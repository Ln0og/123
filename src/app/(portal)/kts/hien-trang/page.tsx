"use client";
import { useEffect, useState } from "react";
import { Card, Tag, Progress, Tabs, Badge, Tooltip, Spin, Empty, Pagination } from "antd";
import { HeThongSoData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG } from "@/lib/utils";

export default function HienTrangPage() {
  const [data, setData] = useState<HeThongSoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    fetch("/api/he-thong")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const byLop = (lop: number) => data.filter((d) => d.lop === lop);

  const TrangThaiTag = ({ trangThai }: { trangThai: string }) => {
    const cfg = TRANG_THAI_CONFIG[trangThai];
    return cfg ? (
      <Tag color={cfg.antdColor}>{cfg.label}</Tag>
    ) : (
      <Tag>{trangThai}</Tag>
    );
  };

  const HeThongCard = ({ item }: { item: HeThongSoData }) => {
    return (
      <Card
        size="small"
        className="mb-3 border hover:shadow-md transition-shadow"
        title={
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800">{item.ten}</span>
            <TrangThaiTag trangThai={item.trangThai} />
          </div>
        }
        extra={
          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
            {item.ma}
          </span>
        }
      >
        {item.moTa && (
          <p className="text-gray-600 text-sm mb-3 whitespace-pre-line line-clamp-3" title={item.moTa}>{item.moTa}</p>
        )}
        <div className="flex gap-4 text-xs text-gray-400">
          {item.chuQuan && (
            <span>🏢 Chủ quản: <strong className="text-gray-600">{item.chuQuan}</strong></span>
          )}
          {item.namTrienKhai && (
            <span>📅 Triển khai: <strong className="text-gray-600">{item.namTrienKhai}</strong></span>
          )}
          {item.donVi && (
            <span>📍 Đơn vị: <strong className="text-gray-600">{item.donVi.ten}</strong></span>
          )}
        </div>
      </Card>
    );
  };

  const LopTab = ({ lop, items }: { lop: 1 | 2 | 3 | 4, items: HeThongSoData[] }) => {
    const [page, setPage] = useState(1);
    const pageSize = 15;
    
    const cfg = LOP_CONFIG[lop];
    const dangVanHanh = items.filter((i) => i.trangThai === "dang-van-hanh").length;
    const canNangCap = items.filter((i) => i.trangThai === "can-nang-cap").length;
    const canThayThe = items.filter((i) => i.trangThai === "can-thay-the").length;

    const currentItems = items.slice((page - 1) * pageSize, page * pageSize);

    return (
      <div>
        {/* Summary */}
        <div
          className="p-4 rounded-xl mb-4 border"
          style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{cfg.icon}</span>
            <div>
              <div className="font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="text-gray-500 text-sm">Tổng cộng: {items.length} hệ thống/thành phần</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge color="green" text={<span className="text-sm">Đang vận hành: {dangVanHanh}</span>} />
            <Badge color="orange" text={<span className="text-sm">Cần nâng cấp: {canNangCap}</span>} />
            <Badge color="red" text={<span className="text-sm">Cần thay thế: {canThayThe}</span>} />
          </div>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <Empty description="Chưa có hệ thống nào trong lớp này" />
        ) : (
          <>
            {currentItems.map((item) => <HeThongCard key={item.id} item={item} />)}
            <div className="flex justify-center mt-6">
              <Pagination 
                current={page} 
                total={items.length} 
                pageSize={pageSize} 
                onChange={setPage} 
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const tabItems = ([1, 2, 3, 4] as const).map((lop) => {
    const items = byLop(lop);
    const cfg = LOP_CONFIG[lop];
    const count = items.length;
    return {
      key: String(lop),
      label: (
        <span className="flex items-center gap-2">
          <span>{cfg.icon}</span>
          <span>{cfg.shortLabel}</span>
          <Badge count={count} style={{ backgroundColor: cfg.color }} />
        </span>
      ),
      children: <LopTab lop={lop} items={items} />,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Đánh giá Hiện trạng Kiến trúc Số</h1>
        <p className="text-blue-200 mt-1">
          Kiểm kê và đánh giá các thành phần số hiện có theo 4 lớp kiến trúc
        </p>
      </div>

      {/* Tổng quan nhanh */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {([1, 2, 3, 4] as const).map((lop) => {
          const cfg = LOP_CONFIG[lop];
          const items = byLop(lop);
          const pct =
            items.length > 0
              ? Math.round(
                  (items.filter((i) => i.trangThai === "dang-van-hanh").length /
                    items.length) *
                    100
                )
              : 0;
          return (
            <Card
              key={lop}
              size="small"
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(String(lop))}
              style={{ borderColor: cfg.borderColor, backgroundColor: cfg.bgColor }}
            >
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-xs font-medium mb-2" style={{ color: cfg.color }}>
                {cfg.shortLabel}
              </div>
              <Tooltip title={`${items.filter(i => i.trangThai === 'dang-van-hanh').length}/${items.length} đang vận hành tốt`}>
                <Progress
                  percent={pct}
                  size="small"
                  strokeColor={cfg.color}
                  format={(p) => `${p}%`}
                />
              </Tooltip>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}
