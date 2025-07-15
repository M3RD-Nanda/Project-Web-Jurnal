import { NextRequest, NextResponse } from "next/server";
import { recordPageVisit } from "@/actions/analytics";

// Add runtime configuration for better performance
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Valid path is required" },
        { status: 400 }
      );
    }

    // Validate path format
    if (!path.startsWith("/")) {
      return NextResponse.json(
        { error: "Path must start with /" },
        { status: 400 }
      );
    }

    await recordPageVisit(path);

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error recording page visit:", error);
    return NextResponse.json(
      { error: "Failed to record page visit" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
