"use client";
import Link from "next/link";
import { Button, Card, Statistic, Tag } from "antd";
import {
  DatabaseOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { LOP_CONFIG } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const stats = [
    { label: "Hệ thống số", value: 10, suffix: "hệ thống", color: "#1677ff" },
    { label: "Nhiệm vụ lộ trình", value: 8, suffix: "nhiệm vụ", color: "#722ed1" },
    { label: "Hoàn thành", value: 0, suffix: "%", color: "#52c41a" },
    { label: "Đơn vị tham gia", value: 8, suffix: "đơn vị", color: "#fa8c16" },
  ];

  const principles = [
    "Ưu tiên dùng chung, kế thừa tối đa",
    "Bảo đảm an toàn, an ninh mạng xuyên suốt",
    "Hướng đến người dân và doanh nghiệp",
    "Đo lường được bằng dữ liệu",
    "Mở, linh hoạt, có khả năng mở rộng",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="hero-gradient text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <ApartmentOutlined className="text-blue-800 text-lg" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">UBND Tỉnh Vĩnh Long</div>
              <div className="text-blue-200 text-xs">Khung Kiến trúc Chính quyền Số</div>
            </div>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/kts/tong-quan" className="text-white hover:text-blue-200 text-sm transition-colors">
              Tổng quan
            </Link>
            <Link href="/kts/hien-trang" className="text-white hover:text-blue-200 text-sm transition-colors">
              Hiện trạng
            </Link>
            <Link href="/kts/muc-tieu" className="text-white hover:text-blue-200 text-sm transition-colors">
              Mục tiêu
            </Link>
            <Link href="/kts/lo-trinh" className="text-white hover:text-blue-200 text-sm transition-colors">
              Lộ trình
            </Link>
            <Link href="/admin">
              <Button type="primary" size="small" danger>
                Quản trị
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Tag color="gold">Phiên bản 1.0</Tag>
            <Tag color="green">Đã ban hành</Tag>
            <span className="text-blue-200 text-sm">Theo QĐ 1425/QĐ-TTg ngày 29/7/2026</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Khung Kiến trúc<br />
            <span className="text-yellow-300">Chính quyền Số</span> tỉnh Vĩnh Long
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            Hệ thống quản lý, giám sát và triển khai Khung Kiến trúc số đồng bộ,
            thống nhất, kết nối liên thông với Khung Kiến trúc Tổng thể Quốc gia Số.
          </p>
          <div className="flex gap-4">
            <Link href="/kts/tong-quan">
              <Button type="primary" size="large" className="bg-yellow-400 border-yellow-400 text-yellow-900 hover:bg-yellow-300 font-semibold">
                Xem Khung KTS <RightOutlined />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="stat-card text-center shadow-md">
              <Statistic
                title={<span className="text-gray-600 text-sm">{s.label}</span>}
                value={s.value}
                suffix={<span className="text-gray-400 text-base">{s.suffix}</span>}
                valueStyle={{ color: s.color, fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          ))}
        </div>
      </section>

      {/* 4 Lớp kiến trúc */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">4 Lớp Kiến trúc Số</h2>
          <p className="text-gray-500 mt-2">
            Cấu trúc theo chuẩn Khung Kiến trúc Tổng thể Quốc gia Số (QĐ 1425/QĐ-TTg)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {([1, 2, 3, 4] as const).map((lop) => {
            const config = LOP_CONFIG[lop];
            return (
              <Card
                key={lop}
                className="lop-card cursor-pointer"
                style={{
                  borderColor: config.borderColor,
                  backgroundColor: config.bgColor,
                }}
                onClick={() =>
                  router.push(`/kts/hien-trang?lop=${lop}`)
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: config.color + "20" }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: config.color }}
                    >
                      Lớp {lop}
                    </div>
                    <div className="font-bold text-gray-800 text-base mb-1">
                      {config.shortLabel}
                    </div>
                    <div className="text-gray-500 text-sm">{config.label.split("—")[1]?.trim()}</div>
                  </div>
                  <RightOutlined className="ml-auto" style={{ color: config.color }} />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Nguyên tắc */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Nguyên tắc Kiến trúc
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {principles.map((p, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {i + 1}
                </div>
                <div className="text-gray-700 text-sm font-medium">{p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Căn cứ pháp lý */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Căn cứ pháp lý
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: <SafetyCertificateOutlined />,
              title: "QĐ 1425/QĐ-TTg",
              desc: "Ban hành Khung Kiến trúc tổng thể quốc gia số (PB 1.0) — Thủ tướng Chính phủ, 29/7/2026",
              color: "#003087",
            },
            {
              icon: <DatabaseOutlined />,
              title: "Luật Chuyển đổi số 2025",
              desc: "Luật số về chuyển đổi số, có hiệu lực từ 1/1/2026",
              color: "#1677ff",
            },
            {
              icon: <CheckCircleOutlined />,
              title: "NQ 57-NQ/TW",
              desc: "Nghị quyết Bộ Chính trị về đột phá phát triển KH&CN, đổi mới sáng tạo và chuyển đổi số quốc gia",
              color: "#52c41a",
            },
          ].map((item, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <div className="flex gap-3 items-start">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{item.title}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-gradient text-white py-8 px-6 mt-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-semibold mb-1">UBND Tỉnh Vĩnh Long</div>
          <div className="text-blue-200 text-sm">
            Hệ thống Quản lý Khung Kiến trúc Chính quyền Số — Phiên bản 1.0 | 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
