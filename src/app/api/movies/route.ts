import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movies = await prisma.content.findMany({
      where: { status: "PUBLISHED", isComingSoon: false },
      orderBy: { createdAt: "desc" },
      take: 20, 
    });
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}