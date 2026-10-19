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
    // Google Drive ka direct download link
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Google Drive se video fetch karo
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch video from Drive", { status: response.status });
    }

    // Headers set karo taake video smooth chale
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
    headers.set("Cache-Control", "public, max-age=3600"); // 1 hour cache
    
    // Agar size pata ho toh bhej do
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Video stream karo
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}