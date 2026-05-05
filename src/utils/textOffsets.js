export function getCharOffset(containerEl, targetNode, nodeOffset) {
  let charOffset = 0;
  let found = false;

  function walk(node) {
    if (found) return;
    if (node === targetNode) {
      charOffset += nodeOffset;
      found = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      charOffset += node.textContent.length;
    } else {
      for (const child of node.childNodes) {
        walk(child);
        if (found) return;
      }
    }
  }

  for (const child of containerEl.childNodes) {
    walk(child);
    if (found) break;
  }

  return found ? charOffset : -1;
}

export function findAncestorWithAttr(node, attr) {
  let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (current) {
    if (current.hasAttribute && current.hasAttribute(attr)) return current;
    current = current.parentElement;
  }
  return null;
}
