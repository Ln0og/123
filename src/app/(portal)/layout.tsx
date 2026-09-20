"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApartmentOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Xác định view hiện tại để set giá trị cho Segmented
  const currentValue = pathname.includes("/kts/lo-trinh") ? "lo-trinh" : "hien-trang";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
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
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Nút Segmented Control dạng Pill */}
        <div className="flex justify-center mb-10">
          <div className="p-1 bg-gray-200/50 rounded-lg shadow-inner">
            <Segmented
              size="large"
              value={currentValue}
              onChange={(val) => {
                if (val === "hien-trang") router.push("/kts/hien-trang");
                else router.push("/kts/lo-trinh");
              }}
              className="bg-transparent"
              options={[
                {
                  label: (
                    <div className="px-8 py-2 text-base font-semibold">
                      📊 Đánh giá Hiện trạng
                    </div>
                  ),
                  value: "hien-trang",
                },
                {
                  label: (
                    <div className="px-8 py-2 text-base font-semibold">
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
