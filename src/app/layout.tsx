import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Khung Kiến trúc Số - Tỉnh Vĩnh Long",
  description: "Hệ thống quản lý Khung Kiến trúc Chính quyền số tỉnh Vĩnh Long",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
