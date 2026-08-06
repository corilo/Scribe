/* Scribe web shim — browser replacement for the Electron preload fileAPI.
   Uses the File System Access API where available (Chrome/Edge), with a
   classic download/upload fallback (Firefox/Safari). Loaded only in the
   web build, before app.js. */
(function () {
  'use strict';
  if (window.fileAPI) return; // running inside Electron — keep the real one

  let handle = null;      // FileSystemFileHandle of the current document
  let handleName = null;  // its file name (what app.js knows as filePath)

  const HTML_TYPES = [{
    description: 'Scribe Document (HTML)',
    accept: { 'text/html': ['.html', '.htm'] }
  }, {
    description: 'Plain text',
    accept: { 'text/plain': ['.txt'] }
  }];

  const hasFS = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

  /* File handles survive reloads via IndexedDB, so "Save" can write back to
     the same file in the next session (browser re-asks permission once). */
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('scribe-files', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('handles');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function putHandle(name, h) {
    try {
      const db = await idb();
      db.transaction('handles', 'readwrite').objectStore('handles').put(h, name);
    } catch (e) {}
  }
  async function getHandle(name) {
    try {
      const db = await idb();
      return await new Promise(res => {
        const rq = db.transaction('handles').objectStore('handles').get(name);
        rq.onsuccess = () => res(rq.result || null);
        rq.onerror = () => res(null);
      });
    } catch (e) { return null; }
  }

  async function pickerOpen() {
    try {
      const [h] = await window.showOpenFilePicker({ types: HTML_TYPES });
      const file = await h.getFile();
      handle = h; handleName = file.name;
      putHandle(file.name, h);
      return { filePath: file.name, content: await file.text() };
    } catch (e) {
      if (e && e.name === 'AbortError') return null; // user cancelled
      throw e;
    }
  }

  function inputOpen() {
    return new Promise(resolve => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.html,.htm,.txt';
      inp.onchange = async () => {
        const f = inp.files && inp.files[0];
        if (!f) return resolve(null);
        handle = null; handleName = f.name;
        resolve({ filePath: f.name, content: await f.text() });
      };
      inp.oncancel = () => resolve(null);
      inp.click();
    });
  }

  async function writeHandle(h, content) {
    const w = await h.createWritable();
    await w.write(content);
    await w.close();
  }

  function download(content, name) {
    const type = /\.txt$/i.test(name) ? 'text/plain' : 'text/html';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  async function pickerSaveAs(content, defaultName) {
    try {
      const h = await window.showSaveFilePicker({
        suggestedName: defaultName || 'document.html',
        types: HTML_TYPES
      });
      await writeHandle(h, content);
      handle = h; handleName = h.name;
      putHandle(h.name, h);
      return { filePath: h.name };
    } catch (e) {
      if (e && e.name === 'AbortError') return null;
      throw e;
    }
  }

  window.fileAPI = {
    open: () => (hasFS ? pickerOpen() : inputOpen()),

    save: async (filePath, content) => {
      if (hasFS && filePath) {
        // Recover the handle from a previous session if we lost it to a reload
        if (!handle || filePath !== handleName) {
          const h = await getHandle(filePath);
          if (h) { handle = h; handleName = filePath; }
        }
        if (handle && filePath === handleName) {
          try {
            if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
              await writeHandle(handle, content);
              return { filePath: handleName };
            }
          } catch (e) { /* fall through to Save As */ }
        }
      }
      if (hasFS) return pickerSaveAs(content, filePath || 'document.html');
      download(content, filePath || 'document.html');
      return { filePath: filePath || 'document.html' };
    },

    saveAs: async (content, defaultName) => {
      if (hasFS) return pickerSaveAs(content, defaultName);
      download(content, defaultName || 'document.html');
      return { filePath: defaultName || 'document.html' };
    },

    // In Electron these come from the native menu; on the web we map the
    // same keyboard shortcuts ourselves.
    onMenu: (cb) => {
      document.addEventListener('keydown', e => {
        if (e.key === 'F1') { e.preventDefault(); cb('help'); return; }
        if (!(e.ctrlKey || e.metaKey)) return;
        const k = e.key.toLowerCase();
        let action = null;
        if (k === 'n') action = 'new';
        else if (k === 'o') action = 'open';
        else if (k === 's') action = e.shiftKey ? 'saveAs' : 'save';
        else if (k === 'e') action = 'explain';
        if (action) { e.preventDefault(); cb(action); }
      });
    }
  };

  // Warn before leaving with unsaved changes (the desktop app confirms via dialog)
  window.addEventListener('beforeunload', e => {
    const dirty = document.getElementById('st-dirty');
    if (dirty && dirty.textContent) { e.preventDefault(); e.returnValue = ''; }
  });
})();
