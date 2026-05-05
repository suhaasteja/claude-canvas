import { useState, useEffect } from 'react';
import { getCharOffset, findAncestorWithAttr } from '../utils/textOffsets';

export function useTextSelection(containerRef, annotationMode) {
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (!annotationMode) {
      setSelection(null);
      return;
    }

    function handleMouseUp() {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setSelection(null);
          return;
        }

        const range = sel.getRangeAt(0);
        const msgElStart = findAncestorWithAttr(range.startContainer, 'data-message-id');
        const msgElEnd = findAncestorWithAttr(range.endContainer, 'data-message-id');

        if (!msgElStart || msgElStart !== msgElEnd) {
          setSelection(null);
          return;
        }

        const messageId = msgElStart.dataset.messageId;
        const contentRoot = msgElStart.querySelector('[data-content-root]');
        if (!contentRoot) return;

        const startOffset = getCharOffset(contentRoot, range.startContainer, range.startOffset);
        const endOffset = getCharOffset(contentRoot, range.endContainer, range.endOffset);

        if (startOffset === -1 || endOffset === -1 || startOffset >= endOffset) {
          setSelection(null);
          return;
        }

        const rect = range.getBoundingClientRect();
        setSelection({
          messageId,
          startOffset,
          endOffset,
          text: sel.toString(),
          rect,
        });
      }, 10);
    }

    const container = containerRef.current;
    container?.addEventListener('mouseup', handleMouseUp);
    return () => container?.removeEventListener('mouseup', handleMouseUp);
  }, [annotationMode, containerRef]);

  return [selection, setSelection];
}
