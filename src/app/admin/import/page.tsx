"use client";
import { useState } from "react";
import { Card, Upload, Button, Table, Alert, Tag, message, Steps } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Dragger } = Upload;

interface PreviewRow {
  ma: string;
  ten: string;
  lop: number;
  trangThai: string;
  moTa?: string;
  chuQuan?: string;
}

export default function AdminImportPage() {
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; error: number } | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Thử đọc sheet DM_DOITUONG (Bảng 1 trong Mẫu 03)
        const sheetName = workbook.SheetNames.find(n => 
          n.includes("DM_DOITUONG") || n.includes("Danh muc") || n === workbook.SheetNames[0]
        ) || workbook.SheetNames[0];
        
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { header: 1 });
        
        // Parse rows (bỏ qua header)
        const parsed: PreviewRow[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as unknown as string[];
          if (!row || !row[1]) continue; // Bỏ qua dòng trống
          parsed.push({
            ma: String(row[0] || `HT-${i.toString().padStart(2, "0")}`),
            ten: String(row[1] || ""),
            lop: parseInt(String(row[2])) || 1,
            trangThai: String(row[3] || "dang-van-hanh"),
            moTa: String(row[4] || ""),
            chuQuan: String(row[5] || ""),
          });
        }
        
        setPreview(parsed);
        setStep(1);
        message.success(`Đọc được ${parsed.length} dòng từ sheet "${sheetName}"`);
      } catch {
        message.error("Lỗi đọc file XLSX. Vui lòng kiểm tra định dạng.");
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Ngăn auto upload
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0, error = 0;
    
    for (const row of preview) {
      try {
        const res = await fetch("/api/he-thong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
        if (res.ok) success++;
        else error++;
      } catch {
        error++;
      }
    }
    
    setImportResult({ success, error });
    setStep(2);
    setImporting(false);
    message.success(`Import hoàn tất: ${success} thành công, ${error} lỗi`);
  };

  const previewColumns = [
    { title: "Mã", dataIndex: "ma", width: 90, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { title: "Tên hệ thống", dataIndex: "ten" },
    { title: "Lớp", dataIndex: "lop", width: 60, render: (l: number) => <Tag color="blue">L{l}</Tag> },
    { title: "Trạng thái", dataIndex: "trangThai", width: 130 },
    { title: "Chủ quản", dataIndex: "chuQuan", width: 120 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Import XLSX Mẫu 03</h1>
        <p className="text-gray-400 text-sm">
          Import dữ liệu từ file XLSX chuẩn Mẫu 03 của Bộ KHCN (bảng DM_DOITUONG)
        </p>
      </div>

      <Steps
        current={step}
        className="mb-8"
        items={[
          { title: "Tải file XLSX", description: "Chọn file Mẫu 03" },
          { title: "Kiểm tra dữ liệu", description: "Xem trước và xác nhận" },
          { title: "Hoàn tất", description: "Import thành công" },
        ]}
      />

      {step === 0 && (
        <Card className="shadow-sm">
          <Alert
            message="Định dạng file yêu cầu"
            description={
              <div className="text-sm">
                <p>File XLSX phải có sheet <strong>DM_DOITUONG</strong> với các cột theo thứ tự:</p>
                <p className="font-mono text-xs mt-2 bg-gray-50 p-2 rounded">
                  [A] Mã | [B] Tên hệ thống | [C] Lớp (1-4) | [D] Trạng thái | [E] Mô tả | [F] Chủ quản
                </p>
              </div>
            }
            type="info"
            className="mb-4"
          />
          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={handleFile}
            showUploadList={false}
            className="py-8"
          >
            <p className="text-4xl mb-4">📊</p>
            <p className="text-lg font-medium text-gray-700">Kéo thả file XLSX vào đây</p>
            <p className="text-gray-400 mt-1">hoặc click để chọn file</p>
            <p className="text-xs text-gray-300 mt-2">Hỗ trợ: .xlsx, .xls — Mẫu 03 theo chuẩn Bộ KHCN</p>
          </Dragger>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-bold text-gray-700">Xem trước dữ liệu</span>
                <span className="ml-2 text-gray-400 text-sm">({preview.length} hệ thống sẽ được import)</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => { setStep(0); setPreview([]); }}>← Tải lại file</Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={importing}
                  onClick={handleImport}
                  style={{ backgroundColor: "#003087" }}
                >
                  Xác nhận Import {preview.length} hệ thống
                </Button>
              </div>
            </div>
            <Table
              columns={previewColumns}
              dataSource={preview}
              rowKey="ma"
              size="small"
              pagination={{ pageSize: 20 }}
              scroll={{ y: 400 }}
            />
          </Card>
        </div>
      )}

      {step === 2 && importResult && (
        <Card className="shadow-sm text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Import hoàn tất!</h2>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{importResult.success}</div>
              <div className="text-gray-400 text-sm">Thành công</div>
            </div>
            {importResult.error > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{importResult.error}</div>
                <div className="text-gray-400 text-sm">Lỗi</div>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <Button onClick={() => { setStep(0); setPreview([]); setImportResult(null); }}>Import file khác</Button>
            <Button type="primary" href="/admin/he-thong" style={{ backgroundColor: "#003087" }}>
              Xem danh sách hệ thống →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
