/* Scribe — editor logic */
const editor = document.getElementById('editor');
const tooltip = document.getElementById('tooltip');
const floatbtn = document.getElementById('floatbtn');
const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');
const panelTitle = document.getElementById('panel-title');
const stFile = document.getElementById('st-file');
const stDirty = document.getElementById('st-dirty');
const stLang = document.getElementById('st-lang');
const stPages = document.getElementById('st-pages');
const stCount = document.getElementById('st-count');
const chkHover = document.getElementById('chk-hover');
const selLayout = document.getElementById('sel-layout');
const selPaste = document.getElementById('sel-paste');
const pageHint = document.getElementById('tb-page-hint');

let currentFile = null;
let dirty = false;

/* ---------------- Session persistence ----------------
   The document, the file it belongs to, and settings survive restarts.
   Works identically in Electron (localStorage lives in the app profile)
   and in the browser. */
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
let persistTimer = null;
function persistDoc(now) {
  clearTimeout(persistTimer);
  // Fmt.cleanHtml() drops the page-layout margins — they are recomputed on load
  const write = () => store.set('scribe-doc', { html: Fmt.cleanHtml(), file: currentFile, dirty });
  if (now) write(); else persistTimer = setTimeout(write, 400);
}
function persistPrefs() {
  const tab = document.querySelector('.tb-tab.active');
  store.set('scribe-prefs', {
    hover: chkHover.checked,
    // what the user picked — not the mode a narrow window forced on them
    layout: selLayout.value,
    paste: PasteMgr.mode(),
    tab: tab ? tab.dataset.tab : 'home'
  });
}
window.addEventListener('beforeunload', () => persistDoc(true));

const WORD_RE = /[֐-׿ְ-ׇ'׳״]+|[A-Za-z][A-Za-z'’-]*/;

function esc(s) {
  return String(s || '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- Formatting toolbar ---------------- */
/* Toolbar buttons must not take focus, or the selection they act on is gone
   before the click handler runs. */
document.getElementById('toolbar').addEventListener('mousedown', e => {
  if (e.target.closest('button')) e.preventDefault();
});

function cmd(name, value) {
  const r = Fmt.targetRange();
  if (r) { editor.focus(); Fmt.selectRange(r); }
  document.execCommand(name, false, value);
  editor.focus();
  updateStatus();
}
document.getElementById('btn-bold').onclick = () => cmd('bold');
document.getElementById('btn-italic').onclick = () => cmd('italic');
document.getElementById('btn-under').onclick = () => cmd('underline');
document.getElementById('btn-hl').onclick = () => { Fmt.apply({ backgroundColor: '#fdeec9' }); updateStatus(); };
document.getElementById('btn-clear').onclick = () => { Fmt.clearFormatting(); markDirty(); updateStatus(); };
document.getElementById('btn-left').onclick = () => cmd('justifyLeft');
document.getElementById('btn-center').onclick = () => cmd('justifyCenter');
document.getElementById('btn-right').onclick = () => cmd('justifyRight');
document.getElementById('btn-ul').onclick = () => cmd('insertUnorderedList');
document.getElementById('btn-ol').onclick = () => cmd('insertOrderedList');
/* ---------------- Font system ---------------- */
const selBlock = document.getElementById('sel-block');
const selFont = document.getElementById('sel-font');
const selSize = document.getElementById('sel-size');
const btnB = document.getElementById('btn-bold');
const btnI = document.getElementById('btn-italic');
const btnU = document.getElementById('btn-under');

/* Font and size are applied by Fmt to every text node in the selection, so a
   whole paragraph — or the whole document — changes at once. With no selection
   the choice is queued for the next characters typed. */
selBlock.onchange = e => cmd('formatBlock', '<' + e.target.value + '>');

selFont.onchange = e => {
  Fmt.apply({ fontFamily: e.target.value });
  markDirty();
  updateStatus();
};
/* Sizes offered in the dropdown; any value in between can simply be typed. */
const SIZE_STEPS = [8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20, 22, 24, 26, 28, 32,
  36, 40, 48, 54, 60, 72, 96, 120, 144];
const MIN_SIZE = 4, MAX_SIZE = 400;

function applySize(px) {
  if (!isFinite(px) || px <= 0) {           // typed something that isn't a size
    selSize.value = String(currentSizePx());
    return;
  }
  px = Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, px)));
  selSize.value = String(px);
  Fmt.apply({ fontSize: px + 'px' });
  markDirty();
  updateStatus();
}
/* Grow/shrink through the preset ladder, then in steps of ~10% past its ends */
function stepSize(dir) {
  const cur = parseFloat(selSize.value) || currentSizePx();
  const next = dir > 0
    ? SIZE_STEPS.find(s => s > cur + 0.5)
    : [...SIZE_STEPS].reverse().find(s => s < cur - 0.5);
  applySize(next !== undefined ? next : cur + dir * Math.max(2, Math.round(cur * 0.1)));
}
function currentSizePx() {
  const r = Fmt.targetRange();
  let node = r ? r.startContainer : null;
  if (node && node.nodeType === 3) node = node.parentElement;
  return node && editor.contains(node) ? Math.round(parseFloat(getComputedStyle(node).fontSize)) : 17;
}

