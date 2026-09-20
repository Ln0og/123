# Kế hoạch chuyển đổi sang ASP.NET Core MVC (.NET 7)

Dự án `NQ57_github` (PropertyRental) đang sử dụng nền tảng công nghệ:
*   **Ngôn ngữ:** C# 11
*   **Framework:** ASP.NET Core MVC (.NET 7.0)
*   **Database ORM:** Entity Framework Core 7 (Sử dụng SQL Server)
*   **Thư viện nổi bật:** EPPlus / ClosedXML (xuất nhập Excel), AutoMapper, NetTopologySuite (bản đồ/GIS), Razor Runtime Compilation.

Việc chuyển đổi dự án **Khung Kiến trúc Số (KTS)** từ Next.js/React sang .NET 7 MVC để có thể tích hợp trực tiếp vào dự án trên là một sự thay đổi toàn diện về kiến trúc. Dưới đây là kế hoạch chi tiết.

> [!WARNING] Cảnh báo Đập đi Xây lại (Rewrite)
> Việc chuyển đổi này đồng nghĩa với việc chúng ta sẽ không sử dụng Next.js, Prisma và React nữa. Mã nguồn hiện tại sẽ được thay thế hoàn toàn bằng C# và Razor Views.

## User Review Required
Bạn có đồng ý chuyển đổi toàn bộ dự án hiện tại (Node.js) sang .NET 7 không? Quá trình này sẽ mất thời gian để code lại các trang giao diện bằng Razor Views (HTML/JS/CSS).

## Proposed Changes

Quá trình chuyển đổi sẽ được chia làm 4 giai đoạn chính để đảm bảo hệ thống vẫn hoạt động tốt:

### 1. Khởi tạo & Cấu trúc dự án .NET
*   Tạo project ASP.NET Core MVC mới bằng .NET 7 CLI (hoặc tích hợp dưới dạng Area/Module nếu đưa thẳng vào NQ57_github).
*   Cài đặt các packages cần thiết: `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools`.

### 2. Thiết kế Database (Code-First với EF Core)
Chuyển đổi Schema của Prisma sang các Models (Entities) trong C#:
#### [NEW] Models/KhungKts.cs
#### [NEW] Models/HeThongSo.cs
#### [NEW] Models/NhiemVu.cs
#### [NEW] Models/DonVi.cs
#### [NEW] Data/KtsDbContext.cs

### 3. Xây dựng Controllers & API
Chuyển đổi logic xử lý từ Next.js Route Handlers sang C# Controllers:
#### [NEW] Controllers/PortalController.cs (Trang chủ, Lộ trình, Hiện trạng)
#### [NEW] Controllers/AdminController.cs (Quản trị Hệ thống, Đơn vị, Nhiệm vụ)
#### [NEW] Controllers/AuthController.cs (Xử lý Đăng nhập qua Cookie Authentication)

### 4. Chuyển đổi Giao diện sang Razor Views
Chuyển đổi mã React sang `.cshtml`:
#### [NEW] Views/Shared/_Layout.cshtml (Layout chính với menu)
#### [NEW] Views/Shared/_AdminLayout.cshtml
#### [NEW] Views/Portal/HienTrang.cshtml (Dùng JS/jQuery để xử lý tabs và phân trang thay vì React state)
#### [NEW] Views/Admin/NhiemVu.cshtml (Dùng Datatables.net để thay thế Ant Design Table)

> [!NOTE] Về các biểu đồ & Sơ đồ (React Flow / Recharts)
> Trong môi trường MVC, chúng ta sẽ sử dụng thư viện JavaScript thuần như **Chart.js / ECharts** (cho Dashboard) và **Mermaid.js / GoJS** (cho sơ đồ 4 lớp) thay vì các thư viện của React.

## Verification Plan

### Manual Verification
1. Run `dotnet ef migrations add InitialCreate` và `dotnet ef database update` để đảm bảo CSDL SQL Server được tạo thành công.
2. Seed dữ liệu mẫu qua Entity Framework `HasData`.
3. Khởi chạy IIS Express hoặc Kestrel (`dotnet run`).
4. Truy cập giao diện và test các luồng: Xem Hiện trạng, Dashboard, Đăng nhập Admin, Quản lý Hệ thống Số.
