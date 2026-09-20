"use client";
import { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, Card, message, Spin, Tag } from "antd";
import { SaveOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function AdminKhungPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [khungId, setKhungId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kts")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setKhungId(data.id);
          form.setFieldsValue({
            ...data,
            ngayBanHanh: data.ngayBanHanh ? dayjs(data.ngayBanHanh) : null,
          });
        }
        setLoading(false);
      });
  }, [form]);

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        id: khungId,
        ngayBanHanh: values.ngayBanHanh ? (values.ngayBanHanh as dayjs.Dayjs).toISOString() : null,
      };
      const res = await fetch("/api/kts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setKhungId(saved.id);
      message.success("Đã lưu thông tin Khung KTS!");
    } catch {
      message.error("Lỗi khi lưu!");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Thông tin Khung Kiến trúc Số</h1>
          <p className="text-gray-400 text-sm mt-0.5">Nhập và cập nhật thông tin Khung KTS của tỉnh (Mẫu 01)</p>
        </div>
        {khungId && <Tag icon={<CheckCircleOutlined />} color="success">Đã có dữ liệu</Tag>}
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-0">
        <div className="grid grid-cols-2 gap-6">
          <Card title="Thông tin cơ bản" className="shadow-sm">
            <Form.Item label="Tên Khung" name="tenKhung" rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: Khung Kiến trúc Chính quyền số tỉnh Vĩnh Long" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Phiên bản" name="phienBan">
                <Input placeholder="1.0" />
              </Form.Item>
              <Form.Item label="Ngày ban hành" name="ngayBanHanh">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </div>
            <Form.Item label="Giai đoạn áp dụng" name="giaiDoanApDung">
              <Input placeholder="2026 - 2028" />
            </Form.Item>
            <Form.Item label="Đầu mối phụ trách" name="daiDienPhuTrach">
              <Input placeholder="Sở Thông tin & Truyền thông tỉnh Vĩnh Long" />
            </Form.Item>
            <Form.Item label="Trạng thái" name="trangThai">
              <Select>
                <Select.Option value="draft">Dự thảo</Select.Option>
                <Select.Option value="published">Đã ban hành</Select.Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="Bối cảnh & Căn cứ" className="shadow-sm">
            <Form.Item label="Bối cảnh" name="boiCanh">
              <TextArea
                rows={8}
                placeholder="Mô tả bối cảnh, các văn bản pháp lý làm cơ sở xây dựng Khung KTS..."
              />
            </Form.Item>
          </Card>

          <Card title="Mục tiêu & Kết quả" className="shadow-sm">
            <Form.Item label="Mục tiêu" name="mucTieu">
              <TextArea
                rows={8}
                placeholder="Mô tả mục tiêu tổng quát, các chỉ tiêu cụ thể cần đạt được..."
              />
            </Form.Item>
          </Card>

          <Card title="Nguyên tắc Kiến trúc" className="shadow-sm">
            <Form.Item
              label="Nguyên tắc (mỗi nguyên tắc một dòng)"
              name="nguyenTac"
              help="Ví dụ: 1. Ưu tiên dùng chung, kế thừa"
            >
              <TextArea
                rows={8}
                placeholder={"1. Ưu tiên dùng chung, kế thừa tối đa\n2. Bảo đảm an toàn, an ninh mạng\n3. Hướng đến người dân và doanh nghiệp\n4. Đo lường được bằng dữ liệu\n5. Mở, linh hoạt, có khả năng mở rộng"}
              />
            </Form.Item>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            icon={<SaveOutlined />}
            size="large"
            style={{ backgroundColor: "#003087" }}
          >
            Lưu thông tin Khung KTS
          </Button>
        </div>
      </Form>
    </div>
  );
}
