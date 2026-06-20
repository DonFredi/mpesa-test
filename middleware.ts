import { NextResponse, type NextRequest } from "next/server";

const allowedOrigins = ["http://localhost:3000"];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  const isAllowed = allowedOrigins.includes(origin);
  const finalOrigin = isAllowed ? origin : allowedOrigins[0];

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": finalOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      },
    });
  }

  const res = NextResponse.next();

  res.headers.set("Access-Control-Allow-Origin", finalOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
