import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), "PUBLIC_");

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL,
  output: "server",
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false }), react(), sitemap()],
  vite: {
    build: { sourcemap: true },
    plugins: [sentryVitePlugin({ org: "dgtech" })],
  },
});
