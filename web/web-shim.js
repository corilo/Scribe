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

  async function pickerOpen() {
    try {
      const [h] = await window.showOpenFilePicker({ types: HTML_TYPES });
      const file = await h.getFile();
      handle = h; handleName = file.name;
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
      return { filePath: h.name };
    } catch (e) {
      if (e && e.name === 'AbortError') return null;
      throw e;
    }
  }

  window.fileAPI = {
    open: () => (hasFS ? pickerOpen() : inputOpen()),

    save: async (filePath, content) => {
      // Re-save to the opened file when we still hold its handle
      if (hasFS && handle && filePath === handleName) {
        await writeHandle(handle, content);
        return { filePath: handleName };
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
