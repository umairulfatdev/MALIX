import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const songs = await prisma.content.findMany({
    where: { type: "MUSIC", status: "PUBLISHED" },
    include: { music: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(songs);
}