import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function useScheduleCourses(scheduleId: string) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["schedule_courses", scheduleId],
      queryFn: async () => {
        let query = supabase.from("schedule_courses").select("courses(*,lectures(*))").eq("schedule_id", scheduleId);
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