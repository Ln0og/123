const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const list = await prisma.heThongSo.findMany({
      include: { donVi: true, nhiemVus: true },
      orderBy: [{ lop: 'asc' }, { ma: 'asc' }],
    });
    console.log('Database connected! Found', list.length, 'he thong so.');
    const nhiemVus = await prisma.nhiemVu.findMany();
    console.log('Found', nhiemVus.length, 'nhiem vu.');
  } catch (e) {
    console.error('Prisma test error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
