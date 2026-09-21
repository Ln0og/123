"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, Modal, Button, Spin } from "antd";
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
} from "@ant-design/icons";
import { HeThongSoData, NhiemVuData } from "@/types";
import { TRANG_THAI_CONFIG } from "@/lib/utils";

interface FrameworkBlock {
  id: string;
  title: string;
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
  const [selectedBlock, setSelectedBlock] = useState<FrameworkBlock | null>(null);

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
      description: "Cổng Dịch vụ công trực tuyến tỉnh tích hợp kết nối Cổng DVC Quốc gia và Hệ thống Một cửa điện tử tập trung.",
      icon: <GlobalOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.lop === 4 || ht.ten.toLowerCase().includes("dịch vụ công") || ht.ten.toLowerCase().includes("một cửa"),
      tasksMatch: (nv) => nv.ma === "NV-04" || nv.lop === 4,
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fdba74",
    },
    lop4_app_mobile: {
      id: "lop4_app_mobile",
      title: "App Vĩnh Long Smart",
      description: "Ứng dụng công dân số đa tiện ích tích hợp Zalo Mini App, VNeID và các dịch vụ tiện ích phục vụ người dân.",
      icon: <MobileOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("di động") || ht.ten.toLowerCase().includes("app") || ht.ten.toLowerCase().includes("smart") || ht.ma === "DL-01",
      tasksMatch: (nv) => nv.ma === "NV-07" || nv.ma === "NV-03",
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fdba74",
    },
    lop4_portal: {
      id: "lop4_portal",
      title: "Cổng Thông Tin Tỉnh",
      description: "Cổng thông tin điện tử tỉnh Vĩnh Long và mạng lưới các trang thông tin điện tử thành phần của Sở, Ban, Ngành, Huyện.",
      icon: <ApartmentOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("cổng thông tin") || ht.ten.toLowerCase().includes("portal"),
      tasksMatch: (nv) => false,
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fdba74",
    },
    lop4_kpi_metric: {
      id: "lop4_kpi_metric",
      title: "Dashboard Đo Lường KPI",
      description: "Hệ thống giám sát, đo lường tỷ lệ dịch vụ công trực tuyến toàn trình và mức độ hài lòng của người dân, doanh nghiệp.",
      icon: <FundProjectionScreenOutlined />,
      lop: 4,
      category: "Lớp 4: Kênh tương tác & Đo lường",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("đo lường") || ht.ten.toLowerCase().includes("kpi") || ht.ten.toLowerCase().includes("đánh giá"),
      tasksMatch: (nv) => nv.ma === "NV-04",
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fdba74",
    },

    // =========================================================================
    // LỚP 3: ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG
    // =========================================================================
    // Nhánh 1: Chính quyền số
    lop3_chidao_dieuhanh: {
      id: "lop3_chidao_dieuhanh",
      title: "Chỉ Đạo & Báo Cáo",
      description: "Quản lý văn bản điều hành iOffice, phòng họp không giấy e-Cabinet, Hệ thống thông tin báo cáo tỉnh.",
      icon: <FileProtectOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("văn bản") || ht.ten.toLowerCase().includes("điều hành") || ht.ten.toLowerCase().includes("báo cáo"),
      tasksMatch: (nv) => nv.ten.toLowerCase().includes("văn bản"),
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    },
    lop3_tthc_sohoa: {
      id: "lop3_tthc_sohoa",
      title: "Giải Quyết TTHC",
      description: "Quy trình giải quyết TTHC liên thông, số hóa hồ sơ giấy và cấp kết quả bản điện tử đồng bộ toàn tỉnh.",
      icon: <DesktopOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("thủ tục") || ht.ten.toLowerCase().includes("tthc"),
      tasksMatch: (nv) => nv.ma === "NV-04",
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    },
    lop3_ioc_tinh: {
      id: "lop3_ioc_tinh",
      title: "Trung Tâm IOC Tỉnh",
      description: "Trung tâm Giám sát, Điều hành thông minh tỉnh Vĩnh Long liên thông số liệu thời gian thực phục vụ lãnh đạo.",
      icon: <FundProjectionScreenOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("ioc") || ht.ten.toLowerCase().includes("điều hành thông minh"),
      tasksMatch: (nv) => nv.ma === "NV-08",
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    },
    lop3_nghiepvu_chuyennganh: {
      id: "lop3_nghiepvu_chuyennganh",
      title: "Nghiệp Vụ Sở Ngành",
      description: "Các phần mềm chuyên môn: Cán bộ công chức, Tư pháp hộ tịch, Thanh tra, Tài chính ngân sách nhà nước.",
      icon: <AuditOutlined />,
      lop: 3,
      category: "Lớp 3: Chính quyền số (Nội bộ & TTHC)",
      itemsMatch: (ht) => (ht.lop === 3 && !ht.ma.startsWith("SNN-") && ht.ma !== "UD-03") || ht.ten.toLowerCase().includes("cán bộ"),
      tasksMatch: (nv) => false,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    },

    // Nhánh 2: Kinh tế số & Xã hội số
    lop3_nongnghiep_so: {
      id: "lop3_nongnghiep_so",
      title: "Nông Nghiệp (380+ CSDL)",
      description: "Bản đồ canh tác, trạm quan trắc VnEmisoft, CSDL trồng trọt, chăn nuôi, thủy sản, OCOP và truy xuất nguồn gốc.",
      icon: <ShopOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma.startsWith("SNN-") || (ht.donVi?.ten || "").includes("Nông nghiệp"),
      tasksMatch: (nv) => false,
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#6ee7b7",
    },
    lop3_yte_so: {
      id: "lop3_yte_so",
      title: "Y Tế & Sức Khỏe Số",
      description: "Hệ thống HIS bệnh viện, Bệnh án điện tử EMR, quản lý trạm y tế cơ sở và Hồ sơ sức khỏe toàn dân.",
      icon: <MedicineBoxOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma === "UD-03" || ht.ten.toLowerCase().includes("y tế") || ht.ten.toLowerCase().includes("his"),
      tasksMatch: (nv) => nv.ma === "NV-09",
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#6ee7b7",
    },
    lop3_datdai_tnmt: {
      id: "lop3_datdai_tnmt",
      title: "Đất Đai & Môi Trường",
      description: "CSDL Đất đai tỉnh kết nối nền tảng điều phối quốc gia (NDOP), trạm quan trắc môi trường tự động.",
      icon: <EnvironmentOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ma === "DL-02" || ht.ten.toLowerCase().includes("đất đai") || ht.ten.toLowerCase().includes("môi trường"),
      tasksMatch: (nv) => nv.ma === "NV-01",
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#6ee7b7",
    },
    lop3_dothi_kinhte: {
      id: "lop3_dothi_kinhte",
      title: "Đô Thị & Du Lịch Số",
      description: "Cổng thông tin du lịch thông minh, Giáo dục số, Chiếu sáng và giao thông thông minh đô thị.",
      icon: <CompassOutlined />,
      lop: 3,
      category: "Lớp 3: Kinh tế số & Xã hội số",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("du lịch") || ht.ten.toLowerCase().includes("giáo dục") || ht.ten.toLowerCase().includes("thương mại"),
      tasksMatch: (nv) => false,
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#6ee7b7",
    },

    // ==========================================
    // LỚP 2: DỮ LIỆU VÀ NỀN TẢNG LÕI
    // ==========================================
    lop2_lgsp_ndxp: {
      id: "lop2_lgsp_ndxp",
      title: "Trục Tích Hợp LGSP",
      description: "Nền tảng tích hợp, chia sẻ dữ liệu cấp tỉnh (LGSP) liên thông kết nối Trục Quốc gia (NDXP).",
      icon: <NodeIndexOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ma === "DL-03" || ht.ten.toLowerCase().includes("lgsp") || ht.ten.toLowerCase().includes("chia sẻ"),
      tasksMatch: (nv) => nv.ma === "NV-04" || nv.ma === "NV-06",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    },
    lop2_kho_dulieu_master: {
      id: "lop2_kho_dulieu_master",
      title: "Kho Dữ Liệu Dùng Chung",
      description: "Kho dữ liệu tổng hợp tỉnh, Từ điển danh mục dùng chung và Nền tảng dữ liệu mở (Open Data).",
      icon: <DatabaseOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ma.startsWith("DL-") || ht.ten.toLowerCase().includes("kho dữ liệu") || ht.ten.toLowerCase().includes("danh mục"),
      tasksMatch: (nv) => nv.ma === "NV-06",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    },
    lop2_csdl_quocgia: {
      id: "lop2_csdl_quocgia",
      title: "CSDL Quốc Gia (ĐA 06)",
      description: "Kết nối CSDL Quốc gia về Dân cư, Đất đai, Đăng ký Doanh nghiệp, Bảo hiểm xã hội và Tư pháp.",
      icon: <ApartmentOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("dân cư") || ht.ma === "DL-01" || ht.ma === "DL-02",
      tasksMatch: (nv) => nv.ma === "NV-03" || nv.ma === "NV-01",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    },
    lop2_nentang_loi: {
      id: "lop2_nentang_loi",
      title: "Định Danh VNeID & GIS",
      description: "Nền tảng định danh xác thực (VNeID/SSO), Thanh toán trực tuyến Payment và Bản đồ số GIS tỉnh.",
      icon: <DeploymentUnitOutlined />,
      lop: 2,
      category: "Lớp 2: Dữ liệu & Nền tảng lõi",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("định danh") || ht.ten.toLowerCase().includes("gis") || ht.ten.toLowerCase().includes("thanh toán"),
      tasksMatch: (nv) => nv.ma === "NV-03",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    },

    // ==========================================
    // LỚP 1: HẠ TẦNG SỐ VÀ AN NINH MẠNG DÙNG CHUNG
    // ==========================================
    lop1_idc_cloud: {
      id: "lop1_idc_cloud",
      title: "Trung Tâm Dữ Liệu IDC",
      description: "Trung tâm tích hợp dữ liệu tỉnh, chuyển đổi sang kiến trúc Cloud kết nối Cloud Quốc gia.",
      icon: <CloudServerOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-02" || ht.ten.toLowerCase().includes("idc") || ht.ten.toLowerCase().includes("trung tâm tích hợp"),
      tasksMatch: (nv) => nv.ma === "NV-02",
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#c4b5fd",
    },
    lop1_mang_tslcd: {
      id: "lop1_mang_tslcd",
      title: "Mạng TSLCD Cấp I, II",
      description: "Mạng Truyền số liệu chuyên dùng cấp I, II kết nối 100% cơ quan Đảng, chính quyền 3 cấp an toàn, thông suốt.",
      icon: <NodeIndexOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-01" || ht.ten.toLowerCase().includes("wan") || ht.ten.toLowerCase().includes("mạng"),
      tasksMatch: (nv) => false,
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#c4b5fd",
    },
    lop1_soc_anm: {
      id: "lop1_soc_anm",
      title: "SOC Tỉnh (ATTT 4 Lớp)",
      description: "Mô hình bảo vệ an toàn thông tin 4 lớp, kết nối SOC Quốc gia của Bộ Công an, Chữ ký số PKI.",
      icon: <LockOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ma === "HT-03" || ht.ten.toLowerCase().includes("soc") || ht.ten.toLowerCase().includes("an toàn"),
      tasksMatch: (nv) => nv.ma === "NV-05",
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#c4b5fd",
    },
    lop1_iot_bien: {
      id: "lop1_iot_bien",
      title: "Hạ Tầng IoT & Camera",
      description: "Hệ thống camera giám sát an ninh đô thị tập trung, mạng lưới cảm biến quan trắc môi trường và nông nghiệp.",
      icon: <EyeOutlined />,
      lop: 1,
      category: "Lớp 1: Hạ tầng số & An ninh mạng",
      itemsMatch: (ht) => ht.ten.toLowerCase().includes("camera") || ht.ten.toLowerCase().includes("quan trắc") || ht.ten.toLowerCase().includes("iot"),
      tasksMatch: (nv) => false,
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      borderColor: "#c4b5fd",
    },
  };

  const getMatchedItems = (block: FrameworkBlock) => {
    return heThongs.filter(block.itemsMatch);
  };

  const getMatchedTasks = (block: FrameworkBlock) => {
    return nhiemVus.filter(block.tasksMatch);
  };

  // Render a clean architectural block (tile) with high legibility and 100% visible text
  const renderTile = (blockKey: string) => {
    const block = frameworkBlocks[blockKey];
    if (!block) return null;
    const items = getMatchedItems(block);
    const tasks = getMatchedTasks(block);
    const hasUpgrade = items.some((i) => i.trangThai === "can-nang-cap") || tasks.length > 0;

    return (
      <div
        onClick={() => setSelectedBlock(block)}
        className="bg-white hover:bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[92px] group select-none relative"
      >
        {/* Top Header inside tile: Icon + Action */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform group-hover:scale-105 shadow-xs"
            style={{ backgroundColor: block.bgColor, color: block.color }}
          >
            {block.icon}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasUpgrade && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Có nhiệm vụ lộ trình nâng cấp" />
            )}
            <RightOutlined className="text-[11px] text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Title: 100% width, full text, never truncated */}
        <div className="font-bold text-slate-800 text-xs sm:text-[13px] group-hover:text-blue-700 transition-colors leading-snug">
          {block.title}
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
    <div className="w-full space-y-5 pb-12">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              QĐ 1425/QĐ-TTg (PB 1.0)
            </span>
            <span className="text-xs text-blue-200/90 font-medium">Khung Kiến Trúc Chính Quyền Số Tỉnh Vĩnh Long</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-white m-0">
            Sơ Đồ Phân Tầng Kiến Trúc Tổng Thể
          </h1>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href="/kts/hien-trang">
            <Button size="middle" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold">
              Hiện Trạng (389 HT)
            </Button>
          </Link>
          <Link href="/kts/lo-trinh">
            <Button type="primary" size="middle" className="bg-blue-600 font-bold shadow-sm">
              Lộ Trình (9 NV)
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-COLUMN MASTER BLUEPRINT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* ========================================================================= */}
        {/* CỘT TRÁI: THÀNH PHẦN XUYÊN SUỐT (I & II) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-2 bg-slate-100/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="bg-slate-800 text-white text-center font-bold text-xs py-2 rounded-lg shadow-xs uppercase tracking-wider">
              TRỤ CỘT XUYÊN SUỐT
            </div>

            {/* 1. Quản trị & Thể chế */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs hover:border-slate-400 transition-colors">
              <BankOutlined className="text-blue-700 text-2xl mb-1.5" />
              <div className="font-extrabold text-slate-900 text-sm">1. Quản Trị & Thể Chế</div>
              <div className="text-xs text-slate-500 mt-1">
                Ban chỉ đạo CĐS • Giám sát KPI
              </div>
            </div>

            {/* 2. Tiêu chuẩn & Quy chuẩn */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs hover:border-slate-400 transition-colors">
              <SafetyCertificateOutlined className="text-blue-700 text-2xl mb-1.5" />
              <div className="font-extrabold text-slate-900 text-sm">2. Tiêu Chuẩn Kỹ Thuật</div>
              <div className="text-xs text-slate-500 mt-1">
                Quy chuẩn kết nối • Open API
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-bold uppercase tracking-wider pt-2 border-t border-slate-200">
            Thể Chế & Chỉ Đạo
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TRUNG TÂM: 04 LỚP KIẾN TRÚC CHUẨN QUỐC GIA (TOP-DOWN: LỚP 4 -> LỚP 1) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* ------------------------------------------------------------- */}
          {/* LỚP 4: KÊNH TƯƠNG TÁC VÀ ĐO LƯỜNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-amber-50/50 rounded-2xl border-2 border-amber-200 p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-amber-200">
              <span className="bg-amber-600 text-white font-black text-xs px-3 py-1 rounded-md shadow-xs tracking-wider">
                LỚP 4
              </span>
              <span className="font-black text-base text-slate-900 uppercase tracking-wide">
                KÊNH TƯƠNG TÁC & ĐO LƯỜNG HIỆU QUẢ
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {renderTile("lop4_dvc")}
              {renderTile("lop4_app_mobile")}
              {renderTile("lop4_portal")}
              {renderTile("lop4_kpi_metric")}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* LỚP 3: ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-700 text-white font-black text-xs px-3 py-1 rounded-md shadow-xs tracking-wider">
                  LỚP 3
                </span>
                <span className="font-black text-base text-slate-900 uppercase tracking-wide">
                  ỨNG DỤNG VÀ NGHIỆP VỤ DÙNG CHUNG
                </span>
              </div>
              <span className="text-xs text-emerald-800 bg-emerald-100/90 font-bold px-3 py-1 rounded-full border border-emerald-300">
                389+ Hệ thống
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nhánh 1: Chính quyền số */}
              <div className="space-y-2">
                <div className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider px-1">
                  🏛️ Chính Quyền Số (Nội Bộ & TTHC)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {renderTile("lop3_chidao_dieuhanh")}
                  {renderTile("lop3_tthc_sohoa")}
                  {renderTile("lop3_ioc_tinh")}
                  {renderTile("lop3_nghiepvu_chuyennganh")}
                </div>
              </div>

              {/* Nhánh 2: Kinh tế số & Xã hội số */}
              <div className="space-y-2">
                <div className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider px-1">
                  🌾 Kinh Tế Số & Xã Hội Số
                </div>
                <div className="grid grid-cols-2 gap-2.5">
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
          <div className="bg-blue-50/50 rounded-2xl border-2 border-blue-200 p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-blue-200">
              <span className="bg-blue-700 text-white font-black text-xs px-3 py-1 rounded-md shadow-xs tracking-wider">
                LỚP 2
              </span>
              <span className="font-black text-base text-slate-900 uppercase tracking-wide">
                DỮ LIỆU VÀ NỀN TẢNG LÕI
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {renderTile("lop2_lgsp_ndxp")}
              {renderTile("lop2_kho_dulieu_master")}
              {renderTile("lop2_csdl_quocgia")}
              {renderTile("lop2_nentang_loi")}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* LỚP 1: HẠ TẦNG SỐ VÀ AN NINH MẠNG */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-purple-50/50 rounded-2xl border-2 border-purple-200 p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-purple-200">
              <span className="bg-purple-700 text-white font-black text-xs px-3 py-1 rounded-md shadow-xs tracking-wider">
                LỚP 1
              </span>
              <span className="font-black text-base text-slate-900 uppercase tracking-wide">
                HẠ TẦNG SỐ VÀ AN NINH MẠNG DÙNG CHUNG
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
        <div className="xl:col-span-2 bg-indigo-50/60 rounded-2xl border border-indigo-200 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="bg-indigo-900 text-white text-center font-bold text-xs py-2 rounded-lg shadow-xs uppercase tracking-wider">
              TRỤ CỘT XUYÊN SUỐT
            </div>

            {/* 3. AI First */}
            <div className="bg-white p-4 rounded-xl border border-indigo-200 text-center shadow-xs hover:border-indigo-400 transition-colors">
              <RobotOutlined className="text-indigo-600 text-2xl mb-1.5" />
              <div className="font-extrabold text-slate-900 text-sm">3. Ưu Tiên AI (AI First)</div>
              <div className="text-xs text-slate-500 mt-1">
                Trợ lý ảo CCVC • Tự động hóa
              </div>
            </div>

            {/* 4. Data-Centric */}
            <div className="bg-white p-4 rounded-xl border border-indigo-200 text-center shadow-xs hover:border-indigo-400 transition-colors">
              <DatabaseOutlined className="text-blue-600 text-2xl mb-1.5" />
              <div className="font-extrabold text-slate-900 text-sm">4. Dữ Liệu Trung Tâm</div>
              <div className="text-xs text-slate-500 mt-1">
                Đúng - Đủ - Sạch - Sống
              </div>
            </div>
          </div>

          <div className="text-[11px] text-indigo-700 text-center font-bold uppercase tracking-wider pt-2 border-t border-indigo-200">
            Động Lực Số & Dữ Liệu
          </div>
        </div>

      </div>

      {/* DETAIL MODAL WHEN CLICKING ANY BLOCK */}
      <Modal
        title={
          <div className="flex items-center gap-2 pr-6">
            <span className="text-xl" style={{ color: selectedBlock?.color }}>{selectedBlock?.icon}</span>
            <span className="font-bold text-base text-gray-800">{selectedBlock?.title}</span>
          </div>
        }
        open={!!selectedBlock}
        onCancel={() => setSelectedBlock(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedBlock(null)}>
            Đóng
          </Button>,
        ]}
        width={750}
        destroyOnHidden
      >
        {selectedBlock && (
          <div className="space-y-4 mt-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-gray-700 leading-relaxed">
              <b>Phân loại kiến trúc:</b> <Tag color="blue">{selectedBlock.category}</Tag>
              <div className="mt-1">{selectedBlock.description}</div>
            </div>

            {/* Nhiệm vụ lộ trình liên quan */}
            <div>
              <div className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
                <ThunderboltOutlined className="text-amber-500" />
                <span>Nhiệm vụ & Đề án Lộ trình liên quan ({getMatchedTasks(selectedBlock).length}):</span>
              </div>
              {getMatchedTasks(selectedBlock).length > 0 ? (
                <div className="space-y-2">
                  {getMatchedTasks(selectedBlock).map((nv) => (
                    <div key={nv.id} className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">
                          <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded mr-1.5">{nv.ma}</span>
                          {nv.ten}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          Chủ trì: {nv.donViChuTri?.ten || "UBND tỉnh"} • Hạn: {nv.thoiHan ? new Date(nv.thoiHan).toLocaleDateString("vi-VN") : "—"}
                        </div>
                      </div>
                      <span className="font-bold text-xs text-blue-600 bg-white px-2 py-1 rounded border border-blue-200">
                        {nv.tienDo}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded">
                  (Khối này hiện đang vận hành ổn định, không có dự án nâng cấp quy mô lớn trong lộ trình hiện tại)
                </div>
              )}
            </div>

            {/* Danh sách hệ thống số hiện trạng */}
            <div>
              <div className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
                <DatabaseOutlined className="text-blue-500" />
                <span>Hệ thống số & CSDL Hiện trạng thuộc khối này ({getMatchedItems(selectedBlock).length}):</span>
              </div>
              {getMatchedItems(selectedBlock).length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {getMatchedItems(selectedBlock).slice(0, 30).map((ht) => (
                    <div key={ht.id} className="p-2 bg-white rounded border border-gray-200 hover:border-blue-300 text-xs flex justify-between items-center">
                      <div className="flex-1 pr-2">
                        <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded mr-1.5 text-[10px]">
                          {ht.ma}
                        </span>
                        <span className="font-medium text-gray-800">{ht.ten}</span>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {ht.donVi?.ten || ht.chuQuan || "Chưa xác định"} {ht.namTrienKhai ? `• Năm ${ht.namTrienKhai}` : ""}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TRANG_THAI_CONFIG[ht.trangThai]?.badgeClass || ""}`}>
                        {TRANG_THAI_CONFIG[ht.trangThai]?.label || ht.trangThai}
                      </span>
                    </div>
                  ))}
                  {getMatchedItems(selectedBlock).length > 30 && (
                    <div className="text-center text-xs text-blue-600 py-2">
                      ...và còn {getMatchedItems(selectedBlock).length - 30} CSDL/phần mềm chuyên ngành khác.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded">
                  (Khối này đóng vai trò quy chuẩn mục tiêu kết nối liên thông)
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
