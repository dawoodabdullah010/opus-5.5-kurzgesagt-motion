// The Toledo War, in the measured OverSimplified style. Every frame is a pure function of t. Helpers come from lib.js.
// Style rules (MEASURED from two OverSimplified clips, see STYLE.md): hard cuts every 4-7 s, the picture holds still
// most of the time, moves are quick (about 0.25 s) then hold, speech text pops on whole in one frame, no easing bounce.
(() => {
const B = window.B, GEO = window.GEO;
const OH = '#e2262b', MI = '#2f6fd6', LAND = '#e9e1cc', CAN = '#d9cfb6', SEA = '#0f1f47', INK = '#141414';
const HAND = '"Short Stack"', CAPS = 'Oswald', BIG = 'Anton', SERIF = '"Libre Baskerville"';

// ---------- shapes from the map data ----------
const ringsPath = R => { c.beginPath(); for (const r of R) { r.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } };
const fillR = (R, col) => { ringsPath(R); c.fillStyle = col; c.fill(); };
const strokeR = (R, col, w) => { ringsPath(R); c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.stroke(); };
const bounds = R => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of R) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
const MITTEN = GEO.michLP, OHIO = GEO.ohio, UP = GEO.michUP, STRIP = GEO.strip;

const ln = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };   // a polyline of [x, y] points

// ---------- type ----------
function txt(s, x, y, size, font, col, align = 'center', base = 'middle') {
  const m = font.match(/^(\d+)\s+(.*)$/); c.font = m ? `${m[1]} ${size}px ${m[2]}` : `${size}px ${font}`; c.textAlign = align; c.textBaseline = base; c.fillStyle = col; c.letterSpacing = '0px'; c.fillText(s, x, y);
}
// speech: lowercase hand lettering, whole line pops on in one frame, a short tick points at the speaker (MEASURED)
function say(s, x, y, tx, ty, t0, t, col = INK, size = 44) {
  if (t < t0) return;
  txt(s, x, y, size, HAND, col);
  const a = Math.atan2(ty - y, tx - x), x0 = x + Math.cos(a) * size * .3, y0 = y + size * .6;   // the tick starts under the line, never through a letter
  ln([[x0, y0], [x0 + Math.cos(a) * 26, y0 + Math.sin(a) * 26]], 3, col);
}
// a caps label with a tick toward what it names (OverSimplified's map and object labels)
function tag(s, x, y, tx, ty, t0, t, col = INK, size = 40) {
  if (t < t0) return;
  txt(s, x, y, size, `700 ${CAPS}`, col);
  if (tx !== null) {
    const a = Math.atan2(ty - y, tx - x), r0 = size * .7, len = clamp(Math.hypot(tx - x, ty - y) - r0 - 10, 20, 400);   // ends on what it names
    ln([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * (r0 + len), y + Math.sin(a) * (r0 + len)]], 4, col);
  }
}

