"use client";
import { useEffect, useState } from "react";
import { Card, Tag, Progress, Tabs, Badge, Spin, Empty, Pagination, Modal, Descriptions } from "antd";
import { HeThongSoData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG } from "@/lib/utils";
import { 
  DatabaseOutlined, 
  GlobalOutlined, 
  BankOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

export default function HienTrangPage() {
  const [data, setData] = useState<HeThongSoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLop, setSelectedLop] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<HeThongSoData | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch("/api/he-thong")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const HeThongCard = ({ item }: { item: HeThongSoData }) => {
    return (
      <Card
        size="small"
        className="mb-3 border hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
              {item.ten}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span><BankOutlined /> {item.donVi?.ten || item.chuQuan || "Chưa xác định"}</span>
              {item.namTrienKhai && (
                <>
                  <span className="text-gray-300">|</span>
                  <span><CalendarOutlined /> Năm {item.namTrienKhai}</span>
                </>
              )}
            </div>
            {item.moTa && (
              <div className="text-xs text-gray-400 mt-2 line-clamp-1 italic bg-gray-50 p-1 px-2 rounded border border-gray-100">
                {item.moTa.replace(/\n/g, ' • ')}
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1 rounded">
              {item.ma}
            </span>
            <Tag color={TRANG_THAI_CONFIG[item.trangThai]?.antdColor || "default"} className="m-0 text-[10px]">
              {TRANG_THAI_CONFIG[item.trangThai]?.label || item.trangThai}
            </Tag>
          </div>
        </div>
      </Card>
    );
  };

  const renderLop = (lop: number) => {
    const items = data.filter((d) => d.lop === lop);
    const config = LOP_CONFIG[lop as 1 | 2 | 3 | 4];
    
    const total = items.length;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedItems = items.slice(startIndex, startIndex + PAGE_SIZE);

    return (
      <div className="py-4 animate-fade-in">
        <div 
          className="p-4 rounded-xl mb-6 flex justify-between items-center"
          style={{ backgroundColor: config.bgColor, border: `1px solid ${config.borderColor}` }}
        >
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: config.color }}>
              <span className="text-2xl">{config.icon}</span> Lớp {lop} — {config.label}
            </h2>
            <p className="text-gray-600 mt-1">Tổng cộng: {items.length} hệ thống/thành phần</p>
          </div>
          <div className="flex gap-4 text-sm bg-white p-2 px-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Đang vận hành: {items.filter(i => i.trangThai === 'dang-van-hanh').length}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Cần nâng cấp: {items.filter(i => i.trangThai === 'can-nang-cap').length}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div> Cần thay thế: {items.filter(i => i.trangThai === 'can-thay-the').length}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Empty description="Chưa có dữ liệu lớp này" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-1">
              {paginatedItems.map((item) => (
                <HeThongCard key={item.id} item={item} />
              ))}
            </div>
            {total > PAGE_SIZE && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderModalContent = () => {
    if (!selectedItem) return null;
    const lopCfg = LOP_CONFIG[selectedItem.lop as 1|2|3|4];
    
    const moTaLines = selectedItem.moTa ? selectedItem.moTa.split('\n') : [];
    const tenMien = moTaLines.find(l => l.startsWith('Tên miền:'))?.replace('Tên miền:', '').trim();
    const duLieu = moTaLines.find(l => l.startsWith('Dữ liệu chia sẻ:'))?.replace('Dữ liệu chia sẻ:', '').trim();
    const phamVi = moTaLines.find(l => l.startsWith('Phạm vi:'))?.replace('Phạm vi:', '').trim();
    
    const plainMoTa = moTaLines.filter(l => !l.startsWith('Tên miền:') && !l.startsWith('Dữ liệu chia sẻ:') && !l.startsWith('Phạm vi:')).join('\n');

    return (
      <div className="mt-4">
        <div className="flex gap-2 mb-4">
          <Tag style={{ color: lopCfg.color, borderColor: lopCfg.borderColor, backgroundColor: lopCfg.bgColor }}>
            {lopCfg.icon} Lớp {selectedItem.lop}
          </Tag>
          <Tag color={TRANG_THAI_CONFIG[selectedItem.trangThai]?.antdColor || "default"}>
            {TRANG_THAI_CONFIG[selectedItem.trangThai]?.label || selectedItem.trangThai}
          </Tag>
          <Tag className="font-mono text-xs">{selectedItem.ma}</Tag>
        </div>

        <Descriptions bordered column={1} size="small" labelStyle={{ width: '30%', backgroundColor: '#f8fafc', fontWeight: 600 }}>
          <Descriptions.Item label="Đơn vị chủ quản">
            <div className="flex items-center gap-2">
              <BankOutlined className="text-gray-400" />
              {selectedItem.donVi?.ten || selectedItem.chuQuan || "Chưa xác định"}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Năm triển khai">
            {selectedItem.namTrienKhai || "Chưa xác định"}
          </Descriptions.Item>

          {tenMien && (
            <Descriptions.Item label="Tên miền truy cập">
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-blue-500" />
                <a href={tenMien.startsWith('http') ? tenMien : `https://${tenMien}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {tenMien}
                </a>
              </div>
            </Descriptions.Item>
          )}

          {duLieu && (
            <Descriptions.Item label="Dữ liệu chia sẻ">
              <div className="flex gap-2">
                <DatabaseOutlined className="text-green-500 mt-1" />
                <span className="whitespace-pre-line">{duLieu}</span>
              </div>
            </Descriptions.Item>
          )}

          {phamVi && (
            <Descriptions.Item label="Phạm vi chia sẻ">
              <span className="whitespace-pre-line">{phamVi}</span>
            </Descriptions.Item>
          )}

          {(plainMoTa || (!tenMien && !duLieu && !phamVi)) && (
            <Descriptions.Item label="Mô tả / Thông tin khác">
              <div className="whitespace-pre-line text-gray-600">
                {plainMoTa || selectedItem.moTa || "Chưa có mô tả chi tiết."}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải dữ liệu hiện trạng..." />
      </div>
    );
  }

  const lop1Count = data.filter((d) => d.lop === 1).length;
  const lop2Count = data.filter((d) => d.lop === 2).length;
  const lop3Count = data.filter((d) => d.lop === 3).length;
  const lop4Count = data.filter((d) => d.lop === 4).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="text-2xl font-bold">Đánh giá Hiện trạng Kiến trúc Số</h1>
        <p className="text-blue-200 mt-1">Kiểm kê và đánh giá các thành phần số hiện có theo 4 lớp kiến trúc</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { lop: 1, count: lop1Count, total: 50 },
          { lop: 2, count: lop2Count, total: 300 },
          { lop: 3, count: lop3Count, total: 150 },
          { lop: 4, count: lop4Count, total: 20 },
        ].map((stat) => {
          const cfg = LOP_CONFIG[stat.lop as 1|2|3|4];
          const pct = Math.min(100, Math.round((stat.count / stat.total) * 100));
          return (
            <Card key={stat.lop} size="small" className="text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-xs font-bold mb-2" style={{ color: cfg.color }}>{cfg.shortLabel}</div>
              <Progress percent={pct} size="small" strokeColor={cfg.color} showInfo={false} />
              <div className="text-[10px] text-gray-400 mt-1">{stat.count} hệ thống</div>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <Tabs
          activeKey={selectedLop}
          onChange={(key) => { setSelectedLop(key); setCurrentPage(1); }}
          items={[
            {
              key: "1",
              label: <span className="font-semibold"><Badge count={lop1Count} color={LOP_CONFIG[1].color} className="mr-2" /> Hạ tầng số</span>,
              children: renderLop(1),
            },
            {
              key: "2",
              label: <span className="font-semibold"><Badge count={lop2Count} color={LOP_CONFIG[2].color} className="mr-2" /> Dữ liệu & NTL</span>,
              children: renderLop(2),
            },
            {
              key: "3",
              label: <span className="font-semibold"><Badge count={lop3Count} color={LOP_CONFIG[3].color} className="mr-2" /> Ứng dụng</span>,
              children: renderLop(3),
            },
            {
              key: "4",
              label: <span className="font-semibold"><Badge count={lop4Count} color={LOP_CONFIG[4].color} className="mr-2" /> Kênh tương tác</span>,
              children: renderLop(4),
            },
          ]}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 text-lg text-blue-900 border-b pb-3">
            <InfoCircleOutlined className="text-blue-600" /> 
            Thông tin chi tiết Hệ thống
          </div>
        }
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        footer={null}
        width={720}
        destroyOnClose
        className="top-8"
      >
        {selectedItem && (
          <div className="pt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedItem.ten}</h3>
            {renderModalContent()}
          </div>
        )}
      </Modal>
    </div>
  );
}
