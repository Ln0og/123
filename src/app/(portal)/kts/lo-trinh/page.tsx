"use client";
import { useEffect, useState } from "react";
import { Table, Tag, Progress, Select, Card, Badge, Tooltip } from "antd";
import { WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { NhiemVuData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG, UU_TIEN_CONFIG, PHUONG_AN_CONFIG, formatDate, isOverdue, getDaysRemaining } from "@/lib/utils";

export default function LoTrinhPage() {
  const [data, setData] = useState<NhiemVuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLop, setFilterLop] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");

  useEffect(() => {
    fetch("/api/nhiem-vu")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const filtered = data.filter((d) => {
    if (filterLop && d.lop !== parseInt(filterLop)) return false;
    if (filterTrangThai && d.trangThai !== filterTrangThai) return false;
    return true;
  });

  const columns: ColumnsType<NhiemVuData> = [
    {
      title: "Mã",
      dataIndex: "ma",
      width: 80,
      render: (ma) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ma}</span>,
    },
    {
      title: "Nhiệm vụ",
      dataIndex: "ten",
      render: (ten, rec) => (
        <div>
          <div className="font-medium text-gray-800">{ten}</div>
          {rec.moTa && <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{rec.moTa}</div>}
          {rec.phuongAnXuLy && (
            <div className="text-xs mt-1 text-blue-600">
              {PHUONG_AN_CONFIG[rec.phuongAnXuLy] || rec.phuongAnXuLy}
            </div>
          )}
          {rec.heThongSos && rec.heThongSos.length > 0 && (
            <div className="mt-2 text-xs border-t border-dashed pt-1">
              <span className="text-gray-500 mr-1">Tác động đến Hệ thống:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {rec.heThongSos.map(ht => (
                  <Tooltip key={ht.id} title={ht.ten}>
                    <Tag className="m-0 text-[10px] cursor-pointer bg-blue-50 border-blue-200 text-blue-600">
                      {ht.ma}
                    </Tag>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 120,
      filters: [1, 2, 3, 4].map((l) => ({ text: LOP_CONFIG[l as 1|2|3|4].shortLabel, value: l })),
      onFilter: (value, record) => record.lop === value,
      render: (lop) => {
        const cfg = LOP_CONFIG[lop as 1|2|3|4];
        return (
          <Tag style={{ color: cfg.color, borderColor: cfg.borderColor, backgroundColor: cfg.bgColor }}>
            {cfg.icon} Lớp {lop}
          </Tag>
        );
      },
    },
    {
      title: "Đơn vị",
      dataIndex: ["donViChuTri", "ten"],
      width: 160,
      render: (_, rec) => rec.donViChuTri?.ten || "—",
    },
    {
      title: "Ưu tiên",
      dataIndex: "uuTien",
      width: 100,
      render: (uuTien) => {
        const cfg = UU_TIEN_CONFIG[uuTien] || { label: uuTien, color: "#8c8c8c" };
        return <Tag color={uuTien === "cao" ? "red" : uuTien === "trung-binh" ? "orange" : "green"}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Thời hạn",
      dataIndex: "thoiHan",
      width: 120,
      render: (thoiHan, rec) => {
        if (!thoiHan) return "—";
        const overdue = isOverdue(thoiHan) && rec.trangThai !== "hoan-thanh";
        const days = getDaysRemaining(thoiHan);
        return (
          <Tooltip title={days !== null ? (overdue ? `Trễ ${Math.abs(days)} ngày` : `Còn ${days} ngày`) : ""}>
            <span className={overdue ? "text-red-500 font-semibold" : days !== null && days <= 30 ? "text-orange-500" : "text-gray-600"}>
              {overdue && <WarningOutlined className="mr-1" />}
              {formatDate(thoiHan)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Tiến độ",
      dataIndex: "tienDo",
      width: 160,
      render: (tienDo, rec) => (
        <div>
          <Progress
            percent={tienDo}
            size="small"
            status={rec.trangThai === "tre-han" ? "exception" : rec.trangThai === "hoan-thanh" ? "success" : "active"}
            strokeColor={
              rec.trangThai === "hoan-thanh" ? "#52c41a" :
              rec.trangThai === "tre-han" ? "#ff4d4f" :
              tienDo > 50 ? "#1677ff" : "#faad14"
            }
          />
          <div className="text-xs text-gray-400 mt-0.5">
            {TRANG_THAI_CONFIG[rec.trangThai]?.label || rec.trangThai}
          </div>
        </div>
      ),
    },
  ];

  const tongHT = data.filter(d => d.trangThai === 'hoan-thanh').length;
  const tongDT = data.filter(d => d.trangThai === 'dang-thuc-hien').length;
  const tongTH = data.filter(d => d.trangThai === 'tre-han' || (d.thoiHan && isOverdue(d.thoiHan) && d.trangThai !== 'hoan-thanh')).length;

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Lộ trình Nhiệm vụ Chuyển đổi Kiến trúc</h1>
        <p className="text-blue-200 mt-1">
          Theo dõi tiến độ các nhiệm vụ chuyển đổi kiến trúc số theo lộ trình 2026–2028
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-4 mb-4">
        <Badge count={data.length} color="#1677ff" overflowCount={99}>
          <Card size="small" className="px-4 py-2 min-w-[100px] text-center">
            <div className="text-lg font-bold text-gray-800">{data.length}</div>
            <div className="text-xs text-gray-400">Tổng nhiệm vụ</div>
          </Card>
        </Badge>
        <Card size="small" className="px-4 py-2 min-w-[100px] text-center bg-green-50 border-green-200">
          <div className="text-lg font-bold text-green-600"><CheckCircleOutlined /> {tongHT}</div>
          <div className="text-xs text-gray-400">Hoàn thành</div>
        </Card>
        <Card size="small" className="px-4 py-2 min-w-[100px] text-center bg-blue-50 border-blue-200">
          <div className="text-lg font-bold text-blue-600"><ClockCircleOutlined /> {tongDT}</div>
          <div className="text-xs text-gray-400">Đang thực hiện</div>
        </Card>
        <Card size="small" className="px-4 py-2 min-w-[100px] text-center bg-red-50 border-red-200">
          <div className="text-lg font-bold text-red-600"><WarningOutlined /> {tongTH}</div>
          <div className="text-xs text-gray-400">Cảnh báo</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 font-medium">Lọc:</span>
          <Select
            placeholder="Tất cả lớp"
            allowClear
            style={{ width: 200 }}
            onChange={setFilterLop}
          >
            {[1, 2, 3, 4].map((l) => (
              <Select.Option key={l} value={String(l)}>
                {LOP_CONFIG[l as 1|2|3|4].icon} {LOP_CONFIG[l as 1|2|3|4].shortLabel}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Tất cả trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={setFilterTrangThai}
          >
            {Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v.label}</Select.Option>
            ))}
          </Select>
          <span className="text-gray-400 text-sm ml-auto">
            Hiển thị {filtered.length}/{data.length} nhiệm vụ
          </span>
        </div>
      </Card>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowClassName={(record) => {
            if (record.trangThai === "hoan-thanh") return "bg-green-50";
            if (isOverdue(record.thoiHan) && record.trangThai !== "hoan-thanh") return "bg-red-50";
            return "";
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
