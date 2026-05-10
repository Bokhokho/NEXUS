import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySession } from "@/lib/session";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function adminOnly(req: NextRequest) {
  const token = req.cookies.get("nexus_session")?.value;
  if (!token) return false;
  const session = verifySession(token) as any;
  return session?.role === "Admin" && Date.now() < session.expiresAt;
}

export async function GET() {
  const { data, error } = await supabase
    .from("team")
    .select("id, name, role, email")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Seed from NEXUS_TEAM_JSON on first use
  if (data.length === 0) {
    try {
      const envTeam = JSON.parse(process.env.NEXUS_TEAM_JSON || "[]");
      const seed = envTeam.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        email: m.email || "",
      }));
      if (seed.length > 0) {
        await supabase.from("team").insert(seed);
        return NextResponse.json(seed);
      }
    } catch {}
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { name, role, email } = await req.json();
  if (!name || !role) return NextResponse.json({ error: "Name and role required" }, { status: 400 });

  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const { error } = await supabase.from("team").insert({ id, name, role, email: email || "" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id, name, role, email } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("team")
    .update({ name, role, email: email || "" })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("team").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