// ---------- backgrounds ----------
let seaTex = null;
function seaTexture() {                                           // a fixed noisy dark sea, like his satellite maps (drawn once)
  if (seaTex) return seaTex;
  seaTex = document.createElement('canvas'); seaTex.width = W; seaTex.height = H;
  const g = seaTex.getContext('2d'); g.fillStyle = SEA; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${hash(i) > .5 ? '40,70,130' : '5,12,30'},${.25 + hash(i + 3) * .25})`; g.fillRect(hash(i + 1) * W, hash(i + 2) * H, 2 + hash(i + 4) * 5, 2 + hash(i + 5) * 5); }
  return seaTex;
}
function greyBg() {                                               // light grey vignette stage (MEASURED: emu 2:04-2:14)
  scr(); const g = c.createRadialGradient(W / 2, H * .45, 100, W / 2, H / 2, W * .65);
  g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c9c9c9'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function whiteBg() { scr(); c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); }

// ---------- characters ----------
// a state as a character: its real outline, black stick limbs, a face (MEASURED: emu 2:04-2:23, countries with stick limbs)
function stateChar(R, col, x, y, h, o = {}, t = 0) {
  const b = bounds(R), s = h / b.h, w = b.w * s, lw = Math.max(5, h * .022);
  const sh = o.shiver ? Math.sin(t * 70) * 3 : 0;
  c.save(); c.translate(x + sh, y);
  const legL = h * .3;
  // legs and feet
  for (const k of [-1, 1]) { ln([[k * w * .14, -h * .06], [k * w * .17, legL]], lw, INK); ln([[k * w * .17, legL], [k * w * .17 + k * h * .07, legL]], lw, INK); }
  const shL = [-w * .36, -h * .5], shR = [w * .36, -h * .5];      // shoulders, inside the body
  const arm = (sh0, pose, k) => {
    const [sx, sy] = sh0;
    if (pose === 'down') ln([[sx, sy], [sx + k * h * .16, sy + h * .34]], lw, INK);
    else if (pose === 'up') ln([[sx, sy], [sx + k * h * .2, sy - h * .14], [sx + k * h * .22, sy - h * .34]], lw, INK);
    else if (pose === 'hips') ln([[sx, sy], [sx + k * h * .2, sy + h * .08], [sx + k * h * .06, sy + h * .2]], lw, INK);
    else if (Array.isArray(pose)) ln([[sx, sy], [pose[0], pose[1]]], lw, INK);   // reach to a point (local)
  };
  if (o.arms !== 'cross') { arm(shL, (o.armL || o.arms || 'down'), -1); arm(shR, (o.armR || o.arms || 'down'), 1); }
  // body
  c.save(); c.translate(-b.cx * s, -b.y1 * s + h * .02); c.scale(s, s); fillR(R, col); c.restore();
  if (o.arms === 'cross') { ln([[-w * .3, -h * .22], [w * .2, -h * .12]], lw, INK); ln([[w * .3, -h * .22], [-w * .2, -h * .12]], lw, INK); }   // folded low, well below the mouth
  // face
  const fx = (o.fx || 0) * w, fy = -h * (o.fy || .62), er = h * .045;
  const eyes = o.eyes || 'dots';
  for (const k of [-1, 1]) {
    const ex = fx + k * h * .07, ey = fy;
    if (eyes === 'dots') { if (((t + (o.seed || 0)) % 2.7) < 4 / 60) ln([[ex - lw * .8, ey], [ex + lw * .8, ey]], lw * .5, INK); else circle(ex, ey, lw * .55, INK); }
    else if (eyes === 'angry') ln([[ex - k * er, ey - er * .9], [ex + k * er * .2, ey], [ex - k * er, ey + er * .9]].map(([a, bb]) => [a, bb]), lw * .7, INK);
    else if (eyes === 'wide') { circle(ex, ey, er * 1.25, '#fff'); circle(ex, ey, er * 1.25 - 0, '#fff'); c.strokeStyle = INK; c.lineWidth = lw * .5; c.beginPath(); c.arc(ex, ey, er * 1.25, 0, TAU); c.stroke(); circle(ex + (o.look || 0) * er * .5, ey, er * .5, INK); }
    else if (eyes === 'happy') { c.strokeStyle = INK; c.lineWidth = lw * .7; c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey + er * .4, er * .8, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
  }
  const my = fy + h * .11, mw = h * .08, mouth = o.mouth || 'flat';
  c.strokeStyle = INK; c.lineWidth = lw * .75; c.lineCap = 'round'; c.beginPath();
  if (mouth === 'flat') { c.moveTo(fx - mw, my); c.lineTo(fx + mw, my); }
  else if (mouth === 'frown') c.arc(fx, my + mw * .9, mw, Math.PI * 1.2, Math.PI * 1.8);
  else if (mouth === 'smile') c.arc(fx, my - mw * .6, mw, Math.PI * .2, Math.PI * .8);
  else if (mouth === 'wavy') { for (let i = 0; i <= 8; i++) { const xx = fx - mw + i * mw / 4, yy = my + (i % 2 ? 4 : -4); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } }
  c.stroke();
  if (mouth === 'open') ell(fx, my, mw * .5, mw * .6, 0, INK);
  c.restore();
  return { s, w, h, bx: b.cx, by1: b.y1 };
}
// the generic OverSimplified person: a white tube body, round head, ". ." or "> <" eyes, a curved arm line (MEASURED: football 0:58-1:11)
function bean(x, y, s, o = {}) {
  const lw = 2.6 * s, bw = 34 * s, bh = 58 * s, hr = 19 * s;
  c.save(); c.translate(x, y);
  if (o.gun !== undefined) {                                      // musket, held at an angle (0 = level, pointing o.dir)
    const d = o.dir || 1, a = o.gun;
    c.save(); c.translate(d * bw * .2, -bh * .55); c.rotate(d > 0 ? -a : Math.PI + a);
    rr(0, -4 * s, 78 * s, 8 * s, 3 * s, '#7a4a22'); rr(40 * s, -2.6 * s, 52 * s, 5.2 * s, 2 * s, '#2b2b2b'); c.restore();
  }
  c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = lw; c.beginPath(); c.roundRect(-bw / 2, -bh, bw, bh, 6 * s); c.fill(); c.stroke();
  c.beginPath(); c.arc(0, -bh - hr * .55, hr, 0, TAU); c.fill(); c.stroke();
  const hy = -bh - hr * .55, d = o.dir || 1;
  if (o.eyes === 'angry') { for (const k of [-1, 1]) ln([[d * 4 * s + k * 9 * s - k * 4 * s, hy - 4 * s], [d * 4 * s + k * 9 * s + k * 2 * s, hy], [d * 4 * s + k * 9 * s - k * 4 * s, hy + 4 * s]], 2.2 * s, INK); }
  else if (o.eyes === 'wide') { for (const k of [-1, 1]) { circle(d * 4 * s + k * 7 * s, hy, 5 * s, '#fff'); c.lineWidth = 1.6 * s; c.beginPath(); c.arc(d * 4 * s + k * 7 * s, hy, 5 * s, 0, TAU); c.stroke(); circle(d * 5 * s + k * 7 * s, hy, 2 * s, INK); } }
  else for (const k of [-1, 1]) circle(d * 4 * s + k * 7 * s, hy, 2.3 * s, INK);
  c.lineWidth = lw; c.beginPath(); c.arc(-d * 2 * s, -bh * .45, bh * .26, d > 0 ? Math.PI * .65 : Math.PI * .05, d > 0 ? Math.PI * .95 : Math.PI * .35); c.stroke();   // the "(" arm
  if (o.hat) { rr(-hr * .85, hy - hr * 1.15, hr * 1.7, hr * .62, 4 * s, o.hat); rr(-hr * .95 + d * 4 * s, hy - hr * .6, hr * 1.25, hr * .2, 2 * s, INK); }
  if (o.tripod) { ln([[d * 30 * s, -bh * .7], [d * 18 * s, 0]], 2.4 * s, '#6b4a2a'); ln([[d * 30 * s, -bh * .7], [d * 42 * s, 0]], 2.4 * s, '#6b4a2a'); rr(d * 30 * s - 8 * s, -bh * .7 - 9 * s, 16 * s, 9 * s, 2 * s, '#c9a227'); }
  c.restore();
}
// a stick figure for a named person (MEASURED: football 0:54-1:15, thin black limbs, round head)
function stick(x, y, s, o = {}) {
  const lw = 7.5 * s, d = o.dir || 1;
  c.save(); c.translate(x, y);
  ln([[0, -70 * s], [0, -150 * s]], lw, INK);                               // body
  ln([[0, -70 * s], [-18 * s, 0]], lw, INK); ln([[0, -70 * s], [18 * s, 0]], lw, INK);   // legs
  const al = o.armL || [-24 * s, -88 * s], ar = o.armR || [24 * s, -88 * s];
  ln([[0, -140 * s], al], lw, INK); ln([[0, -140 * s], ar], lw, INK);
  c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = lw * .7; c.beginPath(); c.arc(0, -178 * s, 30 * s, 0, TAU); c.fill(); c.stroke();
  const hy = -178 * s;
  if (o.eyes === 'angry') for (const k of [-1, 1]) ln([[d * 5 * s + k * 12 * s - k * 5 * s, hy - 7 * s], [d * 5 * s + k * 12 * s + k * 3 * s, hy - 2 * s], [d * 5 * s + k * 12 * s - k * 5 * s, hy + 3 * s]], 2.6 * s, INK);
  else if (o.eyes === 'shut') for (const k of [-1, 1]) ln([[d * 5 * s + k * 11 * s - 5 * s, hy - 2 * s], [d * 5 * s + k * 11 * s + 5 * s, hy - 2 * s]], 2.6 * s, INK);
  else for (const k of [-1, 1]) circle(d * 5 * s + k * 10 * s, hy - 3 * s, 3 * s, INK);
  c.lineWidth = 2.6 * s; c.beginPath();
  if (o.mouth === 'smile') c.arc(d * 5 * s, hy + 6 * s, 9 * s, Math.PI * .15, Math.PI * .85);
  else if (o.mouth === 'open') { c.ellipse(d * 5 * s, hy + 12 * s, 5 * s, 7 * s, 0, 0, TAU); c.fillStyle = INK; c.fill(); }
  else { c.moveTo(d * 5 * s - 8 * s, hy + 12 * s); c.lineTo(d * 5 * s + 8 * s, hy + 12 * s); }
  c.stroke();
  if (o.hat === 'top') { rr(-26 * s, hy - 74 * s, 52 * s, 50 * s, 3 * s, INK); rr(-38 * s, hy - 28 * s, 76 * s, 7 * s, 3 * s, INK); }
  if (o.hat === 'sheriff') { c.fillStyle = '#8a5a2b'; c.beginPath(); c.ellipse(0, hy - 24 * s, 46 * s, 9 * s, 0, 0, TAU); c.fill(); rr(-22 * s, hy - 52 * s, 44 * s, 30 * s, 10 * s, '#8a5a2b'); }
  if (o.badge) star(10 * s * d, -128 * s, 9 * s, '#e0b52a');
  if (o.bandage) { c.save(); c.translate(-10 * s * d, -112 * s); c.rotate(.5); rr(-14 * s, -5 * s, 28 * s, 10 * s, 3 * s, '#f4e2c4'); c.restore(); }
  c.restore();
}
function star(x, y, r, col) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; i ? c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : c.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
// a hanging sign that drops in and swings to rest (MEASURED: football 0:59 "1965 Election")
function banner(s, x, y, w, t0, t, size = 64, sub = null) {
  if (t < t0) return;
  const u = t - t0, drop = eo(clamp(u / .22)), ang = .1 * Math.exp(-5 * u) * Math.cos(u * 11) * clamp(u / .22);
  c.save(); c.translate(x, lerp(-220, y, drop)); c.rotate(ang);
  ln([[-w * .42, -300], [-w * .42, -40]], 4, '#555'); ln([[w * .42, -300], [w * .42, -40]], 4, '#555');
  rr(-w / 2, -50, w, 100 + (sub ? 46 : 0), 14, '#d7eef8'); c.strokeStyle = '#7aa3b8'; c.lineWidth = 4; c.beginPath(); c.roundRect(-w / 2, -50, w, 100 + (sub ? 46 : 0), 14); c.stroke();
  txt(s, 0, 2, size, `700 ${SERIF}`, '#1d2a33'); if (sub) txt(sub, 0, 64, 34, `700 ${SERIF}`, '#7a1f1f');
  c.restore();
}

// ---------- the map ----------
function mapLayer(o) {                                             // world units: 150 per degree of latitude
  const PAL = ['#f2c14e', '#7cc47f', '#f08a5d', '#6cc3d5', '#c5d86d', '#f4a259', '#9fd3a8', '#e9b872'];
  Object.entries(GEO.land).forEach(([n, R], i) => fillR(R, n === 'Ontario' || n === 'Québec' ? CAN : PAL[i % PAL.length]));
  fillR(OHIO, OH);
  fillR(MITTEN, MI); fillR(GEO.michUPeast, MI);
  fillR(GEO.michUPwest, o.upWest ? lerpCol(LAND, MI, o.upWest) : LAND);
  if (o.strip) fillR(STRIP, o.stripCol || '#ffd23f');
  const bw = 5 / o.z;
  for (const R of Object.values(GEO.land)) strokeR(R, '#fff', bw);
  strokeR(OHIO, '#fff', bw); strokeR(MITTEN, '#fff', bw); strokeR(UP, '#fff', bw); strokeR(GEO.michUPwest, '#fff', bw);
}
function lerpCol(a, b, k) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), Bc = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, Bc[i], k))).join(',')})`; }
const S = (wx, wy, cx, cy, z) => [W / 2 + (wx - cx) * z, H / 2 + (wy - cy) * z];

