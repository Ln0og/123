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
  Spin
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
  FlagOutlined,
  RocketOutlined,
  CheckOutlined,
  HourglassOutlined,
  ArrowRightOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  AimOutlined,
  CompassOutlined,
  NodeIndexOutlined
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
  const [detailView, setDetailView] = useState<"timeline" | "table">("timeline");
  const [timelineStyle, setTimelineStyle] = useState<"tree" | "grid">("tree");
  const [selectedTimelinePhase, setSelectedTimelinePhase] = useState<string>("all");
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

  // Structured Phase Definition for Timeline
  const phaseMetadata: Record<string, { title: string; subtitle: string; icon: React.ReactNode; color: string; badgeBg: string }> = {
    "2026": {
      title: "NĂM 2026: NỀN TẢNG & SỐ HÓA CỐT LÕI",
      subtitle: "Tập trung nâng cấp hạ tầng Cloud, bảo mật 4 lớp SOC, triển khai Đề án 06 và CSDL Nông nghiệp",
      icon: <RocketOutlined className="text-blue-600" />,
      color: "#2563eb",
      badgeBg: "bg-blue-50 border-blue-200 text-blue-800"
    },
    "2027": {
      title: "NĂM 2027: TÍCH HỢP & DỊCH VỤ TOÀN TRÌNH",
      subtitle: "Hoàn thiện Kho dữ liệu tổng hợp, dữ liệu mở Open Data và Cổng DVC liên thông toàn trình",
      icon: <ThunderboltOutlined className="text-amber-600" />,
      color: "#d97706",
      badgeBg: "bg-amber-50 border-amber-200 text-amber-800"
    },
    "2028-2030": {
      title: "GIAI ĐOẠN 2028–2030: BỨT PHÁ ĐÔ THỊ THÔNG MINH & XÃ HỘI SỐ",
      subtitle: "Phát triển nền tảng công dân số Vĩnh Long Smart, trung tâm IOC liên ngành và y tế thông minh",
      icon: <RiseOutlined className="text-emerald-600" />,
      color: "#059669",
      badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800"
    }
  };

  // Grouped tasks for Timeline view
  const timelineGroups = useMemo(() => {
    const groups: { key: string; phaseKey: string; yearLabel: string; tasks: NhiemVuData[] }[] = [
      { key: "2026", phaseKey: "2026", yearLabel: "Năm 2026", tasks: [] },
      { key: "2027", phaseKey: "2027", yearLabel: "Năm 2027", tasks: [] },
      { key: "2028-2030", phaseKey: "2028-2030", yearLabel: "Giai đoạn 2028–2030", tasks: [] },
    ];

    filteredData.forEach((task) => {
      let phase = "2028-2030";
      if (task.thoiHan) {
        const y = new Date(task.thoiHan).getFullYear();
        if (y <= 2026) phase = "2026";
        else if (y === 2027) phase = "2027";
        else phase = "2028-2030";
      } else if (task.giaiDoan) {
        if (task.giaiDoan.includes("2026")) phase = "2026";
        else if (task.giaiDoan.includes("2027")) phase = "2027";
      }

      const target = groups.find((g) => g.phaseKey === phase);
      if (target) target.tasks.push(task);
    });

    if (selectedTimelinePhase === "all") {
      return groups.filter((g) => g.tasks.length > 0);
    }
    return groups.filter((g) => g.phaseKey === selectedTimelinePhase && g.tasks.length > 0);
  }, [filteredData, selectedTimelinePhase]);

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
                    <Tag className="m-0 text-[10px] bg-blue-50 text-blue-600 border-blue-200">{ht.ma}</Tag>
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
            {lopCfg.icon} Lớp {selectedTask.lop}: {lopCfg.title}
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
                  <Tag className="m-0 font-mono text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                    {ht.ma}
                  </Tag>
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
      {/* Top Banner */}
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
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quá Hạn / Nguy Cơ</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{tongTH} <span className="text-xs font-normal text-gray-400">nhiệm vụ</span></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 text-lg">
                <WarningOutlined />
              </div>
            </div>
            <Progress percent={Math.round((tongTH / totalTasks) * 100)} strokeColor="#ff4d4f" size="small" className="mt-2 mb-0" />
          </Card>
        </Col>
      </Row>

      {/* DASHBOARD CHARTS & EXECUTIVE CONTROL SECTION */}
      <div className="space-y-6">
        
        {/* 1. BẢNG CHỈ HUY TIẾN ĐỘ 09 NHIỆM VỤ TRỌNG TÂM */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                <span className="font-bold text-gray-900 text-base">📊 Bảng Chỉ Huy & Tiến Độ Thực Thi 09 Nhiệm Vụ Số Hóa Trọng Tâm</span>
              </div>
              <span className="text-xs font-normal text-gray-500 hidden sm:inline">Nhấp vào từng nhiệm vụ để xem hồ sơ chi tiết</span>
            </div>
          }
          className="shadow-xs rounded-2xl border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {data.map((task, idx) => {
              const lopCfg = LOP_CONFIG[task.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
              const statusCfg = TRANG_THAI_CONFIG[task.trangThai] || { label: task.trangThai, badgeClass: "bg-gray-100 text-gray-800" };
              const priorityCfg = UU_TIEN_CONFIG[task.uuTien] || { label: task.uuTien, badgeClass: "bg-gray-100 text-gray-800" };
              
              const progressColor = 
                task.trangThai === "hoan-thanh" ? "#16a34a" :
                task.trangThai === "tre-han" ? "#dc2626" :
                task.tienDo >= 70 ? "#16a34a" :
                task.tienDo >= 40 ? "#2563eb" :
                task.tienDo > 0 ? "#d97706" : "#94a3b8";

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  {/* Top Bar: STT, Layer & Status */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded shadow-xs">
                        #{idx + 1}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${lopCfg.badgeClass}`}>
                        Lớp {task.lop}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Task Name */}
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug m-0">
                      {task.ten}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <BankOutlined className="text-slate-400" />
                      <span className="truncate">{task.donViChuTri?.ten || "UBND tỉnh"}</span>
                    </div>
                  </div>

                  {/* Progress & Target date */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {task.thoiHan ? formatDate(task.thoiHan) : "2026–2030"}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {task.tienDo}%
                      </span>
                    </div>
                    <Progress 
                      percent={task.tienDo} 
                      size="small" 
                      showInfo={false}
                      strokeColor={progressColor} 
                      className="m-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2. TIẾN TRÌNH THEO 3 GIAI ĐOẠN CHIẾN LƯỢC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-xs rounded-2xl border-l-4 border-l-blue-600 bg-gradient-to-br from-white to-blue-50/40" size="small">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                  Giai đoạn 1 (2026)
                </span>
                <h3 className="font-black text-slate-900 text-sm mt-1.5 mb-0">Khởi Động & Nền Tảng</h3>
                <div className="text-xs text-slate-500 mt-0.5">4 nhiệm vụ cốt lõi</div>
              </div>
              <div className="text-xl font-black text-blue-700 bg-blue-100/80 w-12 h-12 rounded-xl flex items-center justify-center">
                68%
              </div>
            </div>
            <Progress percent={68} strokeColor="#2563eb" size="small" className="mt-3 mb-1" />
            <div className="text-[11px] text-slate-600 mt-1">
              Cloud, Bảo mật SOC 4 lớp, Đề án 06, CSDL Nông nghiệp
            </div>
          </Card>

          <Card className="shadow-xs rounded-2xl border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/40" size="small">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                  Giai đoạn 2 (2027)
                </span>
                <h3 className="font-black text-slate-900 text-sm mt-1.5 mb-0">Tăng Tốc & Tích Hợp</h3>
                <div className="text-xs text-slate-500 mt-0.5">2 nhiệm vụ liên thông</div>
              </div>
              <div className="text-xl font-black text-amber-700 bg-amber-100/80 w-12 h-12 rounded-xl flex items-center justify-center">
                40%
              </div>
            </div>
            <Progress percent={40} strokeColor="#d97706" size="small" className="mt-3 mb-1" />
            <div className="text-[11px] text-slate-600 mt-1">
              Kho dữ liệu dùng chung, DVC trực tuyến toàn trình
            </div>
          </Card>

          <Card className="shadow-xs rounded-2xl border-l-4 border-l-emerald-600 bg-gradient-to-br from-white to-emerald-50/40" size="small">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Giai đoạn 3 (2028–2030)
                </span>
                <h3 className="font-black text-slate-900 text-sm mt-1.5 mb-0">Bứt Phá Đô Thị Thông Minh</h3>
                <div className="text-xs text-slate-500 mt-0.5">3 nhiệm vụ đột phá</div>
              </div>
              <div className="text-xl font-black text-emerald-700 bg-emerald-100/80 w-12 h-12 rounded-xl flex items-center justify-center">
                20%
              </div>
            </div>
            <Progress percent={20} strokeColor="#059669" size="small" className="mt-3 mb-1" />
            <div className="text-[11px] text-slate-600 mt-1">
              VinhLong Smart, IOC Điều hành thông minh, Y tế EMR
            </div>
          </Card>
        </div>

        {/* 3. BIỂU ĐỒ 4 LỚP & SỞ NGÀNH */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="font-bold text-gray-800">🏗️ Tiến Độ Bình Quân Theo 4 Lớp Kiến Trúc</span>} className="shadow-xs rounded-2xl h-full">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[1, 2, 3, 4].map((lop) => {
                      const tasks = data.filter((d) => d.lop === lop);
                      const avg = tasks.length > 0 ? Math.round(tasks.reduce((a, b) => a + b.tienDo, 0) / tasks.length) : 0;
                      return {
                        name: `Lớp ${lop}: ${LOP_CONFIG[lop as 1|2|3|4].shortLabel}`,
                        tienDo: avg,
                        count: tasks.length,
                        color: LOP_CONFIG[lop as 1|2|3|4].color,
                      };
                    })}
                    margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip formatter={(v: any) => [`${v}%`, "Tiến độ bình quân"]} />
                    <Bar dataKey="tienDo" name="Tiến độ bình quân (%)" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {[1, 2, 3, 4].map((lop, index) => (
                        <Cell key={`cell-${index}`} fill={LOP_CONFIG[lop as 1|2|3|4].color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<span className="font-bold text-gray-800">🏛️ Phân Công Trách Nhiệm & Tiến Độ Theo Sở / Ngành</span>} className="shadow-xs rounded-2xl h-full">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const map: Record<string, { count: number; sumProgress: number }> = {};
                      data.forEach((d) => {
                        const name = d.donViChuTri?.ten || "UBND tỉnh";
                        let shortName = name.replace("Sở Nông nghiệp và Phát triển nông thôn", "Sở NN&PTNT")
                                            .replace("Sở Thông tin và Truyền thông", "Sở TT&TT")
                                            .replace("Văn phòng Ủy ban nhân dân tỉnh", "VP UBND tỉnh")
                                            .replace("Công an tỉnh Vĩnh Long", "Công an tỉnh");
                        if (!map[shortName]) map[shortName] = { count: 0, sumProgress: 0 };
                        map[shortName].count += 1;
                        map[shortName].sumProgress += d.tienDo;
                      });
                      return Object.entries(map).map(([name, val]) => ({
                        name,
                        avgProgress: Math.round(val.sumProgress / val.count),
                        count: val.count,
                      }));
                    })()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <RechartsTooltip formatter={(v: any, name: any, props: any) => [`${v}% (${props.payload.count} nhiệm vụ)`, "Tiến độ"]} />
                    <Bar dataKey="avgProgress" name="Tiến độ trung bình (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 4. BIỂU ĐỒ ƯU TIÊN & PHƯƠNG ÁN XỬ LÝ */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="font-bold text-gray-800">🎯 Phân Bổ Theo Mức Độ Ưu Tiên</span>} className="shadow-xs rounded-2xl h-full">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
            <Card title={<span className="font-bold text-gray-800">⚡ Cơ Cấu Theo Phương Án Xử Lý</span>} className="shadow-xs rounded-2xl h-full">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={solutionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Số lượng dự án" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* SECTION HEADER & EXECUTION VIEW SWITCHER */}
      <div id="nhiem-vu-detail-section" className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 m-0 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Kế Hoạch Thực Thi & Chi Tiết 09 Nhiệm Vụ Số Hóa
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-0">
            Xem theo mốc thời gian 3 giai đoạn hoặc chuyển sang dạng bảng dữ liệu chi tiết
          </p>
        </div>

        <Segmented
          value={detailView}
          onChange={(val) => setDetailView(val as "timeline" | "table")}
          options={[
            { label: "⏳ Mốc Thời Gian (3 Giai Đoạn)", value: "timeline", icon: <FieldTimeOutlined /> },
            { label: "📋 Bảng Danh Sách Nhiệm Vụ", value: "table", icon: <TableOutlined /> },
          ]}
          className="bg-slate-200/80 p-1 font-semibold text-gray-700"
        />
      </div>

      {/* FILTER & CONTROLS TOOLBAR */}
      <Card className="shadow-xs" size="small">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <Search
              placeholder="Tìm nhiệm vụ, đơn vị chủ trì, giải pháp..."
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              prefix={<SearchOutlined className="text-gray-400" />}
            />

            <Select
              placeholder="Tất cả các lớp"
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

      {/* TABLE VIEW */}
      {detailView === "table" && (
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

      {/* TIMELINE / ROADMAP VIEW (MODERN REDESIGNED INTERACTIVE TREE SPINE) */}
      {detailView === "timeline" && (
        <div className="space-y-6">
          
          {/* Phase Filter Tabs & Style Switcher */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-2xl shadow-sm text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                <CompassOutlined className="text-blue-400" /> Mốc Chiến Lược:
              </span>
              
              <button
                onClick={() => setSelectedTimelinePhase("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTimelinePhase === "all"
                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                <span>Toàn bộ Lộ trình (2026–2030)</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{filteredData.length}</span>
              </button>

              <button
                onClick={() => setSelectedTimelinePhase("2026")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTimelinePhase === "2026"
                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                <RocketOutlined />
                <span>Năm 2026: Khởi động</span>
                <span className="bg-blue-400/30 text-blue-200 px-1.5 py-0.2 rounded-full text-[10px]">4</span>
              </button>

              <button
                onClick={() => setSelectedTimelinePhase("2027")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTimelinePhase === "2027"
                    ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                <ThunderboltOutlined />
                <span>Năm 2027: Tăng tốc</span>
                <span className="bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full text-[10px]">2</span>
              </button>

              <button
                onClick={() => setSelectedTimelinePhase("2028-2030")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTimelinePhase === "2028-2030"
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                <RiseOutlined />
                <span>2028–2030: Bứt phá</span>
                <span className="bg-emerald-400/30 text-emerald-200 px-1.5 py-0.2 rounded-full text-[10px]">3</span>
              </button>
            </div>

            {/* Layout Switcher (Tree Spine vs Grid) */}
            <div className="bg-white/10 p-1 rounded-xl shrink-0 border border-white/10 self-start lg:self-auto">
              <Segmented
                value={timelineStyle}
                onChange={(val) => setTimelineStyle(val as "tree" | "grid")}
                options={[
                  { label: "🌳 Cây Trục So Le", value: "tree", icon: <BranchesOutlined /> },
                  { label: "📦 Lưới Khối Mốc", value: "grid", icon: <AppstoreOutlined /> },
                ]}
                className="bg-white/20 text-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Timeline Journey Stream */}
          {timelineGroups.length === 0 ? (
            <Card className="py-12 text-center rounded-2xl shadow-xs">
              <Empty description="Không tìm thấy nhiệm vụ nào trong mốc thời gian này." />
            </Card>
          ) : (
            <div className="space-y-12">
              {timelineGroups.map((group) => {
                const meta = phaseMetadata[group.phaseKey] || {
                  title: group.yearLabel,
                  subtitle: "Kế hoạch thực thi các nhiệm vụ chuyển đổi số",
                  icon: <CalendarOutlined />,
                  color: "#2563eb",
                  badgeBg: "bg-blue-50 border-blue-200 text-blue-800"
                };

                const avgPhaseProgress = group.tasks.length > 0 
                  ? Math.round(group.tasks.reduce((a, b) => a + b.tienDo, 0) / group.tasks.length) 
                  : 0;

                return (
                  <div key={group.key} className="space-y-6">
                    {/* Phase Header Banner with Glowing Milestone Hub */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-5 rounded-2xl border border-blue-800/40 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Decorative ambient light */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center gap-3.5 z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {meta.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base md:text-lg font-black tracking-tight text-white m-0 uppercase">
                              {meta.title}
                            </h2>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                              {group.tasks.length} nhiệm vụ trọng tâm
                            </span>
                          </div>
                          <p className="text-xs text-blue-200/80 mt-1 mb-0 max-w-2xl leading-relaxed">
                            {meta.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shrink-0 text-right z-10">
                        <div className="text-[11px] text-blue-200 uppercase font-semibold">Tiến độ giai đoạn</div>
                        <div className="text-xl font-black text-white">{avgPhaseProgress}%</div>
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* MODE 1: MODERN TREE SPINE TIMELINE (CÂY TRỤC THỜI GIAN SO LE HIỆN ĐẠI) */}
                    {/* ========================================================================= */}
                    {timelineStyle === "tree" ? (
                      <div className="relative py-4">
                        {/* Central Glowing Vertical Spine Trunk */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 -ml-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 rounded-full opacity-60 shadow-[0_0_12px_rgba(59,130,246,0.5)] pointer-events-none hidden md:block" />
                        <div className="absolute left-6 top-0 bottom-0 w-1 -ml-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 rounded-full opacity-60 md:hidden pointer-events-none" />

                        {/* Alternating Tree Branch Nodes */}
                        <div className="space-y-6 md:space-y-8">
                          {group.tasks.map((task, taskIdx) => {
                            const globalIdx = data.findIndex((t) => t.id === task.id);
                            const sttNum = globalIdx >= 0 ? globalIdx + 1 : 1;
                            const isEven = taskIdx % 2 === 0;
                            const lopCfg = LOP_CONFIG[task.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
                            const statusCfg = TRANG_THAI_CONFIG[task.trangThai] || { label: task.trangThai, badgeClass: "bg-gray-100 text-gray-800" };
                            const priorityCfg = UU_TIEN_CONFIG[task.uuTien] || { label: task.uuTien, badgeClass: "bg-gray-100 text-gray-800" };
                            const overdue = task.thoiHan ? isOverdue(task.thoiHan) && task.trangThai !== "hoan-thanh" : false;
                            const days = task.thoiHan ? getDaysRemaining(task.thoiHan) : null;

                            return (
                              <div key={task.id} className="relative flex flex-col md:flex-row items-center">
                                
                                {/* DESKTOP: Left Side Branch Content */}
                                <div className={`w-full md:w-1/2 ${isEven ? "md:pr-10" : "md:hidden"} pl-12 md:pl-0`}>
                                  {isEven && (
                                    <div
                                      onClick={() => setSelectedTask(task)}
                                      className="bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer space-y-3.5 group relative"
                                    >
                                      {/* Horizontal Connector Line for Desktop Left Branch */}
                                      <div className="hidden md:block absolute top-7 -right-10 w-10 h-0.5 bg-blue-400/80 border-t border-dashed border-blue-500" />
                                      
                                      {/* Card Top Row: STT, Layer, Priority, Status */}
                                      <div className="flex justify-between items-start gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-xs bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                                            <AimOutlined className="text-blue-400" /> #{sttNum}
                                          </span>
                                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${lopCfg.badgeClass}`}>
                                            {lopCfg.icon} Lớp {task.lop}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${priorityCfg.badgeClass}`}>
                                            {priorityCfg.label}
                                          </span>
                                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                                            {statusCfg.label}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Task Title */}
                                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug m-0">
                                        {task.ten}
                                      </h3>

                                      {/* Description */}
                                      {task.moTa && (
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                                          {task.moTa}
                                        </p>
                                      )}

                                      {/* Metadata Matrix */}
                                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <BankOutlined className="text-blue-500 shrink-0" />
                                          <span className="font-semibold text-slate-800">Chủ trì:</span>
                                          <span className="truncate">{task.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-slate-400 shrink-0" />
                                            <span className="font-semibold text-slate-800">Hạn:</span>
                                            <span>{task.thoiHan ? formatDate(task.thoiHan) : "Giai đoạn 2026–2030"}</span>
                                          </div>
                                          {days !== null && (
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                              overdue ? "bg-red-100 text-red-700" :
                                              days <= 30 ? "bg-amber-100 text-amber-800" :
                                              "bg-blue-100 text-blue-800"
                                            }`}>
                                              {overdue ? `Trễ ${Math.abs(days)} ngày` : task.trangThai === "hoan-thanh" ? "Đã nghiệm thu" : `Còn ${days} ngày`}
                                            </span>
                                          )}
                                        </div>

                                        {task.phuongAnXuLy && (
                                          <div className="flex items-center gap-2 text-indigo-700 font-medium">
                                            <ThunderboltOutlined className="shrink-0" />
                                            <span className="truncate">{PHUONG_AN_CONFIG[task.phuongAnXuLy] || task.phuongAnXuLy}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Progress Bar & Impacted Systems */}
                                      <div className="pt-2 border-t border-slate-100 space-y-2">
                                        <div>
                                          <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                                            <span>Tiến độ thực tế</span>
                                            <span className="font-bold text-slate-900">{task.tienDo}%</span>
                                          </div>
                                          <Progress
                                            percent={task.tienDo}
                                            size="small"
                                            status={task.trangThai === "tre-han" ? "exception" : task.trangThai === "hoan-thanh" ? "success" : "active"}
                                            strokeColor={
                                              task.trangThai === "hoan-thanh" ? "#16a34a" :
                                              task.trangThai === "tre-han" ? "#dc2626" :
                                              task.tienDo > 50 ? "#2563eb" : "#d97706"
                                            }
                                          />
                                        </div>

                                        {task.heThongSos && task.heThongSos.length > 0 && (
                                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            <span className="text-[11px] text-slate-500 font-semibold">Tác động:</span>
                                            {task.heThongSos.slice(0, 4).map((ht) => (
                                              <Tooltip key={ht.id} title={ht.ten}>
                                                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                                                  {ht.ma}
                                                </span>
                                              </Tooltip>
                                            ))}
                                            {task.heThongSos.length > 4 && (
                                              <span className="text-[10px] text-slate-400 font-bold">+{task.heThongSos.length - 4}</span>
                                            )}
                                          </div>
                                        )}

                                        <div className="flex justify-end text-xs text-blue-600 font-bold pt-1 group-hover:translate-x-1 transition-transform">
                                          <span className="flex items-center gap-1">Khám phá hồ sơ nhiệm vụ <ArrowRightOutlined /></span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Central Pulsing Connector Node on Spine */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-7 z-20 flex items-center justify-center">
                                  <div className={`w-9 h-9 rounded-full bg-white border-3 shadow-md flex items-center justify-center font-black text-xs transition-transform duration-300 group-hover:scale-110 ${
                                    task.trangThai === "hoan-thanh" ? "border-emerald-500 text-emerald-700 ring-4 ring-emerald-100" :
                                    task.trangThai === "tre-han" ? "border-red-500 text-red-700 ring-4 ring-red-100" :
                                    "border-blue-600 text-blue-700 ring-4 ring-blue-100"
                                  }`}>
                                    {sttNum}
                                  </div>
                                </div>

                                {/* DESKTOP: Right Side Branch Content (or Mobile Default) */}
                                <div className={`w-full md:w-1/2 ${!isEven ? "md:pl-10" : "md:hidden"} pl-12 md:pl-0`}>
                                  {(!isEven || true) && (
                                    <div
                                      onClick={() => setSelectedTask(task)}
                                      className="bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer space-y-3.5 group relative"
                                    >
                                      {/* Horizontal Connector Line for Desktop Right Branch */}
                                      <div className="hidden md:block absolute top-7 -left-10 w-10 h-0.5 bg-blue-400/80 border-t border-dashed border-blue-500" />
                                      
                                      {/* Card Top Row: STT, Layer, Priority, Status */}
                                      <div className="flex justify-between items-start gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-xs bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                                            <AimOutlined className="text-blue-400" /> #{sttNum}
                                          </span>
                                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${lopCfg.badgeClass}`}>
                                            {lopCfg.icon} Lớp {task.lop}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${priorityCfg.badgeClass}`}>
                                            {priorityCfg.label}
                                          </span>
                                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                                            {statusCfg.label}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Task Title */}
                                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug m-0">
                                        {task.ten}
                                      </h3>

                                      {/* Description */}
                                      {task.moTa && (
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                                          {task.moTa}
                                        </p>
                                      )}

                                      {/* Metadata Matrix */}
                                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <BankOutlined className="text-blue-500 shrink-0" />
                                          <span className="font-semibold text-slate-800">Chủ trì:</span>
                                          <span className="truncate">{task.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-slate-400 shrink-0" />
                                            <span className="font-semibold text-slate-800">Hạn:</span>
                                            <span>{task.thoiHan ? formatDate(task.thoiHan) : "Giai đoạn 2026–2030"}</span>
                                          </div>
                                          {days !== null && (
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                              overdue ? "bg-red-100 text-red-700" :
                                              days <= 30 ? "bg-amber-100 text-amber-800" :
                                              "bg-blue-100 text-blue-800"
                                            }`}>
                                              {overdue ? `Trễ ${Math.abs(days)} ngày` : task.trangThai === "hoan-thanh" ? "Đã nghiệm thu" : `Còn ${days} ngày`}
                                            </span>
                                          )}
                                        </div>

                                        {task.phuongAnXuLy && (
                                          <div className="flex items-center gap-2 text-indigo-700 font-medium">
                                            <ThunderboltOutlined className="shrink-0" />
                                            <span className="truncate">{PHUONG_AN_CONFIG[task.phuongAnXuLy] || task.phuongAnXuLy}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Progress Bar & Impacted Systems */}
                                      <div className="pt-2 border-t border-slate-100 space-y-2">
                                        <div>
                                          <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                                            <span>Tiến độ thực tế</span>
                                            <span className="font-bold text-slate-900">{task.tienDo}%</span>
                                          </div>
                                          <Progress
                                            percent={task.tienDo}
                                            size="small"
                                            status={task.trangThai === "tre-han" ? "exception" : task.trangThai === "hoan-thanh" ? "success" : "active"}
                                            strokeColor={
                                              task.trangThai === "hoan-thanh" ? "#16a34a" :
                                              task.trangThai === "tre-han" ? "#dc2626" :
                                              task.tienDo > 50 ? "#2563eb" : "#d97706"
                                            }
                                          />
                                        </div>

                                        {task.heThongSos && task.heThongSos.length > 0 && (
                                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            <span className="text-[11px] text-slate-500 font-semibold">Tác động:</span>
                                            {task.heThongSos.slice(0, 4).map((ht) => (
                                              <Tooltip key={ht.id} title={ht.ten}>
                                                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                                                  {ht.ma}
                                                </span>
                                              </Tooltip>
                                            ))}
                                            {task.heThongSos.length > 4 && (
                                              <span className="text-[10px] text-slate-400 font-bold">+{task.heThongSos.length - 4}</span>
                                            )}
                                          </div>
                                        )}

                                        <div className="flex justify-end text-xs text-blue-600 font-bold pt-1 group-hover:translate-x-1 transition-transform">
                                          <span className="flex items-center gap-1">Khám phá hồ sơ nhiệm vụ <ArrowRightOutlined /></span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* ========================================================================= */
                      /* MODE 2: MODERN PHASE GRID (LƯỚI KHỐI MỐC THỜI GIAN NHANH GỌN) */
                      /* ========================================================================= */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.tasks.map((task) => {
                          const idx = data.findIndex((t) => t.id === task.id);
                          const sttNum = idx >= 0 ? idx + 1 : 1;
                          const lopCfg = LOP_CONFIG[task.lop as 1 | 2 | 3 | 4] || LOP_CONFIG[1];
                          const statusCfg = TRANG_THAI_CONFIG[task.trangThai] || { label: task.trangThai, badgeClass: "bg-gray-100 text-gray-800" };
                          const priorityCfg = UU_TIEN_CONFIG[task.uuTien] || { label: task.uuTien, badgeClass: "bg-gray-100 text-gray-800" };
                          const overdue = task.thoiHan ? isOverdue(task.thoiHan) && task.trangThai !== "hoan-thanh" : false;
                          const days = task.thoiHan ? getDaysRemaining(task.thoiHan) : null;

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className="bg-white hover:bg-slate-50/60 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-xs">
                                      STT #{sttNum}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${lopCfg.badgeClass}`}>
                                      {lopCfg.icon} Lớp {task.lop}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${priorityCfg.badgeClass}`}>
                                      {priorityCfg.label}
                                    </span>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                                      {statusCfg.label}
                                    </span>
                                  </div>
                                </div>

                                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mb-2">
                                  {task.ten}
                                </h3>

                                {task.moTa && (
                                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                                    {task.moTa}
                                  </p>
                                )}

                                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <BankOutlined className="text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-800">Chủ trì:</span>
                                    <span className="truncate">{task.donViChuTri?.ten || "UBND tỉnh Vĩnh Long"}</span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <CalendarOutlined className="text-slate-400 shrink-0" />
                                      <span className="font-semibold text-slate-800">Thời hạn:</span>
                                      <span>{task.thoiHan ? formatDate(task.thoiHan) : "Giai đoạn 2026–2030"}</span>
                                    </div>
                                    {days !== null && (
                                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                        overdue ? "bg-red-100 text-red-700" :
                                        days <= 30 ? "bg-amber-100 text-amber-800" :
                                        "bg-blue-100 text-blue-800"
                                      }`}>
                                        {overdue ? `Trễ ${Math.abs(days)} ngày` : task.trangThai === "hoan-thanh" ? "Đã nghiệm thu" : `Còn ${days} ngày`}
                                      </span>
                                    )}
                                  </div>

                                  {task.phuongAnXuLy && (
                                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                                      <ThunderboltOutlined className="shrink-0" />
                                      <span className="truncate">{PHUONG_AN_CONFIG[task.phuongAnXuLy] || task.phuongAnXuLy}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 space-y-3">
                                <div>
                                  <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                                    <span>Tiến độ thực hiện</span>
                                    <span className="font-bold text-slate-900">{task.tienDo}%</span>
                                  </div>
                                  <Progress
                                    percent={task.tienDo}
                                    size="small"
                                    status={task.trangThai === "tre-han" ? "exception" : task.trangThai === "hoan-thanh" ? "success" : "active"}
                                    strokeColor={
                                      task.trangThai === "hoan-thanh" ? "#16a34a" :
                                      task.trangThai === "tre-han" ? "#dc2626" :
                                      task.tienDo > 50 ? "#2563eb" : "#d97706"
                                    }
                                  />
                                </div>

                                {task.heThongSos && task.heThongSos.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] text-slate-500 font-semibold">Tác động HT:</span>
                                    {task.heThongSos.map((ht) => (
                                      <Tooltip key={ht.id} title={ht.ten}>
                                        <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                                          {ht.ma}
                                        </span>
                                      </Tooltip>
                                    ))}
                                  </div>
                                )}

                                <div className="flex justify-end text-xs text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                                  <span className="flex items-center gap-1">Xem chi tiết hồ sơ <ArrowRightOutlined /></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
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
