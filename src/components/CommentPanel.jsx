import { useState } from 'react';
import { X, Trash2, Edit3, Check } from 'lucide-react';
import { useAnnotation } from '../context/AnnotationContext';
import { chatData } from '../data/chatData';

const HL_SOLID = {
  yellow: '#d7aa4b',
  green:  '#69b47d',
  blue:   '#5f9bd2',
  pink:   '#cd6e8c',
};

const HL_BG = {
  yellow: 'rgba(215,170,75,0.12)',
  green:  'rgba(105,180,125,0.10)',
  blue:   'rgba(95,155,210,0.10)',
  pink:   'rgba(205,110,140,0.10)',
};

export default function CommentPanel() {
  const {
    panelOpen, togglePanel,
    annotations, deleteAnnotation, updateAnnotationComment,
    clearAll,
  } = useAnnotation();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const msgIndexMap = Object.fromEntries(chatData.map((m, i) => [m.id, i]));

  const sorted = [...annotations].sort((a, b) => {
    const ia = msgIndexMap[a.messageId] ?? 0;
    const ib = msgIndexMap[b.messageId] ?? 0;
    if (ia !== ib) return ia - ib;
    return a.startOffset - b.startOffset;
  });

  function scrollToAnnotation(annotation) {
    const el = document.querySelector(`[data-message-id="${annotation.messageId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function startEdit(a) {
    setEditingId(a.id);
    setEditText(a.comment || '');
  }

  function saveEdit(id) {
    updateAnnotationComment(id, editText);
    setEditingId(null);
  }

  return (
    <div
      className="h-full flex flex-col shrink-0 transition-all duration-300"
      style={{
        width: panelOpen ? 340 : 0,
        overflow: 'hidden',
        borderLeft: panelOpen ? '1px solid rgba(255,235,200,0.07)' : 'none',
        background: '#17140f',
      }}
    >
      {panelOpen && (
        <>
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,235,200,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Annotations</span>
              {annotations.length > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: '#23201a', color: '#5a5650' }}
                >
                  {annotations.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {annotations.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={togglePanel}
                className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Annotations list */}
          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="text-text-muted text-sm">No annotations yet</div>
                <div className="text-text-muted text-xs mt-1 opacity-60">Select text in the chat to highlight or comment</div>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {sorted.map((a, idx) => {
                  const msgIndex = msgIndexMap[a.messageId];
                  const msg = chatData[msgIndex];
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl cursor-pointer hover:brightness-110 transition-all"
                      style={{
                        padding: '14px 16px',
                        marginBottom: 6,
                        background: HL_BG[a.color],
                        borderLeft: `3px solid ${HL_SOLID[a.color]}`,
                      }}
                      onClick={() => scrollToAnnotation(a)}
                    >
                      <div className="text-xs text-text-muted mb-2">
                        {msg?.role === 'user' ? 'You' : 'Claude'} · Msg {msgIndex + 1}
                      </div>
                      <div
                        className="text-xs italic line-clamp-2 mb-4"
                        style={{ color: '#d0d0d0' }}
                      >
                        "{a.text}"
                      </div>

                      {editingId === a.id ? (
                        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            className="w-full resize-none rounded-lg text-xs px-2 py-1.5 outline-none"
                            style={{ background: '#23201a', border: '1px solid #2e2b24', color: '#ebe6df', fontFamily: 'inherit' }}
                          />
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditingId(null)} className="text-xs px-2 py-0.5 text-text-muted hover:text-white">Cancel</button>
                            <button
                              onClick={() => saveEdit(a.id)}
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                              style={{ background: '#c96442', color: '#fff' }}
                            >
                              <Check size={9} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {a.comment && (
                            <div className="text-xs text-text-primary mb-4 bg-black/20 rounded-lg px-3 py-2.5">
                              {a.comment}
                            </div>
                          )}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEdit(a)}
                              className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
                            >
                              <Edit3 size={10} />
                              {a.comment ? 'Edit' : 'Add note'}
                            </button>
                            <button
                              onClick={() => deleteAnnotation(a.id)}
                              className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