// ---------- shot 1: 1835, Ohio and Michigan go to war ----------
function shot1(t) {
  // his map push (MEASURED, Emu War 2:34): starts at the cut, +12-23 % over about 1 s, eases out, then holds
  const cx = -150, cy = 120, z = lz(.74, .86, eo(clamp(t / 1.2))); window.CAM = [cx, cy, z];
  scr(); c.drawImage(seaTexture(), 0, 0); cam(cx, cy, z); mapLayer({ z });
  // the two states are characters on the map: faces arrive on "war"
  const wk = t > B.war;
  scr();
  const fO = S(140, 470, cx, cy, z), fM = S(-60, 120, cx, cy, z);
  const face = (x, y, angry) => { for (const k of [-1, 1]) { if (angry) ln([[x + k * 30 - k * 14, y - 14], [x + k * 30 + k * 6, y], [x + k * 30 - k * 14, y + 14]], 8, INK); else circle(x + k * 28, y, 8, INK); } c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); if (angry) c.arc(x, y + 62, 30, Math.PI * 1.2, Math.PI * 1.8); else { c.moveTo(x - 24, y + 40); c.lineTo(x + 24, y + 40); } c.stroke(); };
  face(fO[0], fO[1], wk); face(fM[0], fM[1], wk);
  tag('OHIO', fO[0], fO[1] + 125, null, 0, 0, t, '#fff', 46);
  tag('MICHIGAN', fM[0] - 30, fM[1] + 122, null, 0, 0, t, '#fff', 46);
  txt('1835', 200, 150, 120, `700 ${SERIF}`, '#d81f26');
}

