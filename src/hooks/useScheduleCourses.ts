import { queryClient } from "@/lib/reactQuery";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

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
        return data;
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60,
    },
    queryClient,
  );
}
