"use client";
import { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Card, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { HeThongSoData, DonViData } from "@/types";
import { LOP_CONFIG, TRANG_THAI_CONFIG } from "@/lib/utils";

const { TextArea, Search } = Input;

export default function AdminHeThongPage() {
  const [data, setData] = useState<HeThongSoData[]>([]);
  const [donVis, setDonVis] = useState<DonViData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeThongSoData | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLop, setFilterLop] = useState<number | null>(null);

  const fetchHeThong = () => {
    Promise.all([
      fetch("/api/he-thong").then(r => r.json()),
      fetch("/api/don-vi").then(r => r.json()),
    ]).then(([ht, dv]) => {
      setData(ht);
      setDonVis(dv);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHeThong();
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
        const matchChuQuan = item.chuQuan?.toLowerCase().includes(q);
        if (!matchMa && !matchTen && !matchMoTa && !matchChuQuan) return false;
      }
      return true;
    });
  }, [data, filterLop, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: HeThongSoData) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const url = editing ? `/api/he-thong/${editing.id}` : "/api/he-thong";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success(editing ? "Đã cập nhật!" : "Đã thêm mới!");
        setModalOpen(false);
        fetchHeThong();
      } else {
        message.error("Lỗi khi lưu!");
      }
    } catch {
      // validation error
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/he-thong/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("Đã xóa!"); fetchHeThong(); }
    else message.error("Lỗi khi xóa!");
  };

  const columns: ColumnsType<HeThongSoData> = [
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
      title: "Tên hệ thống",
      dataIndex: "ten",
      render: (ten, rec) => (
        <div>
          <div className="font-medium text-gray-900">{ten}</div>
          {rec.moTa && <div className="text-xs text-gray-400 line-clamp-1 max-w-md">{rec.moTa}</div>}
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      width: 120,
      filters: [1, 2, 3, 4].map(l => ({ text: LOP_CONFIG[l as 1 | 2 | 3 | 4].shortLabel, value: l })),
      onFilter: (v, r) => r.lop === v,
      render: lop => {
        const cfg = LOP_CONFIG[lop as 1 | 2 | 3 | 4];
        return <Tag style={{ color: cfg.color, backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}>{cfg.icon} L{lop}</Tag>;
      },
    },
    { title: "Chủ quản", dataIndex: "chuQuan", width: 140 },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 140,
      render: ts => {
        const cfg = TRANG_THAI_CONFIG[ts];
        return cfg ? <Tag color={cfg.antdColor}>{cfg.label}</Tag> : <Tag>{ts}</Tag>;
      },
    },
    {
      title: "Thao tác",
      width: 100,
      align: "center",
      render: (_, rec) => (
        <div className="flex justify-center gap-2">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} />
          <Popconfirm title="Xóa hệ thống này?" onConfirm={() => handleDelete(rec.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
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
          <h1 className="text-xl font-bold text-gray-800">Quản lý Hệ thống Số</h1>
          <p className="text-gray-400 text-sm">Danh mục các hệ thống số theo 4 lớp kiến trúc</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ backgroundColor: "#003087" }}>
          Thêm hệ thống
        </Button>
      </div>

      <Card className="shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Search
              placeholder="Tìm theo mã, tên, mô tả, chủ quản..."
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
            Hiển thị <span className="font-bold text-blue-600">{filteredData.length}</span> / {data.length} hệ thống
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editing ? "Sửa thông tin hệ thống" : "Thêm hệ thống mới"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        width={640}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Mã" name="ma" rules={[{ required: true }]}>
              <Input placeholder="HT-01" />
            </Form.Item>
            <Form.Item label="Lớp kiến trúc" name="lop" rules={[{ required: true }]}>
              <Select>
                {[1,2,3,4].map(l => <Select.Option key={l} value={l}>{LOP_CONFIG[l as 1|2|3|4].icon} Lớp {l} — {LOP_CONFIG[l as 1|2|3|4].shortLabel}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="Tên hệ thống" name="ten" rules={[{ required: true }]}>
            <Input placeholder="Tên đầy đủ của hệ thống" />
          </Form.Item>
          <Form.Item label="Mô tả" name="moTa">
            <TextArea rows={3} placeholder="Mô tả ngắn gọn về hệ thống, phạm vi, chức năng..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Loại" name="loai" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ha-tang">Hạ tầng số</Select.Option>
                <Select.Option value="du-lieu">Dữ liệu & NTL</Select.Option>
                <Select.Option value="ung-dung">Ứng dụng & NV</Select.Option>
                <Select.Option value="kenh-tuong-tac">Kênh tương tác</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Trạng thái" name="trangThai">
              <Select>
                <Select.Option value="dang-van-hanh">Đang vận hành</Select.Option>
                <Select.Option value="can-nang-cap">Cần nâng cấp</Select.Option>
                <Select.Option value="can-thay-the">Cần thay thế</Select.Option>
                <Select.Option value="ke-hoach">Kế hoạch</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Chủ quản" name="chuQuan">
              <Input placeholder="Sở TT&TT" />
            </Form.Item>
            <Form.Item label="Năm triển khai" name="namTrienKhai">
              <Input type="number" placeholder="2023" />
            </Form.Item>
          </div>
          <Form.Item label="Đơn vị" name="donViId">
            <Select allowClear placeholder="Chọn đơn vị quản lý">
              {donVis.map(dv => <Select.Option key={dv.id} value={dv.id}>{dv.ten}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
