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
}

/* ---------------- Application menu ---------------- */
function sendMenu(action) {
  if (win && !win.isDestroyed()) win.webContents.send('menu', action);
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
  return { filePath, content };
});

ipcMain.handle('file:save', async (_e, { filePath, content }) => {
  let target = filePath;
  if (!target) {
    const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
      filters: FILE_FILTERS,
      defaultPath: 'document.html'
    });
    if (canceled) return null;
    target = chosen;
  }
  fs.writeFileSync(target, content, 'utf-8');
  return { filePath: target };
});

ipcMain.handle('file:saveAs', async (_e, { content, defaultName }) => {
  const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
    filters: FILE_FILTERS,
    defaultPath: defaultName || 'document.html'
  });
  if (canceled) return null;
  fs.writeFileSync(chosen, content, 'utf-8');
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
