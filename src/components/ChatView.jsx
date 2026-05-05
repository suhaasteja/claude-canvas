import { useRef, useCallback } from 'react';
import { Highlighter, PanelRight, Download, X } from 'lucide-react';
import { useAnnotation } from '../context/AnnotationContext';
import { useTextSelection } from '../hooks/useTextSelection';
import { chatData } from '../data/chatData';
import Message from './Message';
import AnnotationToolbar from './AnnotationToolbar';
import { generateExportHTML } from '../utils/exportTemplate';

export default function ChatView() {
  const {
    annotationMode, toggleAnnotationMode,
    panelOpen, togglePanel,
    annotations, messageTags, addAnnotation,
  } = useAnnotation();

  const containerRef = useRef(null);
  const [selection, setSelection] = useTextSelection(containerRef, annotationMode);

  const handleCommit = useCallback((color, comment) => {
    if (!selection) return;
    addAnnotation(
      selection.messageId,
      selection.startOffset,
      selection.endOffset,
      selection.text,
      color,
      comment || ''
    );
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, [selection, addAnnotation, setSelection]);

  function handleExport() {
    const html = generateExportHTML(chatData, annotations, messageTags);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#1d1a15' }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,235,200,0.07)', padding: '10px 24px' }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-text-primary">
            Distributed Rate Limiting Design
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#23201a', color: '#7a7570' }}>
            Claude Opus 4
          </span>
        </div>
        <div className="flex items-center gap-3">
          {annotationMode && annotations.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#23201a', color: '#ebe6df', border: '1px solid #3a3730' }}
            >
              <Download size={13} />
              Export Q&A
            </button>
          )}
          {annotationMode && (
            <button
              onClick={togglePanel}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors"
              style={{
                background: panelOpen ? '#c8673e' : '#23201a',
                color: panelOpen ? '#fff' : '#ebe6df',
                border: '1px solid #3a3730',
              }}
            >
              <PanelRight size={13} />
              {annotations.length > 0 ? `Comments (${annotations.length})` : 'Comments'}
            </button>
          )}
          <button
            onClick={toggleAnnotationMode}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-all"
            style={{
              background: annotationMode ? 'rgba(200,103,62,0.15)' : '#23201a',
              color: annotationMode ? '#c8673e' : '#ebe6df',
              border: annotationMode ? '1px solid rgba(200,103,62,0.4)' : '1px solid #3a3730',
            }}
          >
            {annotationMode ? <X size={13} /> : <Highlighter size={13} />}
            {annotationMode ? 'Exit Annotate' : 'Annotate'}
          </button>
        </div>
      </div>

      {/* Annotation mode hint */}
      {annotationMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 24px',
            fontSize: 12,
            color: '#c8673e',
            background: 'rgba(200,103,62,0.08)',
            borderBottom: '1px solid rgba(200,103,62,0.14)',
            flexShrink: 0,
          }}
        >
          Select any text to highlight · Click highlighted text to toggle comment · Add tags to individual messages
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-8" ref={containerRef}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          {chatData.map((message) => (
            <Message
              key={message.id}
              message={message}
              annotations={annotations.filter((a) => a.messageId === message.id)}
              annotationMode={annotationMode}
            />
          ))}
          <div style={{ height: 80 }} />
        </div>
      </div>

      <AnnotationToolbar
        selection={selection}
        onCommit={handleCommit}
        onDismiss={() => { setSelection(null); window.getSelection()?.removeAllRanges(); }}
      />
    </div>
  );
}
