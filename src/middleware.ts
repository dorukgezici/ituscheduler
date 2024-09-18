import { serverMiddlewareClient } from "@/lib/supabase";
import { defineMiddleware, sequence } from "astro:middleware";

const authenticate = defineMiddleware(async ({ request, cookies }, next) => {
  const response = await next();
  const supabase = serverMiddlewareClient(request, cookies);
  await supabase.auth.getSession();
  return response;
});

export const onRequest = sequence(authenticate);
