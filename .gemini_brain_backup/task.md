# Task List — Web KTS Vĩnh Long

## Giai đoạn 1 — Setup & MVP

### Setup dự án
- [x] Tạo đề xuất thiết kế
- [x] Tạo task list
- [x] Khởi tạo Next.js 14 project
- [x] Cài đặt dependencies (Ant Design, Prisma, NextAuth, React Flow, ECharts)
- [x] Cấu hình database schema (Prisma)
- [x] Setup NextAuth với phân quyền 3 role

### Database Schema
- [x] Table: don_vi (đơn vị tỉnh/sở/huyện)
- [x] Table: khung_kts (thông tin tổng quan Khung)
- [x] Table: he_thong_so (các hệ thống số — DM_DOITUONG)
- [x] Table: ket_noi (quan hệ kết nối — QH_KETNOI)
- [x] Table: anh_xa (ánh xạ đối tượng — ANHXA)
- [x] Table: nhiem_vu (nhiệm vụ lộ trình — HOANTHIEN_NV)
- [x] Table: users + roles

### Trang Portal (xem công khai)
- [x] Trang chủ — Tổng quan KTS Vĩnh Long
- [x] /kts/tong-quan — Mục tiêu, bối cảnh, nguyên tắc
- [x] /kts/hien-trang — Hiện trạng 4 lớp kiến trúc
- [x] /kts/muc-tieu — Sơ đồ kiến trúc mục tiêu (React Flow)
- [x] /kts/lo-trinh — Bảng nhiệm vụ & timeline
- [ ] /admin/khung — Nhập liệu thông tin Khung KTS
- [x] /admin/he-thong — Quản lý danh mục hệ thống số
- [x] /admin/nhiem-vu — Quản lý nhiệm vụ & lộ trình
- [x] /dashboard — Biểu đồ tiến độ tổng thể, cảnh báo trễ hạn

## Giai đoạn 2 — Hoàn thiện
- [ ] Export báo cáo PDF
- [ ] Version history
- [ ] Mobile responsive
- [ ] Thông báo email cảnh báo
