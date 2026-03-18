import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("nexus_session")?.value;

  if (!token) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const session = verifySession(token) as any;

  if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({
    id: session.id,
    name: session.name,
    role: session.role,
    initials: session.initials,
  });
}
