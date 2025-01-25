import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
} from "@supabase/ssr";
import type { AstroCookies, AstroGlobal } from "astro";

export const supabase = createBrowserClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);

export const serverClient = (Astro: AstroGlobal) =>
  createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(Astro.request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            Astro.cookies.set(name, value, options),
          );
        },
      },
    },
  );

export const serverMiddlewareClient = (
  request: Request,
  cookies: AstroCookies,
) =>
  createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options),
          );
        },
      },
    },
  );
