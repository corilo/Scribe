/* Scribe — page layout -------------------------------------------------
   The document stays one contenteditable (so typing, undo, selection and the
   caret keep behaving natively); pages are simulated by drawing paper sheets
   behind it and pushing any block that would straddle a boundary down onto the
   next sheet with a top margin. Nothing is inserted into the text, so the
   layout never gets in the way of editing and disappears on save. */
(function () {
  'use strict';
  const editor = document.getElementById('editor');
  const paper = document.getElementById('paper');
  const bg = document.getElementById('page-bg');

  /* px at 96 dpi */
  const SIZES = {
    a4:     { w: 794, h: 1123, label: 'A4' },
    letter: { w: 816, h: 1056, label: 'Letter' }
  };
  const GAP = 26;                 // space drawn between two sheets
  const PAD_Y = 76, PAD_X = 76;   // page margins

  let sizeKey = 'a4';
  let paged = true;
  let count = 1;
  let timer = null;
  let onChange = function () {};

  function geom() {
    const s = SIZES[sizeKey] || SIZES.a4;
    return { w: s.w, h: s.h, gap: GAP, padY: PAD_Y, contentH: s.h - 2 * PAD_Y };
  }
  function rel(el) {
    return el.getBoundingClientRect().top - editor.getBoundingClientRect().top;
  }
  function clearMarks() {
    editor.querySelectorAll('.page-start').forEach(el => {
      el.classList.remove('page-start');
      el.style.marginTop = '';
      if (!el.getAttribute('style')) el.removeAttribute('style');
      if (!el.getAttribute('class')) el.removeAttribute('class');
    });
  }

  /* Push a block so its top lands exactly on the next page's text area.
     One correction pass absorbs margin collapsing with the previous block. */
  function push(block, target) {
    block.classList.add('page-start');
    block.style.marginTop = '0px';
    const bare = rel(block);
    block.style.marginTop = (target - bare) + 'px';
    const now = rel(block);
    if (Math.abs(now - target) > 0.5)
      block.style.marginTop = (parseFloat(block.style.marginTop) + (target - now)) + 'px';
  }

  function renderSheets(n) {
    while (bg.children.length > n) bg.lastChild.remove();
    while (bg.children.length < n) {
      const s = document.createElement('div');
      s.className = 'sheet';
      bg.appendChild(s);
    }
  }

  function layout() {
    if (!paper) return;
    if (!paged) {
      clearMarks();
      editor.style.minHeight = '';
      renderSheets(0);
      count = 1;
      onChange();
      return;
    }
    const g = geom();
    const pageTop = p => p * (g.h + g.gap);
    const textTop = p => pageTop(p) + g.padY;
    const textBottom = p => pageTop(p) + g.h - g.padY;

    clearMarks();
    const blocks = [...editor.children].filter(n => n.nodeType === 1);
    let page = 0;
    for (const b of blocks) {
      let top = rel(b);
      const h = b.getBoundingClientRect().height;
      const forced = b.dataset.break === 'page';
      const straddles = top + h > textBottom(page) + 0.5;
      const started = top > textTop(page) + 0.5;
      // a block taller than a whole page cannot be moved anywhere better
      if (forced || (straddles && started && h <= g.contentH + 0.5)) {
        page++;
        push(b, textTop(page));
        top = rel(b);
      }
      let guard = 0;
      while (top + h > textBottom(page) + 0.5 && guard++ < 500) page++;
    }
    count = page + 1;
    editor.style.minHeight = (count * (g.h + g.gap) - g.gap) + 'px';
    renderSheets(count);
    onChange();
  }

  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(layout, delay === undefined ? 140 : delay);
  }

  /* ---------------- page size / continuous mode ---------------- */
  function setLayoutMode(key) {
    paged = key !== 'flow';
    if (paged) sizeKey = SIZES[key] ? key : 'a4';
    const g = geom();
    paper.classList.toggle('flow', !paged);
    paper.style.setProperty('--page-w', g.w + 'px');
    paper.style.setProperty('--page-h', g.h + 'px');
    paper.style.setProperty('--page-gap', g.gap + 'px');
    paper.style.setProperty('--page-pad-y', PAD_Y + 'px');
    paper.style.setProperty('--page-pad-x', PAD_X + 'px');
    layout();
  }
  function layoutMode() { return paged ? sizeKey : 'flow'; }

  /* ---------------- caret → page number ---------------- */
  function pageOfRange(r) {
    if (!paged || !r) return 1;
    let top = null;
    const rects = r.getClientRects();
    if (rects.length) top = rects[0].top;
    else {
      let n = r.startContainer;
      if (n.nodeType === 3) n = n.parentElement;
      if (n) top = n.getBoundingClientRect().top;
    }
    if (top === null) return 1;
    const g = geom();
    const p = Math.floor((top - editor.getBoundingClientRect().top) / (g.h + g.gap)) + 1;
    return Math.min(count, Math.max(1, p));
  }

  /* ---------------- manual page break (Ctrl+Enter) ---------------- */
  function caretBlock() {
    const s = window.getSelection();
    if (!s || !s.rangeCount) return null;
    let n = s.getRangeAt(0).startContainer;
    if (n.nodeType === 3) n = n.parentElement;
    return n && n.closest ? n.closest('#editor > *') : null;
  }
  /* Is the caret before any text of its block? Then the break can simply be
     put on that block, with no empty paragraph left behind. */
  function atBlockStart(block) {
    const s = window.getSelection();
    if (!block || !s || !s.rangeCount) return false;
    const r = s.getRangeAt(0);
    if (!r.collapsed) return false;
    const probe = document.createRange();
    probe.selectNodeContents(block);
    probe.setEnd(r.startContainer, r.startOffset);
    return probe.toString().length === 0;
  }
  function insertPageBreak() {
    editor.focus();
    let block = caretBlock();
    if (!block || !atBlockStart(block)) {
      document.execCommand('insertParagraph');   // split the line at the caret
      block = caretBlock();
    }
    if (block) block.dataset.break = 'page';
    schedule(0);
  }
  /* Remove the break marker on the block holding the caret, if any */
  function removePageBreak() {
    const block = caretBlock();
    if (!block || block.dataset.break !== 'page') return false;
    delete block.dataset.break;
    schedule(0);
    return true;
  }

  window.Pages = {
    init(opts) {
      onChange = (opts && opts.onChange) || onChange;
      setLayoutMode((opts && opts.mode) || 'a4');
      window.addEventListener('resize', () => schedule(200));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => schedule(0));
    },
    schedule, refresh: layout, setLayoutMode, layoutMode,
    insertPageBreak, removePageBreak, pageOfRange,
    count: () => count,
    isPaged: () => paged,
    sizes: SIZES
  };
})();
