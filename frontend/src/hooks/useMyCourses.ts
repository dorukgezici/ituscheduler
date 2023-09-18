import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function useMyCourses(userId: string) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["course_codes", userId],
      queryFn: async () => {
        let query = supabase.from("user_courses").select().eq("user_id", userId).order("course_crn");
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
