process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ht03 = await prisma.heThongSo.findFirst({
    where: { ma: 'HT-03' },
    include: { nhiemVus: true, donVi: true }
  });
  console.log('HT-03:', JSON.stringify(ht03, null, 2));

  const allNv = await prisma.nhiemVu.findMany({
    include: { heThongSos: true }
  });
  console.log('\n--- ALL TASKS & CONNECTED SYSTEMS ---');
  allNv.forEach((nv, i) => {
    console.log(`STT #${i+1} | Ma: ${nv.ma} | Ten: ${nv.ten} | Lop: ${nv.lop} | PhuongAn: ${nv.phuongAnXuLy}`);
    console.log('  -> He thong lien ket:', nv.heThongSos.map(h => `${h.ma} (${h.ten})`));
  });
}

main().finally(() => prisma.$disconnect());
