import { X } from 'lucide-react';

const TAG_STYLES = {
  'Key Insight': { bg: 'rgba(215,170,75,0.12)',  border: 'rgba(215,170,75,0.35)',  text: '#d7aa4b' },
  'Action Item': { bg: 'rgba(95,155,210,0.12)',  border: 'rgba(95,155,210,0.35)',  text: '#5f9bd2' },
  'Question':    { bg: 'rgba(175,130,230,0.12)', border: 'rgba(175,130,230,0.35)', text: '#af82e6' },
  'Follow Up':   { bg: 'rgba(200,103,62,0.12)',  border: 'rgba(200,103,62,0.35)',  text: '#c8673e' },
};

export const ALL_TAGS = Object.keys(TAG_STYLES);

export function TagBadge({ tag, onRemove }) {
  const style = TAG_STYLES[tag] || { bg: '#333', border: '#555', text: '#aaa' };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
    >
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="opacity-60 hover:opacity-100">
          <X size={10} />
        </button>
      )}
    </span>
  );
}
