"use client";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, Tag } from "antd";
import { LOP_CONFIG } from "@/lib/utils";

const CustomNode = ({ data }: { data: { label: string; sub?: string; color: string; bgColor: string; icon: string } }) => (
  <div
    className="px-4 py-3 rounded-xl border-2 min-w-[180px] max-w-[220px] text-center shadow-sm"
    style={{ borderColor: data.color, backgroundColor: data.bgColor }}
  >
    <div className="text-lg mb-1">{data.icon}</div>
    <div className="font-semibold text-sm" style={{ color: data.color }}>{data.label}</div>
    {data.sub && <div className="text-xs text-gray-500 mt-1">{data.sub}</div>}
  </div>
);

const GroupNode = ({ data }: { data: { label: string; color: string; bgColor: string } }) => (
  <div
    className="rounded-2xl border-2 border-dashed px-3 py-2"
    style={{ borderColor: data.color, backgroundColor: data.bgColor + "60" }}
  >
    <div className="font-bold text-sm" style={{ color: data.color }}>{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  group: GroupNode,
};

function buildNodes(): Node[] {
  const nodes: Node[] = [];
  const layers = [
    {
      lop: 4,
      label: "LỚP 4 — KÊNH TƯƠNG TÁC & ĐO LƯỜNG",
      y: 0,
      items: [
        { id: "kt-web", label: "Cổng thông tin điện tử", icon: "🌐" },
        { id: "kt-dvctt", label: "Cổng DVCTT tỉnh", icon: "📋" },
        { id: "kt-app", label: "App Vĩnh Long Smart", icon: "📱", planned: true },
        { id: "kt-kpi", label: "Đo lường KPI/KPD", icon: "📊" },
      ],
    },
    {
      lop: 3,
      label: "LỚP 3 — ỨNG DỤNG & NGHIỆP VỤ",
      y: 180,
      items: [
        { id: "ud-qlvb", label: "Quản lý Văn bản", icon: "📄" },
        { id: "ud-his", label: "HIS Y tế", icon: "🏥" },
        { id: "ud-gd", label: "Hệ thống GD&ĐT", icon: "🎓" },
        { id: "ud-ai", label: "Trợ lý ảo tỉnh", icon: "🤖", planned: true },
      ],
    },
    {
      lop: 2,
      label: "LỚP 2 — DỮ LIỆU & NỀN TẢNG LÕI",
      y: 360,
      items: [
        { id: "dl-dancu", label: "CSDL Dân cư", icon: "👥" },
        { id: "dl-datdai", label: "CSDL Đất đai", icon: "🗺️" },
        { id: "dl-lgsp", label: "LGSP (Tích hợp & chia sẻ)", icon: "🔗" },
        { id: "dl-tddl", label: "Từ điển dữ liệu", icon: "📚", planned: true },
      ],
    },
    {
      lop: 1,
      label: "LỚP 1 — HẠ TẦNG SỐ & AN NINH MẠNG",
      y: 540,
      items: [
        { id: "ht-wan", label: "Mạng WAN tỉnh", icon: "🕸️" },
        { id: "ht-idc", label: "IDC / Cloud tỉnh", icon: "☁️" },
        { id: "ht-soc", label: "SOC An ninh mạng", icon: "🛡️" },
        { id: "ht-vpn", label: "VPN & Bảo mật", icon: "🔐" },
      ],
    },
  ];

  layers.forEach((layer) => {
    const cfg = LOP_CONFIG[layer.lop as 1 | 2 | 3 | 4];
    // Group node
    nodes.push({
      id: `group-${layer.lop}`,
      type: "group",
      position: { x: 20, y: layer.y },
      style: { width: 900, height: 140 },
      data: { label: layer.label, color: cfg.color, bgColor: cfg.bgColor },
      draggable: false,
    });

    layer.items.forEach((item, idx) => {
      nodes.push({
        id: item.id,
        type: "custom",
        position: { x: 60 + idx * 210, y: layer.y + 45 },
        data: {
          label: item.label,
          icon: item.icon,
          color: cfg.color,
          bgColor: item.planned ? "#f5f5f5" : cfg.bgColor,
          sub: item.planned ? "Kế hoạch" : undefined,
        },
        parentId: `group-${layer.lop}`,
        extent: "parent" as const,
      });
    });
  });

  return nodes;
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  // Connect layers conceptually
  const connections = [
    ["dl-lgsp", "ud-qlvb"],
    ["dl-lgsp", "ud-his"],
    ["dl-dancu", "dl-lgsp"],
    ["dl-datdai", "dl-lgsp"],
    ["ht-idc", "dl-dancu"],
    ["ht-wan", "ht-idc"],
    ["ud-qlvb", "kt-web"],
    ["ud-qlvb", "kt-dvctt"],
    ["dl-lgsp", "kt-dvctt"],
  ];

  connections.forEach(([source, target], i) => {
    edges.push({
      id: `e-${i}`,
      source,
      target,
      animated: true,
      style: { stroke: "#1677ff", strokeWidth: 1.5, opacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#1677ff" },
    });
  });

  return edges;
}

export default function MucTieuPage() {
  const nodes = buildNodes();
  const edges = buildEdges();

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Kiến trúc Số Mục tiêu</h1>
        <p className="text-blue-200 mt-1">
          Sơ đồ tổng thể kiến trúc số mục tiêu theo 4 lớp — giai đoạn 2026–2028
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {([1, 2, 3, 4] as const).map((lop) => {
          const cfg = LOP_CONFIG[lop];
          return (
            <Tag key={lop} style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor, color: cfg.color }}>
              {cfg.icon} {cfg.shortLabel}
            </Tag>
          );
        })}
        <Tag style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9", color: "#8c8c8c" }}>
          📐 Kế hoạch (chưa triển khai)
        </Tag>
      </div>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <div style={{ height: "720px", width: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.4}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background color="#e8e8e8" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      </Card>

      {/* Chú thích */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {([4, 3, 2, 1] as const).map((lop) => {
          const cfg = LOP_CONFIG[lop];
          return (
            <Card
              key={lop}
              size="small"
              style={{ borderColor: cfg.borderColor, backgroundColor: cfg.bgColor }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cfg.icon}</span>
                <span className="font-bold text-sm" style={{ color: cfg.color }}>
                  Lớp {lop}
                </span>
              </div>
              <div className="text-xs text-gray-600">{cfg.label.split("—")[1]?.trim()}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
