# ĐỀ XUẤT THIẾT KẾ HỆ THỐNG WEB KHUNG KIẾN TRÚC SỐ
## Tỉnh Vĩnh Long — Dựa theo QĐ 1425/QĐ-TTg & Hướng dẫn Bộ KHCN

---

## PHÂN TÍCH 3 PHƯƠNG ÁN

### Phương án 1 — Web hiển thị đơn thuần ❌ Không phù hợp
> Chỉ render dữ liệu KTS có sẵn, không có nhập liệu.

**Hạn chế nghiêm trọng:**
- KTS là tài liệu **sống** — phải cập nhật định kỳ khi nhiệm vụ hoàn thành, khi hệ thống mới đưa vào vận hành.
- Không đáp ứng yêu cầu QĐ 1425 về *"theo dõi, đôn đốc, kiểm tra việc triển khai"*.
- Không có dashboard → không giám sát được tiến độ.
- **Kết luận: Phương án này chỉ phù hợp làm demo, không dùng thực tế.**

---

### Phương án 2 — 2 Web (Admin + Viewer) ⚠️ Tạm được nhưng chưa tối ưu
> 1 web quản trị nhập liệu + 1 web hiển thị cho lãnh đạo.

**Ưu điểm:**
- Tách biệt rõ phân quyền.
- Giao diện xem có thể thiết kế đẹp, tinh gọn.

**Hạn chế:**
- Duy trì 2 hệ thống riêng biệt → phức tạp deploy, bảo trì.
- Không có module dashboard/giám sát tiến độ → vẫn thiếu.
- Không mô hình hóa được mối quan hệ **phân cấp đơn vị** (Tỉnh → Sở/Ban/Ngành → Huyện).

---

### Phương án 3 — ĐỀ XUẤT: 1 Nền tảng Tích hợp ✅ Khuyến nghị

**Kiến trúc: 1 hệ thống duy nhất, phân quyền theo vai trò (Role-Based)**

```
┌─────────────────────────────────────────────────────────────┐
│            HỆ THỐNG QUẢN LÝ KHUNG KTS VĨNH LONG            │
├────────────┬───────────────────┬────────────────────────────┤
│  PORTAL    │   ADMIN / NHẬP    │    DASHBOARD & BÁO CÁO     │
│  Xem công  │   LIỆU (nội bộ)   │    (lãnh đạo & quản lý)    │
│  khai      │                   │                            │
└────────────┴───────────────────┴────────────────────────────┘
         Cùng 1 backend — phân quyền theo Role
```

**3 vai trò người dùng:**

| Vai trò | Chức năng |
|---------|-----------|
| **Admin tỉnh** | Quản lý toàn bộ; phê duyệt nội dung; quản lý tài khoản |
| **Biên tập (Sở/Huyện)** | Nhập/cập nhật dữ liệu KTS của đơn vị mình |
| **Lãnh đạo / Khách xem** | Xem toàn bộ; xem dashboard; export báo cáo |

---

## KIẾN TRÚC HỆ THỐNG ĐỀ XUẤT

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  PORTAL     │  │  ADMIN CMS   │  │  DASHBOARD          │  │
│  │  (public)   │  │  (biên tập)  │  │  (lãnh đạo)         │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────┬────────────────────────────────┘
                              │ REST API / GraphQL
