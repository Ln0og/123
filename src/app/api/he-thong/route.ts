import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lop = searchParams.get("lop");
    const trangThai = searchParams.get("trangThai");

    const where: Record<string, unknown> = {};
    if (lop) where.lop = parseInt(lop);
    if (trangThai) where.trangThai = trangThai;

    const list = await prisma.heThongSo.findMany({
      where,
      include: { donVi: true },
      orderBy: [{ lop: "asc" }, { ma: "asc" }],
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.heThongSo.create({
      data: body,
      include: { donVi: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
