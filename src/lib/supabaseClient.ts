import type { Database } from "@/types/database.types";
import type { AstroCookies } from "astro";
import {
  createClientComponentClient,
  createServerComponentClient,
  createServerMiddlewareClient,
  createServerRouteClient,
} from "supabase-auth-helpers-astro";

export const clientComponentClient = () =>
  createClientComponentClient<Database>({
    supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
    supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  });

// can also be used on routes
export const serverComponentClient = (cookies: AstroCookies) =>
  createServerComponentClient<Database>(
    {
      cookies,
    },
    {
      supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    },
  );

// recommended to use `createServerComponentClient`
export const serverRouteClient = (cookies: AstroCookies) =>
  createServerRouteClient<Database>(
    {
      cookies,
    },
    {
      supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    },
  );

// can also be used on routes
export const serverMiddlewareClient = (req: Request, res: Response) =>
  createServerMiddlewareClient<Database>(
    {
      request: req,
      response: res,
    },
    {
      supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    },
  );