selSize.addEventListener('change', () => applySize(parseFloat(selSize.value)));
selSize.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); applySize(parseFloat(selSize.value)); }
  // Up/Down arrows nudge the value, like a spinner
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    stepSize(e.key === 'ArrowUp' ? 1 : -1);
  }
});
selSize.addEventListener('focus', () => selSize.select());
document.getElementById('btn-size-up').onclick = () => stepSize(1);
document.getElementById('btn-size-down').onclick = () => stepSize(-1);

/* Show a value in a <select>, adding a hidden extra option when it isn't
   one of the presets (e.g. 15px text, or a font not in the list). */
function reflectValue(sel, value, label) {
  const custom = sel.querySelector('option[data-custom]');
  if ([...sel.options].some(o => !o.dataset.custom && o.value === value)) {
    if (custom) custom.remove();
    sel.value = value;
    return;
  }
  const opt = custom || sel.appendChild(document.createElement('option'));
  opt.dataset.custom = '1';
  opt.value = value;
  opt.textContent = label;
  sel.value = value;
}

/* Reflect the caret/selection's formatting in the toolbar:
   size, font, paragraph style and B/I/U button states. */
function syncFontUI(node) {
  const cs = getComputedStyle(node);
  const px = Math.round(parseFloat(cs.fontSize));
  // never fight the user while they are typing a size into the box
  if (document.activeElement !== selSize) selSize.value = String(px);

  const fams = cs.fontFamily.split(',').map(f => f.replace(/["']/g, '').trim().toLowerCase());
  let match = null;
  outer:
  for (const fam of fams) {
    for (const o of selFont.options) {
      if (o.dataset.custom) continue;
      if (o.value.split(',')[0].trim().toLowerCase() === fam) { match = o.value; break outer; }
    }
  }
  if (match) reflectValue(selFont, match, match);
  else reflectValue(selFont, cs.fontFamily,
    fams[0].replace(/(^|\s)\S/g, c => c.toUpperCase()));

  const blk = node.closest('h1,h2,h3,blockquote,p,li,div');
  if (blk && blk !== editor) {
    const tag = blk.tagName.toLowerCase();
    selBlock.value = ['p', 'h1', 'h2', 'h3', 'blockquote'].includes(tag) ? tag : 'p';
  }

  try {
    btnB.classList.toggle('active', document.queryCommandState('bold'));
    btnI.classList.toggle('active', document.queryCommandState('italic'));
    btnU.classList.toggle('active', document.queryCommandState('underline'));
  } catch (e) {}
}

/* ---------------- Theme (dark / light) ---------------- */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('scribe-theme', t); } catch (e) {}
}
applyTheme(
  (() => { try { return localStorage.getItem('scribe-theme'); } catch (e) { return null; } })()
  || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
);
document.getElementById('btn-theme').onclick = () =>
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

/* ---------------- Help modal ---------------- */
const helpOverlay = document.getElementById('help-overlay');
function toggleHelp(show) {
  helpOverlay.classList.toggle('hidden', show === undefined ? undefined : !show);
}
document.getElementById('btn-help').onclick = () => toggleHelp();
document.getElementById('help-close').onclick = () => toggleHelp(false);
helpOverlay.addEventListener('click', e => { if (e.target === helpOverlay) toggleHelp(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleHelp(false);
});

/* ---------------- Pronunciation (Web Speech API) ---------------- */
let _voices = [];
if ('speechSynthesis' in window) {
  _voices = speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => { _voices = speechSynthesis.getVoices(); };
}
let warnedNoHeVoice = false;
function speak(text, lang) {
  if (!('speechSynthesis' in window)) { alert('Speech is not available on this system.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const pref = lang === 'he' ? 'he' : 'en';
  const v = _voices.find(v => v.lang && v.lang.toLowerCase().startsWith(pref));
  if (v) u.voice = v;
  else if (pref === 'he' && !warnedNoHeVoice) {
    warnedNoHeVoice = true;
    alert('No Hebrew voice found on this system — pronunciation may be wrong or silent.\n' +
      'On Windows: Settings → Time & Language → Speech → Add voices → Hebrew.');
  }
  u.lang = pref === 'he' ? 'he-IL' : 'en-US';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
function speakBtn(text, lang) {
  return '<button class="speak" title="Pronounce" data-lang="' + lang +
    '" data-say="' + encodeURIComponent(text) + '">🔊</button>';
}

function setParagraphDir(dir) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  let node = sel.getRangeAt(0).startContainer;
  if (node.nodeType === 3) node = node.parentElement;
  const block = node.closest('#editor p, #editor h1, #editor h2, #editor h3, #editor blockquote, #editor li, #editor div');
  if (block && block.id !== 'editor') {
    block.setAttribute('dir', dir);
    block.style.textAlign = dir === 'rtl' ? 'right' : 'left';
  }
  editor.focus();
}
document.getElementById('btn-ltr').onclick = () => setParagraphDir('ltr');
document.getElementById('btn-rtl').onclick = () => setParagraphDir('rtl');

/* Mark the document as edited (used by the toolbar commands too) */
function markDirty() {
  dirty = true;
  updateStatus();
  persistDoc();
  Pages.schedule();
}

/* New paragraphs get dir=auto so typing Hebrew flips them automatically */
editor.addEventListener('input', () => {
  Fmt.applyPending(); // font/size chosen at a collapsed caret lands on the first keystroke
  editor.querySelectorAll('p:not([dir]), div:not([dir]), h1:not([dir]), h2:not([dir]), h3:not([dir])')
    .forEach(el => el.setAttribute('dir', 'auto'));
  markDirty();
});

/* ---------------- Status bar ---------------- */
function updateStatus() {
  const text = editor.innerText || '';
  const words = (text.match(/[֐-׿]+|[A-Za-z'’-]+/g) || []).length;
  stCount.textContent = words + ' words · ' + text.replace(/\s/g, '').length + ' chars';
  stDirty.textContent = dirty ? '●' : '';
  const sel = window.getSelection();
  if (sel.rangeCount) {
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    if (node.nodeType === 3) node = node.parentElement;
    if (node && editor.contains(node)) {
      const blockText = node.textContent || '';
      stLang.textContent = detectLang(blockText) === 'he' ? 'Hebrew · עברית' : 'English';
      syncFontUI(node);
      if (Pages.isPaged()) stPages.textContent = 'Page ' + Pages.pageOfRange(range) + ' of ' + Pages.count();
    }
  }
  if (!Pages.isPaged()) stPages.textContent = '';
  else if (!stPages.textContent) stPages.textContent = 'Page 1 of ' + Pages.count();
  updatePageHint();
}

/* The Page tab explains what the current layout is doing — including the case
   where pages were asked for but the window is too narrow to show a sheet. */
function updatePageHint() {
  if (!pageHint) return;
  if (Pages.isPaged()) {
    const n = Pages.count();
    pageHint.textContent = n + (n === 1 ? ' page' : ' pages') +
      ' · ' + (Pages.layoutMode() === 'letter' ? 'Letter' : 'A4');
  } else {
    pageHint.textContent = selLayout.value === 'flow'
      ? 'One continuous page'
      : 'Window too narrow for pages — showing continuous';
  }
}
document.addEventListener('selectionchange', updateStatus);

/* ---------------- Ribbon tabs ---------------- */
const tabs = [...document.querySelectorAll('.tb-tab')];
const rows = [...document.querySelectorAll('.tb-row')];
function showTab(name) {
  if (!tabs.some(t => t.dataset.tab === name)) name = 'home';
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  rows.forEach(r => r.classList.toggle('hidden', r.dataset.tab !== name));
  Pages.schedule(0);   // the editor moved: its page boundaries did too
  return name;
}
tabs.forEach(t => t.addEventListener('click', () => { showTab(t.dataset.tab); persistPrefs(); }));

/* ---------------- Page layout & paste preferences ---------------- */
/* Below this the window cannot show a whole sheet (Letter is 816px wide plus
   the editor's own padding), so pages would only add sideways scrolling —
   continuous mode is used instead. */
const PAGED_MIN_WIDTH = 860;
const narrow = () => window.innerWidth < PAGED_MIN_WIDTH;

selLayout.onchange = () => {
  Pages.setLayoutMode(narrow() ? 'flow' : selLayout.value);
  persistPrefs();
  updateStatus();
};
selPaste.onchange = () => { PasteMgr.setMode(selPaste.value); persistPrefs(); };

/* ---------------- Restore previous session ---------------- */
(function restoreSession() {
  const prefs = store.get('scribe-prefs') || {};
  if (typeof prefs.hover === 'boolean') chkHover.checked = prefs.hover;
  if (prefs.layout) selLayout.value = prefs.layout;
  if (prefs.paste) selPaste.value = prefs.paste;
  showTab(prefs.tab || 'home');
  const d = store.get('scribe-doc');
  if (d && typeof d.html === 'string' && d.html.trim()) {
    editor.innerHTML = d.html;
    currentFile = d.file || null;
    dirty = !!d.dirty;
    stFile.textContent = currentFile ? currentFile.split(/[\\/]/).pop() : 'Untitled';
  }
  Fmt.modernize(editor);
  Fmt.normalizeBlocks();

  Pages.init({ mode: narrow() ? 'flow' : selLayout.value, onChange: () => updateStatus() });
  PasteMgr.init({
    mode: selPaste.value,
    onChange: () => { markDirty(); Pages.schedule(0); }
  });
  /* The window can still be sizing itself while this runs (and the user may
     rotate a tablet later), so the paged/continuous choice is re-checked
     rather than decided once. */
  const reconcileLayout = () => {
    const want = narrow() ? 'flow' : selLayout.value;
    if (Pages.layoutMode() !== want) Pages.setLayoutMode(want);
  };
  window.addEventListener('resize', reconcileLayout);
  window.addEventListener('load', reconcileLayout);
  const mq = window.matchMedia('(max-width: ' + (PAGED_MIN_WIDTH - 1) + 'px)');
  if (mq.addEventListener) mq.addEventListener('change', reconcileLayout);
})();
chkHover.addEventListener('change', persistPrefs);
updateStatus();

/* ---------------- File operations ---------------- */
function docHtml() {
  return '<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>Scribe Document</title></head><body>\n'
    + Fmt.cleanHtml() + '\n</body></html>';
}
function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}
function loadDocument(r) {
  currentFile = r.filePath;
  if (/\.(html?|xhtml)$/i.test(r.filePath)) {
    editor.innerHTML = extractBody(r.content);
  } else {
    editor.innerHTML = r.content.split(/\r?\n/)
      .map(line => '<p dir="auto">' + esc(line) + '</p>').join('');
  }
  editor.querySelectorAll('p:not([dir])').forEach(el => el.setAttribute('dir', 'auto'));
  Fmt.modernize(editor);
  Fmt.normalizeBlocks();
  dirty = false;
  stFile.textContent = r.filePath.split(/[\\/]/).pop();
  Pages.schedule(0);
  updateStatus();
  persistDoc(true);
}
async function doOpen() {
  const r = await window.fileAPI.open();
  if (r) loadDocument(r);
}
async function doOpenRecent(filePath) {
  if (!filePath || !window.fileAPI.openPath) return;
  if (dirty && !confirm('Discard unsaved changes?')) return;
  const r = await window.fileAPI.openPath(filePath);
  if (r) loadDocument(r);
}
async function doSave(as) {
  const isTxt = currentFile && /\.txt$/i.test(currentFile);
  const content = isTxt ? editor.innerText : docHtml();
  let r = null;
  try {
    r = as
      ? await window.fileAPI.saveAs(docHtml(), 'document.html')
      : await window.fileAPI.save(currentFile, content);
  } catch (e) {
    alert('Save failed: ' + (e && e.message ? e.message : e));
    return;
  }
  if (!r) return;
  currentFile = r.filePath;
  dirty = false;
  stFile.textContent = r.filePath.split(/[\\/]/).pop();
  updateStatus();
  persistDoc(true);
}
function doNew() {
  if (dirty && !confirm('Discard unsaved changes?')) return;
  editor.innerHTML = '<p dir="auto"><br></p>';
  currentFile = null; dirty = false;
  stFile.textContent = 'Untitled';
  Fmt.clearPending();
  Pages.schedule(0);
  updateStatus();
  persistDoc(true);
}
document.getElementById('btn-new').onclick = doNew;
document.getElementById('btn-open').onclick = doOpen;
document.getElementById('btn-save').onclick = () => doSave(false);

/* ---------------- Page breaks, paste style, printing ---------------- */
function togglePageBreak() {
  if (!Pages.removePageBreak()) Pages.insertPageBreak();
  markDirty();
}
document.getElementById('btn-break').onclick = togglePageBreak;

/* Print / export to PDF — the print stylesheet turns the simulated pages into
   real ones, so the paper matches the screen. */
function doPrint() {
  PasteMgr.hideChip();
  hideTooltip();
  window.print();
}
document.getElementById('btn-print').onclick = doPrint;

/* Paste Special (desktop menu): the clipboard is read in the main process */
async function pasteAs(how) {
  const data = window.fileAPI.readClipboard ? await window.fileAPI.readClipboard() : null;
  // No clipboard access (some browsers) — arm the mode for the next Ctrl+V
  if (!data) { PasteMgr.force(how); return; }
  PasteMgr.pasteAs(data, how);
}

document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'enter' && !e.shiftKey && document.activeElement === editor) {
    e.preventDefault();
    togglePageBreak();
  } else if (k === '\\') {
    e.preventDefault();
    Fmt.clearFormatting();
    markDirty();
  } else if (k === 'v' && e.shiftKey) {
    // the browser still performs the paste — it just arrives as plain text
    PasteMgr.force('text');
  } else if (e.shiftKey && (e.key === '>' || e.code === 'Period')) {
    e.preventDefault();
    stepSize(1);
  } else if (e.shiftKey && (e.key === '<' || e.code === 'Comma')) {
    e.preventDefault();
    stepSize(-1);
  }
});

/* Native application menu (File → New/Open/Save/Save As, Edit → Explain) */
if (window.fileAPI.onMenu) {
  window.fileAPI.onMenu((action, payload) => {
    if (action === 'new') doNew();
    else if (action === 'open') doOpen();
    else if (action === 'openRecent') doOpenRecent(payload);
    else if (action === 'save') doSave(false);
    else if (action === 'saveAs') doSave(true);
    else if (action === 'explain') explainSelection();
    else if (action === 'help') toggleHelp();
    else if (action === 'pageBreak') togglePageBreak();
    else if (action === 'clearFormat') { Fmt.clearFormatting(); markDirty(); }
    else if (action === 'print') window.print();
    else if (action && action.indexOf('paste:') === 0) pasteAs(action.slice(6));
  });
}

/* Shortcuts (Ctrl+N/O/S/Shift+S/E) are handled by the native menu accelerators. */

/* ---------------- Word / sentence under cursor ---------------- */
function rangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    const r = document.createRange();
    r.setStart(p.offsetNode, p.offset);
    r.collapse(true);
    return r;
  }
  return null;
}

function wordAtPoint(x, y) {
  const r = rangeFromPoint(x, y);
  if (!r || r.startContainer.nodeType !== 3) return null;
  const node = r.startContainer;
  if (!editor.contains(node)) return null;
  const text = node.textContent;
  const off = r.startOffset;
  const isWordChar = c => /[֐-׿ְ-ׇA-Za-z'’׳״-]/.test(c);
  if (off >= text.length || !isWordChar(text[off])) return null;
  let s = off, e = off;
  while (s > 0 && isWordChar(text[s - 1])) s--;
  while (e < text.length && isWordChar(text[e])) e++;
  const word = text.slice(s, e).replace(/^['’-]+|['’-]+$/g, '');
  if (!word || !WORD_RE.test(word)) return null;
  return { word, node, start: s, end: e };
}

function sentenceAtPoint(x, y) {
  const r = rangeFromPoint(x, y);
  if (!r) return null;
  let node = r.startContainer;
  if (node.nodeType === 3) node = node.parentElement;
  if (!node || !editor.contains(node)) return null;
  const block = node.closest('p, h1, h2, h3, blockquote, li, div') || node;
  const full = block.innerText || '';
  if (!full.trim()) return null;
  // offset of caret within the block's text
  const pre = document.createRange();
  pre.selectNodeContents(block);
  pre.setEnd(r.startContainer, r.startOffset);
  const caret = pre.toString().length;
  const enders = /[.!?׃;]|\n/g;
  let start = 0, end = full.length, m;
  while ((m = enders.exec(full)) !== null) {
    if (m.index < caret) start = m.index + 1;
    else { end = m.index + 1; break; }
  }
  const sentence = full.slice(start, end).trim();
  return sentence || null;
}

/* ---------------- Hover tooltip ---------------- */
let hoverTimer = null;
let lastHoverKey = '';

function hideTooltip() { tooltip.classList.add('hidden'); lastHoverKey = ''; }

function placeTooltip(x, y) {
  tooltip.style.left = Math.min(x + 14, window.innerWidth - tooltip.offsetWidth - 12) + 'px';
  const top = y + 20;
  tooltip.style.top = (top + tooltip.offsetHeight > window.innerHeight - 8
    ? y - tooltip.offsetHeight - 10 : top) + 'px';
}

function tooltipHtml(r, extraNote) {
  if (!r) return '<div class="tt-def">No definition found.</div>' +
    (extraNote ? '<div class="tt-src">' + esc(extraNote) + '</div>' : '');
  const heCls = r.lang === 'he' ? ' he' : '';
  let h = '<span class="tt-word' + heCls + '">' + esc(r.word) + '</span>';
  if (r.translit) h += '<span class="tt-translit">' + esc(r.translit) + '</span>';
  if (r.pos) h += '<span class="tt-pos">' + esc(r.pos) + '</span>';
  (r.defs || []).forEach((d, i) => {
    h += '<div class="tt-def">' + (r.defs.length > 1 ? (i + 1) + '. ' : '') + esc(d) + '</div>';
  });
  h += '<div class="tt-src">' + esc(r.source || '') +
    ' · select + Ctrl+E for roots &amp; etymology</div>';
  return h;
}

async function hoverLookup(x, y, shift) {
  if (shift) {
    // Sentence translation mode
    const sentence = sentenceAtPoint(x, y);
    if (!sentence) { hideTooltip(); return; }
    const key = 'S:' + sentence;
    if (key === lastHoverKey) return;
    lastHoverKey = key;
    const lang = detectLang(sentence);
    tooltip.innerHTML = '<div class="tt-loading">Translating sentence…</div>';
    tooltip.classList.remove('hidden');
    placeTooltip(x, y);
    const t = await translateText(sentence, lang, lang === 'he' ? 'en' : 'he');
    if (lastHoverKey !== key) return;
    tooltip.innerHTML = t
      ? '<span class="tt-word' + (lang === 'he' ? ' he' : '') + '">' + esc(sentence.slice(0, 120)) + '</span>' +
        '<div class="tt-def"' + (lang === 'en' ? ' dir="rtl" style="font-family:var(--heb-font);font-size:15px"' : '') + '>' +
        esc(t) + '</div><div class="tt-src">Sentence translation · MyMemory</div>'
      : '<div class="tt-def">Could not translate sentence.</div>';
    placeTooltip(x, y);
    return;
  }
  const w = wordAtPoint(x, y);
  if (!w) { hideTooltip(); return; }
  const key = 'W:' + w.word;
  if (key === lastHoverKey) return;
  lastHoverKey = key;
  const lang = detectLang(w.word);
  const builtin = builtinLookup(w.word, lang);
  if (builtin) {
    tooltip.innerHTML = tooltipHtml({
      word: builtin.he || w.word, translit: builtin.translit, pos: builtin.pos,
      defs: builtin.meaning.slice(0, 3), source: 'Built-in dictionary', lang
    });
    tooltip.classList.remove('hidden');
    placeTooltip(x, y);
    return;
  }
  tooltip.innerHTML = '<span class="tt-word' + (lang === 'he' ? ' he' : '') + '">' +
    esc(w.word) + '</span><div class="tt-loading">Looking up…</div>';
  tooltip.classList.remove('hidden');
  placeTooltip(x, y);
  const r = await quickLookup(w.word, lang);
  if (lastHoverKey !== key) return;
  tooltip.innerHTML = tooltipHtml(r, 'Not found online');
  placeTooltip(x, y);
}

const lastMouse = { x: -1, y: -1, inside: false };
editor.addEventListener('mousemove', e => {
  lastMouse.x = e.clientX; lastMouse.y = e.clientY; lastMouse.inside = true;
  if (!chkHover.checked) return;
  clearTimeout(hoverTimer);
  // Shorter delay in sentence mode; same-sentence moves are a no-op anyway
  hoverTimer = setTimeout(() => hoverLookup(e.clientX, e.clientY, e.shiftKey),
    e.shiftKey ? 150 : 350);
});
editor.addEventListener('mouseleave', () => {
  lastMouse.inside = false;
  clearTimeout(hoverTimer); hideTooltip();
});

/* Pressing Shift translates the sentence under the cursor immediately —
   no mouse movement needed. Releasing Shift returns to word mode. */
document.addEventListener('keydown', e => {
  if (e.key === 'Shift' && !e.repeat && chkHover.checked && lastMouse.inside) {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => hoverLookup(lastMouse.x, lastMouse.y, true), 120);
  }
});
document.addEventListener('keyup', e => {
  if (e.key === 'Shift' && lastHoverKey.startsWith('S:')) {
    clearTimeout(hoverTimer);
    hideTooltip();
  }
});

/* Typing hides the tooltip — but modifier keys alone (Shift, Ctrl…) don't */
editor.addEventListener('keydown', e => {
  if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) hideTooltip();
});

