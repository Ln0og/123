import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatDateFull(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return dayjs(date).format("DD/MM/YYYY HH:mm");
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
}

export function getDaysRemaining(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  return dayjs(date).diff(dayjs(), "day");
}

export const LOP_CONFIG = {
  1: {
    label: "Lớp 1 — Hạ tầng số & An ninh mạng",
    shortLabel: "Hạ tầng số",
    color: "#4a044e",
    bgColor: "#fae8ff",
    borderColor: "#e879f9",
    badgeClass: "bg-fuchsia-100 text-fuchsia-950 border-fuchsia-400 font-bold",
    icon: "🏗️",
  },
  2: {
    label: "Lớp 2 — Dữ liệu & Nền tảng lõi",
    shortLabel: "Dữ liệu & NTL",
    color: "#1e3a8a",
    bgColor: "#dbeafe",
    borderColor: "#60a5fa",
    badgeClass: "bg-blue-100 text-blue-950 border-blue-400 font-bold",
    icon: "🗄️",
  },
  3: {
    label: "Lớp 3 — Ứng dụng & Nghiệp vụ",
    shortLabel: "Ứng dụng",
    color: "#064e3b",
    bgColor: "#d1fae5",
    borderColor: "#34d399",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold",
    icon: "📱",
  },
  4: {
    label: "Lớp 4 — Kênh tương tác & Đo lường",
    shortLabel: "Kênh tương tác",
    color: "#7c2d12",
    bgColor: "#ffedd5",
    borderColor: "#fb923c",
    badgeClass: "bg-orange-100 text-orange-950 border-orange-400 font-bold",
    icon: "🌐",
  },
} as const;

export const TRANG_THAI_CONFIG: Record<string, { label: string; color: string; antdColor: string; badgeClass: string }> = {
  "dang-van-hanh": { 
    label: "Đang vận hành", 
    color: "#14532d", 
    antdColor: "success",
    badgeClass: "bg-green-100 text-green-900 border-green-500 font-bold"
  },
  "can-nang-cap": { 
    label: "Cần nâng cấp", 
    color: "#78350f", 
    antdColor: "warning",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-500 font-bold"
  },
  "can-thay-the": { 
    label: "Cần thay thế", 
    color: "#7f1d1d", 
    antdColor: "error",
    badgeClass: "bg-rose-100 text-rose-950 border-rose-500 font-bold"
  },
  "ke-hoach": { 
    label: "Kế hoạch", 
    color: "#1e3a8a", 
    antdColor: "processing",
    badgeClass: "bg-blue-100 text-blue-950 border-blue-500 font-bold"
  },
  "chua-bat-dau": { 
    label: "Chưa bắt đầu", 
    color: "#334155", 
    antdColor: "default",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-400 font-bold"
  },
  "dang-thuc-hien": { 
    label: "Đang thực hiện", 
    color: "#1e3a8a", 
    antdColor: "processing",
    badgeClass: "bg-blue-100 text-blue-950 border-blue-500 font-bold"
  },
  "hoan-thanh": { 
    label: "Hoàn thành", 
    color: "#14532d", 
    antdColor: "success",
    badgeClass: "bg-green-100 text-green-900 border-green-500 font-bold"
  },
  "tre-han": { 
    label: "Trễ hạn", 
    color: "#7f1d1d", 
    antdColor: "error",
    badgeClass: "bg-rose-100 text-rose-950 border-rose-500 font-bold"
  },
};

export const UU_TIEN_CONFIG: Record<string, { label: string; color: string; badgeClass: string }> = {
  cao: { label: "Cao", color: "#991b1b", badgeClass: "bg-red-100 text-red-900 border-red-400 font-bold" },
  "trung-binh": { label: "Trung bình", color: "#854d0e", badgeClass: "bg-yellow-100 text-yellow-950 border-yellow-400 font-bold" },
  thap: { label: "Thấp", color: "#166534", badgeClass: "bg-green-100 text-green-900 border-green-400 font-bold" },
};

export const PHUONG_AN_CONFIG: Record<string, string> = {
  "tiep-tuc": "✅ Tiếp tục sử dụng",
  "chuan-hoa": "🔧 Chuẩn hóa, kết nối",
  "nang-cap": "⬆️ Nâng cấp, mở rộng",
  "hop-nhat": "🔀 Hợp nhất, tổ chức lại",
  "thay-the": "❌ Thay thế",
  "tich-hop": "🔗 Tích hợp",
  "bo-sung": "➕ Bổ sung mới",
};
