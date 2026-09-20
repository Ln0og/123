"use client";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tag, message, Popconfirm, Card, Progress, Slider } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { NhiemVuData, DonViData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG, UU_TIEN_CONFIG, PHUONG_AN_CONFIG, formatDate, isOverdue } from "@/lib/utils";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function AdminNhiemVuPage() {
  const [data, setData] = useState<NhiemVuData[]>([]);
  const [donVis, setDonVis] = useState<DonViData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NhiemVuData | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchNhiemVu = () => {
    Promise.all([
      fetch("/api/nhiem-vu").then(r => r.json()),
      fetch("/api/don-vi").then(r => r.json()),
    ]).then(([nv, dv]) => {
      setData(nv);
      setDonVis(dv);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNhiemVu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (record: NhiemVuData) => {
    setEditing(record);
    form.setFieldsValue({ ...record, thoiHan: record.thoiHan ? dayjs(record.thoiHan) : null });
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
      if (res.ok) { message.success(editing ? "Đã cập nhật!" : "Đã thêm!"); setModalOpen(false);        fetchNhiemVu();
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
    { title: "Mã", dataIndex: "ma", width: 80, render: ma => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ma}</span> },
    { title: "Nhiệm vụ", dataIndex: "ten", render: (ten, rec) => (
      <div>
        <div className="font-medium text-gray-800">{ten}</div>
        {rec.phuongAnXuLy && <div className="text-xs text-blue-500">{PHUONG_AN_CONFIG[rec.phuongAnXuLy]}</div>}
      </div>
    )},
    { title: "Lớp", dataIndex: "lop", width: 100, render: lop => {
      const cfg = LOP_CONFIG[lop as 1|2|3|4];
      return <Tag style={{ color: cfg.color, backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}>{cfg.icon} L{lop}</Tag>;
    }},
    { title: "Ưu tiên", dataIndex: "uuTien", width: 90, render: uuTien => (
      <Tag color={uuTien === "cao" ? "red" : uuTien === "trung-binh" ? "orange" : "green"}>
        {UU_TIEN_CONFIG[uuTien]?.label || uuTien}
      </Tag>
    )},
    { title: "Thời hạn", dataIndex: "thoiHan", width: 110, render: (d, rec) => {
      const overdue = isOverdue(d) && rec.trangThai !== "hoan-thanh";
      return <span className={overdue ? "text-red-500 font-semibold" : "text-gray-600"}>
        {overdue && <WarningOutlined className="mr-1" />}{formatDate(d)}
      </span>;
    }},
    { title: "Tiến độ", dataIndex: "tienDo", width: 150, render: (p, rec) => (
      <div>
        <Progress percent={p} size="small" status={rec.trangThai === "hoan-thanh" ? "success" : isOverdue(rec.thoiHan) && rec.trangThai !== "hoan-thanh" ? "exception" : "active"} />
        <div className="text-xs text-gray-400">{TRANG_THAI_CONFIG[rec.trangThai]?.label}</div>
      </div>
    )},
    { title: "Thao tác", width: 90, render: (_, rec) => (
      <div className="flex gap-1">
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} />
        <Popconfirm title="Xóa nhiệm vụ này?" onConfirm={() => handleDelete(rec.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nhiệm vụ & Lộ trình</h1>
          <p className="text-gray-400 text-sm">Quản lý các nhiệm vụ chuyển đổi kiến trúc số (tương ứng bảng HOANTHIEN_NV trong Mẫu 03)</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ backgroundColor: "#003087" }}>
          Thêm nhiệm vụ
        </Button>
      </div>
      <Card className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 20 }}
          rowClassName={r => isOverdue(r.thoiHan) && r.trangThai !== "hoan-thanh" ? "bg-red-50" : r.trangThai === "hoan-thanh" ? "bg-green-50" : ""} />
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
