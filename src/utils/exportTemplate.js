import { buildSegments } from './segmentText';

const HL_CSS = {
  yellow: 'background: rgba(250,204,21,0.4); border-radius: 2px; padding: 0 1px;',
  green:  'background: rgba(74,222,128,0.35); border-radius: 2px; padding: 0 1px;',
  blue:   'background: rgba(96,165,250,0.35); border-radius: 2px; padding: 0 1px;',
  pink:   'background: rgba(244,114,182,0.35); border-radius: 2px; padding: 0 1px;',
};

const TAG_CSS = {
  'Key Insight': 'background:#facc1522;border:1px solid #facc1555;color:#b58900;',
  'Action Item': 'background:#60a5fa22;border:1px solid #60a5fa55;color:#2563eb;',
  'Question':    'background:#c084fc22;border:1px solid #c084fc55;color:#7c3aed;',
  'Follow Up':   'background:#fb923c22;border:1px solid #fb923c55;color:#ea580c;',
};

function renderTextWithHighlights(content, annotations, footnotes) {
  const lines = content.split('\n');
  let lineStart = 0;
  let result = '';

  lines.forEach((line, idx) => {
    const lineEnd = lineStart + line.length;
    const lineAnnotations = annotations
      .filter((a) => a.startOffset < lineEnd && a.endOffset > lineStart)
      .map((a) => ({
        ...a,
        startOffset: Math.max(0, a.startOffset - lineStart),
        endOffset: Math.min(line.length, a.endOffset - lineStart),
      }));

    const segments = buildSegments(line, lineAnnotations);
    segments.forEach((seg) => {
      if (seg.annotationId) {
        const ann = annotations.find((a) => a.id === seg.annotationId);
        const fnIdx = footnotes.findIndex((f) => f.id === seg.annotationId);
        const sup = fnIdx !== -1 ? `<sup style="font-size:9px;color:#888;">${fnIdx + 1}</sup>` : '';
        result += `<mark style="${HL_CSS[seg.color] || ''}">${escHtml(seg.text)}${sup}</mark>`;
      } else {
        result += escHtml(seg.text);
      }
    });

    if (idx < lines.length - 1) result += '<br>';
    lineStart = lineEnd + 1;
  });

  return result;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateExportHTML(chatData, annotations, messageTags) {
  const annByMsg = {};
  annotations.forEach((a) => {
    if (!annByMsg[a.messageId]) annByMsg[a.messageId] = [];
    annByMsg[a.messageId].push(a);
  });

  const annotatedCount = annotations.length;
  const commentCount = annotations.filter((a) => a.comment).length;
  const tagCount = Object.values(messageTags).flat().length;

  let pairs = '';
  let pairIdx = 0;
  let i = 0;

  while (i < chatData.length) {
    const msg = chatData[i];
    if (msg.role === 'user') {
      const nextMsg = chatData[i + 1];
      pairIdx++;

      const userAnns = annByMsg[msg.id] || [];
      const aiAnns = nextMsg && nextMsg.role === 'assistant' ? (annByMsg[nextMsg.id] || []) : [];
      const userTags = messageTags[msg.id] || [];
      const aiTags = nextMsg ? (messageTags[nextMsg.id] || []) : [];

      const allFootnotes = [...userAnns, ...aiAnns].filter((a) => a.comment);

      const userTagsHtml = userTags.map(t =>
        `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:2px 8px;border-radius:20px;margin-right:4px;${TAG_CSS[t] || ''}">${t}</span>`
      ).join('');

      const aiTagsHtml = aiTags.map(t =>
        `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:2px 8px;border-radius:20px;margin-right:4px;${TAG_CSS[t] || ''}">${t}</span>`
      ).join('');

      const footnotesHtml = allFootnotes.length
        ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e0e0e0;">
            ${allFootnotes.map((a, fi) =>
              `<div style="font-size:12px;color:#555;margin-bottom:4px;">
                <sup>${fi + 1}</sup> <em>"${escHtml(a.text.slice(0, 60))}${a.text.length > 60 ? '…' : ''}"</em> — ${escHtml(a.comment)}
              </div>`
            ).join('')}
           </div>`
        : '';

      pairs += `
        <div class="pair" style="page-break-inside:avoid;margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #e8e8e8;">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
            <span style="font-size:12px;font-weight:700;color:#888;letter-spacing:0.05em;min-width:28px;">Q${pairIdx}</span>
            <div>
              ${userTagsHtml ? `<div style="margin-bottom:6px;">${userTagsHtml}</div>` : ''}
              <p style="margin:0;font-size:15px;font-weight:600;color:#111;line-height:1.5;">${renderTextWithHighlights(msg.content, userAnns, allFootnotes)}</p>
            </div>
          </div>
          ${nextMsg && nextMsg.role === 'assistant' ? `
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:16px;">
            <span style="font-size:12px;font-weight:700;color:#c96442;letter-spacing:0.05em;min-width:28px;">A</span>
            <div style="flex:1;">
              ${aiTagsHtml ? `<div style="margin-bottom:6px;">${aiTagsHtml}</div>` : ''}
              <p style="margin:0;font-size:14px;color:#333;line-height:1.7;">${renderTextWithHighlights(nextMsg.content, aiAnns, allFootnotes)}</p>
              ${footnotesHtml}
            </div>
          </div>
          ` : ''}
        </div>
      `;

      i += nextMsg && nextMsg.role === 'assistant' ? 2 : 1;
    } else {
      i++;
    }
  }

  const now = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Claude Chat Export</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 780px; margin: 0 auto; padding: 40px 24px 80px; color: #222; background: #fff; }
  .no-print { }
  @media print {
    .no-print { display: none !important; }
    .pair { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="no-print" style="position:fixed;top:16px;right:16px;">
    <button onclick="window.print()" style="background:#c96442;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;font-family:sans-serif;">Print / Save PDF</button>
  </div>

  <div style="margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #111;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
        <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017L3.674 20H0L6.569 3.52zm4.132 9.959L8.453 7.687 6.205 13.48h4.496z" fill="#c96442"/>
      </svg>
      <h1 style="margin:0;font-size:22px;font-weight:700;font-family:sans-serif;color:#111;">Claude Chat Export</h1>
    </div>
    <div style="font-family:sans-serif;font-size:13px;color:#666;display:flex;gap:20px;flex-wrap:wrap;">
      <span>Exported: ${now}</span>
      <span>${pairIdx} Q&amp;A pairs</span>
      ${annotatedCount ? `<span>${annotatedCount} highlight${annotatedCount !== 1 ? 's' : ''}</span>` : ''}
      ${commentCount ? `<span>${commentCount} comment${commentCount !== 1 ? 's' : ''}</span>` : ''}
      ${tagCount ? `<span>${tagCount} tag${tagCount !== 1 ? 's' : ''}</span>` : ''}
    </div>
  </div>

  ${pairs}
</body>
</html>`;
}
