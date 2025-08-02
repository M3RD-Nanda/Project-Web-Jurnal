import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// Add runtime configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    // Get the template file path
    const filePath = join(
      process.cwd(),
      "public",
      "template-jurnal-jebaka.docx"
    );

    // Read the file as Node Buffer (Uint8Array)
    const fileBuffer = await readFile(filePath);

    // Wrap buffer into a ReadableStream for Web Response compatibility
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(fileBuffer)); // enqueue as Uint8Array
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          "attachment; filename=template-jurnal-jebaka.docx",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Template file error:", error);
    // Return 404 if file not found
    return new NextResponse("Template file not found", { status: 404 });
  }
}
