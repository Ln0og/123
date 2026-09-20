import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const khung = await prisma.khungKTS.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(khung);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    let khung;
    if (id) {
      khung = await prisma.khungKTS.update({ where: { id }, data });
    } else {
      khung = await prisma.khungKTS.create({ data });
    }
    return NextResponse.json(khung);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