// ---------- shot 2: over this, a thin strip called Toledo; two surveys, two borders ----------
function shot2(t) {
  const cx = 10, cy = 330, z = lz(2.8, 3.2, eo(clamp((t - B.cut1) / 1.1))); window.CAM = [cx, cy, z];
  const on = t > B.thin - .05;
  const flash = on ? (Math.floor((t - B.thin) * 4) % 2 === 0 || t > B.toledo + .4 ? 1 : .55) : 0;   // blinks twice, then holds
  scr(); c.drawImage(seaTexture(), 0, 0); cam(cx, cy, z);
  mapLayer({ z, strip: on, stripCol: lerpCol(OH, '#ffd23f', flash) });
  // the two survey lines, drawn west to east (each in ~0.4 s), on "two" and "different"
  const line = (P, t0, col) => { if (t < t0) return; const k = eo(clamp((t - t0) / .4)); c.setLineDash([14 / z, 10 / z]); c.strokeStyle = col; c.lineWidth = 5 / z; c.beginPath(); c.moveTo(P[0][0] - 8, P[0][1]); c.lineTo(lerp(P[0][0], P[1][0] + 30, k), lerp(P[0][1], P[1][1], k)); c.stroke(); c.setLineDash([]); };
  line(GEO.harris, B.two, '#8b0000'); line(GEO.fulton, B.different - .3, '#0b2a6b');
  scr();
  const [sx, sy] = S(GEO.toledo[0] - 40, GEO.toledo[1], cx, cy, z);
  tag('TOLEDO STRIP', sx - 150, sy - 150, sx - 150, sy - 14, B.toledo - .05, t, '#fff', 56);
  if (t > B.two) { const [hx, hy] = S(GEO.harris[1][0] - 30, GEO.harris[1][1], cx, cy, z); tag("OHIO'S BORDER", hx + 40, hy - 240, hx - 30, hy - 6, B.two + .15, t, '#ffd0d0', 38); }   // the tick ends on the red line
  if (t > B.different - .3) { const [fx, fy] = S(GEO.fulton[0][0] + 60, GEO.fulton[0][1], cx, cy, z); tag("MICHIGAN'S BORDER", fx + 150, fy + 110, fx + 120, fy + 12, B.different - .15, t, '#cfe0ff', 38); }
  closeLabels(t, cx, cy, z);
}
function closeLabels(t, cx, cy, z) {                              // where we are: Michigan, Ohio, Lake Erie, the town of Toledo
  let [x, y] = S(-120, 200, cx, cy, z); tag('MICHIGAN', x, y, null, 0, 0, t, '#fff', 52);
  [x, y] = S(-60, 470, cx, cy, z); tag('OHIO', x, y, null, 0, 0, t, '#fff', 52);
  [x, y] = S(250, 300, cx, cy, z); txt('Lake Erie', x, y, 40, HAND, '#cfe0ff');
  [x, y] = S(GEO.toledo[0], GEO.toledo[1], cx, cy, z); circle(x, y, 9, INK); circle(x, y, 5, '#fff'); txt('Toledo', x + 30, y + 64, 36, HAND, '#fff');   // below both survey lines, inside Ohio
}

