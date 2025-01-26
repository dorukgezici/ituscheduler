import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://ituscheduler.com",
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
