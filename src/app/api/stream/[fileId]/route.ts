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
    
    // Range header check karo (video streaming ke liye zaroori)
    const range = req.headers.get("range");

    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(range ? { Range: range } : {}), // 👈 Range header pass karo
      },
    });

    if (!response.ok && response.status !== 206) {
      return new NextResponse("Failed to fetch video from Drive", { status: response.status });
    }

    const headers = new Headers();
    const contentType = response.headers.get("Content-Type");
    headers.set("Content-Type", contentType || "video/mp4");
    
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // 👇 Accept-Ranges header add karo (streaming ke liye)
    headers.set("Accept-Ranges", "bytes");
    
    // 👇 Content-Range header pass karo agar hai
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    headers.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(response.body, {
      status: response.status, // 206 Partial Content ya 200 OK
      headers,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}