// ---------- shot 3: "it's ours" / "no, it's ours" ----------
function shot3(t) {
  window.CAM = [0, 0, 1]; greyBg();
  // the strip itself, as a prop between them (its real outline, scaled up); each claim yanks it ~40 px in 0.2 s
  const yank = 40 * eo(clamp((t - B.ours1) / .2)) - 80 * eo(clamp((t - B.ours2) / .2));
  const b = bounds(STRIP), s = 760 / b.w, px = W / 2 + yank + 2.5 * Math.sin(t * 37), py = 640 + 1.5 * Math.sin(t * 23);
  c.save(); c.translate(px, py); c.scale(s, s); c.translate(-b.cx, -b.cy); fillR(STRIP, '#ffd23f'); c.restore();
  txt('TOLEDO', px, py + 4, 40, `700 ${CAPS}`, '#5a4300');
  const lo = [px - 380, py], ro = [px + 380, py];
  stateChar(OHIO, OH, 390, 760, 330, { armR: [lo[0] - 390 + 10, lo[1] - 760 + 4], eyes: 'angry', mouth: t > B.ours1 && t < B.michSaid ? 'open' : 'frown', fx: .05 }, t);
  stateChar(MITTEN, MI, 1530, 760, 360, { seed: 1.3, armL: [ro[0] - 1530 - 10, ro[1] - 760 + 4], eyes: 'angry', mouth: t > B.no1 ? 'open' : 'frown', fx: .05, fy: .5 }, t);
  if (t < B.michSaid) say("it's ours", 400, 330, 400, 420, B.ours1 - .02, t);
  if (t > B.michSaid) say("no, it's ours", 1530, 300, 1530, 400, B.no1 - .02, t);
}

// ---------- shot 4: a 24-year-old governor and 1,000 men; Ohio's 600 (Michigan on the right, as in every shot) ----------
function shot4(t) {
  window.CAM = [0, 0, 1]; whiteBg();
  if (t > B.thousand - .05) for (let i = 0; i < 30; i++) { const r = Math.floor(i / 10), k = i % 10; if (t < B.thousand - .05 + i * .012) continue; bean(1100 + k * 64 + r * 26, 470 + r * 62, .95, { hat: MI, dir: -1, eyes: 'angry' }); }
  stick(1450, 930, 1.25, { mouth: 'smile', dir: -1 });
  tag('GOV. STEVENS T. MASON', 1450, 1010, null, 0, B.gov - .05, t, INK, 40);
  if (t > B.age - .05) txt('AGE: 24', 1240, 790, 72, `700 ${CAPS}`, '#d81f26');
  if (t > B.thousand) txt('1,000 MILITIA', 1430, 330, 62, `700 ${CAPS}`, MI);
  if (t > B.ohioRaised - .05) { stick(470, 930, 1.25, { dir: 1, eyes: 'angry' }); tag('GOV. ROBERT LUCAS', 470, 1010, null, 0, B.ohioRaised - .05, t, INK, 40); }
  if (t > B.six - .05) for (let i = 0; i < 18; i++) { const r = Math.floor(i / 6), k = i % 6; if (t < B.six - .05 + i * .012) continue; bean(260 + k * 64 + r * 26, 470 + r * 62, .95, { hat: OH, dir: 1, eyes: 'angry' }); }
  if (t > B.six) txt('600 MILITIA', 440, 330, 62, `700 ${CAPS}`, OH);
}

