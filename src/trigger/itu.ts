import type { Database } from "@/types/database.types";
import type {
  CourseInsert,
  LectureInsert,
  MajorInsert,
} from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { logger, schedules, task } from "@trigger.dev/sdk/v3";
import { SIS_TOKEN, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { splitTimeStr } from "./utils";

const createSupabaseClient = () =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchMajors = schedules.task({
  id: "fetch-majors",
  // every day at 6:00 AM
  cron: "0 6 * * *",
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

export const fetchAllCourses = schedules.task({
  id: "fetch-all-courses",
  // At minute 30 past every 3rd hour from 7 through 19
  // https://crontab.guru/#30_7-19/3_*_*_*
  cron: "30 7-19/3 * * *",
  run: async (payload) => {
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

export const fetchMajorCourses = task({
  id: "fetch-major-courses",
  run: async (payload: { majorId: string; majorCode: string }) => {
    const supabase = createSupabaseClient();

    const url = "https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch";
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
      dersBransKoduId: payload.majorId,
      __RequestVerificationToken: SIS_TOKEN,
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

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
