import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

const COLORS = [
  { id: 'yellow', bg: 'rgba(215,170,75,0.28)',  solid: '#d7aa4b', label: 'Amber' },
  { id: 'green',  bg: 'rgba(105,180,125,0.22)', solid: '#69b47d', label: 'Sage'  },
  { id: 'blue',   bg: 'rgba(95,155,210,0.22)',  solid: '#5f9bd2', label: 'Blue'  },
  { id: 'pink',   bg: 'rgba(205,110,140,0.22)', solid: '#cd6e8c', label: 'Rose'  },
];

export default function AnnotationToolbar({ selection, onCommit, onDismiss }) {
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!selection) {
      setCommenting(false);
      setComment('');
      setSelectedColor('yellow');
    }
  }, [selection]);

  useEffect(() => {
    if (commenting) textareaRef.current?.focus();
  }, [commenting]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onDismiss();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDismiss]);

  if (!selection) return null;

  const { rect } = selection;
  const top = rect.top + window.scrollY - 56;
  const centerX = rect.left + rect.width / 2;
  const toolbarWidth = commenting ? 320 : 280;
  const left = Math.max(8, Math.min(centerX - toolbarWidth / 2, window.innerWidth - toolbarWidth - 8));

  function handleColorClick(colorId) {
    setSelectedColor(colorId);
    if (!commenting) {
      onCommit(colorId, '');
    }
  }

  function handleAddComment() {
    setCommenting(true);
  }

  function handleConfirm() {
    onCommit(selectedColor, comment);
  }

  return createPortal(
    <div
      className="fixed z-50"
      style={{ top, left }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#201d18', border: '1px solid #3a3730', width: toolbarWidth }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
          {COLORS.map((c) => (
            <button
              key={c.id}
              title={c.label}
              onClick={() => handleColorClick(c.id)}
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: c.solid, padding: 0,
                boxShadow: selectedColor === c.id ? `0 0 0 2px #fff` : 'none',
                transform: selectedColor === c.id ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
            />
          ))}
          <div style={{ width: 1, height: 16, background: '#3a3a3a', margin: '0 4px', flexShrink: 0 }} />
          <button
            onClick={handleAddComment}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 10px', borderRadius: 8, color: '#7a7570', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.07)'; e.currentTarget.style.color = '#ebe6df'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a7570'; }}
          >
            <MessageSquare size={13} />
            Comment
          </button>
          <button
            onClick={onDismiss}
            style={{ marginLeft: 'auto', padding: '4px 6px', borderRadius: 6, color: '#5a5650', background: 'transparent', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.07)'; e.currentTarget.style.color = '#ebe6df'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5650'; }}
          >
            <X size={13} />
          </button>
        </div>

        {commenting && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full resize-none rounded-lg text-xs px-3 py-2 outline-none"
              style={{
                background: '#23201a',
                border: '1px solid #2e2b24',
                color: '#ebe6df',
                fontFamily: 'inherit',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onDismiss}
                className="text-xs px-3 py-1 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition-colors"
                style={{ background: '#c8673e', color: '#fff' }}
              >
                <Check size={10} />
                Highlight
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Arrow */}
      <div
        className="absolute"
        style={{
          bottom: -5,
          left: centerX - left - 5,
          width: 10,
          height: 10,
          background: '#201d18',
          border: '1px solid #3a3730',
          transform: 'rotate(45deg)',
          borderTop: 'none',
          borderLeft: 'none',
        }}
      />
    </div>,
    document.body
  );
}
