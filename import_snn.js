const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function importExcel() {
  const filePath = "C:\\Delta Force\\v4. ten mien - snnmt - bo_sung_CSDL_theo_ND278_15.9.2026 (1).xlsx";
  console.log("Reading file:", filePath);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let donVi = await prisma.donVi.findFirst({
    where: { ten: { contains: "Sở Nông nghiệp" } }
  });

  if (!donVi) {
    const tinh = await prisma.donVi.findFirst({ where: { loai: "tinh" } });
    donVi = await prisma.donVi.create({
      data: {
        ten: "Sở Nông nghiệp và Phát triển nông thôn",
        loai: "so",
        parentId: tinh ? tinh.id : null,
      }
    });
  }

  await prisma.heThongSo.deleteMany({
    where: {
      ma: {
        startsWith: "SNN-"
      }
    }
  });
  console.log("Deleted old SNN records.");

  let successCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;

    const ten = String(row[1]).trim();
    const ma = `SNN-${String(row[0] || i).padStart(2, "0")}`;
    const tenMien = row[2] ? String(row[2]).trim() : "";
    const donViQuanLy = row[4] ? String(row[4]).trim() : "";
    const donViCon = row[5] ? String(row[5]).trim() : "";
    
    let chuQuan = donViQuanLy;
    if (donViCon) chuQuan += ` - ${donViCon}`;

    const rawTrangThai = String(row[9] || "").toLowerCase();
    let trangThai = "dang-van-hanh";
    if (rawTrangThai.includes("không") || rawTrangThai.includes("dừng")) {
      trangThai = "can-thay-the";
    }

    const namStr = String(row[6] || "");
    const namTrienKhai = parseInt(namStr) || null;

    let moTaParts = [];
    if (tenMien && tenMien !== "Không có") moTaParts.push(`Tên miền::${tenMien}`);
    if (row[10] && String(row[10]).trim() !== "") moTaParts.push(`Khả năng chia sẻ::${String(row[10]).trim()}`);
    if (row[11] && String(row[11]).trim() !== "") moTaParts.push(`Hình thức chia sẻ::${String(row[11]).trim()}`);
    if (row[12] && String(row[12]).trim() !== "") moTaParts.push(`Tần suất cập nhật::${String(row[12]).trim()}`);
    if (row[13] && String(row[13]).trim() !== "") moTaParts.push(`Phạm vi dữ liệu::${String(row[13]).trim()}`);
    if (row[14] && String(row[14]).trim() !== "") moTaParts.push(`Danh mục cụ thể::${String(row[14]).trim()}`);
    if (row[15] && String(row[15]).trim() !== "") moTaParts.push(`Hiện trạng kết nối::${String(row[15]).trim()}`);

    const isDuLieu = ten.toLowerCase().includes("csdl") || ten.toLowerCase().includes("dữ liệu");
    const loai = isDuLieu ? "du-lieu" : "ung-dung";
    const lop = isDuLieu ? 2 : 3;

    try {
      await prisma.heThongSo.create({
        data: {
          ma,
          ten,
          loai,
          lop,
          moTa: moTaParts.join("\\n"),
          chuQuan,
          trangThai,
          namTrienKhai,
          donViId: donVi.id
        }
      });
      successCount++;
    } catch (e) {
      console.error(`Error importing row ${i}:`, e.message);
    }
  }

  console.log(`\n✅ Re-import completed: ${successCount} systems added with FULL data.`);
  await prisma.$disconnect();
}

importExcel().catch(e => {
  console.error(e);
  process.exit(1);
});