// ---------- shot 5: the Battle of Phillips Corners: muskets fired into the air, nobody hit ----------
function shot5(t) {
  window.CAM = [0, 0, 1];
  scr(); const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8ec5f2'); sky.addColorStop(1, '#cfe9fb'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W, 0); c.scale(-1, 1);                   // the scene is mirrored so Michigan stands on the right
  c.fillStyle = '#4caf3f'; c.beginPath(); c.moveTo(0, 700); c.quadraticCurveTo(W / 2, 640, W, 700); c.lineTo(W, H); c.lineTo(0, H); c.fill();
  c.fillStyle = '#3f9734'; c.fillRect(0, 880, W, 200);
  for (let i = 0; i < 9; i++) { const x = 1100 + i * 90; rr(x, 640 + Math.sin(i) * 6, 10, 70, 3, '#8a6a43'); } rr(1090, 662, 820, 9, 3, '#8a6a43');   // a farm fence
  // Michigan militia (left) aim level at "muskets", then swing up 70 degrees in 0.2 s on "into the air", then fire
  const up = eo(clamp((t - B.into) / .2)), ang = up * 1.2;
  for (let i = 0; i < 6; i++) bean(250 + (i % 3) * 120 + Math.floor(i / 3) * 60, 860 + Math.floor(i / 3) * 40, 1.55, { hat: MI, dir: 1, eyes: 'angry', gun: t > B.muskets - .2 ? ang : .9 });
  if (t > B.air) {                                                // the volley: a 2-frame flash at each muzzle, then smoke drifting up
    const u = t - B.air;
    for (let i = 0; i < 6; i++) {
      const bx = 250 + (i % 3) * 120 + Math.floor(i / 3) * 60 + 1.55 * 34 * .2, by = 860 + Math.floor(i / 3) * 40 - 1.55 * 58 * .55;
      const mx = bx + Math.cos(-ang) * 92 * 1.55, my = by + Math.sin(-ang) * 92 * 1.55;
      if (u < 2 / 60) circle(mx, my, 26, '#ffe27a');
      for (let k = 0; k < 4; k++) circle(mx + k * 8 + u * 30, my - 20 - k * 16 - u * 90, (14 + k * 6) * eo(clamp(u * 3)), rgba('#ffffff', .85 * (1 - clamp(u / 1.4))));
    }
  }
  // Ohio's surveying party (right), with a survey tripod
  const shocked = t > B.air;
  for (let i = 0; i < 3; i++) bean(1350 + i * 150, 900, 1.55, { hat: OH, dir: -1, eyes: shocked ? 'wide' : 'dots', tripod: i === 1 });
  c.restore();
  tag('OHIO SURVEYORS', 420, 1010, null, 0, B.battle + .4, t, '#fff', 42);
  tag('MICHIGAN MILITIA', 1530, 1010, null, 0, B.battle + .4, t, '#fff', 42);
  if (t > B.air) txt('(according to Michigan)', W / 2, 320, 42, HAND, '#1d2a33');
  banner('Battle of Phillips Corners', W / 2, 150, 900, B.battle - .05, t, 52, '26 April 1835');
  if (t > B.nobody) txt('INJURIES: 0', W / 2, 440, 84, `${BIG}`, '#d81f26');
}

// ---------- shot 6: the war's only injury: a deputy sheriff, a penknife, Two Stickney; he survived ----------
function shot6(t) {
  window.CAM = [0, 0, 1]; whiteBg();
  const hits = t > B.stabbed + .18 ? 1 : 0;
  if (t > B.only - .05) txt(`INJURIES: ${hits}`, 1640, 140, 72, BIG, '#d81f26');
  // Two Stickney lunges in 0.18 s on "stabbed" and pulls back
  const lunge = t < B.stabbed ? 0 : eo(clamp((t - B.stabbed) / .18));   // lunges and stays: the knife rests at the wound
  const kx = 760 + 185 * lunge;                                   // the knife tip ends in the sheriff's clutching hand
  stick(kx, 900, 1.6, { dir: 1, eyes: 'angry', armR: [80 * 1.6 + 40 * lunge, -120 * 1.6] });
  if (t > B.stabbed - .3) { c.save(); c.translate(kx + 80 * 1.6 + 40 * lunge, 900 - 120 * 1.6); rr(0, -5, 22, 10, 3, '#6b3d1a'); c.fillStyle = '#c9ced6'; c.beginPath(); c.moveTo(22, -5); c.lineTo(52, 0); c.lineTo(22, 5); c.closePath(); c.fill(); c.restore(); }
  const ow = t > B.stabbed + .18 && t < B.survived;
  stick(1180 + (ow ? 8 : 0), 900, 1.6, { dir: -1, hat: 'sheriff', badge: true, mouth: ow ? 'open' : t > B.survived ? 'smile' : 'flat', eyes: ow ? 'shut' : 'dots', bandage: t > B.survived, armL: ow || t > B.survived ? [-14 * 1.6, -112 * 1.6] : undefined });
  if (t > B.deputy - .05) { txt('DEPUTY', 1180, 980, 44, `700 ${CAPS}`, INK); txt('SHERIFF', 1180, 1030, 44, `700 ${CAPS}`, INK); }
  if (ow) say('ow', 1330, 470, 1250, 560, B.stabbed + .18, t, INK, 60);
  if (t > B.penknife - .05) { const kxx = kx + 80 * 1.6 + 40 * lunge + 26, kyy = 900 - 192; tag('PENKNIFE', kxx - 220, kyy - 280, kxx, kyy, B.penknife - .05, t, '#7a4a22', 40); }
  if (t > B.twoS - .05) { txt('TWO', 945, 980, 44, `700 ${CAPS}`, INK); txt('STICKNEY', 945, 1030, 44, `700 ${CAPS}`, INK); }
  if (t > B.survived) say("i'm fine", 1370, 470, 1250, 560, B.survived, t, INK, 56);
}

