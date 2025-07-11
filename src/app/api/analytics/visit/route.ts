import { NextRequest, NextResponse } from "next/server";
import { recordPageVisit } from "@/actions/analytics";

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    await recordPageVisit(path);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording page visit:", error);
    return NextResponse.json(
      { error: "Failed to record page visit" },
      { status: 500 }
    );
  }
}
