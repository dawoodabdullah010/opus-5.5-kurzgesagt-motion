// usage (from the film folder): PLAYWRIGHT_DIR=... node camfull.mjs out/cams.json   -> window.CAM for every frame, for camcheck.py
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const req = createRequire(path.join(process.env.PLAYWRIGHT_DIR, 'noop.js')); const { chromium } = req('playwright');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.resolve('index.html')); await p.waitForFunction(() => window.ready === true);
const cams = await p.evaluate(() => { const o = []; for (let f = 0; f <= window.LAST_FRAME; f++) { window.seekFrame(f); o.push(window.CAM.slice()); } return o; });
fs.writeFileSync(process.argv[2] || 'out/cams.json', JSON.stringify(cams));
await b.close();