// ---------- shot 7: Congress gives Toledo to Ohio, and Michigan most of a cold peninsula ----------
function shot7a(t) {
  const cx = 10, cy = 330, z = lz(2.8, 3.1, eo(clamp((t - B.cut6) / 1.1))); window.CAM = [cx, cy, z];
  const k = t > B.toledo2 ? 1 : 0;
  scr(); c.drawImage(seaTexture(), 0, 0); cam(cx, cy, z); mapLayer({ z, strip: true, stripCol: k ? OH : '#ffd23f' });
  scr(); tag('CONGRESS, 1836', 1640, 100, null, 0, B.congress - .05, t, INK, 58);
  const [sx, sy] = S(GEO.toledo[0] - 40, GEO.toledo[1], cx, cy, z);
  tag('TOLEDO → OHIO', sx - 150, sy - 150, sx - 150, sy - 14, B.toledo2 - .05, t, '#fff', 56);
  closeLabels(t, cx, cy, z);
}
function shot7(t) {
  const k7 = ss(clamp((t - B.cold + .1) / .9));                  // on "cold": a 0.9 s push onto the peninsula (his ~1 s map pushes), then hold
  const cx = lerp(-150, -300, k7), cy = lerp(120, -120, k7), z = lz(.74, 1.0, k7) * lz(1, 1.06, eo(clamp((t - B.cut6b) / 1.1))); window.CAM = [cx, cy, z];
  const toOhio = t > B.toledo2, upk = t > B.gaveMich ? 1 : 0;
  scr(); c.drawImage(seaTexture(), 0, 0); cam(cx, cy, z);
  mapLayer({ z, strip: !toOhio || true, stripCol: toOhio ? OH : '#ffd23f', upWest: upk });
  if (t > B.cold - .05) {                                          // the cold, forested north: pine trees and snow, clipped to the peninsula
    c.save(); ringsPath(GEO.michUP); c.clip();
    for (let i = 0; i < 40; i++) { const x = -660 + hash(i + 40) * 600, y = -470 + hash(i + 41) * 300; if (t < B.cold - .05 + i * .01) continue; c.fillStyle = '#1f5e3a'; c.beginPath(); c.moveTo(x, y - 26); c.lineTo(x - 12, y + 6); c.lineTo(x + 12, y + 6); c.closePath(); c.fill(); }
    for (let i = 0; i < 70; i++) { const x = -720 + hash(i + 90) * 760, y = ((hash(i + 91) * 520 + (t - B.cold) * 60) % 520) - 520; circle(x, y, 3.2, 'rgba(255,255,255,.9)'); }
    c.restore();
  }
  scr();
  const fO = S(140, 560, cx, cy, z), fM = S(-60, 120, cx, cy, z);
  const face = (x, y, happy) => { for (const k of [-1, 1]) circle(x + k * 28, y, 8, INK); c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); if (happy) c.arc(x, y + 18, 30, Math.PI * .2, Math.PI * .8); else c.arc(x, y + 62, 30, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); };
  const oa = 1 - clamp((t - B.cold + .27) / (10 / 60));
  if (oa > 0) { c.globalAlpha = oa; face(fO[0], fO[1], true); c.globalAlpha = 1; }
  face(fM[0], fM[1], false);
  if (oa > 0) { c.globalAlpha = oa; tag('OHIO', fO[0], fO[1] + 125, null, 0, 0, t, '#fff', 46); c.globalAlpha = 1; }
  tag('MICHIGAN', fM[0] - 30, fM[1] + 122, null, 0, 0, t, '#fff', 46);
  const [ux, uy] = S(-430, -330, cx, cy, z);
  tag('UPPER PENINSULA', ux + 110, Math.max(90, uy - 190), ux + 40, uy - 30, B.peninsula - .05, t, '#fff', 50);
}

// ---------- shot 8: Michigan says no; the Frostbitten Convention; Michigan says yes ----------
function shot8(t) {
  window.CAM = [0, 0, 1]; greyBg();
  const cold = clamp((t - B.then) / 1.2);
  if (cold > 0) { scr(); c.fillStyle = `rgba(150,190,230,${.35 * cold})`; c.fillRect(0, 0, W, H); }
  const yes = t > B.yes - .02;
  stateChar(MITTEN, MI, W / 2 - 40, 780, 470, { seed: 1.3, arms: yes ? 'down' : 'cross', eyes: yes ? 'dots' : 'angry', mouth: t > B.then ? 'wavy' : 'frown', shiver: t > B.then + .3, fy: .5 }, t);
  if (cold > 0) for (let i = 0; i < 90; i++) { const x = hash(i + 7) * W + Math.sin(t * 1.3 + i) * 20, y = ((hash(i + 8) * 1200 + (t - B.then) * (80 + hash(i) * 70)) % 1200) - 60; circle(x, y, 3 + hash(i + 9) * 4, rgba('#ffffff', .9 * cold)); }
  if (t < B.then) say('no.', 1260, 360, 1150, 440, B.no2 - .02, t, INK, 64);
  if (t > B.then) { scr(); }
  banner('The Frostbitten Convention', W / 2, 140, 1000, B.frost - .05, t, 54, 'December 1836');
  if (yes) say('...yes.', 1260, 360, 1150, 440, B.yes - .02, t, INK, 64);
}

