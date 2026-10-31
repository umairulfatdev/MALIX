import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const movie = await prisma.content.findUnique({
      where: { id, status: "PUBLISHED" },
    });
    if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}