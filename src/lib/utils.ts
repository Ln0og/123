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
    color: "#722ed1",
    bgColor: "#f9f0ff",
    borderColor: "#d3adf7",
    icon: "🏗️",
  },
  2: {
    label: "Lớp 2 — Dữ liệu & Nền tảng lõi",
    shortLabel: "Dữ liệu & NTL",
    color: "#1677ff",
    bgColor: "#e6f4ff",
    borderColor: "#91caff",
    icon: "🗄️",
  },
  3: {
    label: "Lớp 3 — Ứng dụng & Nghiệp vụ",
    shortLabel: "Ứng dụng",
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
    icon: "📱",
  },
  4: {
    label: "Lớp 4 — Kênh tương tác & Đo lường",
    shortLabel: "Kênh tương tác",
    color: "#fa8c16",
    bgColor: "#fff7e6",
    borderColor: "#ffd591",
    icon: "🌐",
  },
} as const;

export const TRANG_THAI_CONFIG: Record<string, { label: string; color: string; antdColor: string }> = {
  "dang-van-hanh": { label: "Đang vận hành", color: "#52c41a", antdColor: "success" },
  "can-nang-cap": { label: "Cần nâng cấp", color: "#faad14", antdColor: "warning" },
  "can-thay-the": { label: "Cần thay thế", color: "#ff4d4f", antdColor: "error" },
  "ke-hoach": { label: "Kế hoạch", color: "#1677ff", antdColor: "processing" },
  "chua-bat-dau": { label: "Chưa bắt đầu", color: "#8c8c8c", antdColor: "default" },
  "dang-thuc-hien": { label: "Đang thực hiện", color: "#1677ff", antdColor: "processing" },
  "hoan-thanh": { label: "Hoàn thành", color: "#52c41a", antdColor: "success" },
  "tre-han": { label: "Trễ hạn", color: "#ff4d4f", antdColor: "error" },
};

export const UU_TIEN_CONFIG: Record<string, { label: string; color: string }> = {
  cao: { label: "Cao", color: "#ff4d4f" },
  "trung-binh": { label: "Trung bình", color: "#faad14" },
  thap: { label: "Thấp", color: "#52c41a" },
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
