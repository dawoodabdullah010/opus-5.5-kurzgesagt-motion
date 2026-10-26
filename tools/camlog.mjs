// Camera zoom change per frame for frame ranges, straight from the film code (each shot sets window.CAM = [cx, cy, z]).
// usage (from the film folder): node camlog.mjs 372-381 787-795 ...   env: PLAYWRIGHT_DIR (optional)
import { createRequire } from 'node:module'; import path from 'node:path';
const req = createRequire(path.join(path.resolve(process.env.PLAYWRIGHT_DIR || process.cwd()), 'noop.js'));
let chromium; try { ({ chromium } = req('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.resolve('index.html')); await p.waitForFunction(() => window.ready === true);
for (const rg of process.argv.slice(2)) {
  const [a, z1] = rg.split('-').map(Number); const out = [];
  let prev = null;
  for (let f = a - 1; f <= z1; f++) {
    const c = await p.evaluate(F => { window.seekFrame(F); return window.CAM; }, f);
    if (prev) out.push(`${f}:${((c[2] / prev[2] - 1) * 100).toFixed(1)}%`);
    prev = c;
  }
  console.log(rg, out.join(' '));
}
await b.close();
