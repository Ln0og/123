import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { heThongSoIds, ...data } = body;
    if (data.thoiHan) data.thoiHan = new Date(data.thoiHan);
    
    const item = await prisma.nhiemVu.update({
      where: { id },
      data: {
        ...data,
        heThongSos: heThongSoIds ? {
          set: heThongSoIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: { donViChuTri: true, heThongSos: true },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.nhiemVu.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
