/* Scribe — paste handling ----------------------------------------------
   Every paste goes through a sanitiser, in one of three styles:
     keep  — the source formatting (cleaned of scripts, classes, junk)
     match — structure only (bold/italic/lists/links), the document's own font
     text  — plain text
   The default is a preference; Ctrl+Shift+V always pastes plain text, and a
   small chip appears after a paste so the choice can be changed afterwards. */
(function () {
  'use strict';
  const editor = document.getElementById('editor');
  const chip = document.getElementById('paste-chip');

  const ALLOWED = new Set(['P', 'DIV', 'SPAN', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
    'SUB', 'SUP', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI',
    'A', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'HR', 'FONT', 'IMG',
    'CODE', 'PRE', 'MARK', 'SMALL']);
  const DROP = 'script,style,link,meta,noscript,iframe,object,embed,form,input,button,select,textarea,svg,video,audio,title,base';
  /* Presentational properties worth keeping from a "keep formatting" paste */
  const KEEP_STYLE = ['font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration',
    'text-decoration-line', 'color', 'background-color', 'text-align', 'direction', 'font-variant'];

  let mode = 'keep';          // default paste style (preference)
  let forced = null;          // one-shot override (Ctrl+Shift+V, menu)
  let last = null;            // clipboard payload of the most recent paste
  let chipTimer = null;
  let notify = function () {};

  /* ---------------- sanitising ---------------- */
  function safeUrl(u) {
    return /^(https?:|mailto:|#|\/)/i.test((u || '').trim());
  }
  function filterStyle(el, strip) {
    const css = el.getAttribute('style');
    el.removeAttribute('style');
    if (strip || !css) return;
    const decl = document.createElement('span');
    decl.setAttribute('style', css);
    KEEP_STYLE.forEach(p => {
      const v = decl.style.getPropertyValue(p);
      // Word/Docs export white text on white paper and huge line spacings
      if (v && !/^(transparent|rgba\(0, ?0, ?0, ?0\)|inherit|initial)$/i.test(v))
        el.style.setProperty(p, v);
    });
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }
  function sanitize(html, strip) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const body = doc.body;
    body.querySelectorAll(DROP).forEach(e => e.remove());
    // comments (Word pastes are full of them)
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT, null);
    const comments = [];
    let c;
    while ((c = walker.nextNode())) comments.push(c);
    comments.forEach(n => n.remove());

    [...body.querySelectorAll('*')].forEach(el => {
      if (!ALLOWED.has(el.tagName)) {
        const p = el.parentNode;
        while (el.firstChild) p.insertBefore(el.firstChild, el);
        el.remove();
        return;
      }
      [...el.attributes].forEach(a => {
        const n = a.name.toLowerCase();
        if (n === 'style' || n === 'dir' || n === 'colspan' || n === 'rowspan') return;
        if (n === 'href' && el.tagName === 'A') return;
        if ((n === 'src' || n === 'alt') && el.tagName === 'IMG') return;
        if (n === 'face' || n === 'size' || n === 'color') return;
        el.removeAttribute(a.name);
      });
      if (el.tagName === 'A' && !safeUrl(el.getAttribute('href'))) el.removeAttribute('href');
      if (el.tagName === 'IMG') {
        const src = el.getAttribute('src') || '';
        if (!/^(https?:|data:image\/)/i.test(src)) el.remove();
        return;
      }
      if (strip && (el.tagName === 'SPAN' || el.tagName === 'FONT')) {
        const p = el.parentNode;
        while (el.firstChild) p.insertBefore(el.firstChild, el);
        el.remove();
        return;
      }
      filterStyle(el, strip);
      if (strip) ['face', 'size', 'color'].forEach(a => el.removeAttribute(a));
    });
    return body.innerHTML;
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  }
  function textToHtml(text) {
    return text.replace(/\r\n?/g, '\n').split('\n')
      .map(l => '<p dir="auto">' + (l.trim() ? esc(l) : '<br>') + '</p>').join('');
  }

  /* ---------------- inserting ---------------- */
  function insert(data, how) {
    const text = data.text || '';
    const html = data.html || '';
    if (how === 'text' || !html) {
      // a single line goes in as text so it does not break the paragraph apart
      if (!/[\r\n]/.test(text)) {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('insertHTML', false, textToHtml(text));
      }
    } else {
      const clean = sanitize(html, how === 'match');
      document.execCommand('insertHTML', false, clean || esc(text));
    }
    editor.querySelectorAll('p:not([dir]), div:not([dir]), h1:not([dir]), h2:not([dir]), h3:not([dir])')
      .forEach(el => el.setAttribute('dir', 'auto'));
    if (window.Fmt) { Fmt.modernize(editor); Fmt.tidy(editor); }
    notify();
  }

  /* ---------------- the "paste options" chip ---------------- */
  function showChip(active) {
    if (!chip) return;
    chip.querySelectorAll('button[data-mode]').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === active));
    const s = window.getSelection();
    let rect = null;
    if (s && s.rangeCount) {
      const rects = s.getRangeAt(0).getClientRects();
      rect = rects.length ? rects[rects.length - 1] : null;
      if (!rect) {
        let n = s.getRangeAt(0).startContainer;
        if (n.nodeType === 3) n = n.parentElement;
        if (n) rect = n.getBoundingClientRect();
      }
    }
    chip.classList.remove('hidden');
    const w = chip.offsetWidth, h = chip.offsetHeight;
    const x = rect ? Math.min(rect.left, window.innerWidth - w - 12) : window.innerWidth - w - 20;
    const y = rect ? rect.bottom + 8 : 80;
    chip.style.left = Math.max(8, x) + 'px';
    chip.style.top = Math.min(y, window.innerHeight - h - 12) + 'px';
    clearTimeout(chipTimer);
    chipTimer = setTimeout(hideChip, 12000);
  }
  function hideChip() {
    clearTimeout(chipTimer);
    if (chip) chip.classList.add('hidden');
  }

  if (chip) {
    chip.addEventListener('mousedown', e => e.preventDefault());   // keep the selection
    chip.addEventListener('click', e => {
      const b = e.target.closest('button[data-mode]');
      if (!b || !last) return;
      // undo the previous insertion, then redo it in the chosen style
      editor.focus();
      document.execCommand('undo');
      insert(last, b.dataset.mode);
      showChip(b.dataset.mode);
    });
  }

  /* ---------------- events ---------------- */
  editor.addEventListener('paste', e => {
    const cd = e.clipboardData;
    if (!cd) return;
    e.preventDefault();
    const data = { text: cd.getData('text/plain') || '', html: cd.getData('text/html') || '' };
    const how = forced || mode;
    forced = null;
    last = data;
    editor.focus();
    insert(data, how);
    // nothing to choose between when the clipboard held plain text only
    if (data.html) showChip(how); else hideChip();
  });

  editor.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    if (!dt) return;
    const html = dt.getData('text/html');
    const text = dt.getData('text/plain');
    if (!html && !text) return;
    e.preventDefault();
    const r = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
    if (r) {
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
    editor.focus();
    insert({ html, text }, mode);
  });

  editor.addEventListener('keydown', () => hideChip(), true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideChip(); });

  window.PasteMgr = {
    init(opts) {
      notify = (opts && opts.onChange) || notify;
      if (opts && opts.mode) mode = opts.mode;
    },
    setMode(m) { mode = m; },
    mode: () => mode,
    /* one-shot override for the paste that is about to happen */
    force(m) { forced = m; setTimeout(() => { forced = null; }, 1500); },
    /* Paste Special from the application menu — the clipboard is read for us */
    pasteAs(data, how) {
      if (!data || (!data.text && !data.html)) return;
      last = data;
      editor.focus();
      insert(data, how);
      if (data.html) showChip(how);
    },
    hideChip
  };
})();
