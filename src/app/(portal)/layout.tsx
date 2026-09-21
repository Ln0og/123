"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApartmentOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Xác định view hiện tại để set giá trị cho Segmented
  let currentValue = "hien-trang";
  if (pathname.includes("/kts/so-do")) {
    currentValue = "so-do";
  } else if (pathname.includes("/kts/lo-trinh")) {
    currentValue = "lo-trinh";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center shadow-inner">
              <ApartmentOutlined className="text-white text-sm" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-blue-900 text-sm">KTS Vĩnh Long</div>
              <div className="text-gray-400 text-xs">Khung Kiến trúc Số</div>
            </div>
          </Link>
          
          <div className="flex gap-2">
            <Link href="/admin">
              <Button type="primary" size="small" style={{ backgroundColor: "#003087" }}>
                Quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 md:px-8 py-5">
        {/* Nút Segmented Control dạng Pill */}
        <div className="flex justify-center mb-6">
          <div className="p-1 bg-gray-200/60 rounded-xl shadow-inner border border-gray-300/60">
            <Segmented
              size="large"
              value={currentValue}
              onChange={(val) => {
                if (val === "so-do") router.push("/kts/so-do");
                else if (val === "hien-trang") router.push("/kts/hien-trang");
                else router.push("/kts/lo-trinh");
              }}
              className="bg-transparent font-medium"
              options={[
                {
                  label: (
                    <div className="px-5 py-1.5 text-sm sm:text-base font-semibold">
                      🏛️ Sơ đồ Khung KTS
                    </div>
                  ),
                  value: "so-do",
                },
                {
                  label: (
                    <div className="px-5 py-1.5 text-sm sm:text-base font-semibold">
                      📊 Đánh giá Hiện trạng
                    </div>
                  ),
                  value: "hien-trang",
                },
                {
                  label: (
                    <div className="px-5 py-1.5 text-sm sm:text-base font-semibold">
                      🚀 Kế hoạch Lộ trình
                    </div>
                  ),
                  value: "lo-trinh",
                },
              ]}
            />
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
}
