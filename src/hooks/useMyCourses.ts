import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function useMyCourses(userId?: string) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["user_courses", userId],
      queryFn: async () => {
        if (!userId) throw new Error("`userId` not provided");
        let query = supabase
          .from("user_courses")
          .select("course_crn, courses(code,title,instructor,enrolled,capacity,lectures!fk_courses_lectures(*))")
          .eq("user_id", userId)
          .order("course_crn");
        const { data, error } = await query;
        if (error) throw new Error("Query failed");
        return data;
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient
  );
}
