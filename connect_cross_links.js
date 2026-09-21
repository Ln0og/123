process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Link NV-02 with HT-02 (IDC)
  const ht02 = await prisma.heThongSo.findFirst({ where: { ma: 'HT-02' } });
  const nv02 = await prisma.nhiemVu.findFirst({ where: { ma: 'NV-02' } });
  if (ht02 && nv02) {
    await prisma.nhiemVu.update({
      where: { id: nv02.id },
      data: { heThongSos: { connect: { id: ht02.id } } }
    });
    await prisma.heThongSo.update({
      where: { id: ht02.id },
      data: { trangThai: 'can-nang-cap' }
    });
  }

  // 2. Link NV-01 with DL-02 (Dat dai)
  const dl02 = await prisma.heThongSo.findFirst({ where: { ma: 'DL-02' } });
  const nv01 = await prisma.nhiemVu.findFirst({ where: { ma: 'NV-01' } });
  if (dl02 && nv01) {
    await prisma.nhiemVu.update({
      where: { id: nv01.id },
      data: { heThongSos: { connect: { id: dl02.id } } }
    });
    await prisma.heThongSo.update({
      where: { id: dl02.id },
      data: { trangThai: 'can-nang-cap' }
    });
  }

  // 3. Link NV-03 with DL-01 (Dan cu - VNeID)
  const dl01 = await prisma.heThongSo.findFirst({ where: { ma: 'DL-01' } });
  const nv03 = await prisma.nhiemVu.findFirst({ where: { ma: 'NV-03' } });
  if (dl01 && nv03) {
    await prisma.nhiemVu.update({
      where: { id: nv03.id },
      data: { heThongSos: { connect: { id: dl01.id } } }
    });
    await prisma.heThongSo.update({
      where: { id: dl01.id },
      data: { trangThai: 'can-nang-cap' }
    });
  }

  // 4. Link NV-04 with DL-03 (LGSP / DVCQG)
  const dl03 = await prisma.heThongSo.findFirst({ where: { ma: 'DL-03' } });
  const nv04 = await prisma.nhiemVu.findFirst({ where: { ma: 'NV-04' } });
  if (dl03 && nv04) {
    await prisma.nhiemVu.update({
      where: { id: nv04.id },
      data: { heThongSos: { connect: { id: dl03.id } } }
    });
  }

  // Check all tasks
  const allNv = await prisma.nhiemVu.findMany({ include: { heThongSos: true } });
  console.log('Updated links count:');
  allNv.forEach(nv => {
    console.log(`- [${nv.ma}] ${nv.ten} -> Liên kết hệ thống:`, nv.heThongSos.map(h => `${h.ma} (${h.ten})`));
  });
}

main().finally(() => prisma.$disconnect());
