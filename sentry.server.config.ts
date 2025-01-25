import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://7fba7a280d7725c57d3fd93ae8e4590e@o1175701.ingest.us.sentry.io/4505924274618368",

  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
});
