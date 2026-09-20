import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET() {
  try {
    const [allNV, allHT] = await Promise.all([
      prisma.nhiemVu.findMany({ include: { donViChuTri: true } }),
      prisma.heThongSo.findMany(),
    ]);

    const now = dayjs();
    const in30Days = now.add(30, "day");

    const stats = {
      tongNhiemVu: allNV.length,
      hoanThanh: allNV.filter((n) => n.trangThai === "hoan-thanh").length,
      dangThucHien: allNV.filter((n) => n.trangThai === "dang-thuc-hien").length,
      chuaBatDau: allNV.filter((n) => n.trangThai === "chua-bat-dau").length,
      treHan: allNV.filter(
        (n) =>
          n.thoiHan &&
          dayjs(n.thoiHan).isBefore(now) &&
          n.trangThai !== "hoan-thanh"
      ).length,
      tongHeThong: allHT.length,
      dangVanHanh: allHT.filter((h) => h.trangThai === "dang-van-hanh").length,
      canNangCap: allHT.filter((h) => h.trangThai === "can-nang-cap").length,
      phanTramHoanThanh:
        allNV.length > 0
          ? Math.round(
              (allNV.filter((n) => n.trangThai === "hoan-thanh").length /
                allNV.length) *
                100
            )
          : 0,
      nhiemVuTheoLop: [1, 2, 3, 4].map((lop) => {
        const lopNV = allNV.filter((n) => n.lop === lop);
        return {
          lop,
          total: lopNV.length,
          hoanThanh: lopNV.filter((n) => n.trangThai === "hoan-thanh").length,
        };
      }),
      nhiemVuSapHanOrTreHan: allNV
        .filter(
          (n) =>
            n.thoiHan &&
            (dayjs(n.thoiHan).isBefore(in30Days) ||
              dayjs(n.thoiHan).isBefore(now)) &&
            n.trangThai !== "hoan-thanh"
        )
        .sort((a, b) => {
          if (!a.thoiHan) return 1;
          if (!b.thoiHan) return -1;
          return new Date(a.thoiHan).getTime() - new Date(b.thoiHan).getTime();
        })
        .slice(0, 10),
    };

    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
