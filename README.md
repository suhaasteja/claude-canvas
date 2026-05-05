# Claude Canvas

> An MVP of what I wish Claude actually had.

A reimagined Claude chat interface with annotation and highlighting tools — letting you mark up AI responses the way you'd mark up a doc.

## What it does

Claude Canvas adds a layer of annotation tooling to a Claude-style chat UI:

- **Highlight text** in any message — select text, pick a color, done
- **Comment on highlights** — attach a note to any highlighted passage
- **Remove highlights** — hover a highlight, click the × to clear it
- **Tag messages** — label assistant or user messages (e.g. "important", "follow up")
- **Comment panel** — sidebar showing all highlights and comments in context
- **Annotation mode** — toggle annotations on/off without cluttering the default view

## Why

Claude is great at generating responses. But once the text is on screen, there's no way to interact with it beyond copying it out. No way to mark what's relevant, flag what's wrong, or attach a thought to a specific passage.

This is a prototype exploring what that could look like natively in the interface.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Lucide icons

## Running locally

```bash
npm install
npm run dev
```

## Structure

```
src/
  components/
    ChatView.jsx           # main chat layout
    Message.jsx            # message rendering + highlight marks
    AnnotationToolbar.jsx  # color picker popup on text selection
    CommentPanel.jsx       # sidebar with all annotations
    Sidebar.jsx            # app sidebar
    TagBadge.jsx           # message tag labels
  context/
    AnnotationContext.jsx  # highlight/comment state
  hooks/
    useTextSelection.js    # selection detection + offset tracking
  utils/
    segmentText.js         # splits text into annotated/plain segments
```
