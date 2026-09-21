process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.heThongSo.findMany({
    where: { trangThai: 'can-nang-cap' },
    include: { nhiemVus: true, donVi: true }
  });

  console.log('Total can-nang-cap items:', items.length);
  items.forEach((it, idx) => {
    console.log(`\n${idx + 1}. [${it.ma}] ${it.ten} (Lớp ${it.lop}) - Đơn vị: ${it.donVi?.ten || it.chuQuan}`);
    if (it.nhiemVus && it.nhiemVus.length > 0) {
      it.nhiemVus.forEach(nv => {
        console.log(`   -> ĐÃ CÓ LỘ TRÌNH: [${nv.ma}] ${nv.ten} (Hạn: ${nv.thoiHan ? new Date(nv.thoiHan).toLocaleDateString('vi-VN') : '—'}, Tiến độ: ${nv.tienDo}%)`);
      });
    } else {
      console.log('   -> ⚠️ CHƯA CÓ LỘ TRÌNH LIÊN KẾT!');
    }
  });
}

main().finally(() => prisma.$disconnect());
