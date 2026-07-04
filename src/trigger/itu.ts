import type { Database } from "@/types/database.types";
import type {
  CourseInsert,
  LectureInsert,
  MajorInsert,
  SemesterInsert,
} from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { logger, schedules, task } from "@trigger.dev/sdk";
import { parse, type HTMLElement } from "node-html-parser";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { splitTimeStr } from "./utils";

const createSupabaseClient = () =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const OBS_BASE = "https://obs.itu.edu.tr";

// The OBS public endpoints expect an XHR-style request, otherwise they may
// return the surrounding page instead of the data fragment.
const OBS_HEADERS = {
  accept: "*/*",
  "x-requested-with": "XMLHttpRequest",
  referer: `${OBS_BASE}/public/DersProgram`,
} as const;

/**
 * Column order of the `<td>` cells inside each `<tr>` of the
 * `DersProgramSearch` HTML table (English headers). Indexed by position so we
 * don't have to rely on the (entity-escaped) header text staying stable.
 */
const COL = {
  CRN: 0,
  COURSE_CODE: 1,
  TITLE: 2,
  TEACHING_METHOD: 3,
  INSTRUCTOR: 4,
  BUILDING: 5,
  DAY: 6,
  TIME: 7,
  ROOM: 8,
  CAPACITY: 9,
  ENROLLED: 10,
  RESERVATION: 11,
  MAJOR_RESTRICTION: 12,
  PREREQUISITES: 13,
  CLASS_RESTRICTION: 14,
} as const;

// Decode entities and collapse whitespace for a single-valued cell.
function cleanText(value: string): string {
  return value
    .replace(/&#xA;/gi, "")
    .replace(/&#xD;/gi, "")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalize a single-valued cell to a (possibly null) string. The OBS table
// uses "-" to mean "no value".
function cellValue(cell: HTMLElement | undefined): string | null {
  if (!cell) return null;
  const text = cleanText(cell.text);
  return text === "" || text === "-" ? null : text;
}

// Split a multi-valued cell (Building/Day/Time/Room) on `<br>`, stripping any
// nested tags (e.g. the Building cell wraps its values in an <a>).
function splitCell(cell: HTMLElement | undefined): string[] {
  if (!cell) return [];
  return cell.innerHTML
    .split(/<br\s*\/?>/i)
    .map((part) =>
      part
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/gi, "&")
        .replace(/&#xA;/gi, "")
        .replace(/&#xD;/gi, "")
        .trim(),
    )
    .filter((part) => part.length > 0);
}

function numOrNull(value: string | null | undefined): number | null {
  if (value == null) return null;
  const n = parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

export const fetchSemesters = schedules.task({
  id: "fetch-semesters",
  // every day at 6:00 AM
  cron: "0 6 * * *",
  run: async (payload) => {
    const supabase = createSupabaseClient();

    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });
    logger.log("Starting to fetch semester...", { payload, formatted });

    const url = `${OBS_BASE}/public/DersProgram/GetAktifDonemByProgramSeviye`;
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: OBS_HEADERS,
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      const data: { aktifDonem?: string } = await response.json();
      const name = data.aktifDonem?.trim();
      if (!name) throw new Error("Empty aktifDonem in response");

      // Single-row table tracking the currently active semester.
      const value: SemesterInsert = {
        id: 1,
        name,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { data: semester, error } = await supabase
        .from("semesters")
        .upsert(value, { onConflict: "id" })
        .select();

      logger.log("Completed fetching semester", { error, semester, name });
    } catch (error) {
      logger.error("Error fetching semester", { error });
    }
  },
});

export const fetchMajors = schedules.task({
  id: "fetch-majors",
  // every day at 6:00 AM
  cron: "0 6 * * *",
  run: async (payload) => {
    const supabase = createSupabaseClient();

    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });
    logger.log("Starting to fetch majors...", { payload, formatted });

    const url = `${OBS_BASE}/public/DersProgram/SearchBransKoduByProgramSeviye`;
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: OBS_HEADERS,
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      const data: { bransKoduId: number; dersBransKodu: string }[] =
        await response.json();

      // Don't set created_at here so existing rows keep their original
      // timestamp on upsert (the DB default handles new inserts).
      const values: MajorInsert[] = data.map((major) => ({
        id: major.bransKoduId,
        code: major.dersBransKodu,
      }));

      const { data: majors, error } = await supabase
        .from("majors")
        .upsert(values, {
          onConflict: "code",
        })
        .select();

      logger.log("Completed fetching majors", {
        error,
        count: majors?.length,
      });
    } catch (error) {
      logger.error("Error fetching majors", { error });
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

    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });
    logger.log("Starting to fetch all courses...", { payload, formatted });

    const { data: majors, error } = await supabase.from("majors").select();
    if (error) {
      logger.error("Failed to load majors", { error });
      return;
    }
    if (!majors || majors.length === 0) {
      logger.error("No majors found");
      return;
    }

    const batches = [
      majors.slice(0, 50),
      majors.slice(50, 100),
      majors.slice(100),
    ].filter((batch) => batch.length > 0);

    for (const batch of batches) {
      await fetchMajorCourses.batchTriggerAndWait(
        batch.map((major) => ({
          payload: {
            majorId: `${major.id ?? ""}`,
            majorCode: major.code,
          },
        })),
      );
    }
  },
});

