import { NextResponse } from "next/server";

export async function GET() {
  const team = JSON.parse(process.env.NEXUS_TEAM_JSON!);
  const safe = team.map((m: any) => ({
    id: m.id,
    name: m.name,
    role: m.role,
  }));
  return NextResponse.json(safe);
}
