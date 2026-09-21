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
    let preview = t.user.replace(/[\r\n]+/g, ' ').substring(0, 70);
    if (t.user.length > 70) preview += '...';
    // sanitize anchor
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
      md += `*(Thực hiện các thao tác lệnh / viết code / cập nhật hệ thống)*\n\n`;
    } else {
      // Filter out raw system instructions if any leaked into content
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

async function run() {
  const backupPath = path.resolve('e:/KTS/123/.gemini_brain_backup/.system_generated/logs/transcript_full.jsonl');
  const backupTurns = await parseTranscript(backupPath);
  if (backupTurns.length > 0) {
    const mdBackup = generateMarkdown('Lịch Sử Toàn Bộ Cuộc Trò Chuyện - Dự Án Kiến Trúc Số', 'Phiên Làm Việc Chính (Khởi tạo & Phát triển dự án)', backupTurns);
    fs.writeFileSync('e:/KTS/123/LICH_SU_TRO_CHUYEN.md', mdBackup, 'utf8');
    fs.writeFileSync('e:/KTS/LICH_SU_TRO_CHUYEN.md', mdBackup, 'utf8');
    console.log(`Saved LICH_SU_TRO_CHUYEN.md (${backupTurns.length} turns, ${mdBackup.length} bytes)`);
  }

  const ccebbPath = 'C:/Users/ckgam/.gemini/antigravity/brain/ccebb1f9-e2cd-4027-960c-006162871fa0/.system_generated/logs/transcript_full.jsonl';
  const ccebbTurns = await parseTranscript(ccebbPath);
  if (ccebbTurns.length > 0) {
    const mdCcebb = generateMarkdown('Lịch Sử Cuộc Trò Chuyện - Phiên Kiểm Tra & Phân Quyền', 'Phiên Kiểm Tra (Dashboard & Authorize)', ccebbTurns);
    fs.writeFileSync('e:/KTS/123/LICH_SU_TRO_CHUYEN_PHU.md', mdCcebb, 'utf8');
    console.log(`Saved LICH_SU_TRO_CHUYEN_PHU.md (${ccebbTurns.length} turns, ${mdCcebb.length} bytes)`);
  }
}

run().catch(console.error);
