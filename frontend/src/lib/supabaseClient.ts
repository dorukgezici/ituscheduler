import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types";

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
