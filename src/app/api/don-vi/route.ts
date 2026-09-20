import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const list = await prisma.donVi.findMany({
    orderBy: [{ loai: "asc" }, { ten: "asc" }],
  });
  return NextResponse.json(list);
}
