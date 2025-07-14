import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(_request: NextRequest) {
  try {
    // Get the template file path
    const filePath = join(
      process.cwd(),
      "public",
      "template-jurnal-jebaka.docx"
    );

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Create response with proper headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          "attachment; filename=template-jurnal-jebaka.docx",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

    return response;
  } catch (error) {
    console.error("Template file error:", error);
    // Return 404 if file not found
    return new NextResponse("Template file not found", { status: 404 });
  }
}
