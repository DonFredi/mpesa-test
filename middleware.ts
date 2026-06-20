import { NextResponse, type NextRequest } from "next/server";

const allowedOrigins = ["http://localhost:3000"];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  const finalOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const isPreflight = req.method === "OPTIONS";

  const response = isPreflight ? new NextResponse(null, { status: 204 }) : NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", finalOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  if (isPreflight) return response;

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
