// Fires a single keepalive ping per browser session.
// Combined with Vercel Cron (every 6h), this prevents Lovable Cloud from pausing.
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "__heartbeat_pinged__";

export function pingHeartbeatOnce() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // sessionStorage may be unavailable (extension contexts) — still attempt ping
  }
  // Fire-and-forget; never block UI
  supabase.functions.invoke("heartbeat").catch(() => {});
}
