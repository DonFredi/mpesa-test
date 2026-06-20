import { NextResponse, type NextRequest } from "next/server";

const allowedOrigin = "http://localhost:3000";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");

  const responseOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  console.log("[MIDDLEWARE]", req.method, req.nextUrl.pathname, req.headers.get("origin"));

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": responseOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      },
    });
  }

  const res = NextResponse.next();

  res.headers.set("Access-Control-Allow-Origin", responseOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