/* ---------------- Touch screens: tap a word to look it up ---------------- */
const isTouch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
if (isTouch) {
  document.getElementById('lookup-label').textContent = 'Tap lookup';
  editor.addEventListener('touchend', e => {
    if (!chkHover.checked) return;
    const t = e.changedTouches[0];
    if (!t) return;
    // Wait for the tap to settle (caret placement / selection), then decide
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return; // user is selecting → Explain flow
      hoverLookup(t.clientX, t.clientY, false);
    }, 80);
  }, { passive: true });
  // Tapping outside the editor, or scrolling, dismisses the tooltip
  document.addEventListener('touchstart', e => {
    if (!editor.contains(e.target)) hideTooltip();
  }, { passive: true });
  document.getElementById('editor-wrap').addEventListener('scroll', hideTooltip, { passive: true });
}

/* ---------------- Selection → floating Explain button ---------------- */
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) { floatbtn.classList.add('hidden'); return; }
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) { floatbtn.classList.add('hidden'); return; }
  const text = sel.toString().trim();
  if (!text) { floatbtn.classList.add('hidden'); return; }
  const rect = range.getBoundingClientRect();
  floatbtn.style.left = Math.max(8, rect.left + rect.width / 2 - 45) + 'px';
  floatbtn.style.top = Math.max(8, rect.top - 38) + 'px';
  floatbtn.classList.remove('hidden');
});
floatbtn.onclick = () => explainSelection();
document.getElementById('btn-explain').onclick = () => explainSelection();
document.getElementById('panel-close').onclick = () => panel.classList.add('hidden');

