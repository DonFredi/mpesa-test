import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";

  const res = NextResponse.next();

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
