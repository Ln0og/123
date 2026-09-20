"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Spin, Tag } from "antd";
import {
  DashboardOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { SessionProvider } from "next-auth/react";

const { Sider, Header, Content } = Layout;

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang kiểm tra đăng nhập..." />
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { key: "/admin/khung", icon: <ApartmentOutlined />, label: <Link href="/admin/khung">Thông tin Khung KTS</Link> },
    { key: "/admin/he-thong", icon: <AppstoreOutlined />, label: <Link href="/admin/he-thong">Hệ thống số</Link> },
    { key: "/admin/nhiem-vu", icon: <OrderedListOutlined />, label: <Link href="/admin/nhiem-vu">Nhiệm vụ & Lộ trình</Link> },
    { key: "/admin/import", icon: <UploadOutlined />, label: <Link href="/admin/import">Import XLSX</Link> },
  ];

  const userMenu = {
    items: [
      { key: "portal", icon: <HomeOutlined />, label: <Link href="/">Về trang portal</Link> },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true, onClick: () => signOut({ callbackUrl: "/login" }) },
    ],
  };

  const user = session.user as { name: string; email: string; role: string };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} theme="dark" style={{ background: "#001a3e" }}>
        <div className="p-4 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ApartmentOutlined className="text-white text-sm" />
            </div>
            <div>
              <div className="text-white text-sm font-bold leading-tight">KTS Vĩnh Long</div>
              <div className="text-blue-300 text-xs">Quản trị hệ thống</div>
            </div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ background: "#001a3e", border: "none", marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "white",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div className="text-gray-500 text-sm">
            Hệ thống Quản lý Khung Kiến trúc Số — Tỉnh Vĩnh Long
          </div>
          <Dropdown menu={userMenu} trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg">
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#003087" }} />
              <div className="text-sm">
                <div className="font-medium text-gray-700 leading-tight">{user.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  {user.email}
                  <Tag color={user.role === "admin" ? "red" : user.role === "editor" ? "blue" : "default"} className="ml-1" style={{ fontSize: 10, padding: "0 4px", lineHeight: "16px" }}>
                    {user.role === "admin" ? "Admin" : user.role === "editor" ? "Biên tập" : "Xem"}
                  </Tag>
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: "#f5f6fa" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
