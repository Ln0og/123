import { prisma } from "@/lib/prisma";
import TongQuanClient from "./TongQuanClient";

async function getKhung() {
  return prisma.khungKTS.findFirst({ orderBy: { createdAt: "desc" } });
}

export default async function TongQuanPage() {
  const khung = await getKhung();
  return <TongQuanClient khung={khung} />;
}
