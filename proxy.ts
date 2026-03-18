import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("nexus_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  const session = verifySession(token) as any;

  if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
    const response = NextResponse.redirect(new URL("/gate", request.url));
    response.cookies.set("nexus_session", "", { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