┌─────────────────────────────▼────────────────────────────────┐
│                        BACKEND                               │
│  Auth  │  API KTS  │  File/Import  │  Report  │  Workflow    │
└─────────────────────────────┬────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                       DATABASE                               │
│    Đơn vị │ Hệ thống số │ Nhiệm vụ │ Lộ trình │ Tài liệu    │
└──────────────────────────────────────────────────────────────┘
```

---

## NỘI DUNG CỐT LÕI CẦN THỂ HIỆN

> Dựa chính xác theo **Mẫu 01, 02, 03** của Bộ KHCN và **4 lớp kiến trúc** trong QĐ 1425.

### MODULE 1 — Tổng quan Khung KTS Tỉnh

```
Thông tin đơn vị
├── Tên Khung: "Khung Kiến trúc Chính quyền số tỉnh Vĩnh Long"
├── Phiên bản + Ngày ban hành + Đầu mối phụ trách
├── Giai đoạn áp dụng (ví dụ: 2026-2028)
├── Mục tiêu & chỉ tiêu chuyển đổi số
│   ├── KPI cụ thể (% dịch vụ công trực tuyến, % hồ sơ số hóa...)
│   └── Bài toán ưu tiên (top 3-5 vấn đề cần giải quyết bằng CĐS)
└── Nguyên tắc kiến trúc
```

### MODULE 2 — Hiện trạng Kiến trúc Số (Đánh giá)

> Tương ứng **Bước 2** trong quy trình 5 bước

**Lớp 1 — Hạ tầng số & An ninh mạng dùng chung:**
- Hạ tầng mạng (WAN, LAN, WiFi công cộng)
- Data center / thuê cloud
- Hệ thống SOC / giám sát ATTT
- Ai chủ quản? Trạng thái? Hạn chế?

**Lớp 2 — Dữ liệu & Nền tảng lõi:**
- Các CSDL đang có (dân cư, đất đai, hộ khẩu, doanh nghiệp...)
- Kết nối với CSDL quốc gia (VNeID, NDOP, Từ điển dữ liệu...)
- Nền tảng tích hợp, API gateway

**Lớp 3 — Ứng dụng & Nghiệp vụ dùng chung:**
- Các hệ thống CNTT đang vận hành (phần mềm quản lý văn bản, DVCTT, kế toán...)
- Phân loại: dùng chung toàn tỉnh / riêng từng Sở
- Trạng thái: hoạt động tốt / cần nâng cấp / cần thay thế

**Lớp 4 — Kênh tương tác & Đo lường:**
- Cổng DVCTT tỉnh (tích hợp Cổng DVCQG chưa?)
- App mobile, Zalo OA, SMS
- Chỉ số đo lường KPI hiện tại

### MODULE 3 — Kiến trúc Số Mục tiêu

> Tương ứng **Bước 3** — *"Cần có gì"*

- Sơ đồ kiến trúc mục tiêu (4 lớp) — **hiển thị dạng sơ đồ tương tác**
- Các thành phần dùng chung ưu tiên (từ Khung quốc gia: NDC, VNeID, NDOP...)
- Ranh giới quản trị: thành phần nào tỉnh tự quản, cái nào dùng chung quốc gia
- Điều kiện kết nối & chia sẻ dữ liệu

### MODULE 4 — Nội dung Cần Hoàn thiện & Lộ trình

> Tương ứng **Bước 4 + 5** — *trái tim của KTS*

**Bảng đối chiếu Hiện trạng vs. Mục tiêu:**
```
Thành phần | Hiện trạng | Mục tiêu | Phương án xử lý | Ưu tiên
───────────┼────────────┼──────────┼─────────────────┼────────
CSDL đất   │ Đã có, cũ  │ Kết nối  │ Chuẩn hóa, kết  │ Cao
đai        │            │ NDOP     │ nối              │
...        │ ...        │ ...      │ ...              │
```

**6 phương án xử lý** (theo Bộ KHCN):
1. ✅ Tiếp tục sử dụng nếu đã đáp ứng
2. 🔧 Chuẩn hóa, kết nối hoặc tích hợp
3. ⬆️ Nâng cấp, mở rộng
4. 🔀 Hợp nhất, tổ chức lại
5. ❌ Thay thế, kết thúc sử dụng
6. ➕ Bổ sung mới

**Bảng nhiệm vụ & lộ trình:**
```
Mã NV | Tên nhiệm vụ | Đơn vị chủ trì | Ưu tiên | Thời hạn | KPI | Tiến độ
```

### MODULE 5 — Dashboard Giám sát (cho Lãnh đạo)

**5 biểu đồ/widget cốt lõi:**

1. **Vòng tròn tiến độ tổng thể** — % nhiệm vụ Hoàn thành / Đang làm / Chưa bắt đầu / Trễ hạn
2. **Heat map** — Mức độ hoàn thiện theo từng Sở/Huyện
3. **Timeline lộ trình** — Các mốc quan trọng theo quý/năm
4. **Bảng cảnh báo** — Nhiệm vụ sắp đến hạn / đã trễ hạn
5. **Độ phủ dịch vụ số** — % dịch vụ công đã lên online, % tích hợp VNeID...

### MODULE 6 — Quản lý Hồ sơ & Tài liệu

- Upload/quản lý file: Mẫu 01 (DOCX/PDF), Mẫu 02 (sơ đồ), Mẫu 03 (XLSX)
- **Import từ XLSX Mẫu 03** → tự động điền vào database
- Export báo cáo ra PDF/Word theo định kỳ
- Lịch sử phiên bản (version history) — *bắt buộc theo quy định*

---

## LUỒNG DỮ LIỆU THEO MẪU 03 (XLSX CHUẨN BỘ KHCN)

```
File XLSX Mẫu 03 ──import──► Database
                              ├── DM_DOITUONG  (danh mục đối tượng KTS)
                              ├── QH_KETNOI    (quan hệ kết nối & chia sẻ)
                              ├── ANHXA        (ánh xạ đối tượng)
                              └── HOANTHIEN_NV (nội dung cần hoàn thiện + NV lộ trình)
                                                       │
                                                       ▼
                                              Dashboard & Portal hiển thị
