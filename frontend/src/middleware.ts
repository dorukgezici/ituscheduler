import { serverMiddlewareClient } from "@/lib/supabaseClient";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const res = await next();
  const supabase = serverMiddlewareClient(context.request, res);
  await supabase.auth.getSession();
  return res;
});