export const fetchMajorCourses = task({
  id: "fetch-major-courses",
  run: async (payload: { majorId: string; majorCode: string }) => {
    const supabase = createSupabaseClient();

    const url = `${OBS_BASE}/public/DersProgram/DersProgramSearch`;
    const query = new URLSearchParams({
      programSeviyeTipiAnahtari: "LS",
      dersBransKoduId: payload.majorId,
    }).toString();

    try {
      const response = await fetch(`${url}?${query}`, {
        method: "GET",
        headers: OBS_HEADERS,
      });

      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      // The endpoint returns an HTML table fragment, not JSON.
      const html = await response.text();
      const root = parse(html);
      const rows = root.querySelectorAll("#dersProgramContainer tbody tr");

      const courseValues: CourseInsert[] = [];
      const lectureValues: LectureInsert[] = [];

      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        // The table has 15 columns; skip malformed/partial rows.
        if (cells.length < 15) continue;

        const crn = cleanText(cells[COL.CRN]?.text ?? "");
        if (!crn) continue;

        const days = splitCell(cells[COL.DAY]);
        const times = splitCell(cells[COL.TIME]);
        const buildings = splitCell(cells[COL.BUILDING]);
        const rooms = splitCell(cells[COL.ROOM]);

        courseValues.push({
          crn,
          code: cellValue(cells[COL.COURSE_CODE]),
          major_code: payload.majorCode,
          title: cellValue(cells[COL.TITLE]),
          teaching_method: cellValue(cells[COL.TEACHING_METHOD]),
          instructor: cellValue(cells[COL.INSTRUCTOR]),
          capacity: numOrNull(cells[COL.CAPACITY]?.text ?? null),
          enrolled: numOrNull(cells[COL.ENROLLED]?.text ?? null),
          reservation: cellValue(cells[COL.RESERVATION]),
          major_restriction: cellValue(cells[COL.MAJOR_RESTRICTION]),
          prerequisites: cellValue(cells[COL.PREREQUISITES]),
          class_restriction: cellValue(cells[COL.CLASS_RESTRICTION]),
        });

        // One lecture row per scheduled session. The Building/Day/Time/Room
        // cells share the same <br>-separated ordering.
        const sessionCount = Math.max(days.length, times.length);
        for (let i = 0; i < sessionCount; i++) {
          const timeStr = times[i] ?? "";
          const [timeStart, timeEnd] = splitTimeStr(timeStr);

          lectureValues.push({
            key: `${crn}-${i}`,
            building: buildings[i] ?? null,
            course_crn: crn,
            day: days[i] ?? null,
            room: rooms[i] ?? null,
            time: timeStr || null,
            time_start: timeStart,
            time_end: timeEnd,
          });
        }
      }

      // Upsert courses
      const { error: coursesError } = await supabase
        .from("courses")
        .upsert(courseValues, {
          onConflict: "crn",
        });

      // Upsert lectures
      const { data: lectures, error: lecturesError } = await supabase
        .from("lectures")
        .upsert(lectureValues, {
          onConflict: "key",
        });

      // Refreshed at
      await supabase
        .from("majors")
        .update({ refreshed_at: new Date().toISOString() })
        .eq("code", payload.majorCode);

      logger.log("Completed fetching major courses", {
        majorCode: payload.majorCode,
        courseCount: courseValues.length,
        lectureCount: lectureValues.length,
        coursesError,
        lecturesError,
        lectures,
      });
    } catch (error) {
      logger.error("Error fetching major courses", {
        majorCode: payload.majorCode,
        error,
      });
      throw error;
    }
  },
});