```

---

## TECH STACK GỢI Ý

### Lựa chọn A — Nhanh, gọn, phù hợp team nhỏ

| Thành phần | Công nghệ | Lý do |
|-----------|-----------|-------|
| Frontend | **Next.js 14** (React) | SSR tốt cho portal công khai; App router |
| UI Library | **Ant Design** hoặc **shadcn/ui** | Component phong phú, dashboard đẹp |
| Biểu đồ | **Apache ECharts** hoặc **Recharts** | Sơ đồ kiến trúc + dashboard |
| Sơ đồ KTS | **React Flow** | Vẽ sơ đồ 4 lớp kiến trúc tương tác |
| Backend | **Node.js + Express** hoặc **NestJS** | RESTful API |
| Database | **PostgreSQL** | Quan hệ phức tạp, JSON support |
| Auth | **NextAuth.js** hoặc **Keycloak** | Phân quyền theo role |
| File storage | **MinIO** (tự host) hoặc S3 | Lưu PDF/DOCX/XLSX |

### Lựa chọn B — Nếu team có Java/.NET

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend | **Spring Boot 3** hoặc **.NET 8** |
| Frontend | **Vue 3 + Quasar** hoặc **Angular** |
| Database | **PostgreSQL** hoặc **SQL Server** |
| Sơ đồ | **mxGraph / GoJS** |

> ⚠️ **Lưu ý quan trọng**: Nếu sau này cần kết nối với **Hệ thống quản lý kiến trúc số quốc gia** của Bộ KHCN, cần thiết kế **API chuẩn** ngay từ đầu để tích hợp.

---

## CẤU TRÚC TRANG WEB GỢI Ý

```
/ (Trang chủ — Tổng quan KTS Vĩnh Long)
├── /kts                        (Xem Khung kiến trúc số)
│   ├── /kts/tong-quan          (Mục tiêu, bối cảnh, nguyên tắc)
│   ├── /kts/hien-trang         (Đánh giá 4 lớp hiện trạng)
│   ├── /kts/muc-tieu           (Sơ đồ kiến trúc mục tiêu — interactive)
│   ├── /kts/lo-trinh           (Bảng nhiệm vụ + timeline)
│   └── /kts/ho-so              (Tải file Mẫu 01, 02, 03)
│
├── /dashboard                  (Dashboard lãnh đạo)
│   ├── /dashboard/tong-the     (Biểu đồ tổng hợp)
│   ├── /dashboard/don-vi       (Tiến độ theo Sở/Huyện)
│   └── /dashboard/canh-bao     (Nhiệm vụ sắp/đã trễ hạn)
│
├── /don-vi                     (Danh sách Sở, Ban, Ngành, Huyện)
│   └── /don-vi/:id             (KTS của từng đơn vị)
│
└── /admin                      (Khu vực quản trị — cần đăng nhập)
    ├── /admin/nhap-lieu         (CMS nhập liệu KTS)
    ├── /admin/nhiem-vu          (Quản lý nhiệm vụ & lộ trình)
    ├── /admin/import            (Import từ XLSX Mẫu 03)
    └── /admin/tai-khoan         (Quản lý người dùng & phân quyền)
