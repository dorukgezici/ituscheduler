import { queryClient } from "@/lib/reactQuery";
import { supabase } from "@/lib/supabase";
import type { Course, Lecture } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

// PostgREST embeds a to-one relation as a single object, but supabase-js
// widens the inferred type to an array; describe the real runtime shape.
type MyCourse = {
  course_crn: string;
  courses: (Course & { lectures: Lecture[] }) | null;
};

export default function useMyCourses(userId?: string) {
  return useQuery(
    {
      queryKey: ["user_courses", userId],
      queryFn: async () => {
        if (!userId) throw new Error("`userId` not provided");
        let query = supabase
          .from("user_courses")
          .select(
            "course_crn, courses(code,title,instructor,enrolled,capacity,lectures!fk_courses_lectures(*))",
          )
          .eq("user_id", userId)
          .order("course_crn");
        const { data, error } = await query;
        if (error) throw new Error("Query failed");
        return data as unknown as MyCourse[];
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient,
  );
}
