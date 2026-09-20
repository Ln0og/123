import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lop = searchParams.get("lop");
    const trangThai = searchParams.get("trangThai");
    const uuTien = searchParams.get("uuTien");

    const where: Record<string, unknown> = {};
    if (lop) where.lop = parseInt(lop);
    if (trangThai) where.trangThai = trangThai;
    if (uuTien) where.uuTien = uuTien;

    const list = await prisma.nhiemVu.findMany({
      where,
      include: { donViChuTri: true },
      orderBy: [{ uuTien: "asc" }, { thoiHan: "asc" }],
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.thoiHan) body.thoiHan = new Date(body.thoiHan);
    const item = await prisma.nhiemVu.create({
      data: body,
      include: { donViChuTri: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
