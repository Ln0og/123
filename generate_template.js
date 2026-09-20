const XLSX = require("xlsx");
const wb = XLSX.utils.book_new();
const ws_data = [
  ["Mã", "Tên hệ thống", "Lớp (1-4)", "Trạng thái", "Mô tả", "Chủ quản"],
  ["HT-01", "Phần mềm Quản lý văn bản đi/đến", 3, "dang-van-hanh", "Hệ thống dùng chung toàn tỉnh", "Sở TT&TT"],
  ["HT-02", "CSDL Đất đai tỉnh Vĩnh Long", 2, "can-nang-cap", "Quản lý thông tin địa chính", "Sở TNMT"]
];
const ws = XLSX.utils.aoa_to_sheet(ws_data);
ws["!cols"] = [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 25 }];
XLSX.utils.book_append_sheet(wb, ws, "DM_DOITUONG");
XLSX.writeFile(wb, "public/Mau_03_KhaiBao.xlsx");
console.log("Template generated at public/Mau_03_KhaiBao.xlsx");
