# Scribe

> A bilingual Hebrew-English word processor with instant definitions, etymology and word-root lookup.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-43-47848F.svg)](https://www.electronjs.org/)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg)](https://nodejs.org)

Write in English and Hebrew in the same document, hover any word for its
meaning, and press **Explain** for roots, etymology and full lexicon entries —
Klein, BDB, Strong's and Jastrow included.

---

## Features

**Bilingual editing**

- Type English or Hebrew in the same document; paragraph direction (LTR/RTL)
  switches automatically, with manual override buttons.
- Live status bar showing the language of the current paragraph, word and
  character counts.

**Instant lookup**

- Hover any word → tooltip with its meaning, plus transliteration and part of
  speech for Hebrew.
- Hold <kbd>Shift</kbd> while hovering → the whole sentence is translated
  (Hebrew ↔ English).
- Select text and press **Explain** (<kbd>Ctrl</kbd>+<kbd>E</kbd>) → a side
  panel with deep results:
  - **Hebrew** — shoresh (root), Biblical vs. Modern usage, Klein Dictionary
    etymology, BDB/Strong's with transliteration and pronunciation, Jastrow
    (Rabbinic), and translation.
  - **English** — full definitions with examples and synonyms, Wiktionary
    etymology, and Hebrew translation.
  - **Sentences** — full translation plus a word-by-word gloss.
- **Transliteration** — Hebrew selections get a nikud-based transliteration
  (word-by-word for sentences).
- **Pronunciation** — 🔊 buttons speak words and sentences out loud using your
  system's voices (Hebrew and English).
- **Letters** — select a single Hebrew letter to see its name, sound, numeric
  value (gematria) and final form.
- Built-in Help (<kbd>F1</kbd> or the ? button) lists every shortcut and tip.
- Hover lookup can be toggled off from the toolbar while you type.

**Toolbar**

- A compact ribbon: New / Open / Save and **Explain** stay visible, while the
  rest is grouped into three tabs — **Home** (text formatting), **Page**
  (page size, page breaks, printing) and **Tools** (hover lookup, paste style,
  theme, help). The tab you last used is remembered.

**Formatting**

- Bold, italic, underline, highlight, headings, quotes, ordered and unordered
  lists, alignment.
- Font family picker with a dedicated Hebrew group (David, Frank Ruehl, SBL
  Hebrew, Noto Sans Hebrew, Aharoni) alongside general families.
- Font sizes from a preset list (8–144 px) — or type any size from 4 to 400 px
  straight into the size box. **A▲ / A▼** (and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>
  +<kbd>&gt;</kbd> / <kbd>&lt;</kbd>) grow and shrink the selection a step at a
  time. The toolbar syncs to show the font and size under the cursor.
- Font and size apply to **the whole selection** — a word, a paragraph, several
  paragraphs or the entire document (<kbd>Ctrl</kbd>+<kbd>A</kbd>). With nothing
  selected, the choice applies to the next text you type.
- **Clear formatting** (<kbd>Ctrl</kbd>+<kbd>\\</kbd>) strips fonts, sizes,
  colours and bold/italic from the selection, leaving the text and its
  paragraph style intact.

**Pages**

- The document flows onto as many pages as it needs, drawn as real sheets with
  A4 or Letter geometry — or switch to **Continuous** for one endless page.
- **Page break** (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>) starts a new page; pressing
  it again on the same line removes the break. Breaks are saved with the
  document.
- The status bar shows which page the cursor is on, out of how many.
- **Print / PDF** button on the Page tab (or <kbd>Ctrl</kbd>+<kbd>P</kbd>)
  honours the same page breaks, so what you print matches what you see — and
  always prints on white paper with dark text, even in dark mode.
- Phones and narrow windows switch to continuous automatically.

**Pasting**

- Choose what happens to formatting when you paste, from the toolbar:
  **keep formatting**, **match document** (structure only — bold, italics,
  headings and lists, but the document's own fonts and colours), or
  **text only**.
- <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> always pastes plain text; the
  desktop app also has Edit → Paste Special.
- A small bar appears right after a paste so you can switch style without
  pasting again.
- Pasted markup is sanitised — scripts, styles, event handlers, remote objects
  and editor junk (`class="MsoNormal"` and friends) never reach the document.

**Appearance**

- Light and dark themes with a one-click toggle. Your choice is remembered
  between sessions; first launch follows your system preference.

**Files & session**

- Open and save documents as formatted HTML or plain text.
- Your session survives restarts: the document, the file it belongs to,
  unsaved edits and settings are all restored on launch.
  - Desktop: Save writes straight back to the original file; window size and
    position are remembered too.
  - Web: file access is remembered via the File System Access API — the
    browser re-confirms permission once, then Save writes back to the same
    file on disk (Chrome/Edge; other browsers fall back to download).

---

## Install (desktop app)

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/corilo/Scribe.git
cd Scribe
npm install
npm start
```

## Web version

The same editor also runs in the browser — no backend needed (all dictionary
APIs are CORS-friendly). Files open and save through the browser's file
pickers (File System Access API on Chrome/Edge, download/upload fallback
elsewhere).

Works on phones and tablets too: the layout is responsive (scrollable
toolbar, bottom-sheet Explain panel), and on touch screens hover lookup
becomes **tap lookup** — tap any word for its definition, long-press to
select and Explain.

```bash
npm run build:web   # outputs a static site to dist/
```

Deploy `dist/` to any static host:

- **Cloudflare Pages** (recommended) — connect the GitHub repo at
  [pages.cloudflare.com](https://pages.cloudflare.com), set the build command
  to `node build-web.js` and the output directory to `dist`. Every push to
  `main` redeploys automatically.
- **GitHub Pages** — `npx wrangler` not needed; simply publish the `dist`
  folder (e.g. with `gh-pages` or an Actions workflow).
- **Netlify / Vercel** — same settings: build `node build-web.js`, output `dist`.

---

## Keyboard shortcuts

| Keys | Action |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>N</kbd> | New document |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | Open |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | Save |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> | Save As |
| <kbd>Ctrl</kbd>+<kbd>E</kbd> | Explain selection |
| <kbd>Ctrl</kbd>+<kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd> | Bold / Italic / Underline |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>&gt;</kbd> / <kbd>&lt;</kbd> | Increase / decrease font size |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> | Insert / remove a page break |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | Paste as plain text |
| <kbd>Ctrl</kbd>+<kbd>\\</kbd> | Clear formatting of the selection |
| <kbd>Ctrl</kbd>+<kbd>P</kbd> | Print / export as PDF |
| <kbd>Shift</kbd> + hover | Translate the sentence under the cursor |
| <kbd>F1</kbd> | Help — shortcuts & tips |

---

## Dictionary sources

**Offline** — a built-in dictionary of ~120 common Hebrew words (Biblical and
Modern) with roots, transliteration and etymology notes, plus common English
words. Works with no internet connection.

**Online** — results are fetched on demand and cached per session:

| Source | Used for |
|---|---|
| [Sefaria](https://www.sefaria.org) lexicon API | Klein, BDB, BDB Augmented Strong, Jastrow |
| [Free Dictionary API](https://dictionaryapi.dev) | English definitions, examples, synonyms |
| [Wiktionary](https://en.wiktionary.org) | English etymology |
| [MyMemory](https://mymemory.translated.net) | Hebrew ↔ English translation |

---

## Project structure

```
Scribe/
├── main.js              Electron main process, window and native menus
├── preload.js           Secure IPC bridge for file operations
├── build-web.js         Builds the static web version into dist/
├── web/
│   └── web-shim.js      Browser fileAPI (replaces the Electron preload)
└── renderer/            Shared by the desktop and web apps
    ├── index.html       Toolbar, editor, side panel, status bar
    ├── styles.css       Themeable styling (light/dark CSS variables)
    ├── app.js           Editor logic, toolbar, hover, files, session restore
    ├── format.js        Selection-wide font/size/style engine, clear formatting
    ├── pages.js         Page layout: sheets, automatic and manual page breaks
    ├── paste.js         Clipboard sanitising and the three paste styles
    ├── dictionary.js    Built-in offline Hebrew/English dictionary
    └── lookup.js        Online lexicon, translation and etymology clients
```

---

## Attributions

Klein Dictionary (E. Klein, Carta 1987), Brown-Driver-Briggs (1906) and Jastrow
(1903) are accessed via the Sefaria API. English definitions come from
Wiktionary via the Free Dictionary API. Translations are provided by MyMemory.
Each result in the Explain panel carries its own attribution line.

## License

[MIT](LICENSE) © Yuri Corilo
