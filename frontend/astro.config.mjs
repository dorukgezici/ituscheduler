import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? "https://ituscheduler.vercel.app" : "http://localhost:4321",
  output: "server",
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false }), react(), sitemap()],
});
