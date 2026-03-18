import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const samUrl = `https://api.sam.gov/opportunities/v2/search?${searchParams.toString()}`;
    const res = await fetch(samUrl, { headers: { Accept: "application/json" } });

    if (!res.ok) {
      let msg = "";
      try {
        const j = await res.json();
        msg = j.error?.message || JSON.stringify(j);
      } catch {
        msg = await res.text();
      }
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
