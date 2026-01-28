"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("active-bids") // 👈 EXACT table name
        .select("*");

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);
    }

    test();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Supabase Test</h1>
      <p>Open the browser console.</p>
    </div>
  );
}
