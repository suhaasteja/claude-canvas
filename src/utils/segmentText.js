export function buildSegments(plainText, annotations) {
  if (!annotations || annotations.length === 0) {
    return [{ text: plainText, annotationId: null, color: null }];
  }

  const events = [];
  for (const a of annotations) {
    if (a.startOffset < a.endOffset) {
      events.push({ pos: a.startOffset, type: 'open', annotation: a });
      events.push({ pos: a.endOffset, type: 'close', annotation: a });
    }
  }

  events.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    if (a.type !== b.type) return a.type === 'close' ? -1 : 1;
    return 0;
  });

  const segments = [];
  let cursor = 0;
  const activeStack = [];

  for (const event of events) {
    if (event.pos > cursor && event.pos <= plainText.length) {
      const top = activeStack[activeStack.length - 1];
      segments.push({
        text: plainText.slice(cursor, event.pos),
        annotationId: top ? top.id : null,
        color: top ? top.color : null,
      });
      cursor = event.pos;
    }

    if (event.type === 'open') {
      activeStack.push(event.annotation);
    } else {
      const idx = activeStack.findLastIndex((a) => a.id === event.annotation.id);
      if (idx !== -1) activeStack.splice(idx, 1);
    }
  }

  if (cursor < plainText.length) {
    segments.push({ text: plainText.slice(cursor), annotationId: null, color: null });
  }

  return segments.filter((s) => s.text.length > 0);
}
