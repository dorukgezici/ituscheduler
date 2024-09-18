import { daySlots } from "@/lib/globals";
import { queryClient } from "@/lib/reactQuery";
import { browserClient } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function useCourses(
  major?: string,
  courseCode?: string,
  day?: string,
) {
  const supabase = browserClient();

  return useQuery(
    {
      queryKey: ["courses", major, courseCode, day],
      queryFn: async () => {
        if (!major) throw new Error("`major` not provided");
        let query = supabase
          .from("courses")
          .select("*, lectures!fk_courses_lectures!inner(*)")
          .eq("major_code", major);
        if (courseCode && courseCode !== "null")
          query = query.eq("code", courseCode);
        if (day && day !== "null")
          query = query.eq("lectures.day", daySlots[day].nameTr);
        const { data, error } = await query.order("crn");
        if (error) throw new Error("Query failed");
        return data;
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient,
  );
}
