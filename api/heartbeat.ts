// Vercel serverless route — pinged by Vercel Cron to keep Lovable Cloud warm.
// Forwards to the public Supabase edge function `heartbeat`.

export const config = { runtime: "edge" };

export default async function handler() {
  const projectRef = "xatihqukmjqxopbkjphs";
  const url = `https://${projectRef}.supabase.co/functions/v1/heartbeat`;

  try {
    const r = await fetch(url, { method: "GET" });
    const text = await r.text();
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