// ---------- shot 9: copper, and iron, lots of it ----------
function shot9(t) {
  window.CAM = [0, 0, 1];
  scr(); c.fillStyle = '#bfe3f7'; c.fillRect(0, 0, W, 300);
  c.fillStyle = '#3f8d3a'; c.fillRect(0, 290, W, 40);
  const layers = ['#8a5a36', '#76492b', '#5f3a22', '#4c2e1b'];
  layers.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, 330 + i * 190, W, 190); });
  for (let i = 0; i < 14; i++) { const x = 60 + i * 140 + hash(i) * 40; c.fillStyle = '#1f5e3a'; c.beginPath(); c.moveTo(x, 150); c.lineTo(x - 40, 292); c.lineTo(x + 40, 292); c.closePath(); c.fill(); }
  txt('1840s', 200, 110, 96, `700 ${SERIF}`, '#d81f26');
  tag("MICHIGAN'S UPPER PENINSULA", 1340, 90, null, 0, 0, t, INK, 46);
  // a pickaxe strikes on "found"
  const sw = t < B.copper - .25 ? 0 : eo(clamp((t - B.copper + .25) / .2));          // the swing lands just before "copper"
  c.save(); c.translate(925, 230); c.rotate(-.35 + 1.6 * sw); rr(-5, -120, 10, 120, 4, '#7a4a22'); c.fillStyle = '#9aa2ae'; c.beginPath(); c.moveTo(-55, -120); c.quadraticCurveTo(0, -148, 55, -120); c.lineTo(0, -128); c.closePath(); c.fill(); c.restore();
  bean(900, 292, 1.5, { dir: 1 });
  const nug = (i, col, hi, t0, cluster) => { if (t < t0 + (i % 20) * .015) return; const x = cluster[0] + (hash(i + 300) - .5) * cluster[2], y = cluster[1] + (hash(i + 301) - .5) * cluster[3], r = 18 + hash(i + 302) * 16; c.fillStyle = col; c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr3 = r * (.75 + hash(i * 7 + k) * .35); k ? c.lineTo(x + Math.cos(a) * rr3, y + Math.sin(a) * rr3) : c.moveTo(x + Math.cos(a) * rr3, y + Math.sin(a) * rr3); } c.closePath(); c.fill(); circle(x - r * .3, y - r * .3, r * .22, hi); };
  for (let i = 0; i < 10; i++) nug(i, '#d9822b', '#ffc27a', B.copper - .02, [560, 560, 520, 240]);
  for (let i = 0; i < 10; i++) nug(i + 20, '#6e6e78', '#b7b7c4', B.iron - .02, [1360, 560, 520, 240]);
  if (t > B.lots - .02) { for (let i = 0; i < 40; i++) nug(i + 40, '#d9822b', '#ffc27a', B.lots - .02, [560, 800, 900, 300]); for (let i = 0; i < 40; i++) nug(i + 90, '#6e6e78', '#b7b7c4', B.lots + .1, [1360, 800, 900, 300]); }
  tag('COPPER', 560, 400, 560, 470, B.copper - .02, t, '#ffd9a8', 56);
  tag('IRON', 1360, 400, 1360, 470, B.iron - .02, t, '#e6e6f0', 56);
}

// ---------- shot 10: Michigan lost the war, and won the peninsula ----------
function shot10(t) {
  window.CAM = [0, 0, 1]; greyBg();
  // Ohio holds its strip; Michigan holds the Upper Peninsula up like a prize
  const b = bounds(STRIP), s = 300 / b.w;
  c.save(); c.translate(520, 470); c.scale(s, s); c.translate(-b.cx, -b.cy); fillR(STRIP, OH); strokeR(STRIP, '#fff', 3 / s); c.restore();
  stateChar(OHIO, OH, 520, 860, 300, { armL: [-150, -390], armR: [150, -390], eyes: 'dots', mouth: t > B.won ? 'flat' : 'smile' }, t);
  const ub = bounds(UP), us = 520 / ub.w, lift = t > B.won ? eo(clamp((t - B.won) / .2)) : 0;
  const upx = 1360, upy = 412 - 20 * lift;
  c.save(); c.translate(upx, upy); c.scale(us, us); c.translate(-ub.cx, -ub.cy); fillR(UP, MI); c.restore();
  if (t > B.won) for (let i = 0; i < 9; i++) { const k = ((t - B.won) * 2 + hash(i)) % 1; star(upx - 240 + hash(i + 3) * 170, upy - 40 + hash(i + 4) * 70, 10 * Math.sin(k * Math.PI), '#ffd84a'); }
  stateChar(MITTEN, MI, 1360, 860, 330, { seed: 1.3, armL: [-150, -437 - 20 * lift], armR: [150, -437 - 20 * lift], eyes: t > B.won ? 'happy' : 'dots', mouth: t > B.won ? 'smile' : 'flat', fy: .5 }, t);
  if (t > B.lost) txt('MICHIGAN: LOST THE WAR', 1360, 110, 64, BIG, '#d81f26');
  if (t > B.won) txt('...AND WON THE PENINSULA', 1360, 190, 64, BIG, '#1f9e4a');
  tag('TOLEDO', 520, 410, null, 0, 0, t, INK, 36);
}

// ---------- end card ----------
function endCard(t) {
  window.CAM = [0, 0, 1]; whiteBg();
  const u = t - B.cut10;
  txt('MADE WITH', W / 2, 470, 96, BIG, INK);
  if (u > .25) txt('OPUS', W / 2, 610, 150, BIG, '#d81f26');
}

// ---------- timeline ----------
const SHOTS = [[0, shot1], ['cut1', shot2], ['cut2', shot3], ['cut3', shot4], ['cut4', shot5], ['cut5', shot6], ['cut6', shot7a], ['cut6b', shot7], ['cut7', shot8], ['cut8', shot9], ['cut9', shot10], ['cut10', endCard]];
function draw(t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.setLineDash([]); c.globalCompositeOperation = 'source-over';
  let f = shot1; for (const [k, fn] of SHOTS) if (t >= (k === 0 ? 0 : B[k])) f = fn;
  f(t);
}
window.seekFrame = F => { window.F = F; draw(F / window.FPS); };
window.seek = t => window.seekFrame(t * window.FPS);
})();
