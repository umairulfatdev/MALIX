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
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const range = req.headers.get("range");

    // 👇 NAYA: Server-side caching ke liye headers
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(range ? { Range: range } : {}),
      },
      // 👇 Next.js ko batao ke yeh response cache kare
      next: { revalidate: 3600 } // 1 hour cache
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

    headers.set("Accept-Ranges", "bytes");
    
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    // 👇 NAYA: Edge caching ke liye (Vercel par super fast)
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}