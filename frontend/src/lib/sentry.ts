import * as Sentry from "@sentry/react";

// Since Astro works with the "islands" mentality, you'll have to initialize Sentry
// at the top level of every component you use (not every component, just the one in
// your .astro file — the one that needs a template directive like "client:idle").
// Putting that step in a lib makes it easier to maintain if you have multiple components on a page.

// Use an environment variable for this if you prefer.
const dsn = `https://7fba7a280d7725c57d3fd93ae8e4590e@o1175701.ingest.sentry.io/4505924274618368-dsn`;

export default function initSentry() {
  if (typeof window !== "undefined") {
    Sentry.init({
      dsn,
      release: import.meta.env.PUBLIC_SENTRY_RELEASE,
    });
  }
}
