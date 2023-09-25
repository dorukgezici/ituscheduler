import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const url = `${import.meta.env.PROD ? "https://old.ituscheduler.com" : "http://localhost:8080"}/cron/crawler`;
  const res = await fetch(url);
  console.log(await res.text());
  return new Response("Sent request to crawler.");
};
