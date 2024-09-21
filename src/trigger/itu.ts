import type { Database } from "@/types/database.types";
import type {
  CourseInsert,
  LectureInsert,
  MajorInsert,
} from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { logger, schedules, task } from "@trigger.dev/sdk/v3";
import { splitTimeStr } from "./utils";

const createSupabaseClient = () =>
  createClient<Database>(
    process.env.PUBLIC_SUPABASE_URL ?? "TEST",
    process.env.PUBLIC_SUPABASE_ANON_KEY ?? "TEST",
  );

export const fetchMajors = schedules.task({
  id: "fetch-majors",
  // every hour
  cron: "0 * * * *",
  run: async (payload, { ctx }) => {
    const supabase = createSupabaseClient();

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });
    logger.log("Starting to fetch data...", { payload, formatted });

    const url =
      "https://obs.itu.edu.tr/public/DersProgram/SearchBransKoduByProgramSeviye";
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      // Parse the response JSON
      const data: any[] = await response.json();
      let values: MajorInsert[] = data.map((major) => ({
        id: major.bransKoduId,
        code: major.dersBransKodu,
        created_at: new Date().toISOString(),
      }));

      // Upsert majors
      const { data: majors, error } = await supabase
        .from("majors")
        .upsert(values, {
          onConflict: "code",
        })
        .select();

      logger.log("Completed fetching data", { error, majors });
    } catch (error) {
      logger.error("Error fetching data", { error });
    }
  },
});

export const fetchMajorCourses = task({
  id: "fetch-course",
  run: async (payload: { majorId: string; majorCode: string }) => {
    const supabase = createSupabaseClient();

    const url = "https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch";
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
      dersBransKoduId: payload.majorId,
      __RequestVerificationToken:
        "CfDJ8AdSyj6QpTlAlSo6HeePPNmpKx6G2Ai0X_XaBBYSwz_xTBP7tjSOnObEEA0CDmqL-WQ_GYAxME017AxSMPVLd6WhlVgnDeq7qUeOF-fkEMDtx-LiK33PAcWza3KRkDo2mjqQZLwDbjeSUK1nVLORZeM",
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      //   {
      //     "dersTanimiId": 25122,
      //     "akademikDonemKodu": "202510",
      //     "crn": "13547",
      //     "dersKodu": "BLG 210E",
      //     "dersBransKoduId": 3,
      //     "dilKodu": "en-us",
      //     "programSeviyeTipi": "lisans",
      //     "dersAdi": "Engineering Mathematics",
      //     "ogretimYontemi": "Fiziksel (Yüz yüze)",
      //     "adSoyad": "Mehmet Akif Yazıcı",
      //     "mekanAdi": "-- --",
      //     "gunAdiTR": "Perşembe Cuma",
      //     "gunAdiEN": "Thursday Friday",
      //     "baslangicSaati": "15:30/17:29 15:30/17:29",
      //     "bitisSaati": "",
      //     "webdeGoster": true,
      //     "binaKodu": "BBB BBB",
      //     "kontenjan": 60,
      //     "ogrenciSayisi": 0,
      //     "programSeviyeTipiId": 2,
      //     "rezervasyon": "-",
      //     "sinifProgram": "BLG_LS, BLGE_LS",
      //     "onSart": "Var",
      //     "sinifOnsart": "-"
      // }

      // Parse the response JSON
      const data: any[] = (await response.json()).dersProgramList;
      let courseValues: CourseInsert[] = [];
      let lectureValues: LectureInsert[] = [];

      data.forEach((course) => {
        courseValues.push({
          crn: course.crn,
          code: course.dersKodu,
          major_code: payload.majorCode,
          title: course.dersAdi,
          teaching_method: course.ogretimYontemi,
          instructor: course.adSoyad,
          capacity: course.kontenjan,
          enrolled: course.ogrenciSayisi,
          reservation: course.rezervasyon,
          major_restriction: course.sinifProgram,
          class_restriction: course.sinifOnsart,
          prerequisites: course.onSart,
        });

        const days = (course.gunAdiEN as string).split(" ");
        for (const [i, day] of days.entries()) {
          const timeStr = course.baslangicSaati.split(" ")[i];
          const [timeStart, timeEnd] = splitTimeStr(timeStr);

          lectureValues.push({
            key: `${course.crn}-${i}`,
            building: course.binaKodu.split(" ")[i],
            course_crn: course.crn || "",
            day,
            room: course.mekanAdi.split(" ")[i],
            time: timeStr,
            time_start: timeStart,
            time_end: timeEnd,
          });
        }
      });

      // Upsert courses
      const { error: coursesError } = await supabase
        .from("courses")
        .upsert(courseValues, {
          onConflict: "crn",
        })
        .select();

      // Upsert lectures
      const { data: lectures, error: lecturesError } = await supabase
        .from("lectures")
        .upsert(lectureValues, {
          onConflict: "key",
        })
        .select();

      // Refreshed at
      await supabase
        .from("majors")
        .update({ refreshed_at: new Date().toISOString() })
        .eq("code", payload.majorCode);

      logger.log("Completed fetching data", {
        coursesError,
        lecturesError,
        lectures,
      });
    } catch (error) {
      logger.error("Error fetching data", { error });
      throw error;
    }
  },
});

export const fetchCourses = schedules.task({
  id: "fetch-courses",
  // every hour
  cron: "0 * * * *",
  run: async (payload, { ctx }) => {
    const supabase = createSupabaseClient();

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });
    logger.log("Starting to fetch data...", { payload, formatted });

    const majors = (await supabase.from("majors").select()).data;
    if (!majors) {
      logger.error("No majors found");
      return;
    }

    const majors1 = majors.slice(0, 50);
    const majors2 = majors.slice(50, 100);
    const majors3 = majors.slice(100);

    await fetchMajorCourses.batchTriggerAndWait(
      majors1.map((major) => ({
        payload: {
          majorId: `${major.id || ""}`,
          majorCode: major.code,
        },
      })),
    );

    await fetchMajorCourses.batchTriggerAndWait(
      majors2.map((major) => ({
        payload: {
          majorId: `${major.id || ""}`,
          majorCode: major.code,
        },
      })),
    );

    await fetchMajorCourses.batchTriggerAndWait(
      majors3.map((major) => ({
        payload: {
          majorId: `${major.id || ""}`,
          majorCode: major.code,
        },
      })),
    );
  },
});
