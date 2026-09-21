process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if So Y te exists
  let soYTe = await prisma.donVi.findFirst({ where: { ten: { contains: 'Y tế' } } });
  if (!soYTe) {
    soYTe = await prisma.donVi.create({
      data: {
        ten: 'Sở Y tế',
        loai: 'so'
      }
    });
  }

  // Find UD-03
  const ud03 = await prisma.heThongSo.findFirst({ where: { ma: 'UD-03' } });
  if (!ud03) {
    console.log('UD-03 not found');
    return;
  }

  // Create NV-09 if not exists
  let nv09 = await prisma.nhiemVu.findFirst({ where: { ma: 'NV-09' } });
  if (!nv09) {
    nv09 = await prisma.nhiemVu.create({
      data: {
        ma: 'NV-09',
        ten: 'Nâng cấp và liên thông Hệ thống thông tin quản lý Y tế (HIS/EMR) toàn tỉnh',
        moTa: 'Nâng cấp hệ thống HIS tại các bệnh viện và trung tâm y tế tuyến huyện, hoàn thiện bệnh án điện tử và liên thông dữ liệu y tế quốc gia.',
        donViChuTriId: soYTe.id,
        uuTien: 'cao',
        thoiHan: new Date('2027-06-30'),
        giaiDoan: '2026-2027',
        kpi: '100% cơ sở y tế tuyến huyện đạt chuẩn bệnh án điện tử EMR, tích hợp VNeID và VssID',
        nguonKiemChung: 'Báo cáo đánh giá chuyển đổi số ngành Y tế Vĩnh Long',
        trangThai: 'dang-thuc-hien',
        tienDo: 25,
        lop: 3,
        phuongAnXuLy: 'nang-cap',
        heThongSos: {
          connect: { id: ud03.id }
        }
      }
    });
    console.log('Created NV-09 and connected to UD-03!');
  } else {
    await prisma.nhiemVu.update({
      where: { id: nv09.id },
      data: {
        heThongSos: { connect: { id: ud03.id } }
      }
    });
    console.log('Connected existing NV-09 to UD-03!');
  }

  // Check 5 items again
  const items = await prisma.heThongSo.findMany({
    where: { trangThai: 'can-nang-cap' },
    include: { nhiemVus: true, donVi: true }
  });

  console.log('\n--- KẾT QUẢ ĐỐI CHIẾU 5 HỆ THỐNG CẦN NÂNG CẤP ---');
  items.forEach((it, idx) => {
    console.log(`${idx + 1}. [${it.ma}] ${it.ten}`);
    it.nhiemVus.forEach(nv => {
      console.log(`   -> LỘ TRÌNH: [${nv.ma}] ${nv.ten} (Hạn: ${new Date(nv.thoiHan).toLocaleDateString('vi-VN')}, Tiến độ: ${nv.tienDo}%)`);
    });
  });
}

main().finally(() => prisma.$disconnect());
