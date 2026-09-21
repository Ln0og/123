"use client";
import Link from "next/link";
import { ApartmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Bar */}
      <header className="bg-white border-b shadow-xs sticky top-0 z-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center shadow-xs">
              <ApartmentOutlined className="text-white text-base" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-blue-950 text-base">KTS Vĩnh Long</div>
              <div className="text-slate-400 text-xs font-medium">Khung Kiến Trúc Chính Quyền Số Tổng Thể</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button size="middle" icon={<HomeOutlined />} className="font-semibold text-slate-600 border-slate-200 hover:text-blue-600">
                Trang chủ
              </Button>
            </Link>
            <Link href="/admin">
              <Button type="primary" size="middle" style={{ backgroundColor: "#003087" }} className="font-bold shadow-xs">
                Quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
