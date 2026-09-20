"use client";
import { useState } from "react";
import { Card, Form, Input, Button, message, Divider } from "antd";
import { LockOutlined, MailOutlined, ApartmentOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      message.success("Đăng nhập thành công!");
      router.push("/admin/khung");
    } else {
      message.error("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-2xl border-0"
        style={{ borderRadius: 16 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ApartmentOutlined className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
          <p className="text-gray-400 text-sm mt-1">
            Hệ thống Quản lý Khung Kiến trúc Số<br />
            <span className="font-medium text-blue-700">Tỉnh Vĩnh Long</span>
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-300" />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300" />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ backgroundColor: "#003087", height: 48, borderRadius: 8, fontSize: 16 }}
          >
            Đăng nhập
          </Button>
        </Form>

        <Divider className="my-4" />
        <div className="text-center text-xs text-gray-300">
          <div className="font-medium text-gray-400 mb-1">Tài khoản demo:</div>
          <div>admin@vinhlong.gov.vn / admin123</div>
          <div>editor@vinhlong.gov.vn / editor123</div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  );
}
