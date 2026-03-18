import { NextRequest, NextResponse } from "next/server";
import { signSession, hashPassword } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  const team = JSON.parse(process.env.NEXUS_TEAM_JSON!);
  const member = team.find((m: any) => m.id === id);

  if (!member) {
    return NextResponse.json({ error: "Identity not found." }, { status: 401 });
  }

  // Check Supabase for a password override (set via Team page)
  let effectiveHash = member.passwordHash;
  try {
    const { data } = await supabase
      .from("passwords")
      .select("hash")
      .eq("user_id", id)
      .maybeSingle();
    if (data?.hash) effectiveHash = data.hash;
  } catch {}

  if (effectiveHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const payload = {
    id: member.id,
    name: member.name,
    role: member.role,
    initials: member.initials,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  };

  const token = signSession(payload);

  const response = NextResponse.json({
    id: member.id,
    name: member.name,
    role: member.role,
    initials: member.initials,
  });

  response.cookies.set("nexus_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
