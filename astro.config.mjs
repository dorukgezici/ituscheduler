import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import sentry from "@sentry/astro";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), "PUBLIC_");

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || "https://ituscheduler.com",
  output: "server",
  adapter: vercel(),
  integrations: [
    react(),
    sitemap(),
    sentry({
      sourceMapsUploadOptions: {
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
