/* Builds the deployable web version of Scribe into dist/.
   The renderer is shared between Electron and the web; the only difference
   is web/web-shim.js, injected before app.js to replace the Electron
   preload fileAPI with browser file pickers.

   Usage: node build-web.js   (or: npm run build:web)                    */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Best-effort clean; fall back to overwriting if deletion isn't permitted
try { fs.rmSync(DIST, { recursive: true, force: true }); } catch (e) {}
fs.mkdirSync(DIST, { recursive: true });

// 1. Copy every renderer file
for (const f of fs.readdirSync(path.join(ROOT, 'renderer'))) {
  fs.copyFileSync(path.join(ROOT, 'renderer', f), path.join(DIST, f));
}

// 2. Add the browser shim
fs.copyFileSync(path.join(ROOT, 'web', 'web-shim.js'), path.join(DIST, 'web-shim.js'));

// 3. Inject the shim script before app.js
const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('web-shim.js')) {
  html = html.replace(
    '<script src="app.js"></script>',
    '<script src="web-shim.js"></script>\n  <script src="app.js"></script>'
  );
}
fs.writeFileSync(indexPath, html);

const files = fs.readdirSync(DIST);
console.log('Built dist/ (' + files.length + ' files): ' + files.join(', '));
