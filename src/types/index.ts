export interface KhungKTSData {
  id: string;
  tenKhung: string;
  phienBan: string;
  ngayBanHanh: string | null;
  giaiDoanApDung: string | null;
  mucTieu: string | null;
  boiCanh: string | null;
  nguyenTac: string | null;
  daiDienPhuTrach: string | null;
  trangThai: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonViData {
  id: string;
  ten: string;
  loai: string;
  parentId: string | null;
  children?: DonViData[];
}

export interface HeThongSoData {
  id: string;
  ma: string;
  ten: string;
  loai: string;
  lop: number;
  moTa: string | null;
  chuQuan: string | null;
  trangThai: string;
  namTrienKhai: number | null;
  donViId: string | null;
  donVi?: DonViData;
  createdAt: string;
  updatedAt: string;
}

export interface NhiemVuData {
  id: string;
  ma: string;
  ten: string;
  moTa: string | null;
  donViChuTriId: string | null;
  donViChuTri?: DonViData;
  uuTien: string;
  thoiHan: string | null;
  giaiDoan: string | null;
  kpi: string | null;
  nguonKiemChung: string | null;
  trangThai: string;
  tienDo: number;
  lop: number;
  phuongAnXuLy: string | null;
  ghiChu: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  tongNhiemVu: number;
  hoanThanh: number;
  dangThucHien: number;
  chuaBatDau: number;
  treHan: number;
  tongHeThong: number;
  dangVanHanh: number;
  canNangCap: number;
  phanTramHoanThanh: number;
  nhiemVuTheoLop: {
    lop: number;
    total: number;
    hoanThanh: number;
  }[];
  nhiemVuSapHanOrTreHan: NhiemVuData[];
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  donViId?: string;
  donViTen?: string;
}