/* Pronounce buttons inside the panel (built from HTML strings → delegate) */
panelBody.addEventListener('click', e => {
  const b = e.target.closest('.speak');
  if (b) speak(decodeURIComponent(b.dataset.say), b.dataset.lang);
});

/* Live Explain: while the panel is open, a new selection in the editor
   refreshes it automatically — no need to press Explain again. */
let lastExplained = '';
let autoExplainTimer = null;
document.addEventListener('selectionchange', () => {
  clearTimeout(autoExplainTimer);
  if (panel.classList.contains('hidden')) return;
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  if (!editor.contains(sel.getRangeAt(0).commonAncestorContainer)) return;
  const text = sel.toString().trim();
  if (!text || text === lastExplained) return;
  autoExplainTimer = setTimeout(() => explainSelection(), 600);
});

/* ---------------- Explain panel ---------------- */
function card(title, inner) {
  return '<div class="card"><h4>' + esc(title) + '</h4>' + inner + '</div>';
}
function defList(defs) {
  if (!defs || !defs.length) return '';
  return '<ol>' + defs.map(d => '<li>' + esc(d) + '</li>').join('') + '</ol>';
}

async function explainSelection() {
  const sel = window.getSelection();
  const text = (sel && sel.toString().trim()) || '';
  if (!text) { alert('Select a word or sentence first, then press Explain.'); return; }
  lastExplained = text;
  floatbtn.classList.add('hidden');
  panel.classList.remove('hidden');
  const lang = detectLang(text);
  const words = text.match(new RegExp(WORD_RE.source, 'g')) || [];
  const isSingleWord = words.length === 1;
  const headWord = isSingleWord ? words[0] : text;
  panelTitle.textContent = 'Explain: ' + (headWord.length > 24 ? headWord.slice(0, 24) + '…' : headWord);
  panelBody.innerHTML = '<div class="panel-loading">Looking up "' + esc(headWord.slice(0, 40)) + '"…</div>';

  const sections = [];

  // Header card (with pronunciation)
  const heCls = lang === 'he' ? ' he' : '';
  sections.push('<div class="card"><div class="hw' + heCls + '">' + esc(headWord) +
    speakBtn(text, lang) + '</div>' +
    '<div class="meta">' + (lang === 'he' ? 'Hebrew · עברית' : 'English') +
    (isSingleWord ? '' : ' · ' + words.length + ' words') + '</div></div>');

  // Hebrew letter card — selecting a single letter explains it
  if (lang === 'he') {
    const bare = stripNikud(headWord);
    if (bare.length === 1 && HEB_LETTERS[bare]) {
      const L = HEB_LETTERS[bare];
      let inner = '<div class="letter-big">' + esc(bare) + '</div>' +
        '<div class="meta"><b>' + esc(L.name) + '</b> · sound: ' + esc(L.sound) +
        ' · gematria: ' + L.gematria + '</div>';
      if (L.final) inner += '<div class="panel-note">Final form (used at the end of a word): ' +
        '<span class="letter-big" style="font-size:24px">' + esc(L.final) + '</span></div>';
      if (L.finalOf) inner += '<div class="panel-note">This is the final form of ' +
        '<span class="letter-big" style="font-size:24px">' + esc(L.finalOf) + '</span>' +
        ', used at the end of a word.</div>';
      sections.push(card('Hebrew letter', inner));
    }
  }

  // Transliteration card (Hebrew selections)
  if (lang === 'he') {
    const pointed = hasNikud(text);
    const note = pointed ? '' :
      '<div class="panel-note">No nikud (vowel points) in this text — consonants only. ' +
      'Pointed text gives a full transliteration.</div>';
    if (isSingleWord) {
      const t = hebTranslit(headWord);
      if (t) sections.push(card('Transliteration',
        '<div class="translit-big">' + esc(t) + '</div>' + speakBtn(headWord, 'he') + note));
    } else {
      const items = words.filter(w => detectLang(w) === 'he').slice(0, 20).map(w => {
        const t = hebTranslit(w);
        return '<li><b style="font-family:var(--heb-font);font-size:16px">' + esc(w) + '</b>' +
          (t ? ' — <i>' + esc(t) + '</i>' : '') + speakBtn(w, 'he') + '</li>';
      });
      if (items.length) sections.push(card('Transliteration', '<ol>' + items.join('') + '</ol>' + note));
    }
  }

  // 1. Built-in entry (single word)
  if (isSingleWord) {
    const b = builtinLookup(headWord, lang);
    if (b) {
      let inner = '<div class="hw' + heCls + '">' + esc(b.he || b.key) + '</div>';
      inner += '<div class="meta">' + esc(b.translit || '') + (b.pos ? ' · ' + esc(b.pos) : '') +
        (b.reg ? ' · ' + esc(b.reg === 'both' ? 'Biblical & Modern' : b.reg) : '') + '</div>';
      if (b.prefix) inner += '<div class="meta">Prefix detected: ' + esc(b.prefix) + '־ (and/the/in/to/from…)</div>';
      if (b.root && b.root !== '—') inner += '<div>Root: <span class="root-badge">' + esc(b.root) + '</span></div>';
      inner += defList(b.meaning);
      if (b.ety) inner += '<div class="ety"><b>Origin:</b> ' + esc(b.ety) + '</div>';
      sections.push(card('Built-in dictionary', inner));
    }
  }
  panelBody.innerHTML = sections.join('') + '<div class="panel-loading">Fetching online dictionaries…</div>';

  const jobs = [];

  // 2. Online lookups
  if (isSingleWord && lang === 'he') {
    jobs.push(sefariaLookup(headWord).then(s => {
      if (!s) return '';
      let out = '';
      if (s.klein) {
        let inner = '<div class="hw he">' + esc(s.klein.headword) + '</div>' +
          '<div class="meta">' + esc(s.klein.morphology || '') + ' · Modern Hebrew</div>' +
          defList(s.klein.defs);
        if (s.klein.etymology) inner += '<div class="ety"><b>Etymology:</b> ' + esc(s.klein.etymology) + '</div>';
        if (s.klein.derivatives) inner += '<div class="panel-note">' + esc(s.klein.derivatives) + '</div>';
        inner += '<div class="attribution">Klein Dictionary (E. Klein, Carta 1987) via Sefaria</div>';
        out += card('Klein Dictionary — meaning & etymology', inner);
      }
      if (s.strong) {
        let inner = '<div class="hw he">' + esc(s.strong.headword) + '</div>' +
          '<div class="meta">' + esc(s.strong.translit || '') +
          (s.strong.pron ? ' · pronounced ' + esc(s.strong.pron) : '') +
          (s.strong.strongNumber ? ' · Strong’s #' + esc(s.strong.strongNumber) : '') + '</div>' +
          defList(s.strong.defs) +
          '<div class="attribution">BDB Augmented Strong via Sefaria</div>';
        out += card('Biblical Hebrew — BDB / Strong', inner);
      }
      if (s.bdb) {
        let inner = '<div class="hw he">' + esc(s.bdb.headword) + '</div>' +
          (s.bdb.occurrences ? '<div class="meta">' + esc(s.bdb.occurrences) + ' occurrences in the Tanakh</div>' : '') +
          defList(s.bdb.defs) +
          '<div class="attribution">Brown-Driver-Briggs (1906) via Sefaria</div>';
        out += card('Biblical Hebrew — BDB Lexicon', inner);
      }
      if (s.jastrow) {
        let inner = '<div class="hw he">' + esc(s.jastrow.headword) + '</div>' +
          '<div class="meta">' + esc(s.jastrow.morphology || '') + ' · Talmudic/Rabbinic</div>' +
          defList(s.jastrow.defs) +
          '<div class="attribution">Jastrow Dictionary (1903) via Sefaria</div>';
        out += card('Rabbinic Hebrew — Jastrow', inner);
      }
      return out;
    }));
    // Word translation
    jobs.push(translateText(headWord, 'he', 'en').then(t =>
      t ? card('Translation', '<div class="trans-text">' + esc(t) + '</div>' +
        '<div class="attribution">MyMemory Translation</div>') : ''));
  } else if (isSingleWord) {
    jobs.push(englishLookup(headWord).then(e => {
      if (!e) return '';
      let inner = '<div class="hw">' + esc(e.word) + '</div>' +
        (e.phonetic ? '<div class="meta">' + esc(e.phonetic) + '</div>' : '');
      e.meanings.forEach(m => {
        inner += '<div class="meta"><b>' + esc(m.pos) + '</b></div><ol>' +
          m.defs.map(d => '<li>' + esc(d.def) +
            (d.example ? '<br><i style="color:#777">"' + esc(d.example) + '"</i>' : '') + '</li>').join('') + '</ol>';
        if (m.synonyms.length) inner += '<div class="panel-note">Synonyms: ' + esc(m.synonyms.join(', ')) + '</div>';
      });
      inner += '<div class="attribution">Free Dictionary API (Wiktionary data)</div>';
      return card('English dictionary', inner);
    }));
    jobs.push(wiktionaryEtymology(headWord).then(t =>
      t ? card('Word origin — etymology',
        '<div class="ety"><b>Etymology:</b> ' + esc(t) + '</div>' +
        '<div class="attribution">Wiktionary</div>') : ''));
    jobs.push(translateText(headWord, 'en', 'he').then(t =>
      t ? card('Hebrew translation',
        '<div class="trans-text" dir="rtl" style="font-family:var(--heb-font);font-size:20px">' + esc(t) + '</div>' +
        (hebTranslit(t) ? '<div class="translit-big">' + esc(hebTranslit(t)) + '</div>' : '') +
        speakBtn(t, 'he') +
        '<div class="attribution">MyMemory Translation</div>') : ''));
  } else {
    // Phrase / sentence: translate + per-word gloss
    const from = lang, to = lang === 'he' ? 'en' : 'he';
    jobs.push(translateText(text, from, to).then(t =>
      t ? card('Sentence translation',
        '<div class="trans-text"' + (to === 'he' ? ' dir="rtl" style="font-family:var(--heb-font);font-size:18px"' : '') + '>' +
        esc(t) + '</div><div class="attribution">MyMemory Translation</div>') : ''));
    const glossWords = words.slice(0, 12);
    jobs.push(Promise.all(glossWords.map(async w => {
      const wl = detectLang(w);
      const r = await quickLookup(w, wl).catch(() => null);
      const gloss = r && r.defs && r.defs.length ? r.defs[0] : '—';
      return '<li><b' + (wl === 'he' ? ' style="font-family:var(--heb-font);font-size:16px"' : '') + '>' +
        esc(w) + '</b>' + (r && r.translit ? ' <i>(' + esc(r.translit) + ')</i>' : '') +
        ' — ' + esc(gloss) + speakBtn(w, wl) + '</li>';
    })).then(items => card('Word-by-word gloss',
      '<ol>' + items.join('') + '</ol>' +
      (words.length > 12 ? '<div class="panel-note">First 12 words shown.</div>' : ''))));
  }

  const results = await Promise.all(jobs.map(p => p.catch(() => '')));
  const online = results.filter(Boolean).join('');
  panelBody.innerHTML = sections.join('') +
    (online || '<div class="err">No online results (check your internet connection).</div>');
}
