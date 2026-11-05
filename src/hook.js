// Cleans X links before they reach the clipboard. Every path fails open: if
// anything goes wrong, the page's original text is copied unchanged.
(() => {
  const clean = globalThis.__xClean;
  delete globalThis.__xClean;
  if (typeof clean !== 'function') return;

  const safeClean = (text) => {
    try {
      return clean(text);
    } catch {
      return text;
    }
  };

  // X's Share > Copy link calls this.
  const clipboardProto = globalThis.Clipboard?.prototype;
  if (clipboardProto?.writeText) {
    const originalWriteText = clipboardProto.writeText;
    clipboardProto.writeText = function writeText(...args) {
      if (typeof args[0] === 'string') args[0] = safeClean(args[0]);
      return originalWriteText.apply(this, args);
    };
  }

  function selectionHasMedia() {
    const selection = document.getSelection();
    if (!selection) return false;
    for (let i = 0; i < selection.rangeCount; i++) {
      const contents = selection.getRangeAt(i).cloneContents();
      if (contents.querySelector('img,picture,video,svg')) return true;
    }
    return false;
  }

  function selectedText() {
    const active = document.activeElement;
    if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) {
      try {
        const { selectionStart: start, selectionEnd: end, value } = active;
        if (start !== null && end !== null && start !== end) return value.slice(start, end);
      } catch {
        // Some input types do not expose a selection.
      }
    }
    // Overriding the copy would drop the media from the clipboard.
    if (selectionHasMedia()) return '';
    return String(document.getSelection() ?? '');
  }

  // Covers Ctrl+C and document.execCommand('copy') of a selection. Text the
  // page sets from its own copy listener is not seen here.
  window.addEventListener(
    'copy',
    (event) => {
      if (!event.clipboardData) return;
      try {
        const text = selectedText();
        const cleaned = safeClean(text);
        if (cleaned === text) return;
        event.clipboardData.setData('text/plain', cleaned);
        event.preventDefault();
      } catch {
        // Let the browser perform the normal copy.
      }
    },
    true,
  );
})();
