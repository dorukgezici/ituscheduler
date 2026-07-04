export const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
// Secret key for server-side ingestion jobs. NEVER expose this in the browser
// bundle (no `PUBLIC_` prefix). The service_role bypasses RLS, so it can write
// to the catalog tables (courses/lectures/majors/semesters) that are otherwise
// read-only for anon/authenticated.
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const SIS_TOKEN = process.env.SIS_TOKEN ?? "";
