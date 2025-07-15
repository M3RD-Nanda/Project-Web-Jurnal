import { NextRequest, NextResponse } from "next/server";

// Add runtime configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Handle common 404 requests that shouldn't cause errors
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Common files that browsers request but we don't need
  const ignoredPaths = [
    "/index.iife.min.js.map",
    "/.well-known/appspecific/com.chrome.devtools.json",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  if (ignoredPaths.some((path) => pathname.includes(path))) {
    // Return empty response for ignored paths to prevent 404 logs
    return new NextResponse(null, { status: 204 });
  }

  // For other 404s, return proper 404 response
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
