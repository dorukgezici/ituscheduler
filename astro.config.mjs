import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://ituscheduler.com",
  output: "server",
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false }), react(), sitemap()],
  vite: {
    build: { sourcemap: true },
    plugins: [sentryVitePlugin({ org: "dgtech" })],
  },
});
