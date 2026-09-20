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
      include: { donViChuTri: true, heThongSos: true },
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
    const { heThongSoIds, ...data } = body;
    
    if (data.thoiHan) data.thoiHan = new Date(data.thoiHan);
    
    const item = await prisma.nhiemVu.create({
      data: {
        ...data,
        heThongSos: heThongSoIds ? {
          connect: heThongSoIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: { donViChuTri: true, heThongSos: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
