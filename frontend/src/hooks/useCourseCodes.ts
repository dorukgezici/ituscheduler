import { queryClient } from "@/lib/queryClient";
import { clientComponentClient } from "@/lib/supabaseClient";
import type { Views } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

export default function useCourseCodes(initialData: Views<"course_codes">[] | null, major: string) {
  const supabase = clientComponentClient();

  return useQuery(
    {
      queryKey: ["course_codes", major],
      queryFn: async () => {
        let query = supabase.from("course_codes").select().eq("major_code", major).order("code");
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
