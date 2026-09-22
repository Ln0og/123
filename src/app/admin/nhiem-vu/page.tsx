"use client";
import { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tag, message, Popconfirm, Card, Progress, Slider } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, SearchOutlined, BankOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { NhiemVuData, DonViData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG, UU_TIEN_CONFIG, PHUONG_AN_CONFIG, formatDate, isOverdue } from "@/lib/utils";
import dayjs from "dayjs";

const { TextArea, Search } = Input;

export default function AdminNhiemVuPage() {
  const [data, setData] = useState<NhiemVuData[]>([]);
  const [donVis, setDonVis] = useState<DonViData[]>([]);
  const [heThongSos, setHeThongSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NhiemVuData | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLop, setFilterLop] = useState<number | null>(null);

  const fetchNhiemVu = () => {
    Promise.all([
      fetch("/api/nhiem-vu").then(r => r.json()),
      fetch("/api/don-vi").then(r => r.json()),
      fetch("/api/he-thong").then(r => r.json()),
    ]).then(([nv, dv, hts]) => {
      setData(nv);
      setDonVis(dv);
      setHeThongSos(hts);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNhiemVu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterLop && item.lop !== filterLop) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMa = item.ma?.toLowerCase().includes(q);
        const matchTen = item.ten?.toLowerCase().includes(q);
        const matchMoTa = item.moTa?.toLowerCase().includes(q);
        const matchDonVi = item.donViChuTri?.ten?.toLowerCase().includes(q);
        if (!matchMa && !matchTen && !matchMoTa && !matchDonVi) return false;
      }
      return true;
    });
  }, [data, filterLop, searchQuery]);

  const openEdit = (record: NhiemVuData) => {
    setEditing(record);
    form.setFieldsValue({ 
      ...record, 
      thoiHan: record.thoiHan ? dayjs(record.thoiHan) : null,
      heThongSoIds: record.heThongSos?.map(h => h.id) || []
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ trangThai: "chua-bat-dau", uuTien: "trung-binh", tienDo: 0, lop: 2 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values, thoiHan: values.thoiHan ? values.thoiHan.toISOString() : null };
      const url = editing ? `/api/nhiem-vu/${editing.id}` : "/api/nhiem-vu";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        message.success(editing ? "Đã cập nhật!" : "Đã thêm!");
        setModalOpen(false);
        fetchNhiemVu();
      } else {
        message.error("Lỗi khi lưu!");
      }
    } catch {
      // validation error
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/nhiem-vu/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("Đã xóa!"); fetchNhiemVu(); }
    else message.error("Lỗi khi xóa!");
  };

  const columns: ColumnsType<NhiemVuData> = [
    {
      title: "Mã",
      dataIndex: "ma",
      width: 90,
      render: (ma: string) => (
        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          {ma}
        </span>
      ),
    },
    {
      title: "Nhiệm vụ & Mục tiêu",
      dataIndex: "ten",
      render: (ten, rec) => (
        <div>
          <div className="font-semibold text-gray-900">{ten}</div>
          {rec.phuongAnXuLy && <div className="text-xs text-blue-600 mt-0.5">{PHUONG_AN_CONFIG[rec.phuongAnXuLy]}</div>}
          {rec.heThongSos && rec.heThongSos.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              <span className="text-[10px] text-gray-400">Tác động:</span>
              {rec.heThongSos.map(h => (
                <Tag key={h.id} className="m-0 text-[10px] bg-slate-50 text-slate-600 border-slate-200">{h.ma}</Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 100,
      render: lop => {
        const cfg = LOP_CONFIG[lop as 1 | 2 | 3 | 4];
        return <Tag style={{ color: cfg.color, backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}>{cfg.icon} L{lop}</Tag>;
      },
    },
    {
      title: "Chủ trì",
      dataIndex: ["donViChuTri", "ten"],
      width: 160,
      render: (_, rec) => (
        <div className="text-xs text-gray-700 flex items-center gap-1">
          <BankOutlined className="text-gray-400 shrink-0" />
          <span className="truncate">{rec.donViChuTri?.ten || "UBND tỉnh"}</span>
        </div>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "uuTien",
      width: 110,
      render: uuTien => (
        <Tag color={uuTien === "cao" ? "red" : uuTien === "trung-binh" ? "orange" : "green"}>
          {UU_TIEN_CONFIG[uuTien]?.label || uuTien}
        </Tag>
      ),
    },
    {
      title: "Thời hạn",
      dataIndex: "thoiHan",
      width: 120,
      render: (d, rec) => {
        const overdue = isOverdue(d) && rec.trangThai !== "hoan-thanh";
        return (
          <span className={overdue ? "text-red-500 font-semibold text-xs" : "text-gray-600 text-xs"}>
            {overdue && <WarningOutlined className="mr-1" />}
            {formatDate(d)}
          </span>
        );
      },
    },
    {
      title: "Tiến độ",
      dataIndex: "tienDo",
      width: 140,
      render: (p, rec) => (
        <div>
          <Progress
            percent={p}
            size="small"
            status={rec.trangThai === "hoan-thanh" ? "success" : isOverdue(rec.thoiHan) && rec.trangThai !== "hoan-thanh" ? "exception" : "active"}
          />
          <div className="text-[11px] text-gray-400 mt-0.5">{TRANG_THAI_CONFIG[rec.trangThai]?.label}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      width: 90,
      align: "center",
      render: (_, rec) => (
        <div className="flex justify-center gap-1">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} />
          <Popconfirm title="Xóa nhiệm vụ này?" onConfirm={() => handleDelete(rec.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nhiệm vụ & Lộ trình</h1>
          <p className="text-gray-400 text-sm">Quản lý các nhiệm vụ chuyển đổi kiến trúc số (tương ứng bảng HOANTHIEN_NV trong Mẫu 03)</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ backgroundColor: "#003087" }}>
          Thêm nhiệm vụ
        </Button>
      </div>

      <Card className="shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Search
              placeholder="Tìm theo mã, tên nhiệm vụ, đơn vị..."
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Tất cả các lớp"
              allowClear
              value={filterLop}
              onChange={(val) => setFilterLop(val)}
              style={{ width: 160 }}
            >
              {[1, 2, 3, 4].map(l => (
                <Select.Option key={l} value={l}>
                  {LOP_CONFIG[l as 1 | 2 | 3 | 4].icon} Lớp {l}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Hiển thị <span className="font-bold text-blue-600">{filteredData.length}</span> / {data.length} nhiệm vụ
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20 }}
          rowClassName={r => isOverdue(r.thoiHan) && r.trangThai !== "hoan-thanh" ? "bg-red-50/40" : r.trangThai === "hoan-thanh" ? "bg-green-50/40" : ""}
        />
      </Card>

      <Modal title={editing ? "Sửa nhiệm vụ" : "Thêm nhiệm vụ mới"} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} confirmLoading={saving} okText={editing ? "Cập nhật" : "Thêm mới"} width={720}>
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="Mã" name="ma" rules={[{ required: true }]}><Input placeholder="NV-01" /></Form.Item>
            <Form.Item label="Lớp" name="lop" rules={[{ required: true }]}>
              <Select>{[1,2,3,4].map(l => <Select.Option key={l} value={l}>{LOP_CONFIG[l as 1|2|3|4].icon} Lớp {l}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item label="Ưu tiên" name="uuTien"><Select><Select.Option value="cao">🔴 Cao</Select.Option><Select.Option value="trung-binh">🟡 Trung bình</Select.Option><Select.Option value="thap">🟢 Thấp</Select.Option></Select></Form.Item>
          </div>
          <Form.Item label="Tên nhiệm vụ" name="ten" rules={[{ required: true }]}><Input /></Form.Item>
          
          <Form.Item label="Hệ thống số chịu tác động (Liên kết với Hiện trạng)" name="heThongSoIds">
            <Select mode="multiple" allowClear placeholder="Chọn các hệ thống bị tác động bởi nhiệm vụ này" optionFilterProp="children">
              {heThongSos.map(ht => <Select.Option key={ht.id} value={ht.id}>[{ht.ma}] {ht.ten}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item label="Mô tả" name="moTa"><TextArea rows={3} /></Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Đơn vị chủ trì" name="donViChuTriId">
              <Select allowClear placeholder="Chọn đơn vị">
                {donVis.map(dv => <Select.Option key={dv.id} value={dv.id}>{dv.ten}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Thời hạn hoàn thành" name="thoiHan"><DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" /></Form.Item>
            <Form.Item label="Giai đoạn" name="giaiDoan"><Input placeholder="2026-2027" /></Form.Item>
            <Form.Item label="Trạng thái" name="trangThai">
              <Select>
                <Select.Option value="chua-bat-dau">Chưa bắt đầu</Select.Option>
                <Select.Option value="dang-thuc-hien">Đang thực hiện</Select.Option>
                <Select.Option value="hoan-thanh">Hoàn thành</Select.Option>
                <Select.Option value="tre-han">Trễ hạn</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="Phương án xử lý" name="phuongAnXuLy">
            <Select allowClear placeholder="Chọn phương án">
              {Object.entries(PHUONG_AN_CONFIG).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="KPI / Tiêu chí kiểm chứng" name="kpi"><TextArea rows={2} /></Form.Item>
          <Form.Item label={`Tiến độ thực hiện`} name="tienDo">
            <Slider marks={{ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" }} />
          </Form.Item>
          <Form.Item label="Ghi chú" name="ghiChu"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
