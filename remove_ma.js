const fs = require('fs');
const files = [
  'src/app/(portal)/kts/hien-trang/page.tsx',
  'src/app/(portal)/kts/lo-trinh/page.tsx',
  'src/app/(portal)/kts/so-do/page.tsx',
  'src/app/admin/he-thong/page.tsx',
  'src/app/admin/nhiem-vu/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Hien Trang / Lo Trinh table Mã column
  code = code.replace(/\{\s*title:\s*\"Mã\",\s*dataIndex:\s*\"ma\"[\s\S]*?\},/g, '');
  
  // HeThongCard ma tag in hien-trang
  code = code.replace(/<span className=\"font-mono[^>]*>\s*\{item\.ma\}\s*<\/span>/g, '');
  
  // Modal tag in hien-trang
  code = code.replace(/<span className=\"font-mono[^>]*>\s*\{selectedItem\.ma\}\s*<\/span>/g, '');
  
  // heThongSos tag in lo-trinh
  code = code.replace(/<Tag className=\"m-0 font-mono[^>]*>\s*\{ht\.ma\}\s*<\/Tag>/g, '<Tag className="m-0 text-[10px] bg-blue-50 text-blue-600 border-blue-200">{ht.ten}</Tag>');
  
  // heThongSos fallback if not font-mono
  code = code.replace(/<Tag className=\"m-0 text-\[10px\] bg-blue-50[^>]*>\s*\{ht\.ma\}\s*<\/Tag>/g, '<Tag className="m-0 text-[10px] bg-blue-50 text-blue-600 border-blue-200">{ht.ten}</Tag>');
  
  // NV tag in so-do
  code = code.replace(/<span className=\"font-mono[^>]*>\s*\{nv\.ma\}\s*<\/span>/g, '');
  
  // HT tag in so-do
  code = code.replace(/<span className=\"font-mono[^>]*>\s*\{ht\.ma\}\s*<\/span>/g, '');

  fs.writeFileSync(f, code);
  console.log('Updated ' + f);
});
