import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL
    const title =
      searchParams.get("title") ||
      "Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa";
    const subtitle =
      searchParams.get("subtitle") || "JEBAKA - Universitas Percobaan Nanda";
    const type = searchParams.get("type") || "website";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            backgroundImage:
              "linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        >
          {/* Header with logo area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#1e40af",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "20px",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                J
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1e40af",
                  marginBottom: "4px",
                }}
              >
                JEBAKA
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#64748b",
                }}
              >
                Jurnal Ilmiah
              </div>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "900px",
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? "48px" : "56px",
                fontWeight: "bold",
                color: "#1e293b",
                lineHeight: "1.2",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: "24px",
                color: "#64748b",
                lineHeight: "1.4",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              {subtitle}
            </p>

            {/* Type badge */}
            {type !== "website" && (
              <div
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {type === "article" ? "Artikel" : type}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              right: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                color: "#94a3b8",
              }}
            >
              Universitas Percobaan Nanda
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "#94a3b8",
              }}
            >
              jimeka.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
