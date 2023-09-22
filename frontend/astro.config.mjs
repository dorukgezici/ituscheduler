import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sentryIntegration from "./sentry-integration";

const { SENTRY_AUTH_TOKEN, PUBLIC_SENTRY_RELEASE } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? "https://ituscheduler.com" : "http://localhost:4321",
  output: "server",
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
    sentryIntegration({
      authToken: SENTRY_AUTH_TOKEN,
      org: "dgtech",
      project: "ituscheduler",
      release: PUBLIC_SENTRY_RELEASE,
    }),
  ],
});
