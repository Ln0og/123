"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Tag,
  Modal,
  Button,
  Spin,
  Tooltip,
  Card,
  Input,
  Select,
  Table,
  Progress,
  Tabs,
  Badge,
  Descriptions,
} from "antd";
import {
  ApartmentOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  RightOutlined,
  FileProtectOutlined,
  CloudServerOutlined,
  MobileOutlined,
  NodeIndexOutlined,
  LockOutlined,
  DesktopOutlined,
  FundProjectionScreenOutlined,
  RobotOutlined,
  DeploymentUnitOutlined,
  AuditOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  CompassOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  TableOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { HeThongSoData, NhiemVuData } from "@/types";
import {
  LOP_CONFIG,
  TRANG_THAI_CONFIG,
  PHUONG_AN_CONFIG,
  UU_TIEN_CONFIG,
  formatDate,
  isOverdue,
  getDaysRemaining,
} from "@/lib/utils";

const { Search } = Input;

interface FrameworkBlock {
  id: string;
  title: string;
  subNote: string;
  description: string;
  icon: React.ReactNode;
  lop: number;
  category: string;
  itemsMatch: (ht: HeThongSoData) => boolean;
  tasksMatch: (nv: NhiemVuData) => boolean;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function SoDoKhungKTSPage() {
  const [heThongs, setHeThongs] = useState<HeThongSoData[]>([]);
  const [nhiemVus, setNhiemVus] = useState<NhiemVuData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBlock, setSelectedBlock] = useState<FrameworkBlock | null>(null);
  const [selectedHT, setSelectedHT] = useState<HeThongSoData | null>(null);

  // Data Explorer Tab state
  const [activeTab, setActiveTab] = useState("hien-trang");

  // Filters for Hiện trạng
  const [searchHT, setSearchHT] = useState("");
  const [selectedLopHT, setSelectedLopHT] = useState("all");
  const [filterDonViHT, setFilterDonViHT] = useState("");
  const [filterTrangThaiHT, setFilterTrangThaiHT] = useState("");

  // Filters for Lộ trình
  const [searchNV, setSearchNV] = useState("");
  const [selectedLopNV, setSelectedLopNV] = useState("all");
  const [filterTrangThaiNV, setFilterTrangThaiNV] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/he-thong").then((r) => r.json()),
      fetch("/api/nhiem-vu").then((r) => r.json()),
    ])
      .then(([htData, nvData]) => {
        setHeThongs(Array.isArray(htData) ? htData : []);
        setNhiemVus(Array.isArray(nvData) ? nvData : []);
        setLoading(false);
      })
      .catch(() => {
        setHeThongs([]);
        setNhiemVus([]);
        setLoading(false);
      });
  }, []);

  // 4 Tầng Lớp Chuẩn Quốc Gia theo QĐ 1425/QĐ-TTg (Phiên bản 1.0)
  const frameworkBlocks: Record<string, FrameworkBlock> = {
    // ==========================================
    // LỚP 4: KÊNH TƯƠNG TÁC VÀ ĐO LƯỜNG HIỆU QUẢ
    // ==========================================
    lop4_dvc: {
      id: "lop4_dvc",
      title: "Cổng DVC & Một Cửa",
      subNote: "Nộp hồ sơ trực tuyến, thanh toán phí/lệ phí điện tử",
      description: "Cổng Dịch vụ công trực tuyến tỉnh tích hợp kết nối Cổng DVC Quốc gia và Hệ thống Một cửa điện tử tập trung.",
      icon: <GlobalOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.lop === 4 || ht.ten.toLowerCase().includes("dịch vụ công") || ht.ten.toLowerCase().includes("một cửa"),
      tasksMatch: (nv) => nv.ma === "NV-04" || nv.lop === 4,
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    lop4_app_mobile: {
      id: "lop4_app_mobile",
      title: "App Vĩnh Long Smart",
      subNote: "Tiện ích công dân số, Zalo Mini App, VNeID",
      description: "Ứng dụng công dân số đa tiện ích tích hợp Zalo Mini App, VNeID và các dịch vụ tiện ích phục vụ người dân.",
      icon: <MobileOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("di động") || ht.ten.toLowerCase().includes("app") || ht.ten.toLowerCase().includes("smart") || ht.ma === "DL-01",
      tasksMatch: (nv) => nv.ma === "NV-07" || nv.ma === "NV-03",
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    lop4_portal: {
      id: "lop4_portal",
      title: "Cổng Thông Tin Tỉnh",
      subNote: "Mạng lưới cổng tin tức điện tử Sở, Ngành, Huyện",
      description: "Cổng thông tin điện tử tỉnh Vĩnh Long và mạng lưới các trang thông tin điện tử thành phần của Sở, Ban, Ngành, Huyện.",
      icon: <ApartmentOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("cổng thông tin") || ht.ten.toLowerCase().includes("portal"),
      tasksMatch: () => false,
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    lop4_kpi_metric: {
      id: "lop4_kpi_metric",
      title: "Dashboard Đo Lường KPI",
      subNote: "Đo lường tỷ lệ DVC toàn trình & mức độ hài lòng",
      description: "Hệ thống giám sát, đo lường tỷ lệ dịch vụ công trực tuyến toàn trình và mức độ hài lòng của người dân, doanh nghiệp.",
      icon: <FundProjectionScreenOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("đo lường") || ht.ten.toLowerCase().includes("kpi") || ht.ten.toLowerCase().includes("đánh giá"),
      tasksMatch: (nv) => nv.ma === "NV-04",
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
    },

    // =========================================================================
    // LỚP 3: ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG
    // =========================================================================
    // Nhánh 1: Chính quyền số
    lop3_chidao_dieuhanh: {
      id: "lop3_chidao_dieuhanh",
      title: "Chỉ Đạo & Báo Cáo",
      subNote: "Văn bản iOffice, họp e-Cabinet, báo cáo tỉnh",
      description: "Quản lý văn bản điều hành iOffice, phòng họp không giấy e-Cabinet, Hệ thống thông tin báo cáo tỉnh.",
      icon: <FileProtectOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("văn bản") || ht.ten.toLowerCase().includes("điều hành") || ht.ten.toLowerCase().includes("báo cáo"),
      tasksMatch: (nv) => nv.ten.toLowerCase().includes("văn bản"),
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },
    lop3_tthc_sohoa: {
      id: "lop3_tthc_sohoa",
      title: "Giải Quyết TTHC",
      subNote: "Số hóa hồ sơ, giải quyết TTHC liên thông 3 cấp",
      description: "Quy trình giải quyết TTHC liên thông, số hóa hồ sơ giấy và cấp kết quả bản điện tử đồng bộ toàn tỉnh.",
      icon: <DesktopOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("thủ tục") || ht.ten.toLowerCase().includes("tthc"),
      tasksMatch: (nv) => nv.ma === "NV-04",
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },
    lop3_ioc_tinh: {
      id: "lop3_ioc_tinh",
      title: "Trung Tâm IOC Tỉnh",
      subNote: "Giám sát, điều hành thông minh thời gian thực",
      description: "Trung tâm Giám sát, Điều hành thông minh tỉnh Vĩnh Long liên thông số liệu thời gian thực phục vụ lãnh đạo.",
      icon: <FundProjectionScreenOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("ioc") || ht.ten.toLowerCase().includes("điều hành thông minh"),
      tasksMatch: (nv) => nv.ma === "NV-08",
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },
    lop3_nghiepvu_chuyennganh: {
      id: "lop3_nghiepvu_chuyennganh",
      title: "Nghiệp Vụ Sở Ngành",
      subNote: "Phần mềm CBCC, tài chính, tư pháp, thanh tra",
      description: "Các phần mềm chuyên môn: Cán bộ công chức, Tư pháp hộ tịch, Thanh tra, Tài chính ngân sách nhà nước.",
      icon: <AuditOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => (ht.lop === 3 && !ht.ma.startsWith("SNN-") && ht.ma !== "UD-03") || ht.ten.toLowerCase().includes("cán bộ"),
      tasksMatch: () => false,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },

    // Nhánh 2: Kinh tế số & Xã hội số
    lop3_nongnghiep_so: {
      id: "lop3_nongnghiep_so",
      title: "Nông Nghiệp (380+ CSDL)",
      subNote: "Trồng trọt, chăn nuôi, thủy sản, quan trắc, OCOP",
      description: "Bản đồ canh tác, trạm quan trắc VnEmisoft, CSDL trồng trọt, chăn nuôi, thủy sản, OCOP và truy xuất nguồn gốc.",
      icon: <ShopOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma.startsWith("SNN-") || (ht.donVi?.ten || "").includes("Nông nghiệp"),
      tasksMatch: () => false,
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
    lop3_yte_so: {
      id: "lop3_yte_so",
      title: "Y Tế & Sức Khỏe Số",
      subNote: "Bệnh án điện tử EMR, quản lý trạm y tế, HIS",
      description: "Hệ thống HIS bệnh viện, Bệnh án điện tử EMR, quản lý trạm y tế cơ sở và Hồ sơ sức khỏe toàn dân.",
      icon: <MedicineBoxOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma === "UD-03" || ht.ten.toLowerCase().includes("y tế") || ht.ten.toLowerCase().includes("his"),
      tasksMatch: (nv) => nv.ma === "NV-09",
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
    lop3_datdai_tnmt: {
      id: "lop3_datdai_tnmt",
      title: "Đất Đai & Môi Trường",
      subNote: "CSDL Đất đai NDOP, trạm quan trắc tự động",
      description: "CSDL Đất đai tỉnh kết nối nền tảng điều phối quốc gia (NDOP), trạm quan trắc môi trường tự động.",
      icon: <EnvironmentOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma === "DL-02" || ht.ten.toLowerCase().includes("đất đai") || ht.ten.toLowerCase().includes("môi trường"),
      tasksMatch: (nv) => nv.ma === "NV-01",
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
    lop3_dothi_kinhte: {
      id: "lop3_dothi_kinhte",
      title: "Đô Thị & Du Lịch Số",
      subNote: "Du lịch thông minh, giáo dục số, giao thông",
      description: "Cổng thông tin du lịch thông minh, Giáo dục số, Chiếu sáng và giao thông thông minh đô thị.",
      icon: <CompassOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("du lịch") || ht.ten.toLowerCase().includes("giáo dục") || ht.ten.toLowerCase().includes("thương mại"),
      tasksMatch: () => false,
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },

    // ==========================================
    // LỚP 2: DỮ LIỆU VÀ NỀN TẢNG LÕI
    // ==========================================
    lop2_lgsp_ndxp: {
      id: "lop2_lgsp_ndxp",
      title: "Trục Tích Hợp LGSP",
      subNote: "Cầu nối chia sẻ dữ liệu tỉnh với Quốc gia (NDXP)",
      description: "Nền tảng tích hợp, chia sẻ dữ liệu cấp tỉnh (LGSP) liên thông kết nối Trục Quốc gia (NDXP).",
      icon: <NodeIndexOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ma === "DL-03" || ht.ten.toLowerCase().includes("lgsp") || ht.ten.toLowerCase().includes("chia sẻ"),
      tasksMatch: (nv) => nv.ma === "NV-04" || nv.ma === "NV-06",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    lop2_kho_dulieu_master: {
      id: "lop2_kho_dulieu_master",
      title: "Kho Dữ Liệu Dùng Chung",
      subNote: "Kho dữ liệu tổng hợp & Cổng dữ liệu mở Open Data",
      description: "Kho dữ liệu tổng hợp tỉnh, Từ điển danh mục dùng chung và Nền tảng dữ liệu mở (Open Data).",
      icon: <DatabaseOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ma.startsWith("DL-") || ht.ten.toLowerCase().includes("kho dữ liệu") || ht.ten.toLowerCase().includes("danh mục"),
      tasksMatch: (nv) => nv.ma === "NV-06",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    lop2_csdl_quocgia: {
      id: "lop2_csdl_quocgia",
      title: "CSDL Quốc Gia (ĐA 06)",
      subNote: "Dân cư VNeID, đất đai, bảo hiểm, doanh nghiệp",
      description: "Kết nối CSDL Quốc gia về Dân cư, Đất đai, Đăng ký Doanh nghiệp, Bảo hiểm xã hội và Tư pháp.",
      icon: <ApartmentOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("dân cư") || ht.ma === "DL-01" || ht.ma === "DL-02",
      tasksMatch: (nv) => nv.ma === "NV-03" || nv.ma === "NV-01",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    lop2_nentang_loi: {
      id: "lop2_nentang_loi",
      title: "Định Danh VNeID & GIS",
      subNote: "Đăng nhập một lần (SSO), thanh toán & bản đồ số",
      description: "Nền tảng định danh xác thực (VNeID/SSO), Thanh toán trực tuyến Payment và Bản đồ số GIS tỉnh.",
      icon: <DeploymentUnitOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("định danh") || ht.ten.toLowerCase().includes("gis") || ht.ten.toLowerCase().includes("thanh toán"),
      tasksMatch: (nv) => nv.ma === "NV-03",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
    },

    // ==========================================
    // LỚP 1: HẠ TẦNG SỐ VÀ AN NINH MẠNG DÙNG CHUNG
    // ==========================================
    lop1_idc_cloud: {
      id: "lop1_idc_cloud",
      title: "Trung Tâm Dữ Liệu IDC",
      subNote: "Trung tâm dữ liệu tỉnh, chuyển đổi sang Cloud tập trung",
      description: "Trung tâm tích hợp dữ liệu tỉnh, chuyển đổi sang kiến trúc Cloud kết nối Cloud Quốc gia.",
      icon: <CloudServerOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-02" || ht.ten.toLowerCase().includes("idc") || ht.ten.toLowerCase().includes("trung tâm tích hợp"),
      tasksMatch: (nv) => nv.ma === "NV-02",
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
    lop1_mang_tslcd: {
      id: "lop1_mang_tslcd",
      title: "Mạng TSLCD Cấp I, II",
      subNote: "Mạng chuyên dùng bảo mật cao kết nối 3 cấp chính quyền",
      description: "Mạng Truyền số liệu chuyên dùng cấp I, II kết nối 100% cơ quan Đảng, chính quyền 3 cấp an toàn, thông suốt.",
      icon: <NodeIndexOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-01" || ht.ten.toLowerCase().includes("wan") || ht.ten.toLowerCase().includes("mạng"),
      tasksMatch: () => false,
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
    lop1_soc_anm: {
      id: "lop1_soc_anm",
      title: "SOC Tỉnh (ATTT 4 Lớp)",
      subNote: "Giám sát an toàn thông tin 4 lớp kết nối SOC Quốc gia",
      description: "Mô hình bảo vệ an toàn thông tin 4 lớp, kết nối SOC Quốc gia của Bộ Công an, Chữ ký số PKI.",
      icon: <LockOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-03" || ht.ten.toLowerCase().includes("soc") || ht.ten.toLowerCase().includes("an toàn"),
      tasksMatch: (nv) => nv.ma === "NV-05",
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
    lop1_iot_bien: {
      id: "lop1_iot_bien",
      title: "Hạ Tầng IoT & Camera",
      subNote: "Camera an ninh đô thị & cảm biến quan trắc",
      description: "Hệ thống camera giám sát an ninh đô thị tập trung, mạng lưới cảm biến quan trắc môi trường và nông nghiệp.",
      icon: <EyeOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("camera") || ht.ten.toLowerCase().includes("quan trắc") || ht.ten.toLowerCase().includes("iot"),
      tasksMatch: () => false,
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
  };

  const getMatchedItems = (block: FrameworkBlock) => {
    return heThongs.filter(block.itemsMatch);
  };

  const getMatchedTasks = (block: FrameworkBlock) => {
    return nhiemVus.filter((nv) => {
      if (block.tasksMatch(nv)) return true;
      if (nv.heThongSos && nv.heThongSos.some((ht) => block.itemsMatch(ht))) return true;
      return false;
    });
  };

  const getTaskActionBadge = (tasks: NhiemVuData[]) => {
    if (tasks.length === 0) return null;
    const hasThayThe = tasks.some((t) => t.phuongAnXuLy === "thay-the");
    const hasNangCap = tasks.some((t) => t.phuongAnXuLy === "nang-cap");
    const hasBoSung = tasks.some((t) => t.phuongAnXuLy === "bo-sung");
    const hasTichHop = tasks.some((t) => t.phuongAnXuLy === "tich-hop");

    let actionLabel = `${tasks.length} nhiệm vụ`;
    let badgeColor = "from-amber-500 to-orange-500";

    if (hasThayThe) {
      actionLabel = tasks.length === 1 ? "1 Thay thế" : `${tasks.length} NV (Thay thế)`;
      badgeColor = "from-rose-500 to-red-600";
    } else if (hasNangCap) {
      actionLabel = tasks.length === 1 ? "1 Nâng cấp" : `${tasks.length} NV (Nâng cấp)`;
      badgeColor = "from-amber-500 to-orange-500";
    } else if (hasBoSung) {
      actionLabel = tasks.length === 1 ? "1 Bổ sung" : `${tasks.length} NV (Bổ sung)`;
      badgeColor = "from-emerald-500 to-teal-600";
    } else if (hasTichHop) {
      actionLabel = tasks.length === 1 ? "1 Tích hợp" : `${tasks.length} NV (Tích hợp)`;
      badgeColor = "from-blue-500 to-indigo-600";
    }

    return (
      <span
        className={`inline-flex items-center gap-1 bg-gradient-to-r ${badgeColor} text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-tight`}
        title={`Có ${tasks.length} nhiệm vụ lộ trình (${actionLabel})`}
      >
        <ThunderboltOutlined className="text-[10px] animate-bounce" />
        <span>{actionLabel}</span>
      </span>
    );
  };

  // Render a clean architectural block (tile) with high legibility and 100% visible text
  const renderTile = (blockKey: string) => {
    const block = frameworkBlocks[blockKey];
    if (!block) return null;
    const items = getMatchedItems(block);
    const tasks = getMatchedTasks(block);

    return (
      <div
        onClick={() => setSelectedBlock(block)}
        className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 rounded-2xl p-4 border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[118px] select-none"
      >
        {/* Top Header inside tile: Icon + Action / Task Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs"
            style={{ backgroundColor: block.bgColor, color: block.color }}
          >
            {block.icon}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {tasks.length > 0 ? (
              getTaskActionBadge(tasks)
            ) : items.length > 0 ? (
              <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100/80">
                {items.length} HT
              </span>
            ) : null}
            
            <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
              <RightOutlined className="text-[10px] text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Title + SubNote */}
        <div>
          <div className="font-bold text-slate-900 text-[13px] group-hover:text-blue-600 transition-colors leading-snug">
            {block.title}
          </div>
          {block.subNote && (
            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal leading-tight">
              {block.subNote}
            </div>
          )}
          {items.length > 0 && tasks.length > 0 && (
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              {items.length} CSDL/Hệ thống
            </div>
          )}
        </div>
      </div>
    );
  };

  // Department list for Hiện trạng filter
  const donViOptions = useMemo(() => {
    const set = new Set<string>();
    heThongs.forEach((d) => {
      const name = d.donVi?.ten || d.chuQuan;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [heThongs]);

  // Filtered dataset for Hiện trạng table
  const filteredHT = useMemo(() => {
    return heThongs.filter((item) => {
      if (selectedLopHT !== "all" && item.lop !== parseInt(selectedLopHT)) return false;
      if (filterTrangThaiHT && item.trangThai !== filterTrangThaiHT) return false;
      if (filterDonViHT) {
        const dvName = item.donVi?.ten || item.chuQuan || "";
        if (dvName.trim() !== filterDonViHT.trim()) return false;
      }
      if (searchHT.trim()) {
        const q = searchHT.toLowerCase().trim();
        const mTen = item.ten.toLowerCase().includes(q);
        const mMoTa = item.moTa ? item.moTa.toLowerCase().includes(q) : false;
        const mDonVi = item.donVi?.ten ? item.donVi.ten.toLowerCase().includes(q) : false;
        const mChuQuan = item.chuQuan ? item.chuQuan.toLowerCase().includes(q) : false;
        return mTen || mMoTa || mDonVi || mChuQuan;
      }
      return true;
    });
  }, [heThongs, selectedLopHT, filterTrangThaiHT, filterDonViHT, searchHT]);

  // Filtered dataset for Lộ trình table
  const filteredNV = useMemo(() => {
    return nhiemVus.filter((item) => {
      if (selectedLopNV !== "all" && item.lop !== parseInt(selectedLopNV)) return false;
      if (filterTrangThaiNV && item.trangThai !== filterTrangThaiNV) return false;
      if (searchNV.trim()) {
        const q = searchNV.toLowerCase().trim();
        const mTen = item.ten.toLowerCase().includes(q);
        const mMoTa = item.moTa ? item.moTa.toLowerCase().includes(q) : false;
        const mDonVi = item.donViChuTri?.ten ? item.donViChuTri.ten.toLowerCase().includes(q) : false;
        return mTen || mMoTa || mDonVi;
      }
      return true;
    });
  }, [nhiemVus, selectedLopNV, filterTrangThaiNV, searchNV]);

  // Columns for Hiện trạng Table
  const htTableColumns: ColumnsType<HeThongSoData> = [
    {
      title: "STT",
      key: "stt",
      width: 65,
      align: "center",
      render: (_, __, index) => (
        <span className="font-bold text-gray-500 text-xs">{index + 1}</span>
      ),
    },
    {
      title: "Tên hệ thống số / CSDL / Phần mềm",
      dataIndex: "ten",
      render: (ten: string, rec: HeThongSoData) => (
        <div className="group cursor-pointer">
          <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">
            {ten}
          </div>
          {rec.moTa && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
              {rec.moTa.replace(/\\n|\n/g, " • ").replace(/::/g, ": ")}
            </div>
          )}
          {rec.nhiemVus && rec.nhiemVus.length > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚡ Có {rec.nhiemVus.length} nhiệm vụ nâng cấp
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 130,
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
      dataIndex: "chuQuan",
      width: 220,
      render: (_: string, rec: HeThongSoData) => (
        <div className="text-xs text-slate-700">
          <div className="font-medium">{rec.donVi?.ten || rec.chuQuan || "Chưa xác định"}</div>
          {rec.namTrienKhai && (
            <div className="text-slate-400 text-[11px]">Năm khai thác: {rec.namTrienKhai}</div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 150,
      render: (trangThai: string) => {
        const cfg = TRANG_THAI_CONFIG[trangThai] || { label: trangThai, antdColor: "default", badgeClass: "" };
        return (
          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          className="text-blue-600 font-bold hover:underline p-0"
          onClick={() => setSelectedHT(record)}
        >
          Chi tiết →
        </Button>
      ),
    },
  ];

  // Columns for Lộ trình Table
  const nvTableColumns: ColumnsType<NhiemVuData> = [
    {
      title: "STT",
      key: "stt",
      width: 65,
      align: "center",
      render: (_, __, index) => (
        <span className="font-bold text-gray-500 text-xs">{index + 1}</span>
      ),
    },
    {
      title: "Nhiệm vụ & Đề án Chuyển đổi",
      dataIndex: "ten",
      render: (ten, rec) => (
        <div>
          <div className="font-bold text-slate-800 text-sm">{ten}</div>
          {rec.moTa && <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{rec.moTa}</div>}
          {rec.phuongAnXuLy && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {PHUONG_AN_CONFIG[rec.phuongAnXuLy] || rec.phuongAnXuLy}
              </span>
            </div>
          )}
          {rec.heThongSos && rec.heThongSos.length > 0 && (
            <div className="mt-2 text-xs border-t border-dashed pt-1.5">
              <span className="text-slate-500 mr-1.5 font-medium">Tác động đến Hệ thống:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {rec.heThongSos.map((ht) => (
                  <Tag key={ht.id} className="m-0 text-[11px] bg-slate-100 text-slate-700 border-slate-200 font-medium">
                    {ht.ten}
                  </Tag>
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
      render: (_, rec) => <span className="text-xs font-medium text-slate-700">{rec.donViChuTri?.ten || "UBND tỉnh"}</span>,
    },
    {
      title: "Ưu tiên",
      dataIndex: "uuTien",
      width: 110,
      render: (uuTien) => {
        const cfg = UU_TIEN_CONFIG[uuTien] || { label: uuTien, badgeClass: "bg-gray-100 text-gray-800" };
        return <span className={`text-xs font-bold px-2 py-0.5 rounded border ${cfg.badgeClass}`}>{cfg.label}</span>;
      },
    },
    {
      title: "Thời hạn",
      dataIndex: "thoiHan",
      width: 120,
      render: (thoiHan, rec) => {
        if (!thoiHan) return <span className="text-slate-400">—</span>;
        const overdue = isOverdue(thoiHan) && rec.trangThai !== "hoan-thanh";
        const days = getDaysRemaining(thoiHan);
        return (
          <Tooltip title={days !== null ? (overdue ? `Trễ ${Math.abs(days)} ngày` : `Còn ${days} ngày`) : ""}>
            <span className={`text-xs ${overdue ? "text-red-500 font-bold" : "text-slate-600 font-medium"}`}>
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
              rec.trangThai === "hoan-thanh" ? "#16a34a" : rec.trangThai === "tre-han" ? "#dc2626" : tienDo > 50 ? "#2563eb" : "#f59e0b"
            }
          />
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {TRANG_THAI_CONFIG[rec.trangThai]?.label || rec.trangThai}
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải khung kiến trúc số Vĩnh Long..." />
      </div>
    );
  }

  const totalTasks = nhiemVus.length;
  const totalSystems = heThongs.length;

  return (
    <div className="w-full space-y-8 pb-20">
      
      {/* ========================================================================= */}
      {/* TẦNG 1: HEADER HERO BAR (Sleek Executive Tech Banner) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-sm">
                <SafetyCertificateOutlined className="text-blue-400" /> QĐ 1425/QĐ-TTg (PB 1.0)
              </span>
              <span className="text-xs text-slate-300/80 font-medium">Khung Kiến Trúc Chính Quyền Số Tỉnh Vĩnh Long</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
              Trung Tâm Quản Trị Kiến Trúc Số Tổng Thể
            </h1>
            <p className="text-xs md:text-sm text-slate-300/90 mt-1 max-w-2xl leading-relaxed">
              Mô hình 4 tầng lớp kiến trúc kết hợp 4 trụ cột xuyên suốt, tích hợp đồng bộ giữa <b>Kiểm kê Hiện trạng 389+ CSDL/Hệ thống</b> và <b>Kế hoạch Lộ trình 9+ Đề án</b> chuyển đổi số tỉnh Vĩnh Long.
            </p>
          </div>

          {/* Metric Stats */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shadow-inner">
              <div className="text-xs text-slate-300 font-medium">Hệ thống số & CSDL</div>
              <div className="text-2xl font-black text-emerald-400 leading-tight">{totalSystems}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shadow-inner">
              <div className="text-xs text-slate-300 font-medium">Nhiệm vụ lộ trình</div>
              <div className="text-2xl font-black text-amber-400 leading-tight">{totalTasks}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shadow-inner">
              <div className="text-xs text-slate-300 font-medium">Tầng lớp chuẩn hóa</div>
              <div className="text-2xl font-black text-blue-400 leading-tight">4 Lớp</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GUIDE & LEGEND BAR */}
      {/* ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <InfoCircleOutlined className="text-blue-600 text-sm" /> Chú thích & Hướng dẫn:
          </span>
          <span className="text-slate-600">
            Nhấp chuột vào bất kỳ <b>Khối chức năng</b> trên sơ đồ để xem ngay danh mục phần mềm và nhiệm vụ nâng cấp.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">Ký hiệu phương án:</span>
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ThunderboltOutlined className="text-[9px]" /> Nâng cấp
          </span>
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ThunderboltOutlined className="text-[9px]" /> Thay thế
          </span>
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ThunderboltOutlined className="text-[9px]" /> Bổ sung mới
          </span>
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ThunderboltOutlined className="text-[9px]" /> Tích hợp
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TẦNG 2: 3-COLUMN MASTER BLUEPRINT (SƠ ĐỒ PHÂN TẦNG KIẾN TRÚC TỔNG THỂ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        
        {/* ========================================================================= */}
        {/* CỘT TRÁI: THÀNH PHẦN XUYÊN SUỐT (I & II) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-2 bg-gradient-to-b from-slate-100/90 to-slate-200/60 backdrop-blur-sm rounded-3xl border border-slate-300/80 p-4 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3.5">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-center font-black text-[11px] py-2 rounded-xl shadow-xs uppercase tracking-wider">
              TRỤ CỘT XUYÊN SUỐT
            </div>

            {/* 1. Quản trị & Thể chế */}
            <div className="bg-white hover:bg-slate-50/90 p-4 rounded-2xl border border-slate-200 text-center shadow-xs hover:border-slate-300 transition-all group">
              <div className="w-11 h-11 mx-auto bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <BankOutlined />
              </div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">1. Quản Trị & Thể Chế</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Ban chỉ đạo CĐS • Giám sát KPI • Kiến trúc sư trưởng
              </div>
            </div>

            {/* 2. Tiêu chuẩn & Quy chuẩn */}
            <div className="bg-white hover:bg-slate-50/90 p-4 rounded-2xl border border-slate-200 text-center shadow-xs hover:border-slate-300 transition-all group">
              <div className="w-11 h-11 mx-auto bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <SafetyCertificateOutlined />
              </div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">2. Tiêu Chuẩn Kỹ Thuật</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Quy chuẩn kết nối • Open API • Danh mục dùng chung
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 text-center font-extrabold uppercase tracking-wider pt-3 border-t border-slate-300/80 flex items-center justify-center gap-1">
            <span>🏛️ Thể Chế & Chỉ Đạo</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TRUNG TÂM: 04 LỚP KIẾN TRÚC CHUẨN QUỐC GIA (TOP-DOWN: LỚP 4 -> LỚP 1) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* ------------------------------------------------------------- */}
          {/* LỚP 4: KÊNH TƯƠNG TÁC VÀ ĐO LƯỜNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-orange-50/70 rounded-3xl border border-amber-300/80 p-4 md:p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-amber-200/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-xs tracking-wider">
                    LỚP 4
                  </span>
                  <span className="font-black text-sm md:text-base text-slate-900 uppercase tracking-wide">
                    KÊNH TƯƠNG TÁC & ĐO LƯỜNG HIỆU QUẢ
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/80 font-medium mt-1">
                  💡 Giao tiếp đa kênh phục vụ Người dân, Doanh nghiệp và đo lường mức độ hài lòng DVC trực tuyến
                </div>
              </div>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-100/90 px-3 py-0.5 rounded-full border border-amber-300/80 hidden sm:inline-block shrink-0">
                Tương tác Đa kênh • Đánh giá DVC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {renderTile("lop4_dvc")}
              {renderTile("lop4_app_mobile")}
              {renderTile("lop4_portal")}
              {renderTile("lop4_kpi_metric")}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* LỚP 3: ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 rounded-3xl border border-emerald-300/80 p-4 md:p-5 shadow-xs space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-black text-xs px-3 py-1 rounded-lg shadow-xs tracking-wider">
                    LỚP 3
                  </span>
                  <span className="font-black text-sm md:text-base text-slate-900 uppercase tracking-wide">
                    ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG
                  </span>
                </div>
                <div className="text-[11px] text-emerald-900/80 font-medium mt-1">
                  💡 Hệ thống phần mềm tác nghiệp nội bộ chính quyền và các ứng dụng phát triển kinh tế - xã hội số
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-100 font-extrabold px-3 py-0.5 rounded-full border border-emerald-300 shrink-0">
                389+ Hệ thống số & CSDL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nhánh 1: Chính quyền số */}
              <div className="space-y-2.5 bg-white/60 p-3 rounded-2xl border border-emerald-200/60">
                <div className="font-black text-xs text-emerald-900 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>🏛️ Chính Quyền Số (Nội Bộ & TTHC)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">4 Khối</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {renderTile("lop3_chidao_dieuhanh")}
                  {renderTile("lop3_tthc_sohoa")}
                  {renderTile("lop3_ioc_tinh")}
                  {renderTile("lop3_nghiepvu_chuyennganh")}
                </div>
              </div>

              {/* Nhánh 2: Kinh tế số & Xã hội số */}
              <div className="space-y-2.5 bg-white/60 p-3 rounded-2xl border border-emerald-200/60">
                <div className="font-black text-xs text-emerald-900 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>🌾 Kinh Tế Số & Xã Hội Số</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">4 Khối</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {renderTile("lop3_nongnghiep_so")}
                  {renderTile("lop3_yte_so")}
                  {renderTile("lop3_datdai_tnmt")}
                  {renderTile("lop3_dothi_kinhte")}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* LỚP 2: DỮ LIỆU VÀ NỀN TẢNG LÕI */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-gradient-to-r from-blue-50/70 via-blue-50/40 to-cyan-50/70 rounded-3xl border border-blue-300/80 p-4 md:p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-blue-200/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black text-xs px-3 py-1 rounded-lg shadow-xs tracking-wider">
                    LỚP 2
                  </span>
                  <span className="font-black text-sm md:text-base text-slate-900 uppercase tracking-wide">
                    DỮ LIỆU VÀ NỀN TẢNG LÕI
                  </span>
                </div>
                <div className="text-[11px] text-blue-900/80 font-medium mt-1">
                  💡 Trung tâm tích hợp, liên thông dữ liệu qua LGSP/NDXP và các CSDL Quốc gia cốt lõi (Đề án 06)
                </div>
              </div>
              <span className="text-[11px] text-blue-800 font-bold bg-blue-100/90 px-3 py-0.5 rounded-full border border-blue-300/80 hidden sm:inline-block shrink-0">
                Trục LGSP • CSDL Quốc Gia • Kho Dữ Liệu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {renderTile("lop2_lgsp_ndxp")}
              {renderTile("lop2_kho_dulieu_master")}
              {renderTile("lop2_csdl_quocgia")}
              {renderTile("lop2_nentang_loi")}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* LỚP 1: HẠ TẦNG SỐ VÀ AN NINH MẠNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-gradient-to-r from-purple-50/70 via-purple-50/40 to-indigo-50/70 rounded-3xl border border-purple-300/80 p-4 md:p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-purple-200/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black text-xs px-3 py-1 rounded-lg shadow-xs tracking-wider">
                    LỚP 1
                  </span>
                  <span className="font-black text-sm md:text-base text-slate-900 uppercase tracking-wide">
                    HẠ TẦNG SỐ VÀ AN NINH MẠNG DÙNG CHUNG
                  </span>
                </div>
                <div className="text-[11px] text-purple-900/80 font-medium mt-1">
                  💡 Nền tảng Trung tâm dữ liệu (IDC/Cloud), Mạng truyền số liệu chuyên dùng (TSLCD) và SOC An toàn 4 lớp
                </div>
              </div>
              <span className="text-[11px] text-purple-800 font-bold bg-purple-100/90 px-3 py-0.5 rounded-full border border-purple-300/80 hidden sm:inline-block shrink-0">
                Cloud IDC • TSLCD • SOC An Toàn 4 Lớp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {renderTile("lop1_idc_cloud")}
              {renderTile("lop1_mang_tslcd")}
              {renderTile("lop1_soc_anm")}
              {renderTile("lop1_iot_bien")}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI: THÀNH PHẦN XUYÊN SUỐT (III & IV) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-2 bg-gradient-to-b from-indigo-50/90 to-indigo-100/60 backdrop-blur-sm rounded-3xl border border-indigo-300/80 p-4 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3.5">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white text-center font-black text-[11px] py-2 rounded-xl shadow-xs uppercase tracking-wider">
              TRỤ CỘT XUYÊN SUỐT
            </div>

            {/* 3. AI First */}
            <div className="bg-white hover:bg-slate-50/90 p-4 rounded-2xl border border-indigo-200 text-center shadow-xs hover:border-indigo-300 transition-all group">
              <div className="w-11 h-11 mx-auto bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <RobotOutlined />
              </div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">3. Ưu Tiên AI (AI First)</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Trợ lý ảo CCVC • Tự động hóa thủ tục • AI Phân tích dữ liệu
              </div>
            </div>

            {/* 4. Data-Centric */}
            <div className="bg-white hover:bg-slate-50/90 p-4 rounded-2xl border border-indigo-200 text-center shadow-xs hover:border-indigo-300 transition-all group">
              <div className="w-11 h-11 mx-auto bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <DatabaseOutlined />
              </div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">4. Dữ Liệu Trung Tâm</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Đúng - Đủ - Sạch - Sống • Open Data • Chia sẻ liên thông
              </div>
            </div>
          </div>

          <div className="text-[11px] text-indigo-800 text-center font-extrabold uppercase tracking-wider pt-3 border-t border-indigo-300/80 flex items-center justify-center gap-1">
            <span>🚀 Động Lực Số & Dữ Liệu</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TẦNG 3: KHU VỰC BẢNG DỮ LIỆU TRA CỨU CHI TIẾT (UNIFIED DATA EXPLORER) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        
        {/* Header of Data Explorer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <h2 className="text-xl font-black text-slate-900 m-0">
                Tra Cứu Dữ Liệu Chi Tiết Kiến Trúc Số
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Kiểm kê toàn bộ danh mục tài sản số hiện có và theo dõi tiến độ các nhiệm vụ đề án chuyển đổi số
            </p>
          </div>

          {/* Master Tabs Switcher */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("hien-trang")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "hien-trang"
                  ? "bg-white text-blue-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DatabaseOutlined className={activeTab === "hien-trang" ? "text-blue-600" : ""} />
              <span>Kiểm kê Hiện trạng ({totalSystems})</span>
            </button>

            <button
              onClick={() => setActiveTab("lo-trinh")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "lo-trinh"
                  ? "bg-white text-blue-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ThunderboltOutlined className={activeTab === "lo-trinh" ? "text-amber-500" : ""} />
              <span>Tiến độ Lộ trình ({totalTasks})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HIỆN TRẠNG (389+ CSDL & PHẦN MỀM) */}
        {activeTab === "hien-trang" && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <Search
                  placeholder="Tìm theo tên phần mềm, CSDL, mô tả..."
                  allowClear
                  value={searchHT}
                  onChange={(e) => setSearchHT(e.target.value)}
                  style={{ width: 280 }}
                  prefix={<SearchOutlined className="text-gray-400" />}
                />

                <Select
                  placeholder="Tất cả lớp kiến trúc"
                  value={selectedLopHT}
                  onChange={(val) => setSelectedLopHT(val)}
                  style={{ width: 180 }}
                >
                  <Select.Option value="all">🌐 Tất cả các lớp ({totalSystems})</Select.Option>
                  {[1, 2, 3, 4].map((l) => (
                    <Select.Option key={l} value={String(l)}>
                      {LOP_CONFIG[l as 1 | 2 | 3 | 4].icon} {LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  placeholder="Tất cả đơn vị"
                  allowClear
                  value={filterDonViHT || undefined}
                  onChange={(val) => setFilterDonViHT(val || "")}
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
                  value={filterTrangThaiHT || undefined}
                  onChange={(val) => setFilterTrangThaiHT(val || "")}
                  style={{ width: 170 }}
                >
                  {Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v.label}</Select.Option>
                  ))}
                </Select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Tìm thấy <span className="font-bold text-blue-600">{filteredHT.length}</span> / {totalSystems} hệ thống
              </div>
            </div>

            {/* Table */}
            <Table
              columns={htTableColumns}
              dataSource={filteredHT}
              rowKey="id"
              pagination={{ pageSize: 12, showQuickJumper: true }}
              size="middle"
              className="border rounded-2xl overflow-hidden"
              onRow={(record) => ({
                onClick: () => setSelectedHT(record),
                className: "cursor-pointer hover:bg-blue-50/40 transition-colors",
              })}
            />
          </div>
        )}

        {/* TAB 2: LỘ TRÌNH (9+ NHIỆM VỤ & ĐỀ ÁN) */}
        {activeTab === "lo-trinh" && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <Search
                  placeholder="Tìm theo tên nhiệm vụ, đề án..."
                  allowClear
                  value={searchNV}
                  onChange={(e) => setSearchNV(e.target.value)}
                  style={{ width: 300 }}
                  prefix={<SearchOutlined className="text-gray-400" />}
                />

                <Select
                  placeholder="Tất cả lớp kiến trúc"
                  value={selectedLopNV}
                  onChange={(val) => setSelectedLopNV(val)}
                  style={{ width: 180 }}
                >
                  <Select.Option value="all">🌐 Tất cả các lớp ({totalTasks})</Select.Option>
                  {[1, 2, 3, 4].map((l) => (
                    <Select.Option key={l} value={String(l)}>
                      {LOP_CONFIG[l as 1 | 2 | 3 | 4].icon} {LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  placeholder="Tất cả trạng thái"
                  allowClear
                  value={filterTrangThaiNV || undefined}
                  onChange={(val) => setFilterTrangThaiNV(val || "")}
                  style={{ width: 180 }}
                >
                  {Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v.label}</Select.Option>
                  ))}
                </Select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Tìm thấy <span className="font-bold text-blue-600">{filteredNV.length}</span> / {totalTasks} nhiệm vụ
              </div>
            </div>

            {/* Table */}
            <Table
              columns={nvTableColumns}
              dataSource={filteredNV}
              rowKey="id"
              pagination={{ pageSize: 10, showQuickJumper: true }}
              size="middle"
              className="border rounded-2xl overflow-hidden"
              rowClassName={(record) => (record.trangThai === "hoan-thanh" ? "bg-green-50/30" : isOverdue(record.thoiHan) && record.trangThai !== "hoan-thanh" ? "bg-red-50/30" : "")}
            />
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DETAIL MODAL WHEN CLICKING ANY BLUEPRINT BLOCK */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2.5 pr-6 pb-2 border-b">
            <span className="text-2xl p-1.5 rounded-xl bg-slate-100 flex items-center justify-center" style={{ color: selectedBlock?.color }}>
              {selectedBlock?.icon}
            </span>
            <div>
              <div className="font-extrabold text-lg text-slate-900 leading-tight">{selectedBlock?.title}</div>
              <div className="text-xs text-slate-500 font-medium">{selectedBlock?.category}</div>
            </div>
          </div>
        }
        open={!!selectedBlock}
        onCancel={() => setSelectedBlock(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedBlock(null)} className="rounded-xl font-bold px-6">
            Đóng
          </Button>,
        ]}
        width={750}
        destroyOnHidden
      >
        {selectedBlock && (
          <div className="space-y-4 mt-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <div className="font-semibold text-slate-800 mb-1">Mục tiêu & Chức năng quy hoạch:</div>
              <div>{selectedBlock.description}</div>
            </div>

            {/* Nhiệm vụ lộ trình liên quan */}
            <div>
              <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <ThunderboltOutlined className="text-amber-500" />
                <span>Nhiệm vụ & Đề án Lộ trình liên quan ({getMatchedTasks(selectedBlock).length}):</span>
              </div>
              {getMatchedTasks(selectedBlock).length > 0 ? (
                <div className="space-y-2">
                  {getMatchedTasks(selectedBlock).map((nv) => (
                    <div key={nv.id} className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex justify-between items-center hover:border-amber-300 transition-colors">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">
                            {nv.ten}
                          </span>
                          {nv.phuongAnXuLy && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                              {PHUONG_AN_CONFIG[nv.phuongAnXuLy] || nv.phuongAnXuLy}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Chủ trì: {nv.donViChuTri?.ten || "UBND tỉnh"} • Hạn chót: {nv.thoiHan ? new Date(nv.thoiHan).toLocaleDateString("vi-VN") : "—"}
                        </div>
                      </div>
                      <span className="font-black text-xs text-blue-600 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                        {nv.tienDo}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 text-center">
                  (Khối này hiện đang vận hành ổn định, không có dự án nâng cấp quy mô lớn trong lộ trình hiện tại)
                </div>
              )}
            </div>

            {/* Danh sách hệ thống số hiện trạng */}
            <div>
              <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <DatabaseOutlined className="text-blue-500" />
                <span>Hệ thống số & CSDL Hiện trạng thuộc khối này ({getMatchedItems(selectedBlock).length}):</span>
              </div>
              {getMatchedItems(selectedBlock).length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {getMatchedItems(selectedBlock).slice(0, 30).map((ht) => (
                    <div key={ht.id} className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 text-xs flex justify-between items-center shadow-2xs">
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-slate-800">{ht.ten}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {ht.donVi?.ten || ht.chuQuan || "Chưa xác định"} {ht.namTrienKhai ? `• Năm ${ht.namTrienKhai}` : ""}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TRANG_THAI_CONFIG[ht.trangThai]?.badgeClass || ""}`}>
                        {TRANG_THAI_CONFIG[ht.trangThai]?.label || ht.trangThai}
                      </span>
                    </div>
                  ))}
                  {getMatchedItems(selectedBlock).length > 30 && (
                    <div className="text-center text-xs text-blue-600 font-bold py-2">
                      ...và còn {getMatchedItems(selectedBlock).length - 30} CSDL/phần mềm chuyên ngành khác.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 text-center">
                  (Khối này đóng vai trò quy chuẩn mục tiêu kết nối liên thông)
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* DETAIL MODAL WHEN CLICKING ANY SYSTEM IN TABLE */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 pr-6 border-b pb-2.5">
            <DatabaseOutlined className="text-blue-600" />
            <span>Thông tin chi tiết Hệ thống số / CSDL</span>
          </div>
        }
        open={!!selectedHT}
        onCancel={() => setSelectedHT(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedHT(null)} className="rounded-xl font-bold px-6">
            Đóng
          </Button>,
        ]}
        width={750}
        destroyOnClose
      >
        {selectedHT && (
          <div className="mt-3 space-y-4">
            <h3 className="text-lg font-bold text-blue-900 m-0">{selectedHT.ten}</h3>
            
            <div className="flex gap-2 flex-wrap items-center">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${LOP_CONFIG[selectedHT.lop as 1|2|3|4]?.badgeClass}`}>
                {LOP_CONFIG[selectedHT.lop as 1|2|3|4]?.icon} Lớp {selectedHT.lop}: {LOP_CONFIG[selectedHT.lop as 1|2|3|4]?.shortLabel}
              </span>
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${TRANG_THAI_CONFIG[selectedHT.trangThai]?.badgeClass}`}>
                {TRANG_THAI_CONFIG[selectedHT.trangThai]?.label || selectedHT.trangThai}
              </span>
            </div>

            <Descriptions bordered column={1} size="small" labelStyle={{ width: "32%", backgroundColor: "#f8fafc", fontWeight: 600 }}>
              <Descriptions.Item label="Đơn vị chủ quản">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <BankOutlined className="text-blue-500" />
                  {selectedHT.donVi?.ten || selectedHT.chuQuan || "Chưa xác định"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Năm triển khai">
                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarOutlined className="text-slate-400" />
                  <span>{selectedHT.namTrienKhai ? `Năm ${selectedHT.namTrienKhai}` : "Chưa xác định"}</span>
                </div>
              </Descriptions.Item>

              {/* Parsed description Key::Value pairs */}
              {selectedHT.moTa && selectedHT.moTa.split(/\\n/).filter(l => l.trim()).map((line, idx) => {
                const parts = line.split("::");
                const k = parts.length >= 2 ? parts[0].trim() : "Thông tin";
                const v = parts.length >= 2 ? parts.slice(1).join("::").trim() : line.trim();
                return (
                  <Descriptions.Item key={idx} label={k}>
                    <span className="whitespace-pre-wrap">{v}</span>
                  </Descriptions.Item>
                );
              })}

              {selectedHT.nhiemVus && selectedHT.nhiemVus.length > 0 && (
                <Descriptions.Item label="Nhiệm vụ lộ trình liên quan">
                  <div className="space-y-2">
                    {selectedHT.nhiemVus.map((nv, idx) => (
                      <div key={idx} className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                        <div className="font-bold text-blue-900 text-xs">{nv.ten}</div>
                        <div className="text-[11px] text-blue-700 mt-1 flex justify-between">
                          <span>Tiến độ: <b>{nv.tienDo}%</b></span>
                          <span>Hạn chót: <b>{nv.thoiHan ? new Date(nv.thoiHan).toLocaleDateString("vi-VN") : "Chưa rõ"}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

    </div>
  );
}
