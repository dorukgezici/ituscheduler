import { serverMiddlewareClient } from "@/lib/supabaseClient";
import { defineMiddleware, sequence } from "astro:middleware";

const authenticate = defineMiddleware(async ({ request }, next) => {
  const response = await next();
  const supabase = serverMiddlewareClient(request, response);
  await supabase.auth.getSession();
  return response;
});

export const onRequest = sequence(authenticate);
