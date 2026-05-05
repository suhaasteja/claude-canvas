import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

const AnnotationContext = createContext(null);

const STORAGE_KEY = 'claude-annotator-state';

const defaultState = {
  annotations: [],
  messageTags: {},
  panelOpen: false,
  annotationMode: false,
  activeCommentAnnotationId: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

export function AnnotationProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    const { activeCommentAnnotationId, panelOpen, annotationMode, ...persist } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [state]);

  const update = (fn) => setState((s) => fn(s));

  const actions = {
    addAnnotation(messageId, startOffset, endOffset, text, color, comment = '') {
      const annotation = {
        id: uuid(),
        messageId,
        startOffset,
        endOffset,
        text,
        color,
        comment,
        createdAt: new Date().toISOString(),
      };
      update((s) => ({ ...s, annotations: [...s.annotations, annotation] }));
      return annotation.id;
    },

    updateAnnotationComment(annotationId, comment) {
      update((s) => ({
        ...s,
        annotations: s.annotations.map((a) =>
          a.id === annotationId ? { ...a, comment } : a
        ),
      }));
    },

    deleteAnnotation(annotationId) {
      update((s) => ({
        ...s,
        annotations: s.annotations.filter((a) => a.id !== annotationId),
        activeCommentAnnotationId:
          s.activeCommentAnnotationId === annotationId
            ? null
            : s.activeCommentAnnotationId,
      }));
    },

    addMessageTag(messageId, tag) {
      update((s) => ({
        ...s,
        messageTags: {
          ...s.messageTags,
          [messageId]: [...new Set([...(s.messageTags[messageId] || []), tag])],
        },
      }));
    },

    removeMessageTag(messageId, tag) {
      update((s) => ({
        ...s,
        messageTags: {
          ...s.messageTags,
          [messageId]: (s.messageTags[messageId] || []).filter((t) => t !== tag),
        },
      }));
    },

    togglePanel() {
      update((s) => ({ ...s, panelOpen: !s.panelOpen }));
    },

    toggleAnnotationMode() {
      update((s) => ({
        ...s,
        annotationMode: !s.annotationMode,
        panelOpen: !s.annotationMode ? s.panelOpen : false,
      }));
    },

    setActiveCommentAnnotationId(id) {
      update((s) => ({ ...s, activeCommentAnnotationId: id }));
    },

    clearAll() {
      update((s) => ({ ...s, annotations: [], messageTags: {} }));
    },
  };

  return (
    <AnnotationContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotation() {
  const ctx = useContext(AnnotationContext);
  if (!ctx) throw new Error('useAnnotation must be used inside AnnotationProvider');
  return ctx;
}
