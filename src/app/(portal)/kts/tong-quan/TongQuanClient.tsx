"use client";

import { Card, Tag, Descriptions } from "antd";
import {
  AimOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { KhungKTS } from "@prisma/client";

export default function TongQuanClient({ khung }: { khung: KhungKTS | null }) {
  if (!khung) {
    return (
      <div className="text-center py-16 text-gray-400">
        Chưa có dữ liệu Khung KTS. Vui lòng nhập liệu trong phần{" "}
        <a href="/admin/khung" className="text-blue-600">Quản trị</a>.
      </div>
    );
  }

  const nguyenTacs = khung.nguyenTac?.split("\n").filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-2">
          <Tag color="gold">Phiên bản {khung.phienBan}</Tag>
          <Tag color={khung.trangThai === "published" ? "green" : "orange"}>
            {khung.trangThai === "published" ? "Đã ban hành" : "Dự thảo"}
          </Tag>
        </div>
        <h1 className="text-2xl font-bold">{khung.tenKhung}</h1>
        <div className="text-blue-200 mt-1 flex gap-4 text-sm">
          <span>
            <CalendarOutlined className="mr-1" />
            Giai đoạn: {khung.giaiDoanApDung || "—"}
          </span>
          <span>
            <UserOutlined className="mr-1" />
            Đầu mối: {khung.daiDienPhuTrach || "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Bối cảnh */}
        <Card
          className="col-span-2"
          title={
            <span className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-600" />
              Bối cảnh & Căn cứ
            </span>
          }
        >
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {khung.boiCanh || "Chưa có thông tin."}
          </p>
        </Card>

        {/* Thông tin chung */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <CalendarOutlined className="text-green-600" />
              Thông tin chung
            </span>
          }
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Tên Khung">
              {khung.tenKhung}
            </Descriptions.Item>
            <Descriptions.Item label="Phiên bản">
              {khung.phienBan}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày ban hành">
              {khung.ngayBanHanh
                ? new Date(khung.ngayBanHanh).toLocaleDateString("vi-VN")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Giai đoạn">
              {khung.giaiDoanApDung || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={khung.trangThai === "published" ? "green" : "orange"}>
                {khung.trangThai === "published" ? "Đã ban hành" : "Dự thảo"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đầu mối">
              {khung.daiDienPhuTrach || "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      {/* Mục tiêu */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <AimOutlined className="text-red-500" />
            Mục tiêu & Kết quả cần đạt
          </span>
        }
      >
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {khung.mucTieu || "Chưa có thông tin."}
        </p>
      </Card>

      {/* Nguyên tắc */}
      {nguyenTacs.length > 0 && (
        <Card
          title={
            <span className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-600" />
              Nguyên tắc Kiến trúc
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {nguyenTacs.map((nt: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100"
              >
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-gray-700 text-sm">
                  {nt.replace(/^\d+\.\s*/, "")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
