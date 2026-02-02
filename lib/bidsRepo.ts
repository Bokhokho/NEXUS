import { supabase } from "@/lib/supabaseClient";
export type Bid = Record<string, any>;

type Row = { id: string; payload: Bid };

export async function getActiveBids(): Promise<Bid[]> {
  const { data, error } = await supabase
    .from("bids")
    .select("id, payload")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Row[]).map(r => r.payload);
}

export async function setActiveBids(rows: Bid[]): Promise<void> {
  // simplest approach: replace all rows
  // (later we can do real per-row upserts)
  const { error: delErr } = await supabase.from("bids").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  if (rows.length === 0) return;

  const inserts = rows.map(r => ({ payload: r }));
  const { error: insErr } = await supabase.from("bids").insert(inserts);
  if (insErr) throw insErr;
}

export async function getInactiveBids(): Promise<Bid[]> {
  const { data, error } = await supabase
    .from("inactive_bids")
    .select("id, payload")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Row[]).map(r => r.payload);
}

export async function setInactiveBids(rows: Bid[]): Promise<void> {
  const { error: delErr } = await supabase.from("inactive_bids").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  if (rows.length === 0) return;

  const inserts = rows.map(r => ({ payload: r }));
  const { error: insErr } = await supabase.from("inactive_bids").insert(inserts);
  if (insErr) throw insErr;
}
