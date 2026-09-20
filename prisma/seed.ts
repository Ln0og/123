import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Tạo đơn vị
  const tinh = await prisma.donVi.create({
    data: { ten: "UBND tỉnh Vĩnh Long", loai: "tinh" },
  });

  const soTTTT = await prisma.donVi.create({
    data: { ten: "Sở Thông tin & Truyền thông", loai: "so", parentId: tinh.id },
  });
  const soTC = await prisma.donVi.create({
    data: { ten: "Sở Tài chính", loai: "so", parentId: tinh.id },
  });
  const soNV = await prisma.donVi.create({
    data: { ten: "Sở Nội vụ", loai: "so", parentId: tinh.id },
  });
  const soYT = await prisma.donVi.create({
    data: { ten: "Sở Y tế", loai: "so", parentId: tinh.id },
  });
  const soGD = await prisma.donVi.create({
    data: { ten: "Sở Giáo dục & Đào tạo", loai: "so", parentId: tinh.id },
  });
  await prisma.donVi.create({
    data: { ten: "Huyện Long Hồ", loai: "huyen", parentId: tinh.id },
  });
  await prisma.donVi.create({
    data: { ten: "Huyện Mang Thít", loai: "huyen", parentId: tinh.id },
  });

  // Tạo users
  const adminPass = await bcrypt.hash("admin123", 10);
  const editorPass = await bcrypt.hash("editor123", 10);

  await prisma.user.create({
    data: {
      email: "admin@vinhlong.gov.vn",
      password: adminPass,
      name: "Quản trị viên",
      role: "admin",
      donViId: tinh.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "editor@vinhlong.gov.vn",
      password: editorPass,
      name: "Biên tập viên",
      role: "editor",
      donViId: soTTTT.id,
    },
  });

  // Tạo Khung KTS
  await prisma.khungKTS.create({
    data: {
      tenKhung: "Khung Kiến trúc Chính quyền số tỉnh Vĩnh Long",
      phienBan: "1.0",
      ngayBanHanh: new Date("2026-10-01"),
      giaiDoanApDung: "2026 - 2028",
      mucTieu:
        "Xây dựng Chính quyền số tỉnh Vĩnh Long đồng bộ, thống nhất, kết nối liên thông với Khung Kiến trúc Tổng thể Quốc gia Số; đảm bảo 100% dịch vụ công thiết yếu được cung cấp trực tuyến toàn trình; 80% hồ sơ thủ tục hành chính được xử lý hoàn toàn trên môi trường số vào năm 2028.",
      boiCanh:
        "Thực hiện Quyết định số 1425/QĐ-TTg ngày 29/7/2026 của Thủ tướng Chính phủ về ban hành Khung Kiến trúc Tổng thể Quốc gia Số (phiên bản 1.0). Tỉnh Vĩnh Long xây dựng Khung Kiến trúc Chính quyền số cấp tỉnh phù hợp với định hướng chuyển đổi số quốc gia.",
      nguyenTac:
        "1. Ưu tiên dùng chung, kế thừa\n2. Bảo đảm an toàn, an ninh mạng\n3. Hướng đến người dân và doanh nghiệp\n4. Đo lường được bằng dữ liệu\n5. Mở, linh hoạt, có khả năng mở rộng",
      daiDienPhuTrach: "Sở Thông tin & Truyền thông tỉnh Vĩnh Long",
      trangThai: "published",
    },
  });

  // Tạo Hệ thống số
  const hts = await Promise.all([
    // Lớp 1 - Hạ tầng
    prisma.heThongSo.create({
      data: {
        ma: "HT-01",
        ten: "Hạ tầng mạng WAN tỉnh",
        loai: "ha-tang",
        lop: 1,
        moTa: "Mạng diện rộng WAN kết nối UBND tỉnh với các Sở, Ban, Ngành và UBND cấp huyện",
        chuQuan: "Sở TT&TT",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2019,
        donViId: soTTTT.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "HT-02",
        ten: "Trung tâm tích hợp dữ liệu tỉnh (IDC)",
        loai: "ha-tang",
        lop: 1,
        moTa: "Trung tâm dữ liệu tỉnh phục vụ hosting các hệ thống CNTT",
        chuQuan: "Sở TT&TT",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2020,
        donViId: soTTTT.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "HT-03",
        ten: "Hệ thống giám sát ATTT (SOC tỉnh)",
        loai: "ha-tang",
        lop: 1,
        moTa: "Hệ thống giám sát an toàn thông tin, cảnh báo sự cố mạng",
        chuQuan: "Sở TT&TT",
        trangThai: "can-nang-cap",
        namTrienKhai: 2022,
        donViId: soTTTT.id,
      },
    }),
    // Lớp 2 - Dữ liệu
    prisma.heThongSo.create({
      data: {
        ma: "DL-01",
        ten: "CSDL Dân cư tỉnh",
        loai: "du-lieu",
        lop: 2,
        moTa: "Cơ sở dữ liệu dân cư tích hợp với CSDL quốc gia về dân cư",
        chuQuan: "Công an tỉnh",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2021,
        donViId: tinh.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "DL-02",
        ten: "CSDL Đất đai tỉnh",
        loai: "du-lieu",
        lop: 2,
        moTa: "Cơ sở dữ liệu địa chính, đất đai toàn tỉnh",
        chuQuan: "Sở TN&MT",
        trangThai: "can-nang-cap",
        namTrienKhai: 2018,
        donViId: tinh.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "DL-03",
        ten: "Nền tảng tích hợp chia sẻ dữ liệu (LGSP)",
        loai: "du-lieu",
        lop: 2,
        moTa: "Local Government Service Platform - nền tảng kết nối, chia sẻ dữ liệu cấp tỉnh",
        chuQuan: "Sở TT&TT",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2021,
        donViId: soTTTT.id,
      },
    }),
    // Lớp 3 - Ứng dụng
    prisma.heThongSo.create({
      data: {
        ma: "UD-01",
        ten: "Phần mềm Quản lý Văn bản (QLVB)",
        loai: "ung-dung",
        lop: 3,
        moTa: "Hệ thống quản lý văn bản và điều hành dùng chung toàn tỉnh",
        chuQuan: "Sở TT&TT",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2019,
        donViId: soTTTT.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "UD-02",
        ten: "Cổng Dịch vụ công trực tuyến tỉnh Vĩnh Long",
        loai: "ung-dung",
        lop: 3,
        moTa: "Cổng DVCTT cấp tỉnh, tích hợp với Cổng DVCQG quốc gia",
        chuQuan: "Sở TT&TT",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2020,
        donViId: soTTTT.id,
      },
    }),
    prisma.heThongSo.create({
      data: {
        ma: "UD-03",
        ten: "Hệ thống thông tin quản lý y tế (HIS)",
        loai: "ung-dung",
        lop: 3,
        moTa: "Hệ thống thông tin bệnh viện và quản lý y tế cấp tỉnh",
        chuQuan: "Sở Y tế",
        trangThai: "can-nang-cap",
        namTrienKhai: 2020,
        donViId: soYT.id,
      },
    }),
    // Lớp 4 - Kênh tương tác
    prisma.heThongSo.create({
      data: {
        ma: "KT-01",
        ten: "Cổng thông tin điện tử tỉnh Vĩnh Long",
        loai: "kenh-tuong-tac",
        lop: 4,
        moTa: "Website chính thức của UBND tỉnh Vĩnh Long (vinhlong.gov.vn)",
        chuQuan: "Văn phòng UBND tỉnh",
        trangThai: "dang-van-hanh",
        namTrienKhai: 2015,
        donViId: tinh.id,
      },
    }),
  ]);

  // Tạo Nhiệm vụ
  await Promise.all([
    prisma.nhiemVu.create({
      data: {
        ma: "NV-01",
        ten: "Nâng cấp CSDL đất đai kết nối NDOP quốc gia",
        moTa: "Chuẩn hóa, nâng cấp CSDL đất đai tỉnh Vĩnh Long để kết nối với Nền tảng điều phối dữ liệu quốc gia (NDOP) do Bộ Công an quản lý",
        donViChuTriId: tinh.id,
        uuTien: "cao",
        thoiHan: new Date("2027-06-30"),
        giaiDoan: "2026-2027",
        kpi: "Hoàn thành kết nối API với NDOP; 100% thửa đất có dữ liệu chuẩn hóa",
        trangThai: "dang-thuc-hien",
        tienDo: 20,
        lop: 2,
        phuongAnXuLy: "nang-cap",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-02",
        ten: "Triển khai điện toán đám mây cho IDC tỉnh",
        moTa: "Nâng cấp Trung tâm dữ liệu tỉnh theo mô hình Cloud, kết nối với hạ tầng điện toán đám mây tại Trung tâm Dữ liệu Quốc gia",
        donViChuTriId: soTTTT.id,
        uuTien: "cao",
        thoiHan: new Date("2026-12-31"),
        giaiDoan: "2026",
        kpi: "Tối thiểu 30% hệ thống CNTT tỉnh chuyển lên cloud",
        trangThai: "dang-thuc-hien",
        tienDo: 40,
        lop: 1,
        phuongAnXuLy: "nang-cap",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-03",
        ten: "Kết nối CSDL Dân cư với VNeID",
        moTa: "Đồng bộ toàn bộ dữ liệu dân cư tỉnh Vĩnh Long với Nền tảng định danh điện tử VNeID của Bộ Công an",
        donViChuTriId: tinh.id,
        uuTien: "cao",
        thoiHan: new Date("2026-09-30"),
        giaiDoan: "2026",
        kpi: "100% công dân có CCCD gắn chip được đồng bộ trên VNeID",
        trangThai: "dang-thuc-hien",
        tienDo: 75,
        lop: 2,
        phuongAnXuLy: "tich-hop",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-04",
        ten: "Tích hợp Cổng DVCTT với Cổng DVCQG",
        moTa: "Kết nối hoàn toàn Cổng Dịch vụ công trực tuyến tỉnh Vĩnh Long với Cổng Dịch vụ công Quốc gia theo mô hình 5721",
        donViChuTriId: soTTTT.id,
        uuTien: "cao",
        thoiHan: new Date("2026-10-31"),
        giaiDoan: "2026",
        kpi: "100% TTHC cấp tỉnh kết nối Cổng DVCQG; tỷ lệ nộp HS online đạt >60%",
        trangThai: "dang-thuc-hien",
        tienDo: 60,
        lop: 3,
        phuongAnXuLy: "tich-hop",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-05",
        ten: "Xây dựng hệ thống SOC tỉnh thế hệ mới",
        moTa: "Đầu tư xây dựng Trung tâm điều hành an toàn thông tin (SOC) cấp tỉnh, kết nối với SOC quốc gia",
        donViChuTriId: soTTTT.id,
        uuTien: "trung-binh",
        thoiHan: new Date("2027-12-31"),
        giaiDoan: "2027",
        kpi: "SOC tỉnh đi vào vận hành; kết nối với SOC quốc gia của BCA",
        trangThai: "chua-bat-dau",
        tienDo: 10,
        lop: 1,
        phuongAnXuLy: "bo-sung",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-06",
        ten: "Triển khai Từ điển dữ liệu dùng chung tỉnh",
        moTa: "Xây dựng và đăng ký Từ điển dữ liệu chuyên ngành tỉnh Vĩnh Long theo hướng dẫn của Bộ Công an (Công văn 2910/BCA-TTDLQG)",
        donViChuTriId: soTTTT.id,
        uuTien: "trung-binh",
        thoiHan: new Date("2026-12-31"),
        giaiDoan: "2026",
        kpi: "Hoàn thành đăng ký Từ điển dữ liệu trên Nền tảng số Từ điển dữ liệu dùng chung",
        trangThai: "dang-thuc-hien",
        tienDo: 30,
        lop: 2,
        phuongAnXuLy: "bo-sung",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-07",
        ten: "Phát triển App Vĩnh Long Smart",
        moTa: "Xây dựng ứng dụng di động tích hợp các dịch vụ số, thông tin tiện ích cho người dân tỉnh Vĩnh Long",
        donViChuTriId: soTTTT.id,
        uuTien: "trung-binh",
        thoiHan: new Date("2027-06-30"),
        giaiDoan: "2026-2027",
        kpi: "App ra mắt; đạt 50.000 lượt tải trong năm đầu",
        trangThai: "chua-bat-dau",
        tienDo: 0,
        lop: 4,
        phuongAnXuLy: "bo-sung",
      },
    }),
    prisma.nhiemVu.create({
      data: {
        ma: "NV-08",
        ten: "Xây dựng Trợ lý ảo tỉnh Vĩnh Long",
        moTa: "Triển khai trợ lý ảo AI phục vụ cán bộ công chức và người dân, kết nối với Trợ lý ảo quốc gia",
        donViChuTriId: soTTTT.id,
        uuTien: "thap",
        thoiHan: new Date("2028-12-31"),
        giaiDoan: "2028",
        kpi: "Trợ lý ảo xử lý được >80% câu hỏi thường gặp về TTHC",
        trangThai: "chua-bat-dau",
        tienDo: 0,
        lop: 3,
        phuongAnXuLy: "bo-sung",
      },
    }),
  ]);

  console.log("✅ Seed completed!");
  console.log("📧 Admin: admin@vinhlong.gov.vn / admin123");
  console.log("📧 Editor: editor@vinhlong.gov.vn / editor123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
