const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function parseTranscript(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const rl = readline.createInterface({ input: fs.createReadStream(filePath, { encoding: 'utf8' }), crlfDelay: Infinity });
  const turns = [];
  let currentTurn = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        if (currentTurn) turns.push(currentTurn);
        let userContent = obj.content || '';
        const match = userContent.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        if (match) userContent = match[1].trim();
        
        currentTurn = {
          step: obj.step_index,
          createdAt: obj.created_at,
          user: userContent,
          responses: []
        };
      } else if (currentTurn) {
        if (obj.type === 'PLANNER_RESPONSE') {
          if (obj.content && obj.content.trim()) {
            currentTurn.responses.push(obj.content.trim());
          }
        }
      }
    } catch(e){}
  }
  if (currentTurn) turns.push(currentTurn);
  return turns;
}

function generateMarkdown(title, sessionName, turns) {
  let md = `# ${title}\n\n`;
  md += `> **Phiên làm việc:** ${sessionName}\n`;
  md += `> **Tổng số lượt tương tác:** ${turns.length}\n`;
  md += `> **Thời gian xuất file:** ${new Date().toLocaleString('vi-VN')}\n\n`;
  md += `---\n\n## 📑 Mục lục\n\n`;

  turns.forEach((t, i) => {
    let preview = t.user.replace(/[\r\n]+/g, ' ').substring(0, 80);
    if (t.user.length > 80) preview += '...';
    const anchor = `luot-${i + 1}`;
    md += `${i + 1}. [Lượt ${i + 1}: ${preview.replace(/[\[\]]/g, '')}](#${anchor})\n`;
  });

  md += '\n---\n\n## 💬 Chi tiết toàn bộ nội dung trò chuyện\n\n';

  turns.forEach((t, i) => {
    const anchor = `luot-${i + 1}`;
    md += `<a id="${anchor}"></a>\n\n`;
    md += `### 📍 Lượt ${i + 1} (${t.createdAt || 'N/A'})\n\n`;
    md += `**👤 Người dùng:**\n\n\`\`\`\n${t.user}\n\`\`\`\n\n`;
    md += `**🤖 Trợ lý AI:**\n\n`;
    if (t.responses.length === 0) {
      md += `*(Thực hiện các thao tác xử lý lệnh / viết code / cấu hình hệ thống)*\n\n`;
    } else {
      t.responses.forEach(r => {
        let cleanR = r.replace(/^CRITICAL INSTRUCTION \d+:.*$/gm, '').trim();
        if (cleanR) {
          md += `${cleanR}\n\n`;
        }
      });
    }
    md += `---\n\n`;
  });

  return md;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function run() {
  const currentBrainDir = path.resolve('C:/Users/Lnog/.gemini/antigravity/brain/0c724d03-995b-41e5-b753-c6096ba91ae8');
  const backupBrainDir = path.resolve(__dirname, '.gemini_brain_backup');

  console.log('Copying brain folder to backup directory...');
  copyDirRecursive(currentBrainDir, backupBrainDir);
  console.log('Brain backup copied successfully.');

  const transcriptPath = path.join(currentBrainDir, '.system_generated/logs/transcript_full.jsonl');
  let turns = await parseTranscript(transcriptPath);
  if (turns.length === 0) {
    const fallbackPath = path.join(currentBrainDir, '.system_generated/logs/transcript.jsonl');
    turns = await parseTranscript(fallbackPath);
  }

  if (turns.length > 0) {
    const md = generateMarkdown(
      'Lịch Sử Toàn Bộ Cuộc Trò Chuyện - Dự Án Kiến Trúc Số Vĩnh Long',
      'Phiên Làm Việc Chính (C:/Delta Force/kts-vinhlong)',
      turns
    );
    const outputPath = path.resolve(__dirname, 'LICH_SU_TRO_CHUYEN.md');
    fs.writeFileSync(outputPath, md, 'utf8');
    console.log(`Saved LICH_SU_TRO_CHUYEN.md (${turns.length} turns, ${md.length} bytes) to ${outputPath}`);
  } else {
    console.warn('No turns found in transcript.');
  }
}

run().catch(console.error);
