import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

export default function useCourses(
  initialData: Tables<"courses">[] | null,
  major: string,
  courseCode?: string,
  day?: string
) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["courses", major, courseCode, day],
      queryFn: async () => {
        let query = supabase.from("courses").select().eq("major_code", major).order("crn");
        if (courseCode) query = query.eq("code", courseCode);
        //   if (day) query = query.eq("", day);
        const { data, error } = await query;
        if (error) throw new Error("Query failed");
        return data;
      },
      placeholderData: (prev) => prev,
      // initialData,
      staleTime: 1000 * 60,
    },
    queryClient
  );
}
