import { daySlots } from "@/lib/globals";
import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function useCourses(major?: string, courseCode?: string, day?: string) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["courses", major, courseCode, day],
      queryFn: async () => {
        if (!major) throw new Error("`major` not provided");
        let query = supabase.from("courses").select("*, lectures!inner(*)").eq("major_code", major);
        if (courseCode) query = query.eq("code", courseCode);
        if (day) query = query.eq("lectures.day", daySlots[day].nameTr);
        const { data, error } = await query.order("crn");
        if (error) throw new Error("Query failed");
        return data;
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient
  );
}
