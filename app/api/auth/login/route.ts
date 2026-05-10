import { NextRequest, NextResponse } from "next/server";
import { signSession, hashPassword } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  // Look up member: env var first, then Supabase team table
  let member: any = null;
  try {
    const team = JSON.parse(process.env.NEXUS_TEAM_JSON || "[]");
    member = team.find((m: any) => m.id === id) ?? null;
  } catch {}

  if (!member) {
    const { data } = await supabase
      .from("team")
      .select("id, name, role, email")
      .eq("id", id)
      .maybeSingle();
    if (data) member = data;
  }

  if (!member) {
    return NextResponse.json({ error: "Identity not found." }, { status: 401 });
  }

  // Password: check Supabase passwords table first, then env hash as fallback
  let effectiveHash = member.passwordHash ?? null;
  try {
    const { data } = await supabase
      .from("passwords")
      .select("hash")
      .eq("user_id", id)
      .maybeSingle();
    if (data?.hash) effectiveHash = data.hash;
  } catch {}

  if (!effectiveHash || effectiveHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const initials = member.initials
    ?? member.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    ?? "??";

  const payload = {
    id: member.id,
    name: member.name,
    role: member.role,
    initials,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  };

  const token = signSession(payload);

  const response = NextResponse.json({
    id: member.id,
    name: member.name,
    role: member.role,
    initials,
  });

  response.cookies.set("nexus_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
