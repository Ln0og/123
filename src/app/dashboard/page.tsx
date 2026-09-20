"use client";
import { useEffect, useState } from "react";
import { Card, Progress, Table, Tag, Statistic, Spin, Alert } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { DashboardStats, NhiemVuData } from "@/types";
import { LOP_CONFIG, formatDate, isOverdue } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  if (!stats) return <Alert message="Không tải được dữ liệu" type="error" />;

  const pieData = [
    { name: "Hoàn thành", value: stats.hoanThanh, color: "#52c41a" },
    { name: "Đang thực hiện", value: stats.dangThucHien, color: "#1677ff" },
    { name: "Chưa bắt đầu", value: stats.chuaBatDau, color: "#8c8c8c" },
    { name: "Trễ hạn", value: stats.treHan, color: "#ff4d4f" },
  ].filter(d => d.value > 0);

  const barData = stats.nhiemVuTheoLop.map((l) => ({
    name: LOP_CONFIG[l.lop as 1|2|3|4]?.shortLabel || `Lớp ${l.lop}`,
    "Tổng": l.total,
    "Hoàn thành": l.hoanThanh,
    "Còn lại": l.total - l.hoanThanh,
  }));

  const alertColumns: ColumnsType<NhiemVuData> = [
    {
      title: "Mã",
      dataIndex: "ma",
      width: 70,
      render: (ma) => <span className="font-mono text-xs">{ma}</span>,
    },
    { title: "Nhiệm vụ", dataIndex: "ten", ellipsis: true },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 80,
      render: (lop) => {
        const cfg = LOP_CONFIG[lop as 1|2|3|4];
        return <Tag style={{ color: cfg.color, backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}>{cfg.icon} {lop}</Tag>;
      },
    },
    {
      title: "Thời hạn",
      dataIndex: "thoiHan",
      width: 110,
      render: (d, rec) => {
        const overdue = isOverdue(d) && rec.trangThai !== "hoan-thanh";
        return (
          <span className={overdue ? "text-red-500 font-semibold" : "text-orange-500"}>
            {overdue && <WarningOutlined className="mr-1" />}
            {formatDate(d)}
          </span>
        );
      },
    },
    {
      title: "Tiến độ",
      dataIndex: "tienDo",
      width: 100,
      render: (p) => <Progress percent={p} size="small" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="hero-gradient text-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex items-center gap-3 mb-1">
            <ApartmentOutlined className="text-2xl" />
            <div>
              <h1 className="text-2xl font-bold">Dashboard Lãnh đạo</h1>
              <p className="text-blue-200 text-sm">
                Giám sát tiến độ triển khai Khung Kiến trúc Số — Tỉnh Vĩnh Long
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <a href="/kts/hien-trang" className="px-4 py-2 bg-blue-800 bg-opacity-50 hover:bg-opacity-100 rounded-lg text-sm text-white transition flex items-center gap-2 border border-blue-700">
              Về Portal
            </a>
            <a href="/admin/he-thong" className="px-4 py-2 bg-white text-blue-900 hover:bg-gray-100 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
              Trang Quản trị
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
        {/* Cảnh báo trễ hạn */}
        {stats.treHan > 0 && (
          <Alert
            message={`⚠️ Có ${stats.treHan} nhiệm vụ trễ hạn cần xử lý gấp`}
            type="error"
            showIcon
            className="rounded-xl"
          />
        )}

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            {
              title: "Tổng nhiệm vụ",
              value: stats.tongNhiemVu,
              color: "#1677ff",
              icon: <ClockCircleOutlined />,
              bg: "#e6f4ff",
            },
            {
              title: "Hoàn thành",
              value: stats.hoanThanh,
              color: "#52c41a",
              icon: <CheckCircleOutlined />,
              bg: "#f6ffed",
            },
            {
              title: "Đang thực hiện",
              value: stats.dangThucHien,
              color: "#1677ff",
              icon: <ClockCircleOutlined />,
              bg: "#e6f4ff",
            },
            {
              title: "Trễ hạn",
              value: stats.treHan,
              color: "#ff4d4f",
              icon: <WarningOutlined />,
              bg: "#fff2f0",
            },
            {
              title: "Hệ thống số",
              value: stats.tongHeThong,
              color: "#722ed1",
              icon: <DatabaseOutlined />,
              bg: "#f9f0ff",
            },
          ].map((s) => (
            <Card
              key={s.title}
              className="stat-card border-0"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: s.color + "20", color: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                  <Statistic
                    title={<span className="text-gray-500 text-xs">{s.title}</span>}
                    value={s.value}
                    valueStyle={{ color: s.color, fontSize: 28, fontWeight: 700 }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress tổng thể */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-700 text-lg">Tiến độ tổng thể</span>
            <span className="text-2xl font-bold text-blue-600">{stats.phanTramHoanThanh}%</span>
          </div>
          <Progress
            percent={stats.phanTramHoanThanh}
            strokeWidth={16}
            strokeColor={{
              "0%": "#1677ff",
              "100%": "#52c41a",
            }}
            trailColor="#e8e8e8"
            format={(p) => `${p}% hoàn thành`}
          />
          <div className="flex gap-6 mt-3 text-sm text-gray-500">
            <span>✅ Hoàn thành: {stats.hoanThanh}</span>
            <span>🔵 Đang thực hiện: {stats.dangThucHien}</span>
            <span>⚪ Chưa bắt đầu: {stats.chuaBatDau}</span>
            <span>🔴 Trễ hạn: {stats.treHan}</span>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pie chart */}
          <Card title="Phân bổ trạng thái nhiệm vụ" className="shadow-sm">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar chart by layer */}
          <Card title="Tiến độ theo lớp kiến trúc" className="shadow-sm">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Hoàn thành" fill="#52c41a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Còn lại" fill="#e8e8e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 4 Lớp quick view */}
        <div className="grid grid-cols-4 gap-4">
          {stats.nhiemVuTheoLop.map((l) => {
            const cfg = LOP_CONFIG[l.lop as 1|2|3|4];
            const pct = l.total > 0 ? Math.round((l.hoanThanh / l.total) * 100) : 0;
            return (
              <Card
                key={l.lop}
                size="small"
                className="lop-card"
                style={{ borderColor: cfg.borderColor, backgroundColor: cfg.bgColor }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cfg.icon}</span>
                  <div>
                    <div className="font-bold text-xs" style={{ color: cfg.color }}>
                      Lớp {l.lop}
                    </div>
                    <div className="text-xs text-gray-500">{l.total} nhiệm vụ</div>
                  </div>
                </div>
                <Progress percent={pct} size="small" strokeColor={cfg.color} />
                <div className="text-xs text-gray-400 mt-1">
                  {l.hoanThanh}/{l.total} hoàn thành
                </div>
              </Card>
            );
          })}
        </div>

        {/* Cảnh báo nhiệm vụ sắp hạn/trễ hạn */}
        {stats.nhiemVuSapHanOrTreHan.length > 0 && (
          <Card
            title={
              <span className="flex items-center gap-2 text-orange-600">
                <WarningOutlined /> Nhiệm vụ cần chú ý (sắp đến hạn hoặc trễ hạn)
              </span>
            }
            className="shadow-sm border-orange-200"
            headStyle={{ backgroundColor: "#fff7e6", borderBottom: "1px solid #ffd591" }}
          >
            <Table
              columns={alertColumns}
              dataSource={stats.nhiemVuSapHanOrTreHan}
              rowKey="id"
              pagination={false}
              size="small"
              rowClassName={(r) =>
                isOverdue(r.thoiHan) && r.trangThai !== "hoan-thanh"
                  ? "bg-red-50"
                  : "bg-orange-50"
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
