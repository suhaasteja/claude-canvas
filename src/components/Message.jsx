import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { buildSegments } from '../utils/segmentText';
import { TagBadge, ALL_TAGS } from './TagBadge';
import { useAnnotation } from '../context/AnnotationContext';

const HL_BG = {
  yellow: 'rgba(215,170,75,0.28)',
  green:  'rgba(105,180,125,0.22)',
  blue:   'rgba(95,155,210,0.22)',
  pink:   'rgba(205,110,140,0.22)',
};

const HL_SOLID = {
  yellow: '#d7aa4b',
  green:  '#69b47d',
  blue:   '#5f9bd2',
  pink:   '#cd6e8c',
};

// ── content parsing ──────────────────────────────────────────────────────────

const CODE_LINE_RE = /^(local |redis\.|return |if |end\b|function |KEYS\[|ARGV\[)/;

function looksLikeCode(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 3) return false;
  const hits = lines.filter(l => CODE_LINE_RE.test(l.trim())).length;
  return hits / lines.length >= 0.4;
}

function parseBlocks(content) {
  const blocks = [];
  let offset = 0;
  for (const part of content.split('\n\n')) {
    if (part.trim()) {
      blocks.push({ isCode: looksLikeCode(part), text: part, startOffset: offset });
    }
    offset += part.length + 2;
  }
  return blocks;
}

// Bold leading "Term: " patterns — e.g. "Token Bucket: ..."
const TERM_RE = /^([A-Z][a-zA-Z0-9 \-\/\(\)]{2,40}?):\s/;

function applyTermBold(text) {
  const m = text.match(TERM_RE);
  if (!m) return text;
  return (
    <>
      <strong style={{ fontWeight: 600, color: '#e2e2e2' }}>{m[1]}:</strong>{' '}
      {text.slice(m[0].length)}
    </>
  );
}

// ── component ────────────────────────────────────────────────────────────────

export default function Message({ message, annotations, annotationMode }) {
  const {
    messageTags, addMessageTag, removeMessageTag,
    setActiveCommentAnnotationId, activeCommentAnnotationId,
    deleteAnnotation,
  } = useAnnotation();
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState(null);
  const tags = messageTags[message.id] || [];
  const isUser = message.role === 'user';

  function renderSegment(seg, si, isFirstInBlock) {
    if (seg.annotationId) {
      const hasComment = annotations.find(a => a.id === seg.annotationId)?.comment;
      const isHovered = hoveredAnnotationId === seg.annotationId;
      return (
        <mark
          key={si}
          data-annotation-id={seg.annotationId}
          style={{ background: HL_SOLID[seg.color], position: 'relative' }}
          className="rounded-sm cursor-pointer"
          onMouseEnter={() => setHoveredAnnotationId(seg.annotationId)}
          onMouseLeave={() => setHoveredAnnotationId(null)}
          onClick={() => setActiveCommentAnnotationId(
            activeCommentAnnotationId === seg.annotationId ? null : seg.annotationId
          )}
        >
          {seg.text}
          {hasComment && (
            <span className="annotation-dot" style={{ background: HL_SOLID[seg.color] }} />
          )}
          {isHovered && (
            <span
              onClick={(e) => { e.stopPropagation(); deleteAnnotation(seg.annotationId); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 14, height: 14, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', color: '#fff',
                marginLeft: 3, verticalAlign: 'middle', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={9} strokeWidth={2.5} />
            </span>
          )}
        </mark>
      );
    }
    const content = (!isUser && isFirstInBlock && si === 0)
      ? applyTermBold(seg.text)
      : seg.text;
    return <span key={si}>{content}</span>;
  }

  function renderContent() {
    const blocks = parseBlocks(message.content);

    return blocks.map((block, bi) => {
      if (block.isCode) {
        return (
          <pre
            key={bi}
            style={{
              marginTop: bi > 0 ? 14 : 0,
              background: '#141210',
              border: '1px solid #2a2620',
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 12.5,
              lineHeight: 1.7,
              color: '#8aaa9e',
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code','Menlo',monospace",
              whiteSpace: 'pre',
            }}
          >
            <code>{block.text}</code>
          </pre>
        );
      }

      // Text block — render lines with annotation support
      const lines = block.text.split('\n');
      let lineStart = block.startOffset;
      const lineEls = lines.map((line, li) => {
        const lineEnd = lineStart + line.length;
        const lineAnns = annotations
          .filter(a => a.startOffset < lineEnd && a.endOffset > lineStart)
          .map(a => ({
            ...a,
            startOffset: Math.max(0, a.startOffset - lineStart),
            endOffset:   Math.min(line.length, a.endOffset - lineStart),
          }));
        const segs = buildSegments(line, lineAnns);
        const el = (
          <span key={li}>
            {segs.map((seg, si) => renderSegment(seg, si, li === 0))}
            {li < lines.length - 1 && <br />}
          </span>
        );
        lineStart = lineEnd + 1;
        return el;
      });

      return (
        <p key={bi} style={{ marginTop: bi > 0 ? 13 : 0, lineHeight: 1.7 }}>
          {lineEls}
        </p>
      );
    });
  }

  // ── user bubble ────────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end px-4 pt-3 pb-4" data-message-id={message.id}>
        <div style={{ maxWidth: '62%' }}>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5 justify-end">
              {tags.map(t => (
                <TagBadge key={t} tag={t}
                  onRemove={annotationMode ? () => removeMessageTag(message.id, t) : undefined} />
              ))}
            </div>
          )}
          <div
            style={{
              background: '#28251e',
              color: '#ebe6df',
              borderRadius: 20,
              padding: '10px 16px',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <div data-content-root>{renderContent()}</div>
          </div>
          <div style={{ fontSize: 11, color: '#4a4640', marginTop: 4, textAlign: 'right', paddingRight: 4 }}>
            {message.timestamp}
          </div>
          {annotationMode && (
            <div className="flex justify-end mt-1">
              <TagMenu messageId={message.id} existingTags={tags}
                show={showTagMenu}
                onToggle={() => setShowTagMenu(v => !v)}
                onAdd={tag => { addMessageTag(message.id, tag); setShowTagMenu(false); }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── assistant message ──────────────────────────────────────────────────────
  return (
    <div className="flex gap-3 px-4 pt-5 pb-3" data-message-id={message.id}>
      {/* Avatar */}
      <div className="shrink-0" style={{ marginTop: 2 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(200,103,62,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ClaudeStarLogo size={15} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(t => (
              <TagBadge key={t} tag={t}
                onRemove={annotationMode ? () => removeMessageTag(message.id, t) : undefined} />
            ))}
          </div>
        )}

        <div style={{ fontSize: 14, color: '#ddd8d1' }}>
          <div data-content-root>{renderContent()}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: '#4a4640' }}>{message.timestamp}</span>
          {message.model && (
            <span style={{ fontSize: 11, color: '#4a4640' }}>{message.model}</span>
          )}
          {annotationMode && (
            <TagMenu messageId={message.id} existingTags={tags}
              show={showTagMenu}
              onToggle={() => setShowTagMenu(v => !v)}
              onAdd={tag => { addMessageTag(message.id, tag); setShowTagMenu(false); }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Claude asterisk logo ──────────────────────────────────────────────────────
function ClaudeStarLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <g transform="translate(50,50)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect key={i} x="-6" y="-44" width="12" height="28" rx="6"
            fill="#c96442" transform={`rotate(${deg})`} />
        ))}
      </g>
    </svg>
  );
}

// ── tag menu ──────────────────────────────────────────────────────────────────
function TagMenu({ messageId, existingTags, show, onToggle, onAdd }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors"
        style={{ border: '1px solid #2e2b24', color: '#5a5650' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#9e9890'; e.currentTarget.style.borderColor = '#5a5650'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a5650'; e.currentTarget.style.borderColor = '#2e2b24'; }}
      >
        <Plus size={10} />
        Tag
      </button>
      {show && (
        <div
          className="absolute z-50 bottom-full mb-1 left-0 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: '#23201a', border: '1px solid #2e2b24', minWidth: 130 }}
        >
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => onAdd(tag)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left"
              style={{ color: '#ebe6df' }}
            >
              {tag}
              {existingTags.includes(tag) && <Check size={10} className="text-green-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
