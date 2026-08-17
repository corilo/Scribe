/* Scribe — inline formatting engine ------------------------------------
   execCommand('fontSize'/'fontName') styles only the run under the caret,
   loses the selection when a toolbar <select> takes focus, and leaves nested
   <font> tags that override each other — which is why size/font changes used
   to apply to a single word only. This applies the style to every text node in
   the selection instead, so a command always covers the whole range. */
(function () {
  'use strict';
  const editor = document.getElementById('editor');

  /* Legacy <font size="1..7"> → px, so documents saved earlier keep their look */
  const FONT_PX = { 1: '10px', 2: '13px', 3: '16px', 4: '18px', 5: '24px', 6: '32px', 7: '48px' };
  const INLINE_TAGS = ['SPAN', 'FONT', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SMALL', 'BIG', 'MARK'];

  function inEditor(n) { return !!n && (n === editor || editor.contains(n)); }

  /* ---------------- selection memory ----------------
     Toolbar controls steal focus; the last range that lived inside the editor
     is remembered so a command always knows what it should act on. */
  let saved = null;
  let pending = null;   // style chosen while the caret was collapsed

  function liveRange() {
    const s = window.getSelection();
    if (s && s.rangeCount) {
      const r = s.getRangeAt(0);
      if (inEditor(r.commonAncestorContainer)) return r;
    }
    return null;
  }
  function targetRange() {
    const r = liveRange();
    if (r) return r;
    return saved && inEditor(saved.commonAncestorContainer) ? saved : null;
  }
  function selectRange(r) {
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    saved = r.cloneRange();
  }
  document.addEventListener('selectionchange', () => {
    const r = liveRange();
    if (!r) return;
    saved = r.cloneRange();
    // caret moved away from where a style was queued → forget it
    if (pending && (r.startContainer !== pending.node || r.startOffset !== pending.offset))
      pending = null;
  });

  /* ---------------- style helpers ---------------- */
  function setStyles(el, styles) {
    for (const k in styles) el.style[k] = styles[k];
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }
  function unwrap(el) {
    const p = el.parentNode;
    if (!p) return;
    while (el.firstChild) p.insertBefore(el.firstChild, el);
    p.removeChild(el);
  }

  /* <font face size color> → <span style> (one styling model everywhere) */
  function fontToSpan(f) {
    const span = document.createElement('span');
    if (f.getAttribute('style')) span.setAttribute('style', f.getAttribute('style'));
    const face = f.getAttribute('face');
    const size = f.getAttribute('size');
    const color = f.getAttribute('color');
    if (face) span.style.fontFamily = face;
    if (color) span.style.color = color;
    if (size && FONT_PX[size]) span.style.fontSize = FONT_PX[size];
    while (f.firstChild) span.appendChild(f.firstChild);
    f.parentNode.replaceChild(span, f);
    return span;
  }
  function modernize(root) {
    (root || editor).querySelectorAll('font').forEach(fontToSpan);
  }

  /* ---------------- range → text nodes ----------------
     Boundary text nodes are split first, so every collected node lies wholly
     inside the selection. */
  function splitAndCollect(range) {
    const ec = range.endContainer, eo = range.endOffset;
    if (ec.nodeType === 3 && eo > 0 && eo < ec.nodeValue.length) ec.splitText(eo);
    const sc = range.startContainer, so = range.startOffset;
    if (sc.nodeType === 3 && so > 0 && so < sc.nodeValue.length) {
      const after = sc.splitText(so);
      range.setStart(after, 0);
    }
    const anc = range.commonAncestorContainer;
    const scope = anc.nodeType === 1 ? anc : anc.parentNode;
    if (!scope) return [];
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null);
    const probe = document.createRange();
    const out = [];
    let n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.length || !inEditor(n)) continue;
      probe.selectNodeContents(n);
      // keep the nodes that genuinely overlap the selection
      if (range.compareBoundaryPoints(Range.END_TO_START, probe) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, probe) > 0) out.push(n);
    }
    return out;
  }

  /* Style one text node: reuse the wrapper it already owns, else add a span */
  function wrapNode(node, styles) {
    let host = node.parentNode;
    if (host && host !== editor && host.nodeType === 1 && host.childNodes.length === 1 &&
        (host.tagName === 'SPAN' || host.tagName === 'FONT')) {
      if (host.tagName === 'FONT') host = fontToSpan(host);
      host.setAttribute('data-fmt', '');
      setStyles(host, styles);
      return host;
    }
    const span = document.createElement('span');
    span.setAttribute('data-fmt', '');
    setStyles(span, styles);
    node.parentNode.insertBefore(span, node);
    span.appendChild(node);
    return span;
  }

  /* Drop empty wrappers and merge identical neighbours, so repeated edits do
     not pile up spans. Text nodes are moved, never merged, so live ranges
     (the selection) survive. */
  function tidy(root) {
    const scope = root && root.nodeType === 1 && inEditor(root) ? root : editor;
    scope.querySelectorAll('span[data-fmt]').forEach(s => {
      if (!s.getAttribute('style')) unwrap(s);
    });
    scope.querySelectorAll('span[data-fmt]').forEach(s => {
      const prev = s.previousSibling;
      if (!s.parentNode || !prev || prev.nodeType !== 1) return;
      if (prev.tagName !== 'SPAN' || !prev.hasAttribute('data-fmt')) return;
      if (prev.getAttribute('style') !== s.getAttribute('style')) return;
      while (s.firstChild) prev.appendChild(s.firstChild);
      s.remove();
    });
  }

  function applyToRange(range, styles) {
    const nodes = splitAndCollect(range);
    if (!nodes.length) return false;
    const spans = nodes.map(n => wrapNode(n, styles));
    const first = spans[0], last = spans[spans.length - 1];
    const r = document.createRange();
    r.setStartBefore(first.firstChild || first);
    r.setEndAfter(last.lastChild || last);
    selectRange(r);
    const anc = range.commonAncestorContainer;
    tidy(anc.nodeType === 1 ? anc : anc.parentNode);
    return true;
  }

  /* ---------------- public commands ---------------- */

  /* Apply CSS styles to the whole selection. With a collapsed caret the style
     is queued and lands on the next character typed, like every word
     processor does. */
  function apply(styles) {
    const range = targetRange();
    if (!range) return false;
    if (range.collapsed) {
      pending = {
        node: range.startContainer,
        offset: range.startOffset,
        styles: Object.assign({}, pending && pending.styles, styles)
      };
      editor.focus();
      selectRange(range);
      return true;
    }
    const ok = applyToRange(range, styles);
    editor.focus();
    return ok;
  }

  /* Called from the editor input handler: dresses the first character typed
     after a style was queued, and leaves the caret inside that span so the
     rest of the word inherits it. */
  function applyPending() {
    if (!pending) return;
    const styles = pending.styles;
    pending = null;
    const r = liveRange();
    if (!r || !r.collapsed || r.startContainer.nodeType !== 3 || r.startOffset < 1) return;
    const one = document.createRange();
    one.setStart(r.startContainer, r.startOffset - 1);
    one.setEnd(r.startContainer, r.startOffset);
    const nodes = splitAndCollect(one);
    if (!nodes.length) return;
    const span = wrapNode(nodes[0], styles);
    const end = document.createRange();
    end.setStart(span.firstChild, span.firstChild.nodeValue.length);
    end.collapse(true);
    selectRange(end);
  }

  function fullyInside(range, el) {
    const r = document.createRange();
    r.selectNode(el);
    return range.compareBoundaryPoints(Range.START_TO_START, r) <= 0 &&
           range.compareBoundaryPoints(Range.END_TO_END, r) >= 0;
  }

  /* Strip inline formatting from the selection ("clear style") */
  function clearFormatting() {
    const range = targetRange();
    if (!range || range.collapsed) { pending = null; return false; }
    editor.focus();
    selectRange(range);
    // execCommand splits partially selected <b>/<i>/<font> correctly
    try { document.execCommand('removeFormat'); } catch (e) {}
    const r = targetRange();
    if (!r) return true;
    const nodes = splitAndCollect(r);
    const first = nodes[0], last = nodes[nodes.length - 1];
    nodes.forEach(n => {
      let el = n.parentNode;
      while (el && el !== editor && INLINE_TAGS.includes(el.tagName)) {
        const up = el.parentNode;
        if (fullyInside(r, el)) unwrap(el);   // only wrappers inside the selection
        el = up;
      }
    });
    if (first && last && first.parentNode && last.parentNode) {
      const sel = document.createRange();
      sel.setStart(first, 0);
      sel.setEnd(last, last.nodeValue.length);
      selectRange(sel);
    }
    tidy(editor);
    return true;
  }

  /* HTML for saving: page-layout margins and helper attributes stripped */
  function cleanHtml() {
    const copy = editor.cloneNode(true);
    copy.querySelectorAll('.page-start').forEach(el => {
      el.style.marginTop = '';
      el.classList.remove('page-start');
      if (!el.getAttribute('style')) el.removeAttribute('style');
      if (!el.getAttribute('class')) el.removeAttribute('class');
    });
    return copy.innerHTML;
  }

  /* Loose text at the top level cannot be paginated (it has no block to move),
     so it is folded into paragraphs after loading or pasting. */
  function normalizeBlocks() {
    const BLOCK = /^(P|DIV|H1|H2|H3|H4|H5|H6|BLOCKQUOTE|UL|OL|TABLE|PRE|HR|FIGURE)$/;
    let stray = [];
    const flush = () => {
      if (!stray.length) return;
      const p = document.createElement('p');
      p.setAttribute('dir', 'auto');
      stray[0].parentNode.insertBefore(p, stray[0]);
      stray.forEach(n => p.appendChild(n));
      stray = [];
    };
    [...editor.childNodes].forEach(n => {
      if (n.nodeType === 1 && BLOCK.test(n.tagName)) flush();
      else if (n.nodeType === 3 && !n.nodeValue.trim()) n.remove();
      else if (n.nodeType === 8) n.remove();
      else stray.push(n);
    });
    flush();
    if (!editor.firstChild) editor.innerHTML = '<p dir="auto"><br></p>';
  }

  window.Fmt = {
    apply, applyPending, clearFormatting, cleanHtml, modernize, normalizeBlocks,
    tidy, targetRange, selectRange,
    clearPending() { pending = null; }
  };
})();
