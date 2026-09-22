"use client";
import { useEffect, useState, useMemo } from "react";
import { 
  Card, 
  Tag, 
  Progress, 
  Spin, 
  Empty, 
  Pagination, 
  Modal, 
  Descriptions, 
  Input, 
  Select, 
  Button, 
  Segmented, 
  Table, 
  Row, 
  Col 
} from "antd";
import { HeThongSoData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG, PHUONG_AN_CONFIG } from "@/lib/utils";
import { 
  DatabaseOutlined, 
  GlobalOutlined, 
  BankOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  AppstoreOutlined, 
  TableOutlined, 
  PieChartOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined, 
  ApartmentOutlined, 
  ThunderboltOutlined 
} from "@ant-design/icons";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend 
} from "recharts";

const { Search } = Input;

export default function HienTrangPage() {
  const [data, setData] = useState<HeThongSoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayType, setDisplayStyle] = useState<"table" | "cards">("table");
  const [selectedLop, setSelectedLop] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");
  const [filterDonVi, setFilterDonVi] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<HeThongSoData | null>(null);
  const PAGE_SIZE = 9;

  useEffect(() => {
    fetch("/api/he-thong")
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, []);

  // Filter options
  const donViOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const name = d.donVi?.ten || d.chuQuan;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedLop !== "all" && item.lop !== parseInt(selectedLop)) return false;
      if (filterTrangThai && item.trangThai !== filterTrangThai) return false;
      if (filterDonVi) {
        const dvName = item.donVi?.ten || item.chuQuan || "";
        if (!dvName.includes(filterDonVi)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMa = item.ma.toLowerCase().includes(q);
        const matchTen = item.ten.toLowerCase().includes(q);
        const matchMoTa = (item.moTa || "").toLowerCase().includes(q);
        const matchDonVi = (item.donVi?.ten || item.chuQuan || "").toLowerCase().includes(q);
        if (!matchMa && !matchTen && !matchMoTa && !matchDonVi) return false;
      }
      return true;
    });
  }, [data, selectedLop, filterTrangThai, filterDonVi, searchQuery]);

  // Statistics
  const totalCount = data.length;
  const lop1Count = data.filter((d) => d.lop === 1).length;
  const lop2Count = data.filter((d) => d.lop === 2).length;
  const lop3Count = data.filter((d) => d.lop === 3).length;
  const lop4Count = data.filter((d) => d.lop === 4).length;

  const dangVanHanhCount = data.filter((d) => d.trangThai === "dang-van-hanh").length;
  const canNangCapCount = data.filter((d) => d.trangThai === "can-nang-cap").length;
  const canThayTheCount = data.filter((d) => d.trangThai === "can-thay-the").length;

  // Chart data: by Layer
  const layerChartData = [
    { name: "Lớp 1: Hạ tầng", value: lop1Count, color: "#722ed1" },
    { name: "Lớp 2: Dữ liệu", value: lop2Count, color: "#1677ff" },
    { name: "Lớp 3: Ứng dụng", value: lop3Count, color: "#52c41a" },
    { name: "Lớp 4: Kênh tương tác", value: lop4Count, color: "#fa8c16" },
  ];

  // Chart data: top Departments
  const deptChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      let dept = d.donVi?.ten || d.chuQuan || "Khác";
      if (dept.length > 25) dept = dept.substring(0, 22) + "...";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [data]);

  // Chart data: by Deployment Year
  const yearChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      if (d.namTrienKhai && d.namTrienKhai > 2000) {
        counts[d.namTrienKhai] = (counts[d.namTrienKhai] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [data]);

  // Pagination slice for cards
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const renderModalContent = () => {
    if (!selectedItem) return null;
    const lopCfg = LOP_CONFIG[selectedItem.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
    const rawMoTa = selectedItem.moTa || "";
    const lines = rawMoTa.split(/\\n|\n/).filter((l) => l.trim() !== "");
    
    // Group values by key to prevent multiple duplicate rows
    const groupedAttributes: { key: string; values: string[] }[] = [];
    const keyMap = new Map<string, string[]>();

    lines.forEach((line) => {
      const parts = line.split("::");
      let key = "Thông tin bổ sung";
      let val = line.trim();
      if (parts.length >= 2) {
        key = parts[0].trim();
        val = parts.slice(1).join("::").trim();
      }
      if (!val) return;

      if (!keyMap.has(key)) {
        const arr: string[] = [];
        keyMap.set(key, arr);
        groupedAttributes.push({ key, values: arr });
      }
      keyMap.get(key)!.push(val);
    });

    const tenMienGroup = groupedAttributes.find((a) => a.key === "Tên miền");
    const otherGroups = groupedAttributes.filter((a) => a.key !== "Tên miền");

    return (
      <div className="mt-3 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md border ${lopCfg.badgeClass}`}>
            {lopCfg.icon} Lớp {selectedItem.lop}: {lopCfg.shortLabel}
          </span>
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-md border ${TRANG_THAI_CONFIG[selectedItem.trangThai]?.badgeClass || "bg-gray-100 text-gray-800 border-gray-300 font-bold"}`}>
            {TRANG_THAI_CONFIG[selectedItem.trangThai]?.label || selectedItem.trangThai}
          </span>
        </div>

        <Descriptions bordered column={1} size="small" labelStyle={{ width: "32%", backgroundColor: "#f8fafc", fontWeight: 600 }}>
          <Descriptions.Item label="Đơn vị chủ quản">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <BankOutlined className="text-blue-500" />
              {selectedItem.donVi?.ten || selectedItem.chuQuan || "Chưa xác định"}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Năm triển khai">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarOutlined className="text-gray-400" />
              <span>{selectedItem.namTrienKhai ? `Năm ${selectedItem.namTrienKhai}` : "Chưa xác định"}</span>
            </div>
          </Descriptions.Item>

          {tenMienGroup && tenMienGroup.values.length > 0 && (
            <Descriptions.Item label="Tên miền / Đường dẫn">
              <div className="flex flex-col gap-1">
                {tenMienGroup.values.map((tm, tmIdx) => (
                  <div key={tmIdx} className="flex items-center gap-2">
                    <GlobalOutlined className="text-blue-500" />
                    <a
                      href={tm.startsWith("http") ? tm : `https://${tm}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono text-xs"
                    >
                      {tm}
                    </a>
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          )}

          {otherGroups.map((attr, idx) => (
            <Descriptions.Item key={idx} label={attr.key}>
              {attr.values.length === 1 ? (
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {attr.values[0].startsWith("-") || attr.values[0].startsWith("'-")
                    ? attr.values[0].replace(/^['\-\s]+/, '')
                    : attr.values[0]}
                </div>
              ) : (
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-gray-700 m-0 p-0">
                  {attr.values.map((v, vIdx) => {
                    const cleanV = v.startsWith("-") || v.startsWith("'-") ? v.replace(/^['\-\s]+/, '') : v;
                    return (
                      <li key={vIdx} className="leading-relaxed pl-1">
                        {cleanV}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Descriptions.Item>
          ))}
        </Descriptions>

        {/* Cross-linking Nhiem Vu */}
        <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100">
          <div className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
            <ApartmentOutlined className="text-blue-600" />
            <span>Kế hoạch Lộ trình & Nhiệm vụ Nâng cấp / Thay thế:</span>
          </div>

          {selectedItem.nhiemVus && selectedItem.nhiemVus.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedItem.nhiemVus.map((nv, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-blue-200 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{nv.ten}</span>
                    </div>
                    <Tag color="blue">{nv.phuongAnXuLy ? (PHUONG_AN_CONFIG[nv.phuongAnXuLy] || nv.phuongAnXuLy) : "Đề xuất nâng cấp"}</Tag>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex justify-between items-center border-t border-dashed pt-1.5">
                    <span>Tiến độ thực hiện: <b>{nv.tienDo}%</b></span>
                    <span>Hạn chót: <b>{nv.thoiHan ? new Date(nv.thoiHan).toLocaleDateString("vi-VN") : "Chưa xác định"}</b></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-1">
              (Hệ thống đang vận hành ổn định, chưa có nhiệm vụ nâng cấp hoặc thay thế trong lộ trình hiện tại)
            </div>
          )}
        </div>
      </div>
    );
  };

  const tableColumns = [
    {
      title: "Tên hệ thống số / CSDL / Phần mềm",
      dataIndex: "ten",
      render: (ten: string, rec: HeThongSoData) => (
        <div className="group cursor-pointer">
          <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {ten}
          </div>
          {rec.moTa && (
            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">
              {rec.moTa.replace(/\\n|\n/g, " • ").replace(/::/g, ": ")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 140,
      render: (lop: number) => {
        const cfg = LOP_CONFIG[lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${cfg.badgeClass}`}>
            {cfg.icon} Lớp {lop}
          </span>
        );
      },
    },
    {
      title: "Đơn vị chủ quản",
      dataIndex: ["donVi", "ten"],
      width: 210,
      render: (_: unknown, rec: HeThongSoData) => (
        <div className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
          <BankOutlined className="text-gray-400" />
          <span>{rec.donVi?.ten || rec.chuQuan || "Chưa xác định"}</span>
        </div>
      ),
    },
    {
      title: "Năm",
      dataIndex: "namTrienKhai",
      width: 85,
      render: (nam: number | null) => nam ? <span className="text-xs font-semibold text-gray-700">{nam}</span> : <span className="text-gray-400">—</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 145,
      render: (tt: string) => {
        const cfg = TRANG_THAI_CONFIG[tt] || { label: tt, badgeClass: "bg-gray-100 text-gray-800 border-gray-300 font-bold" };
        return (
          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* 1. TOP BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Khung KTS Vĩnh Long (PB 1.0)
            </span>
            <span className="text-xs text-blue-300">Cập nhật theo QĐ 1425/QĐ-TTg</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0">
            Đánh Giá & Quản Lý Hiện Trạng Kiến Trúc Số
          </h1>
          <p className="text-sm text-blue-200/90 mt-1 mb-0 max-w-2xl">
            Tổng hợp kiểm kê <b>{totalCount} thành phần số</b> trên toàn tỉnh, phân tích theo 4 lớp chuẩn kiến trúc và trạng thái hoạt động.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            type="primary" 
            className="bg-white/20 border-white/30 text-white font-semibold hover:bg-white/30"
            onClick={() => {
              const el = document.getElementById("danh-muc-kiem-ke");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Xuống Danh Mục Kiểm Kê ↓
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1 (TRÊN): TỔNG QUAN DASHBOARD & BIỂU ĐỒ PHÂN TÍCH THỐNG KÊ */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        
        {/* Tiêu đề phần Dashboard */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <PieChartOutlined className="text-blue-600 text-xl" />
            <h2 className="text-lg font-bold text-slate-800 m-0 uppercase tracking-wide">
              Tổng Quan Thống Kê & Phân Tích Sức Khỏe Hệ Thống
            </h2>
          </div>
          <span className="text-xs text-slate-500">Số liệu cập nhật thời gian thực</span>
        </div>

        {/* 4 KPI Summary Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-purple-600 bg-white" size="small">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp 1: Hạ tầng & ATTT</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{lop1Count} <span className="text-xs font-normal text-gray-400">hệ thống</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                  🏗️
                </div>
              </div>
              <Progress percent={Math.round((lop1Count / totalCount) * 100)} strokeColor="#722ed1" size="small" className="mt-2 mb-0" />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-blue-600 bg-white" size="small">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp 2: Dữ liệu & Nền tảng</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{lop2Count} <span className="text-xs font-normal text-gray-400">hệ thống</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                  🗄️
                </div>
              </div>
              <Progress percent={Math.round((lop2Count / totalCount) * 100)} strokeColor="#1677ff" size="small" className="mt-2 mb-0" />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-green-600 bg-white" size="small">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp 3: Ứng dụng & Nghiệp vụ</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{lop3Count} <span className="text-xs font-normal text-gray-400">hệ thống</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 text-lg">
                  📱
                </div>
              </div>
              <Progress percent={Math.round((lop3Count / totalCount) * 100)} strokeColor="#52c41a" size="small" className="mt-2 mb-0" />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-orange-500 bg-white" size="small">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp 4: Kênh tương tác</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{lop4Count} <span className="text-xs font-normal text-gray-400">hệ thống</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 text-lg">
                  🌐
                </div>
              </div>
              <Progress percent={Math.round((lop4Count / totalCount) * 100)} strokeColor="#fa8c16" size="small" className="mt-2 mb-0" />
            </Card>
          </Col>
        </Row>

        {/* 3 Status highlight summary cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xs" size="small">
              <div className="flex items-center gap-3">
                <CheckCircleOutlined className="text-3xl text-green-600" />
                <div>
                  <div className="text-xs text-green-700 font-semibold uppercase">Đang vận hành ổn định</div>
                  <div className="text-2xl font-bold text-green-800">{dangVanHanhCount} <span className="text-xs font-normal text-green-600">({Math.round((dangVanHanhCount / totalCount) * 100)}%)</span></div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-xs" size="small">
              <div className="flex items-center gap-3">
                <WarningOutlined className="text-3xl text-amber-500" />
                <div>
                  <div className="text-xs text-amber-700 font-semibold uppercase">Cần nâng cấp / Hoàn thiện</div>
                  <div className="text-2xl font-bold text-amber-800">{canNangCapCount} <span className="text-xs font-normal text-amber-600">({Math.round((canNangCapCount / totalCount) * 100)}%)</span></div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-xs" size="small">
              <div className="flex items-center gap-3">
                <CloseCircleOutlined className="text-3xl text-red-500" />
                <div>
                  <div className="text-xs text-red-700 font-semibold uppercase">Cần thay thế / Hợp nhất</div>
                  <div className="text-2xl font-bold text-red-800">{canThayTheCount} <span className="text-xs font-normal text-red-600">({Math.round((canThayTheCount / totalCount) * 100)}%)</span></div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Sức khỏe 4 lớp kiến trúc & Phân bổ tổng thể */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={<span className="font-bold text-gray-800">🏥 Ma Trận Đánh Giá Tình Trạng Sức Khỏe Theo 4 Lớp</span>} className="shadow-xs h-full">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[1, 2, 3, 4].map((lop) => {
                      const items = data.filter((d) => d.lop === lop);
                      return {
                        name: `Lớp ${lop}: ${LOP_CONFIG[lop as 1|2|3|4].shortLabel}`,
                        "Đang vận hành": items.filter((d) => d.trangThai === "dang-van-hanh").length,
                        "Cần nâng cấp": items.filter((d) => d.trangThai === "can-nang-cap").length,
                        "Cần thay thế": items.filter((d) => d.trangThai === "can-thay-the").length,
                      };
                    })}
                    margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="Đang vận hành" fill="#16a34a" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Cần nâng cấp" fill="#eab308" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Cần thay thế" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title={<span className="font-bold text-gray-800">📊 Tỷ Trọng Phân Bổ Theo 4 Lớp</span>} className="shadow-xs h-full">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={layerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {layerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Top Departments & Historical Deployment Year */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="font-bold text-gray-800">🏛️ Top Cơ Quan Quản Lý Nhiều CSDL / Hệ Thống Nhất</span>} className="shadow-xs h-full">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Số lượng hệ thống" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={<span className="font-bold text-gray-800">📅 Lịch Sử Đưa Hệ Thống Vào Khai Thác Theo Năm</span>}
              className="shadow-xs h-full"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Số lượng đưa vào vận hành" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 2 (DƯỚI): DANH MỤC KIỂM KÊ 389 HỆ THỐNG SỐ & BỘ LỌC ĐA CHIỀU */}
      {/* ========================================================================= */}
      <div id="danh-muc-kiem-ke" className="space-y-4 pt-4 border-t-2 border-slate-200">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableOutlined className="text-blue-600 text-xl" />
            <h2 className="text-lg font-bold text-slate-800 m-0 uppercase tracking-wide">
              Danh Mục Kiểm Kê 389 Hệ Thống Số & CSDL Toàn Tỉnh
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            Tìm thấy {filteredData.length} / {totalCount} hệ thống
          </span>
        </div>

        {/* Filter Toolbar */}
        <Card className="shadow-xs" size="small">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <Search
                placeholder="Tìm theo tên phần mềm, CSDL, mô tả..."
                allowClear
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: 280 }}
                prefix={<SearchOutlined className="text-gray-400" />}
              />

              <Select
                placeholder="Tất cả lớp kiến trúc"
                value={selectedLop}
                onChange={(val) => {
                  setSelectedLop(val);
                  setCurrentPage(1);
                }}
                style={{ width: 190 }}
              >
                <Select.Option value="all">🌐 Tất cả các lớp ({totalCount})</Select.Option>
                {[1, 2, 3, 4].map((l) => (
                  <Select.Option key={l} value={String(l)}>
                    {LOP_CONFIG[l as 1 | 2 | 3 | 4].icon} {LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel}
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Tất cả đơn vị"
                allowClear
                value={filterDonVi || undefined}
                onChange={(val) => {
                  setFilterDonVi(val || "");
                  setCurrentPage(1);
                }}
                style={{ width: 220 }}
                showSearch
              >
                {donViOptions.map((dv) => (
                  <Select.Option key={dv} value={dv}>{dv}</Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Tất cả trạng thái"
                allowClear
                value={filterTrangThai || undefined}
                onChange={(val) => {
                  setFilterTrangThai(val || "");
                  setCurrentPage(1);
                }}
                style={{ width: 170 }}
              >
                {Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
                  <Select.Option key={k} value={k}>{v.label}</Select.Option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <Segmented
                  size="small"
                  value={displayType}
                  onChange={(val) => setDisplayStyle(val as "table" | "cards")}
                  options={[
                    { label: "Bảng", value: "table", icon: <TableOutlined /> },
                    { label: "Thẻ", value: "cards", icon: <AppstoreOutlined /> },
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Table or Cards */}
        {displayType === "table" ? (
          <Card className="shadow-xs rounded-xl">
            <Table
              columns={tableColumns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ pageSize: 15, showQuickJumper: true }}
              onRow={(record) => ({
                onClick: () => setSelectedItem(record),
                className: "cursor-pointer hover:bg-blue-50/50 transition-colors",
              })}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedCards.length === 0 ? (
              <Card className="py-12 text-center">
                <Empty description="Không tìm thấy hệ thống số nào phù hợp với bộ lọc." />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCards.map((item) => {
                  const lopCfg = LOP_CONFIG[item.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
                  const statusCfg = TRANG_THAI_CONFIG[item.trangThai] || { label: item.trangThai, antdColor: "default" };
                  const hasCrossLink = item.nhiemVus && item.nhiemVus.length > 0;

                  return (
                    <Card
                      key={item.id}
                      size="small"
                      hoverable
                      className="border border-gray-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between rounded-xl bg-white"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div>
                        {/* Card Top: Layer Tag & Status Tag */}
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${lopCfg.badgeClass}`}>
                              {lopCfg.icon} Lớp {item.lop}
                            </span>
                            <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                              {statusCfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors leading-snug mb-2">
                          {item.ten}
                        </h3>

                        {/* Department & Year */}
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          <div className="flex items-center gap-1.5 line-clamp-1">
                            <BankOutlined className="text-gray-400 shrink-0" />
                            <span>{item.donVi?.ten || item.chuQuan || "Chưa xác định"}</span>
                          </div>
                          {item.namTrienKhai && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <CalendarOutlined className="shrink-0" />
                              <span>Khai thác từ năm {item.namTrienKhai}</span>
                            </div>
                          )}
                        </div>

                        {/* Short Description */}
                        {item.moTa && (
                          <div className="text-xs text-gray-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            {item.moTa.replace(/\\n|\n/g, " • ").replace(/::/g, ": ")}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Cross-link Indicator */}
                      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                        {hasCrossLink ? (
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <ApartmentOutlined /> Có nhiệm vụ lộ trình
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Vận hành độc lập</span>
                        )}
                        <span className="text-blue-500 font-semibold hover:underline flex items-center gap-0.5">
                          Xem chi tiết →
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredData.length > PAGE_SIZE && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={filteredData.length}
                  onChange={(p) => setCurrentPage(p)}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="text-base font-bold text-gray-800 pr-6 leading-normal">
            {selectedItem?.ten}
          </div>
        }
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedItem(null)}>
            Đóng
          </Button>
        ]}
        width={750}
        destroyOnClose
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}
