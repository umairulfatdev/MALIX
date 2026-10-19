import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) {
    return new NextResponse("File ID is required", { status: 400 });
  }

  try {
    // Google Drive ka direct download URL
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Google Drive se file fetch karo
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch file from Drive", { status: response.status });
    }

    // Headers set karo taake browser direct download kare
    const headers = new Headers();
    
    // Content-Type
    const contentType = response.headers.get("Content-Type");
    headers.set("Content-Type", contentType || "application/octet-stream");
    
    // Content-Disposition (download force karne ke liye)
    headers.set("Content-Disposition", `attachment; filename="video.mp4"`);
    
    // Content-Length (agar available ho)
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // File stream karo
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}