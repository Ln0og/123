"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ApartmentOutlined, BarChartOutlined } from "@ant-design/icons";
import { Button } from "antd";

const navItems = [
  { href: "/kts/hien-trang", label: "Hiện trạng" },
  { href: "/kts/lo-trinh", label: "Lộ trình" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
              <ApartmentOutlined className="text-white text-sm" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-blue-900 text-sm">KTS Vĩnh Long</div>
              <div className="text-gray-400 text-xs">Khung Kiến trúc Số</div>
            </div>
          </Link>
          <nav className="flex gap-1 flex-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block ${
                    pathname === item.href
                      ? "bg-blue-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button type="primary" size="small" style={{ backgroundColor: "#003087" }}>
                Quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