```

---

## LỘ TRÌNH PHÁT TRIỂN (MVP → Hoàn chỉnh)

### Giai đoạn 1 — MVP (4-6 tuần)
- [ ] Setup project, database schema theo 4 bảng Mẫu 03
- [ ] Auth + phân quyền 3 role
- [ ] Form nhập liệu cơ bản (Module 1, 4)
- [ ] Trang xem KTS tỉnh (Module 1, 2, 3)
- [ ] Bảng nhiệm vụ & lộ trình cơ bản

### Giai đoạn 2 — Dashboard (3-4 tuần)
- [ ] Dashboard giám sát tiến độ (Module 5)
- [ ] Import XLSX Mẫu 03 tự động
- [ ] Sơ đồ kiến trúc tương tác (React Flow / mxGraph)
- [ ] Phân cấp đơn vị Tỉnh → Sở/Huyện

### Giai đoạn 3 — Hoàn thiện (3-4 tuần)
- [ ] Export báo cáo PDF/Word
- [ ] Thông báo / cảnh báo nhiệm vụ
- [ ] Version history (lịch sử phiên bản Khung)
- [ ] Mobile responsive cho lãnh đạo xem trên điện thoại

---

## ĐIỂM KHÁC BIỆT VỚI PHƯƠNG ÁN 1 & 2

| Tiêu chí | PA 1 | PA 2 | **PA 3 (Đề xuất)** |
|----------|------|------|-------------------|
| Nhập liệu | ❌ | ✅ | ✅ |
| Dashboard lãnh đạo | ❌ | ❌ | ✅ |
| Phân cấp Tỉnh → Sở/Huyện | ❌ | ⚠️ Khó | ✅ |
| Import XLSX Mẫu 03 | ❌ | ⚠️ | ✅ |
| 1 hệ thống duy nhất | N/A | ❌ (2 web) | ✅ |
| Sơ đồ kiến trúc tương tác | ❌ | ⚠️ | ✅ |
| Kết nối tương lai với Bộ KHCN | ❌ | ⚠️ | ✅ (API chuẩn) |
| Cảnh báo nhiệm vụ trễ hạn | ❌ | ❌ | ✅ |
| Version history | ❌ | ❌ | ✅ |

---

## CÂU HỎI CÒN CẦN XÁC NHẬN

> [!IMPORTANT]
> Các câu hỏi sau sẽ ảnh hưởng đến thiết kế chi tiết:

1. **Phạm vi đơn vị**: Chỉ cấp tỉnh (UBND + các Sở), hay bao gồm cả cấp huyện/xã?
2. **Timeline**: Cần go-live khi nào? (QĐ 1425 yêu cầu hoàn thành trong 6 tháng)
3. **Team size**: Bao nhiêu dev? Full-stack hay có phân BE/FE?
4. **Dữ liệu ban đầu**: Tỉnh Vĩnh Long đã có KTS nào chưa, hay bắt đầu từ đầu?
5. **Cần public không?**: Portal xem có cho người dân/doanh nghiệp xem không, hay chỉ nội bộ?
