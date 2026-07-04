import { queryClient } from "@/lib/reactQuery";
import { supabase } from "@/lib/supabase";
import type { Course, Lecture } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

// PostgREST embeds a to-one relation as a single object, but supabase-js
// widens the inferred type to an array; describe the real runtime shape.
type ScheduleCourse = {
  courses: (Course & { lectures: Lecture[] }) | null;
};

export default function useScheduleCourses(scheduleId?: string) {
  return useQuery(
    {
      queryKey: ["schedule_courses", scheduleId],
      queryFn: async () => {
        if (!scheduleId) throw new Error("`scheduleId` not provided");
        let query = supabase
          .from("schedule_courses")
          .select("courses(*,lectures!fk_courses_lectures(*))")
          .eq("schedule_id", scheduleId);
        const { data, error } = await query;
        if (error) throw new Error("Query failed");
        return data as unknown as ScheduleCourse[];
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient,
  );
}
