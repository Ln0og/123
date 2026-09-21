"use client";
import { useEffect, useState, useMemo } from "react";
import { 
  Table, 
  Tag, 
  Progress, 
  Select, 
  Card, 
  Badge, 
  Tooltip, 
  Modal, 
  Descriptions, 
  Button, 
  Input, 
  Segmented,
  Row,
  Col,
  Empty,
  Spin,
  Timeline
} from "antd";
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BankOutlined, 
  CalendarOutlined, 
  ApartmentOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  EyeOutlined,
  PieChartOutlined,
  TableOutlined,
  FieldTimeOutlined,
  SearchOutlined,
  FireOutlined,
  RiseOutlined,
  FlagOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { NhiemVuData } from "@/types";
import { 
  LOP_CONFIG, 
  TRANG_THAI_CONFIG, 
  UU_TIEN_CONFIG, 
  PHUONG_AN_CONFIG, 
  formatDate, 
  isOverdue, 
  getDaysRemaining 
} from "@/lib/utils";
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

export default function LoTrinhPage() {
  const [data, setData] = useState<NhiemVuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"dashboard" | "table" | "timeline">("dashboard");
  const [filterLop, setFilterLop] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");
  const [filterUuTien, setFilterUuTien] = useState<string>("");
  const [filterDonVi, setFilterDonVi] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<NhiemVuData | null>(null);

  useEffect(() => {
    fetch("/api/nhiem-vu")
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

  // Department filter options
  const donViOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const name = d.donViChuTri?.ten;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (filterLop && d.lop !== parseInt(filterLop)) return false;
      if (filterTrangThai && d.trangThai !== filterTrangThai) return false;
      if (filterUuTien && d.uuTien !== filterUuTien) return false;
      if (filterDonVi) {
        const dv = d.donViChuTri?.ten || "";
        if (!dv.includes(filterDonVi)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMa = d.ma.toLowerCase().includes(q);
        const matchTen = d.ten.toLowerCase().includes(q);
        const matchMoTa = (d.moTa || "").toLowerCase().includes(q);
        const matchDonVi = (d.donViChuTri?.ten || "").toLowerCase().includes(q);
        if (!matchMa && !matchTen && !matchMoTa && !matchDonVi) return false;
      }
      return true;
    });
  }, [data, filterLop, filterTrangThai, filterUuTien, filterDonVi, searchQuery]);

  // Key KPI stats
  const totalTasks = data.length;
  const tongHT = data.filter((d) => d.trangThai === "hoan-thanh").length;
  const tongDT = data.filter((d) => d.trangThai === "dang-thuc-hien").length;
  const tongCBD = data.filter((d) => d.trangThai === "chua-bat-dau").length;
  const tongTH = data.filter(
    (d) => d.trangThai === "tre-han" || (d.thoiHan && isOverdue(d.thoiHan) && d.trangThai !== "hoan-thanh")
  ).length;

  const avgProgress = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.tienDo, 0);
    return Math.round(sum / data.length);
  }, [data]);

  // Chart data: Progress by Task with STT
  const taskProgressChartData = useMemo(() => {
    return data.map((d, idx) => ({
      name: `STT ${idx + 1}`,
      fullName: d.ten,
      tienDo: d.tienDo,
      lop: `Lớp ${d.lop}`,
    }));
  }, [data]);

  // Chart data: by Priority
  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = { cao: 0, "trung-binh": 0, thap: 0 };
    data.forEach((d) => {
      counts[d.uuTien] = (counts[d.uuTien] || 0) + 1;
    });
    return [
      { name: "Ưu tiên Cao", value: counts.cao, color: "#ff4d4f" },
      { name: "Ưu tiên Trung bình", value: counts["trung-binh"], color: "#faad14" },
      { name: "Ưu tiên Thấp", value: counts.thap, color: "#52c41a" },
    ];
  }, [data]);

  // Chart data: by Solution / Phương án xử lý
  const solutionChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const key = d.phuongAnXuLy || "Khác";
      const label = PHUONG_AN_CONFIG[key] ? PHUONG_AN_CONFIG[key].replace(/^[^ ]+ /, '') : key;
      counts[label] = (counts[label] || 0) + 1;
    });
    const colors = ["#1677ff", "#722ed1", "#52c41a", "#fa8c16", "#13c2c2", "#eb2f96"];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [data]);

  // Grouped tasks by Year for Timeline view
  const tasksByYear = useMemo(() => {
    const groups: Record<string, NhiemVuData[]> = {};
    data.forEach((d) => {
      let year = "Giai đoạn 2026–2030";
      if (d.thoiHan) {
        const y = new Date(d.thoiHan).getFullYear();
        if (y) year = `Năm ${y}`;
      }
      if (!groups[year]) groups[year] = [];
      groups[year].push(d);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const columns: ColumnsType<NhiemVuData> = [
    {
      title: "STT",
      key: "stt",
      width: 75,
      align: "center",
      render: (_, __, index) => (
        <span className="font-bold text-gray-700 bg-gray-100 border border-gray-200/80 px-2.5 py-1 rounded-full text-xs">
          {index + 1}
        </span>
      ),
    },
    {
      title: "Nhiệm vụ & Mục tiêu",
      dataIndex: "ten",
      render: (ten, rec) => (
        <div className="group">
          <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <span>{ten}</span>
            <EyeOutlined className="text-gray-300 group-hover:text-blue-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {rec.moTa && <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{rec.moTa}</div>}
          {rec.phuongAnXuLy && (
            <div className="text-xs mt-1 text-blue-600 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {PHUONG_AN_CONFIG[rec.phuongAnXuLy] || rec.phuongAnXuLy}
            </div>
          )}
          {rec.heThongSos && rec.heThongSos.length > 0 && (
            <div className="mt-2 text-xs border-t border-dashed pt-1">
              <span className="text-gray-500 mr-1">Tác động đến Hệ thống:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {rec.heThongSos.map((ht) => (
                  <Tooltip key={ht.id} title={ht.ten}>
                    <Tag className="m-0 text-[10px] bg-blue-50 text-blue-600 border-blue-200">{ht.ten}</Tag>
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
      width: 140,
      filters: [1, 2, 3, 4].map((l) => ({ text: LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel, value: l })),
      onFilter: (value, record) => record.lop === value,
      render: (lop) => {
        const cfg = LOP_CONFIG[lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${cfg.badgeClass}`}>
            {cfg.icon} Lớp {lop}
          </span>
        );
      },
    },
    {
      title: "Đơn vị chủ trì",
      dataIndex: ["donViChuTri", "ten"],
      width: 180,
      render: (_, rec) => (
        <div className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
          <BankOutlined className="text-gray-400" />
          <span>{rec.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}</span>
        </div>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "uuTien",
      width: 120,
      render: (uuTien) => {
        const cfg = UU_TIEN_CONFIG[uuTien] || { label: uuTien, badgeClass: "bg-gray-100 text-gray-800 border-gray-300 font-bold" };
        return (
          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Thời hạn",
      dataIndex: "thoiHan",
      width: 130,
      render: (thoiHan, rec) => {
        if (!thoiHan) return "—";
        const overdue = isOverdue(thoiHan) && rec.trangThai !== "hoan-thanh";
        const days = getDaysRemaining(thoiHan);
        return (
          <Tooltip title={days !== null ? (overdue ? `Trễ ${Math.abs(days)} ngày` : `Còn ${days} ngày`) : ""}>
            <span className={overdue ? "text-red-600 font-bold" : days !== null && days <= 30 ? "text-amber-600 font-bold" : "text-gray-700 font-medium"}>
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
              rec.trangThai === "hoan-thanh" ? "#15803d" :
              rec.trangThai === "tre-han" ? "#b91c1c" :
              tienDo > 50 ? "#1d4ed8" : "#d97706"
            }
          />
          <div className="text-xs font-semibold text-gray-500 mt-0.5">
            {TRANG_THAI_CONFIG[rec.trangThai]?.label || rec.trangThai}
          </div>
        </div>
      ),
    },
  ];

  const renderModalContent = () => {
    if (!selectedTask) return null;
    const taskIndex = data.findIndex(t => t.id === selectedTask.id);
    const sttNumber = taskIndex >= 0 ? taskIndex + 1 : 1;
    const lopCfg = LOP_CONFIG[selectedTask.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
    const overdue = selectedTask.thoiHan ? isOverdue(selectedTask.thoiHan) && selectedTask.trangThai !== "hoan-thanh" : false;
    const days = selectedTask.thoiHan ? getDaysRemaining(selectedTask.thoiHan) : null;

    return (
      <div className="mt-3 space-y-4">
        {/* Badges and Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-bold text-sm bg-blue-100 text-blue-950 border border-blue-400 px-3 py-1 rounded-md">
            STT: #{sttNumber}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md border ${lopCfg.badgeClass}`}>
            {lopCfg.icon} Lớp {selectedTask.lop}: {lopCfg.shortLabel}
          </span>
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-md border ${UU_TIEN_CONFIG[selectedTask.uuTien]?.badgeClass || "bg-gray-100 text-gray-800 border-gray-300 font-bold"}`}>
            Ưu tiên: {UU_TIEN_CONFIG[selectedTask.uuTien]?.label || selectedTask.uuTien}
          </span>
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-md border ${TRANG_THAI_CONFIG[selectedTask.trangThai]?.badgeClass || "bg-gray-100 text-gray-800 border-gray-300 font-bold"}`}>
            {TRANG_THAI_CONFIG[selectedTask.trangThai]?.label || selectedTask.trangThai}
          </span>
        </div>

        {/* Descriptions Details */}
        <Descriptions bordered column={1} size="small" labelStyle={{ width: "32%", backgroundColor: "#f8fafc", fontWeight: 600 }}>
          <Descriptions.Item label="Đơn vị chủ trì">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <BankOutlined className="text-blue-500" />
              {selectedTask.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Thời hạn hoàn thành">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-400" />
              <span>{selectedTask.thoiHan ? formatDate(selectedTask.thoiHan) : "Chưa xác định"}</span>
              {days !== null && (
                <Tag color={overdue ? "error" : days <= 30 ? "warning" : "processing"} className="ml-2">
                  {overdue ? `Trễ hạn ${Math.abs(days)} ngày` : `Còn lại ${days} ngày`}
                </Tag>
              )}
            </div>
          </Descriptions.Item>

          {selectedTask.giaiDoan && (
            <Descriptions.Item label="Giai đoạn áp dụng">
              {selectedTask.giaiDoan}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Phương án xử lý">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <ThunderboltOutlined />
              <span>{PHUONG_AN_CONFIG[selectedTask.phuongAnXuLy || ""] || selectedTask.phuongAnXuLy || "Nâng cấp, phát triển mới"}</span>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Tiến độ thực tế">
            <div className="w-full max-w-md py-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Mức độ hoàn thành</span>
                <span className="font-bold text-gray-800">{selectedTask.tienDo}%</span>
              </div>
              <Progress
                percent={selectedTask.tienDo}
                status={selectedTask.trangThai === "tre-han" ? "exception" : selectedTask.trangThai === "hoan-thanh" ? "success" : "active"}
                strokeColor={
                  selectedTask.trangThai === "hoan-thanh" ? "#52c41a" :
                  selectedTask.trangThai === "tre-han" ? "#ff4d4f" :
                  selectedTask.tienDo > 50 ? "#1677ff" : "#faad14"
                }
              />
            </div>
          </Descriptions.Item>

          {selectedTask.moTa && (
            <Descriptions.Item label="Mục tiêu & Mô tả">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedTask.moTa}
              </div>
            </Descriptions.Item>
          )}

          {selectedTask.kpi && (
            <Descriptions.Item label="Chỉ số KPI / Kết quả đầu ra">
              <div className="flex items-start gap-2 text-gray-700">
                <CheckSquareOutlined className="text-green-500 mt-0.5" />
                <span>{selectedTask.kpi}</span>
              </div>
            </Descriptions.Item>
          )}

          {selectedTask.nguonKiemChung && (
            <Descriptions.Item label="Nguồn kiểm chứng / Căn cứ">
              <div className="flex items-start gap-2 text-gray-600">
                <FileTextOutlined className="text-blue-500 mt-0.5" />
                <span>{selectedTask.nguonKiemChung}</span>
              </div>
            </Descriptions.Item>
          )}

          {selectedTask.ghiChu && (
            <Descriptions.Item label="Ghi chú">
              <span className="italic text-gray-500">{selectedTask.ghiChu}</span>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Impacted Systems List */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
            <ApartmentOutlined className="text-blue-600" />
            <span>Các Hệ Thống Số Hiện Trạng Chịu Tác Động / Liên Quan:</span>
          </div>

          {selectedTask.heThongSos && selectedTask.heThongSos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {selectedTask.heThongSos.map((ht) => (
                <div key={ht.id} className="bg-white p-2.5 rounded border border-gray-200 shadow-2xs flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800 text-xs line-clamp-1">{ht.ten}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{ht.donVi?.ten || ht.chuQuan || "Chưa xác định"}</div>
                  </div>
                  <Tag className="m-0 text-[10px] bg-blue-50 text-blue-600 border-blue-200">{ht.ten}</Tag>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-1">
              (Nhiệm vụ này là đề án xây dựng nền tảng mới hoặc tác động tổng thể trên toàn tỉnh)
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <RiseOutlined /> Lộ trình 2026–2030
            </span>
            <span className="text-xs text-blue-300">Căn cứ Quyết định 1425/QĐ-TTg</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0">
            Kế Hoạch & Lộ Trình Chuyển Đổi Kiến Trúc Số
          </h1>
          <p className="text-sm text-blue-200/90 mt-1 mb-0 max-w-2xl">
            Theo dõi tiến độ, mốc thời gian hoàn thành, phân công đơn vị chủ trì và đo lường kết quả thực thi các nhiệm vụ số hóa.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/20">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "dashboard" | "table" | "timeline")}
            options={[
              { label: "📊 Dashboard Tiến Độ", value: "dashboard", icon: <PieChartOutlined /> },
              { label: "📋 Bảng Nhiệm Vụ", value: "table", icon: <TableOutlined /> },
              { label: "⏳ Mốc Thời Gian", value: "timeline", icon: <FieldTimeOutlined /> },
            ]}
            className="bg-white/20 text-white"
          />
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-blue-600 bg-white" size="small">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Nhiệm Vụ</div>
                <div className="text-2xl font-bold text-gray-800 mt-1">{totalTasks} <span className="text-xs font-normal text-gray-400">dự án</span></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                <FlagOutlined />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Tiến độ bình quân toàn tỉnh: <b>{avgProgress}%</b></div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-amber-500 bg-white" size="small">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đang Triển Khai</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">{tongDT} <span className="text-xs font-normal text-gray-400">nhiệm vụ</span></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                <ClockCircleOutlined />
              </div>
            </div>
            <Progress percent={Math.round((tongDT / totalTasks) * 100)} strokeColor="#faad14" size="small" className="mt-2 mb-0" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-green-600 bg-white" size="small">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã Hoàn Thành</div>
                <div className="text-2xl font-bold text-green-600 mt-1">{tongHT} <span className="text-xs font-normal text-gray-400">nhiệm vụ</span></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 text-lg">
                <CheckCircleOutlined />
              </div>
            </div>
            <Progress percent={Math.round((tongHT / totalTasks) * 100)} strokeColor="#52c41a" size="small" className="mt-2 mb-0" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs hover:shadow-md transition-all border-l-4 border-l-red-500 bg-white" size="small">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cảnh Báo / Trễ Hạn</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{tongTH} <span className="text-xs font-normal text-gray-400">nhiệm vụ</span></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 text-lg">
                <WarningOutlined />
              </div>
            </div>
            <div className="text-xs text-red-500 mt-2 font-medium">
              {tongTH > 0 ? "Cần đôn đốc tiến độ" : "Các mốc thời gian đảm bảo"}
            </div>
          </Card>
        </Col>
      </Row>

      {/* DASHBOARD VIEW */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">

          {/* 2 Donut / Pie Charts: Priority & Solution */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<span className="font-bold text-gray-800">🎯 Phân Bổ Theo Mức Độ Ưu Tiên</span>} className="shadow-xs h-full">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {priorityChartData.map((entry, index) => (
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

            <Col xs={24} lg={12}>
              <Card title={<span className="font-bold text-gray-800">⚡ Phân Bổ Theo Phương Án Xử Lý</span>} className="shadow-xs h-full">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={solutionChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {solutionChartData.map((entry, index) => (
                          <Cell key={`cell-sol-${index}`} fill={entry.color} />
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

          {/* Quick Highlight Cards for Urgent Tasks */}
          <Card title={<span className="font-bold text-gray-800">🔥 Nhiệm Vụ Trọng Tâm & Ưu Tiên Cao Cần Đẩy Nhanh</span>} className="shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data
                .filter((d) => d.uuTien === "cao")
                .map((task) => {
                  const idx = data.findIndex(t => t.id === task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 bg-gradient-to-br from-red-50/40 via-white to-orange-50/30 rounded-xl border border-red-200/80 hover:border-red-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            STT #{idx + 1}
                          </span>
                          <Tag color="red">Ưu tiên Cao</Tag>
                        </div>
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors mb-1">
                          {task.ten}
                        </h4>
                        <div className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {task.moTa || "Chưa có mô tả chi tiết."}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tiến độ</span>
                          <span className="font-bold text-gray-700">{task.tienDo}%</span>
                        </div>
                        <Progress percent={task.tienDo} size="small" strokeColor="#ff4d4f" />
                        <div className="text-[11px] text-gray-400 mt-2 flex justify-between">
                          <span>Hạn: {task.thoiHan ? formatDate(task.thoiHan) : "—"}</span>
                          <span className="text-blue-600 font-semibold hover:underline">Chi tiết →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}

      {/* FILTER CONTROLS (Available in Table and Timeline views) */}
      {viewMode !== "dashboard" && (
        <Card className="shadow-xs" size="small">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <Search
                placeholder="Tìm tên nhiệm vụ, mô tả..."
                allowClear
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 280 }}
                prefix={<SearchOutlined className="text-gray-400" />}
              />

              <Select
                placeholder="Tất cả lớp"
                allowClear
                value={filterLop || undefined}
                onChange={(val) => setFilterLop(val || "")}
                style={{ width: 170 }}
              >
                {[1, 2, 3, 4].map((l) => (
                  <Select.Option key={l} value={String(l)}>
                    {LOP_CONFIG[l as 1 | 2 | 3 | 4].icon} {LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel}
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Tất cả trạng thái"
                allowClear
                value={filterTrangThai || undefined}
                onChange={(val) => setFilterTrangThai(val || "")}
                style={{ width: 170 }}
              >
                {Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
                  <Select.Option key={k} value={k}>{v.label}</Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Mức độ ưu tiên"
                allowClear
                value={filterUuTien || undefined}
                onChange={(val) => setFilterUuTien(val || "")}
                style={{ width: 150 }}
              >
                <Select.Option value="cao">Ưu tiên Cao</Select.Option>
                <Select.Option value="trung-binh">Ưu tiên Trung bình</Select.Option>
                <Select.Option value="thap">Ưu tiên Thấp</Select.Option>
              </Select>

              <Select
                placeholder="Đơn vị chủ trì"
                allowClear
                value={filterDonVi || undefined}
                onChange={(val) => setFilterDonVi(val || "")}
                style={{ width: 200 }}
                showSearch
              >
                {donViOptions.map((dv) => (
                  <Select.Option key={dv} value={dv}>{dv}</Select.Option>
                ))}
              </Select>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Hiển thị <span className="font-bold text-blue-600">{filteredData.length}</span> / {totalTasks} nhiệm vụ
            </div>
          </div>
        </Card>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <Card className="shadow-xs rounded-xl">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 15 }}
            onRow={(record) => ({
              onClick: () => setSelectedTask(record),
              className: "cursor-pointer hover:bg-blue-50/50 transition-colors",
            })}
            rowClassName={(record) => {
              if (record.trangThai === "hoan-thanh") return "bg-green-50/30";
              if (isOverdue(record.thoiHan) && record.trangThai !== "hoan-thanh") return "bg-red-50/30";
              return "";
            }}
          />
        </Card>
      )}

      {/* TIMELINE / ROADMAP VIEW */}
      {viewMode === "timeline" && (
        <Card className="shadow-xs rounded-xl p-4">
          <div className="max-w-4xl mx-auto py-4">
            <Timeline
              mode="left"
              items={tasksByYear.map(([year, taskList]) => ({
                label: <span className="font-bold text-blue-800 text-sm">{year}</span>,
                children: (
                  <div className="space-y-3 pb-4">
                    {taskList.map((task) => {
                      const idx = data.findIndex(t => t.id === task.id);
                      const overdue = task.thoiHan ? isOverdue(task.thoiHan) && task.trangThai !== "hoan-thanh" : false;
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="bg-slate-50 hover:bg-white p-3.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                STT #{idx + 1}
                              </span>
                              <span className="font-bold text-sm text-gray-800 hover:text-blue-600 transition-colors">
                                {task.ten}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                              <span><BankOutlined /> {task.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}</span>
                              <span><CalendarOutlined /> Hạn: {task.thoiHan ? formatDate(task.thoiHan) : "—"}</span>
                              {overdue && <span className="text-red-500 font-semibold"><WarningOutlined /> Quá hạn</span>}
                            </div>
                          </div>

                          <div className="w-full md:w-44 shrink-0">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Tiến độ</span>
                              <span className="font-bold text-gray-800">{task.tienDo}%</span>
                            </div>
                            <Progress
                              percent={task.tienDo}
                              size="small"
                              strokeColor={task.tienDo > 50 ? "#1677ff" : "#faad14"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ),
              }))}
            />
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <div className="text-base font-bold text-gray-800 pr-6 leading-normal">
            {selectedTask?.ten}
          </div>
        }
        open={!!selectedTask}
        onCancel={() => setSelectedTask(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedTask(null)}>
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
