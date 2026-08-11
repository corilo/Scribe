const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let win;

/* Remember window size/position between runs */
const boundsFile = () => path.join(app.getPath('userData'), 'window-bounds.json');
function loadBounds() {
  try { return JSON.parse(fs.readFileSync(boundsFile(), 'utf-8')); } catch (e) { return {}; }
}
function saveBounds() {
  if (!win || win.isDestroyed()) return;
  try {
    fs.writeFileSync(boundsFile(), JSON.stringify({
      ...win.getNormalBounds(), maximized: win.isMaximized()
    }));
  } catch (e) {}
}

/* ---------------- Recently opened files ---------------- */
const MAX_RECENTS = 10;
const recentsFile = () => path.join(app.getPath('userData'), 'recent-files.json');
function loadRecents() {
  try {
    const r = JSON.parse(fs.readFileSync(recentsFile(), 'utf-8'));
    return Array.isArray(r) ? r.filter(p => typeof p === 'string') : [];
  } catch (e) { return []; }
}
function saveRecents(list) {
  try { fs.writeFileSync(recentsFile(), JSON.stringify(list.slice(0, MAX_RECENTS))); } catch (e) {}
}
function addRecent(filePath) {
  if (!filePath) return;
  const list = loadRecents().filter(p => p !== filePath);
  list.unshift(filePath);
  saveRecents(list);
  try { app.addRecentDocument(filePath); } catch (e) {}
  buildMenu(); // refresh Open Recent submenu
}
function removeRecent(filePath) {
  saveRecents(loadRecents().filter(p => p !== filePath));
  buildMenu();
}

function createWindow() {
  const b = loadBounds();
  win = new BrowserWindow({
    width: b.width || 1440,
    height: b.height || 920,
    ...(Number.isFinite(b.x) && Number.isFinite(b.y) ? { x: b.x, y: b.y } : {}),
    title: 'Scribe — English/Hebrew Word Processor',
    icon: path.join(__dirname, 'renderer', 'icon.png'),
    backgroundColor: '#f2efe9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (b.maximized) win.maximize();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('close', saveBounds);

  /* Right-click context menu (editor and panels) */
  win.webContents.on('context-menu', (_e, params) => {
    const items = [];
    const selText = (params.selectionText || '').trim();
    if (selText) {
      const label = selText.length > 28 ? selText.slice(0, 28) + '…' : selText;
      items.push(
        { label: 'Explain "' + label + '"', accelerator: 'CmdOrCtrl+E', click: () => sendMenu('explain') },
        { type: 'separator' }
      );
    }
    if (params.isEditable) {
      items.push(
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut', enabled: !!selText },
        { role: 'copy', enabled: !!selText },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle', label: 'Paste as Plain Text' },
        { role: 'delete', enabled: !!selText },
        { type: 'separator' },
        { role: 'selectAll' }
      );
    } else if (selText) {
      items.push({ role: 'copy' });
    }
    if (items.length) Menu.buildFromTemplate(items).popup({ window: win });
  });
}

/* ---------------- Application menu ---------------- */
function sendMenu(action, payload) {
  if (win && !win.isDestroyed()) win.webContents.send('menu', action, payload);
}

function recentsSubmenu() {
  const recents = loadRecents();
  const items = recents.map((p, i) => ({
    label: (i < 9 ? '&' + (i + 1) + '  ' : '') + (p.length > 60 ? '…' + p.slice(-58) : p),
    click: () => sendMenu('openRecent', p)
  }));
  return [
    ...(items.length ? items : [{ label: 'No Recent Files', enabled: false }]),
    { type: 'separator' },
    { label: 'Clear Recently Opened', enabled: !!items.length, click: () => { saveRecents([]); buildMenu(); } }
  ];
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => sendMenu('new') },
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => sendMenu('open') },
        { label: 'Open Recent', submenu: recentsSubmenu() },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendMenu('save') },
        { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => sendMenu('saveAs') },
        { type: 'separator' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        ...(isMac ? [] : [{ label: 'Exit', role: 'quit' }])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Explain Selection', accelerator: 'CmdOrCtrl+E', click: () => sendMenu('explain') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'reload' }, { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Shortcuts && Tips', accelerator: 'F1', click: () => sendMenu('help') },
        { type: 'separator' },
        {
          label: 'About Scribe',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'About Scribe',
              message: 'Scribe ' + app.getVersion(),
              detail: 'Bilingual English/Hebrew word processor with hover definitions, root analysis and etymology.\n\nDictionary sources: Klein, BDB, Jastrow (via Sefaria), Wiktionary, MyMemory.'
            });
          }
        },
        {
          label: 'Sefaria (dictionary source)',
          click: () => shell.openExternal('https://www.sefaria.org')
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const FILE_FILTERS = [
  { name: 'Scribe Document (HTML)', extensions: ['html', 'htm'] },
  { name: 'Plain Text', extensions: ['txt'] },
  { name: 'All Files', extensions: ['*'] }
];

ipcMain.handle('file:open', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: FILE_FILTERS
  });
  if (canceled || !filePaths.length) return null;
  const filePath = filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  addRecent(filePath);
  return { filePath, content };
});

/* Open a specific path (Open Recent). Removes dead entries. */
ipcMain.handle('file:openPath', async (_e, { filePath }) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    addRecent(filePath);
    return { filePath, content };
  } catch (err) {
    removeRecent(filePath);
    dialog.showMessageBox(win, {
      type: 'warning',
      title: 'File not found',
      message: 'Could not open the file.',
      detail: filePath + '\n\nIt may have been moved or deleted. It was removed from the recent files list.'
    });
    return null;
  }
});

/* Save. If the remembered path (e.g. restored from the last session's cache)
   can no longer be written — moved, deleted, drive gone — fall back to a
   Save As dialog instead of failing. */
ipcMain.handle('file:save', async (_e, { filePath, content }) => {
  if (filePath) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      addRecent(filePath);
      return { filePath };
    } catch (err) { /* fall through to Save As */ }
  }
  const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
    filters: FILE_FILTERS,
    defaultPath: filePath || 'document.html'
  });
  if (canceled) return null;
  fs.writeFileSync(chosen, content, 'utf-8');
  addRecent(chosen);
  return { filePath: chosen };
});

ipcMain.handle('file:saveAs', async (_e, { content, defaultName }) => {
  const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
    filters: FILE_FILTERS,
    defaultPath: defaultName || 'document.html'
  });
  if (canceled) return null;
  fs.writeFileSync(chosen, content, 'utf-8');
  addRecent(chosen);
  return { filePath: chosen };
});

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
