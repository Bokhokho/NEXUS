import { NextRequest, NextResponse } from "next/server";
import { verifySession, hashPassword } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const token = request.cookies.get("nexus_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token) as any;
  if (!session || session.role !== "Admin" || Date.now() > session.expiresAt) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { userId, newPassword } = await request.json();
  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const hash = hashPassword(newPassword);

  const { error } = await supabase
    .from("passwords")
    .upsert({ user_id: userId, hash, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
