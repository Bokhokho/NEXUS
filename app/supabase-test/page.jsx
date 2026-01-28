"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

export default function SupabaseTestPage() {
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("healthcheck").select("*").limit(1);
      console.log("SUPABASE TEST:", { data, error });
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase Test</h1>
      <p>Open the browser console. You should see SUPABASE TEST with data or an empty array.</p>
    </main>
  );
}
