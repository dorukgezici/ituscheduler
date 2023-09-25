import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const body = new URLSearchParams({ "majorCodes[]": "BLG" });
  await fetch("https://old.ituscheduler.com/admin/refresh-courses", { method: "POST", body: body });
  return new Response("Sent request to crawler.");
};
