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
    
    // Fetch file from Google Drive
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch file from Drive", { status: response.status });
    }

    // Headers set karo taake download trigger ho
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="video.mp4"`);
    
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Stream the file back to the user
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}