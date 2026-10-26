// Render a seek(F) film page to PNG frames with Playwright + headless Chromium.
// usage (from the film folder):
//   node render.mjs full [F0] [F1]     -> frames/fNNNN.png (default 0..window.LAST_FRAME)
//   node render.mjs stills 60,300,900  -> out/stills/fNNNN.png
// env: WORKERS (parallel browsers, default 4), PLAYWRIGHT_DIR (a folder whose node_modules holds playwright; default: resolve normally)
// The page contract: window.FPS, window.LAST_FRAME, window.seekFrame(F) draws frame F as a pure function of F, window.ready = true when fonts are loaded.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const req = createRequire(path.join(path.resolve(process.env.PLAYWRIGHT_DIR || process.cwd()), 'noop.js'));
let chromium;
try { ({ chromium } = req('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }

const [mode = 'full', a, b] = process.argv.slice(2);
const page0 = 'file://' + path.resolve('index.html');
const open = async () => {
  const br = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto(page0); await p.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  return [br, p];
};
const [b0, p0] = await open();
const last = await p0.evaluate(() => window.LAST_FRAME);
let list, dir;
if (mode === 'stills') { list = a.split(',').map(Number); dir = 'out/stills'; }
else { const f0 = a ? +a : 0, f1 = b ? +b : last; list = Array.from({ length: f1 - f0 + 1 }, (_, i) => f0 + i); dir = 'frames'; }
fs.mkdirSync(dir, { recursive: true });
const NW = Math.max(1, Math.min(+(process.env.WORKERS || 4), list.length));
const chunks = Array.from({ length: NW }, (_, i) => list.slice(Math.floor(i * list.length / NW), Math.floor((i + 1) * list.length / NW)));
const pool = [[b0, p0], ...(await Promise.all(chunks.slice(1).map(() => open())))];
const t0 = Date.now();
await Promise.all(chunks.map(async (chunk, w) => {
  const p = pool[w][1];
  for (const F of chunk) {
    const ok = await p.evaluate(F => { try { window.seekFrame(F); return null; } catch (e) { return String(e); } }, F);
    if (ok) { console.error(`frame ${F}: ${ok}`); process.exitCode = 1; continue; }          // never leave a silent gap
    await p.locator('canvas').first().screenshot({ path: `${dir}/f${String(F).padStart(4, '0')}.png` });
  }
}));
for (const [br] of pool) await br.close();
const n = fs.readdirSync(dir).filter(f => /^f\d+\.png$/.test(f)).length;
console.log(`rendered ${list.length} frame(s) -> ${dir} in ${((Date.now() - t0) / 1000).toFixed(1)} s (${n} frames in the folder)`);
