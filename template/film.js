// Apollo 13 in 60 seconds. Every frame is a pure function of t. Helpers come from lib.js.
// Camera rules (46-motion-skill craft 4.5, 3.10, 11): every zoom is straight about one aim point, direction continues or
// is zero across every cut, speeds matched across cuts, no white-outs, the camera never parks.
(() => {
const B = window.B;

// ---------- shared pieces ----------
function spaceBg(t, cx, cy, z) {
  scr();
  const g = c.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * .75);
  g.addColorStop(0, '#0f0b3c'); g.addColorStop(1, '#04031a');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  cam(cx * .2, cy * .2, 1 + (z - 1) * .2);
  glow(-1100, -420, 950, '#1c7f8a', .15); glow(1200, 480, 1050, '#7a1255', .13); glow(200, -700, 760, '#2d3fb0', .13);
  starfield(t, cx, cy, z, 77, 210, .25);
}
function moon(x, y, R) {
  glow(x, y, R * 1.35, '#9fb2d8', .18);
  circle(x, y, R, '#c4c9d4');
  c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
  const cr = [[-.35, -.3, .22], [.25, -.45, .12], [.4, .2, .18], [-.1, .35, .14], [-.55, .25, .09], [.05, -.05, .1], [.6, -.15, .07]];
  for (const [a, b, r] of cr) { circle(x + a * R, y + b * R, r * R, '#a9aebb'); circle(x + a * R - r * R * .15, y + b * R - r * R * .15, r * R * .78, '#b4b9c5'); }
  const sh = c.createLinearGradient(x - R, y, x + R, y);      // sunlight from the left
  sh.addColorStop(0, 'rgba(10,8,53,0)'); sh.addColorStop(.6, 'rgba(10,8,53,.15)'); sh.addColorStop(1, 'rgba(10,8,53,.72)');
  c.fillStyle = sh; c.fillRect(x - R, y - R, R * 2, R * 2);
  ell(x - R * .45, y - R * .5, R * .35, R * .18, -.5, 'rgba(255,255,255,.12)');
  c.restore();
}
const earth = (t, x, y, R) => planet(t, x, y, R, 0);

// The Apollo stack, side view, CM docked to the LM. Local units, ~620 long at s = 1, centred on the CM.
function ship(t, x, y, s, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const sep = o.sep || 0;                                       // 0..1: SM drifts left, LM drifts right (before re-entry)
  // service module
  c.save(); c.translate(-sep * 260, sep * 40); c.rotate(-sep * .25);
  c.fillStyle = '#5b6270'; c.beginPath(); c.moveTo(-262, -24); c.lineTo(-336, -50); c.lineTo(-336, 50); c.lineTo(-262, 24); c.fill();
  c.fillStyle = '#3a404c'; c.beginPath(); c.moveTo(-300, -38); c.lineTo(-336, -50); c.lineTo(-336, 50); c.lineTo(-300, 38); c.fill();
  rr(-262, -58, 222, 116, 6, '#cfd6df');
  rr(-262, 14, 222, 44, 6, '#a7b0bd');
  rr(-262, -58, 222, 14, 6, '#eef2f6');
  for (let i = 0; i < 6; i++) rr(-252 + i * 36, -40, 4, 76, 2, 'rgba(90,100,115,.35)');
  rr(-110, -58, 44, 116, 3, '#bcc4cf');                       // radiator band
  if (o.hole) {                                                 // bay 4 after the panel blew off
    rr(-200, -58, 84, 54, 4, '#1a1d24');
    rr(-196, -54, 76, 46, 4, '#2b2e36');
    for (let i = 0; i < 5; i++) circle(-196 + hash(i + 30) * 76, -54 + hash(i + 31) * 46, 6 + hash(i + 32) * 6, 'rgba(255,140,60,.35)');
  } else if (!o.noPanel) rr(-200, -58, 84, 54, 4, '#dde3ea');
  c.restore();
  // lunar module
  c.save(); c.translate(sep * 300, -sep * 30); c.rotate(sep * .3);
  rr(40, -12, 18, 24, 4, '#8f98a6');                          // docking tunnel
  c.fillStyle = '#d5dbe3'; c.beginPath(); c.moveTo(58, -46); c.lineTo(120, -62); c.lineTo(165, -40); c.lineTo(165, 40); c.lineTo(120, 62); c.lineTo(58, 46); c.fill();
  c.fillStyle = '#aeb6c2'; c.beginPath(); c.moveTo(58, 10); c.lineTo(165, 10); c.lineTo(165, 40); c.lineTo(120, 62); c.lineTo(58, 46); c.fill();
  rr(98, -36, 26, 20, 5, '#1f2a3d'); rr(102, -33, 8, 6, 2, '#6fd3ff');
  c.fillStyle = '#d9a43a'; c.beginPath(); c.moveTo(165, -70); c.lineTo(285, -60); c.lineTo(285, 60); c.lineTo(165, 70); c.fill();
  c.fillStyle = '#a8761f'; c.beginPath(); c.moveTo(165, 18); c.lineTo(285, 16); c.lineTo(285, 60); c.lineTo(165, 70); c.fill();
  for (let i = 0; i < 7; i++) ell(180 + hash(i + 50) * 95, -55 + hash(i + 51) * 80, 14, 5, hash(i) * 3, 'rgba(255,225,140,.45)');
  cap([285, -55, 330, -96], 7, '#b8bec8'); cap([285, 55, 330, 96], 7, '#b8bec8');
  c.restore();
  // command module (the capsule that comes home)
  c.fillStyle = '#e6ebf0'; c.beginPath(); c.moveTo(-40, -60); c.lineTo(28, -18); c.quadraticCurveTo(40, 0, 28, 18); c.lineTo(-40, 60); c.closePath(); c.fill();
  c.fillStyle = '#b8c1cc'; c.beginPath(); c.moveTo(-40, 14); c.lineTo(28, 6); c.quadraticCurveTo(36, 12, 28, 18); c.lineTo(-40, 60); c.closePath(); c.fill();
  rr(-46, -62, 10, 124, 4, '#6b5a48');                         // heat shield edge
  rr(-6, -24, 14, 12, 3, '#1f2a3d');
  c.restore();
}

// a capsule under parachutes (ocean shot): local units, capsule ~120 wide at s = 1
function capsule(x, y, s, sway, chutes) {
  c.save(); c.translate(x, y); c.rotate(sway); c.scale(s, s);
  if (chutes > 0) {                                             // after splashdown the canopies deflate and settle on the water
    const dfl = 1 - chutes, cols = [['#ff8f4a', '#fff4e8'], ['#fff4e8', '#ff8f4a'], ['#ff8f4a', '#fff4e8']];
    c.save(); c.rotate(-sway);                                   // canopies don't follow the capsule's sway once it is floating
    [-230, 0, 230].forEach((dx0, i) => {
      const r = 150, dx = dx0 * (1 + .9 * dfl), cy = lerp(-470 - (i === 1 ? 50 : 0), 30, eo(clamp(dfl * 1.5))), flat = lerp(.62, .14, ss(clamp((dfl - .45) / .55)));
      c.globalAlpha = 1 - inv(.55, 1, dfl);
      c.strokeStyle = rgba('#e6ebf5', .55 * (1 - ss(clamp(dfl * 2)))); c.lineWidth = 2.5;
      for (const k of [-.9, -.3, .3, .9]) { c.beginPath(); c.moveTo(dx + k * r, cy); c.lineTo(0, -70); c.stroke(); }
      c.save(); c.beginPath(); c.ellipse(dx, cy, r, r * flat, 0, Math.PI, TAU); c.closePath(); c.clip();
      for (let k = 0; k < 6; k++) { c.fillStyle = cols[i][k % 2]; c.beginPath(); c.moveTo(dx, cy); c.arc(dx, cy, r + 2, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6); c.fill(); }
      c.restore();
      ell(dx, cy, r, r * .1, 0, 'rgba(120,40,20,.35)');
    });
    c.restore(); c.globalAlpha = 1;
  }
  c.fillStyle = '#e6ebf0'; c.beginPath(); c.moveTo(-60, 40); c.lineTo(-18, -56); c.quadraticCurveTo(0, -68, 18, -56); c.lineTo(60, 40); c.closePath(); c.fill();
  c.fillStyle = '#b8c1cc'; c.beginPath(); c.moveTo(10, -58); c.quadraticCurveTo(18, -56, 20, -52); c.lineTo(60, 40); c.lineTo(22, 40); c.closePath(); c.fill();
  rr(-64, 34, 128, 14, 6, '#6b5a48');
  rr(-10, -24, 14, 12, 3, '#1f2a3d');
  c.restore();
}

function helmet(x, y, r, look = 0) {
  circle(x, y, r, '#f3f7fb'); circle(x + r * .12, y + r * .1, r * .9, '#d9e1ea');
  ell(x + look * r * .1, y + r * .05, r * .68, r * .55, 0, '#0f2236');
  ell(x - r * .25 + look * r * .1, y - r * .15, r * .22, r * .12, -.5, 'rgba(111,211,255,.65)');
}

function label(x, y, text, size, t0, bg = 'rgba(6,20,40,.78)', fg = '#eaf5ee', alpha = 1) { pill(x, y, text, size, bg, fg, t0, 1, alpha); }

// monotone cubic spline through [t, v] keys: no overshoot, no stop at every key (craft 3.7)
function sk(F, K) {
  const n = K.length;
  if (F <= K[0][0]) return K[0][1];
  if (F >= K[n - 1][0]) return K[n - 1][1];
  const h = [], d = [];
  for (let i = 0; i < n - 1; i++) { h[i] = K[i + 1][0] - K[i][0]; d[i] = (K[i + 1][1] - K[i][1]) / h[i]; }
  const m = [d[0]];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 3 * (h[i - 1] + h[i]) / ((2 * h[i] + h[i - 1]) / d[i - 1] + (h[i] + 2 * h[i - 1]) / d[i]);
  m[n - 1] = d[n - 2];
  let i = 0; while (F > K[i + 1][0]) i++;
  const q = (F - K[i][0]) / h[i], q2 = q * q, q3 = q2 * q;
  return (2 * q3 - 3 * q2 + 1) * K[i][1] + (q3 - 2 * q2 + q) * h[i] * m[i] + (-2 * q3 + 3 * q2) * K[i + 1][1] + (q3 - q2) * h[i] * m[i + 1];
}
function splineCam(t, keys) {                                   // keys: [t, cx, cy, z]; one smooth path, log-zoom
  return [sk(t, keys.map(k => [k[0], k[1]])), sk(t, keys.map(k => [k[0], k[2]])), Math.exp(sk(t, keys.map(k => [k[0], Math.log(k[3])])))];
}
function aimCam(t, keys) {                                      // keys: [t, fx, fy, z]; straight log-zoom moves between keys
  let k = 0; while (k < keys.length - 2 && t >= keys[k + 1][0]) k++;
  const [t0, x0, y0, z0] = keys[k], [t1, x1, y1, z1] = keys[Math.min(k + 1, keys.length - 1)];
  const e = t1 > t0 ? eio(inv(t0, t1, t)) : 1;
  const z = lz(z0, z1, e);
  // the camera centre moves on the same curve as the log-zoom, so each move reads as one straight push or pull
  return [lerp(x0, x1, e), lerp(y0, y1, e), z];
}

function vent(t, HX, HY, k, fade = 1) {
  const dt = t - B.bang; if (dt <= 0) return;
  glow(HX, HY - 40 * k, 260 * k * eo(clamp(dt / .3)), '#dff6ff', (.5 * Math.exp(-1.5 * dt) + .12) * fade);
  for (let i = 0; i < 140; i++) {
    const born = (hash(i) * 6) % 6, age = ((dt - born) % 1.4 + 1.4) % 1.4;
    if (dt < born) continue;
    const a = -1.9 + (hash(i + 7) - .5) * .9, sp = (260 + hash(i + 8) * 420) * k;
    circle(HX + Math.cos(a) * sp * age, HY + Math.sin(a) * sp * age, (6 + 26 * age) * (.6 + hash(i + 9) * .8) * k, rgba(i % 3 ? '#eaf6ff' : '#bfe6ff', .55 * (1 - age / 1.4) * fade));
  }
}
const HOLE = [-158, -40];                                        // bay 4 in ship units
const holeAt = (sx, sy, s, rot) => [sx + (Math.cos(rot) * HOLE[0] - Math.sin(rot) * HOLE[1]) * s, sy + (Math.sin(rot) * HOLE[0] + Math.cos(rot) * HOLE[1]) * s];

// ---------- shot A: three men on their way to the Moon ----------
const EARTH = [-1600, 140], MOON = [1650, -90];
function shipPathA(t) { return [-640 + 125 * t, 40 + 18 * Math.sin(t * .6)]; }
function shotA(t) {
  const x = clamp(t / B.cut1), f = .12 * x + .88 * Math.pow(x, 9);  // moving from frame 0, accelerates into the cut
  const [sx, sy] = shipPathA(t);
  const z = lz(.5, 6, f);
  const [cx, cy] = aim(sx, sy, (sx - 60) * .5 * (1 - f), (sy - 10) * .5 * (1 - f), z);
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  earth(t, EARTH[0], EARTH[1], 300); moon(MOON[0], MOON[1], 210);
  const fa = 1 - inv(B.cut1 - .4, B.cut1 - .06, t);              // everything that does not cross the cut fades out first
  c.setLineDash([14, 16]); c.strokeStyle = rgba('#eaf5ee', .28 * fa); c.lineWidth = 4 / z * 1.5;
  c.beginPath(); c.moveTo(EARTH[0] + 300, EARTH[1]); c.quadraticCurveTo(0, -60, MOON[0] - 230, MOON[1] + 10); c.stroke(); c.setLineDash([]);
  glow(sx, sy, 60, '#9fd8ff', .25 * fa);
  ship(t, sx, sy, .16, -.05);
  scr();
  label(330, 150, 'APRIL 13, 1970', 34, t - B.april, undefined, undefined, fa);
  const mi = Math.round(200000 * EA((t - B.miles) * 30, .2));
  if (t > B.miles) label(1560, 150, `${mi.toLocaleString('en-US')} MILES FROM EARTH`, 30, t - B.miles, 'rgba(6,20,40,.78)', '#ffd98a', fa);
  vignette(.6);
}

// ---------- shot B: the bang ----------
function shotB(t) {
  const u = t - B.cut1;
  let z = lz(.6, 1.05, EA(u * 30, .16)) * Math.exp(.03 * u);    // match cut: the ship enters at A's last size and place, still pushing in
  z *= lerp(1, .9, eo(inv(B.bang, B.bang + .5, t)));            // the blast kicks the camera back
  const xo = clamp((t - (B.leaking + .3)) / (B.cut2 - B.leaking - .3));
  z *= lz(1, .2, Math.pow(xo, 3));                               // pulls back, accelerating into the cut (~4 %/frame)
  const sh = t > B.bang ? 16 * Math.exp(-5 * (t - B.bang)) : 0;
  const cx = 0 + (Math.sin(t * 21) + .5 * Math.sin(t * 37)) * sh / z, cy = -10 + (Math.cos(t * 17) + .5 * Math.cos(t * 29)) * sh / z;
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  const rot = -.05 + (t > B.bang ? .05 * (t - B.bang) : 0);
  const hx = -158, hy = -40;                                     // bay 4 in ship units
  const S = 1.6, HX = Math.cos(rot) * hx * S - Math.sin(rot) * hy * S, HY = Math.sin(rot) * hx * S + Math.cos(rot) * hy * S;
  vent(t, HX, HY, 1);
  ship(t, 0, 0, S, rot, { hole: t > B.bang });
  if (t > B.bang) {                                             // the panel tumbles away
    const dt = t - B.bang;
    c.save(); c.translate(HX - 220 * dt, HY - 520 * dt + 60 * dt * dt); c.rotate(dt * 4.2); rr(-67, -43, 134, 86, 6, '#dde3ea'); rr(-67, 10, 134, 33, 6, '#b8c1cc'); c.restore();
    for (let i = 0; i < 26; i++) {
      const a = -1.6 + (hash(i + 70) - .5) * 2.4, sp = 300 + hash(i + 71) * 700, k = 1.1;
      const d = sp * (1 - Math.exp(-k * dt)) / k;
      const px = HX + Math.cos(a) * d, py = HY + Math.sin(a) * d;
      c.save(); c.translate(px, py); c.rotate(dt * (2 + hash(i) * 6)); rr(-6, -3, 12 + hash(i + 2) * 14, 6, 2, i % 4 ? '#cfd6df' : '#ff9a45'); c.restore();
    }
  }
  scr();
  if (t > B.tank) {
    const [px, py] = [W / 2 + (HX - cx) * z, H / 2 + (HY - cy) * z];
    label(px + 60, py + 230, 'OXYGEN TANK 2', 36, t - B.tank, 'rgba(6,20,40,.82)', '#ffd98a', 1 - inv(B.cut2 - .9, B.cut2 - .5, t));
  }
  if (Math.abs(t - B.bang) < .5 / 60) { scr(); c.fillStyle = 'rgba(255,250,235,.9)'; c.fillRect(0, 0, W, H); }   // 1-frame flash
  vignette(.6);
}

// ---------- shot C: "Houston, we've had a problem", the landing is off, the way home, the crew moves into the lander ----------
function shipPathC(t) { const u = t - B.cut2; return [520 + 70 * u, -30 + 10 * Math.sin(u * .7)]; }
const SHIPROT_C = -.05 + .05 * (B.cut2 - B.bang);                  // B's tumble carried over exactly
function wayHome(s) {                                             // ship -> over the Moon -> round its far side -> back toward Earth
  const [mx, my] = MOON, R = 330;
  if (s < .2) { const k = s / .2; return [lerp(1000, mx - 40, k), lerp(-120, my - R, eo(k))]; }
  if (s < .7) { const a = -Math.PI / 2 + (s - .2) / .5 * Math.PI; return [mx + Math.cos(a) * R, my + Math.sin(a) * R]; }
  const k = (s - .7) / .3; return [lerp(mx, mx - 1500, k), lerp(my + R, my + 160, ss(k))];
}
function shotC(t) {
  const u = t - B.cut2;
  const [sx, sy] = shipPathC(t);
  // match cut from B: the ship enters at B's last size and place, still pulling back, then settles wide
  const p = EA(u * 30, .08);
  let z = lz(2.43, .55, p)   // 2.43 = 10 x B's last zoom (0.2428): same ship size across the cut
   * Math.exp(.035 * u);
  let [cx, cy] = aim(sx, sy, (sx - 300) * .55 * p, (sy - 0) * .55 * p, z);
  // "The Moon landing is over": one straight move onto the Moon, starting from the current camera
  const m = eio(inv(B.landing - .3, B.landing + 1.2, t));
  if (m > 0) {
    const zc = z, z1 = 1.05 * Math.exp(.045 * u); z = lz(z, z1, m);
    const [mx, my] = MOON, ox = (mx - cx) * zc, oy = (my - cy) * zc;
    [cx, cy] = aim(mx, my, ox * (1 - m) + 300 * m, oy * (1 - m) + 40 * m, z);
  }
  // "They move into the lunar lander": one straight move onto the ship, from the current camera, then a creep
  const g = eio(inv(B.home, B.cut3, t));                         // one calm push all the way to the cut (never parks), close enough to see the crew inside
  if (g > 0) {
    const zc = z, z2 = 9 * Math.exp(.04 * Math.max(0, t - B.home));
    const tx = sx + 12, ox = (tx - cx) * zc, oy = (sy - cy) * zc;
    z = lz(zc, z2, g); [cx, cy] = aim(tx, sy, ox * (1 - g), oy * (1 - g), z);
  }
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  earth(t, EARTH[0], EARTH[1], 300); moon(MOON[0], MOON[1], 210);
  if (t > B.landing - .1) {                                       // landing site, struck off on "over"
    const lx = MOON[0] - 40, ly = MOON[1] - 40, a = 1 - .7 * inv(B.over + .2, B.over + .7, t);
    c.strokeStyle = rgba('#ffd98a', a); c.lineWidth = 4; c.beginPath(); c.arc(lx, ly, 22 * SS((t - B.landing) * 30), 0, TAU); c.stroke();
    circle(lx, ly, 5, rgba('#ffd98a', a));
  }
  // the way home: drawn on "get home alive", an arrowhead leads it, a label says what it is
  let tip = null;
  if (t > B.goal) {
    const q = eio(inv(B.goal, B.home + .7, t)), N = 120;
    const pa = 1 - inv(B.lander - 1.1, B.lander - .7, t);
    c.setLineDash([16, 14]); c.strokeStyle = rgba('#73dd9e', .95 * pa); c.lineWidth = 6 / Math.max(1, z * .8); c.beginPath();
    for (let i = 0; i <= N * q; i++) { const [px, py] = wayHome(i / N); i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke(); c.setLineDash([]);
    const [ax, ay] = wayHome(q), [bx, by] = wayHome(Math.max(0, q - .01)), ang = Math.atan2(ay - by, ax - bx);
    c.save(); c.translate(ax, ay); c.rotate(ang); c.fillStyle = rgba('#73dd9e', pa); c.beginPath(); c.moveTo(22, 0); c.lineTo(-12, -14); c.lineTo(-12, 14); c.closePath(); c.fill(); c.restore();
    tip = [ax, ay];
  }
  const rotC = SHIPROT_C;
  const [hx, hy] = holeAt(sx, sy, .16, rotC);
  vent(t, hx, hy, .1, (1 - .6 * inv(B.cut2, B.cut2 + 3, t)) * (1 - inv(B.cut3 - .5, B.cut3 - .1, t)));   // thinning out; gone before the cut
  glow(sx, sy, 60, '#9fd8ff', .25);
  ship(t, sx, sy, .16, rotC, { hole: true });
  // the crew moves from the command module into the lander, INSIDE the ship: the hull opens as a cutaway and
  // three small floating astronauts pass one at a time through the docking tunnel (nobody went outside)
  const cut = eo(inv(B.lander - 1.35, B.lander - 1.0, t));   // stays open into shot D, which opens on the lander's cabin
  if (cut > 0) {
    c.save(); c.translate(sx, sy); c.rotate(rotC); c.scale(.16, .16); c.globalAlpha = cut;
    const poly = pts => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
    const CMI = [[-34, -50], [22, -16], [22, 16], [-34, 50]], TUN = [[20, -14], [64, -14], [64, 14], [20, 14]];
    const LMI = [[62, -40], [118, -54], [160, -34], [160, 34], [118, 54], [62, 40]];
    c.fillStyle = '#16233a'; for (const P of [CMI, TUN, LMI]) { poly(P); c.fill(); }
    c.save(); poly(LMI); c.clip(); glow(110, 0, 70, '#ffd36b', .35 * eo(inv(B.lander - .9, B.lander - .2, t))); c.restore();
    c.fillStyle = '#22304b'; c.fillRect(-30, -8, 6, 16);                              // CM couch edge
    for (let k = 0; k < 4; k++) circle(70 + k * 24, -30 + (k % 2) * 4, 2.6, (k % 2) ? 'rgba(111,211,255,.85)' : 'rgba(255,179,71,.85)');
    const tiny = (x, y, r, a) => {                                 // a floating astronaut, ~30 long, lying along the ship's axis
      c.save(); c.translate(x, y); c.rotate(r); c.scale(1.6, 1.6); c.globalAlpha = cut * a;
      rr(-12, -6, 18, 12, 5, '#e6ebf0'); cap([-12, -3, -20, -4], 3.2, '#d9e1ea'); cap([-12, 3, -20, 5], 3.2, '#d9e1ea');
      circle(10, 0, 6.5, '#f3f7fb'); ell(11.5, .3, 4.3, 3.6, 0, '#0f2236');
      c.restore();
    };
    const SLOT = [[90, -20], [132, -10], [100, 22]], START = [[-14, -20], [-20, 0], [-14, 20]];
    c.save(); c.beginPath(); for (const P of [CMI, TUN, LMI]) P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.clip('nonzero');   // the crew stays inside the hull
    for (let i = 0; i < 3; i++) {                                  // one at a time, during "They move into the lunar lander"
      const k = ss(inv(B.lander - 1.12 + i * .3, B.lander - .52 + i * .3, t));
      const [x0, y0] = START[i], [x2, y2] = SLOT[i];
      let x, y;
      if (k < .5) { const q = k * 2; x = lerp(x0, 30, q); y = lerp(y0, 0, ss(q)); }   // drift to the hatch, then through the tunnel
      else { const q = (k - .5) * 2; x = lerp(30, x2, q); y = lerp(0, y2, ss(q)); }
      tiny(x, y + 1.2 * Math.sin(t * 2.2 + i * 2), .12 * Math.sin(t * 1.7 + i) + (k > .5 ? .25 * Math.sin((k - .5) * TAU) : 0), 1);
    }
    c.restore(); c.restore(); c.globalAlpha = 1;
  }
  // radio from the ship to Houston
  if (t > B.houston - .2 && t < B.houston + 2.6) {
    for (let k = 0; k < 4; k++) {
      const a = (((t - B.houston) * 1.2 + k / 4) % 1 + 1) % 1;
      c.strokeStyle = rgba('#6fd3ff', .5 * (1 - a)); c.lineWidth = 3 / Math.max(1, z); c.beginPath(); c.arc(sx, sy, Math.max(1, 30 + a * 380), Math.PI * .75, Math.PI * 1.25); c.stroke();
    }
  }
  scr();
  const S = ([wx, wy]) => [W / 2 + (wx - cx) * z, H / 2 + (wy - cy) * z];
  if (t > B.houston && t < B.landing + .2) {
    const [px, py] = S([sx, sy]);
    label(px, py - 90, '“HOUSTON, WE’VE HAD A PROBLEM”', 30, t - B.houston, 'rgba(234,245,238,.95)', '#0a0835', 1 - inv(B.landing - .25, B.landing + .15, t));
  }
  if (t > B.landing) {
    const [px, py] = S([MOON[0] - 40, MOON[1] - 40]);
    const a = (1 - .65 * inv(B.over + .2, B.over + .7, t)) * (1 - inv(B.lander - 1.1, B.lander - .7, t));
    label(px, py - 70, 'LANDING SITE', 28, t - B.landing, 'rgba(6,20,40,.82)', '#ffd98a', a);
    const k = eo(inv(B.over, B.over + .25, t));
    if (k > 0 && a > .01) { c.strokeStyle = rgba('#ff5a3d', a); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - 120, py - 70); c.lineTo(px - 120 + 240 * k, py - 70); c.stroke(); }
  }
  if (tip && t > B.home - .2) {
    const [px, py] = S(tip);
    label(clamp(px + 20, 260, W - 260), clamp(py + 70, 120, H - 120), 'THE WAY HOME', 34, t - B.home + .2, 'rgba(6,40,30,.88)', '#73dd9e', 1 - inv(B.lander - 1.1, B.lander - .7, t));
  }
  if (t > B.lander - .9) {
    const [px, py] = S([sx + 34, sy - 14]);
    label(px, py - 70, 'LUNAR LANDER', 32, t - B.lander + .9, 'rgba(6,20,40,.85)', '#ffd98a', 1 - inv(B.cut3 - .3, B.cut3 - .08, t));
  }
  vignette(.6);
}

// ---------- shot D: the lunar module, a lifeboat built for two ----------
function shotD(t) {
  const u = t - B.cut3;
  let z = lz(.82, 1, eo(ss(inv(0, 1.4, u)))) * Math.exp(.03 * u);   // C ends on a creep: D leaves rest and pushes in gently
  const wx = 30, wy = -150;                                      // the window into the cabin
  const cx = 330, cy = -40;                                      // lander on the left third, the numbers on the right; ends on its creep
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  // descent stage (gold foil) and legs
  c.fillStyle = '#d9a43a'; c.beginPath(); c.moveTo(-260, 40); c.lineTo(260, 40); c.lineTo(300, 120); c.lineTo(260, 220); c.lineTo(-260, 220); c.lineTo(-300, 120); c.closePath(); c.fill();
  c.fillStyle = '#a8761f'; c.beginPath(); c.moveTo(-300, 120); c.lineTo(300, 120); c.lineTo(260, 220); c.lineTo(-260, 220); c.closePath(); c.fill();
  for (let i = 0; i < 12; i++) ell(-230 + hash(i + 90) * 460, 60 + hash(i + 91) * 140, 30, 9, hash(i) * 3, 'rgba(255,225,140,.4)');
  for (const sx of [-1, 1]) { cap([sx * 280, 160, sx * 430, 330], 14, '#b8bec8'); cap([sx * 200, 210, sx * 430, 330], 9, '#9aa2ae'); ell(sx * 440, 340, 52, 12, 0, '#cfd5de'); }
  // ascent stage (the cabin)
  c.fillStyle = '#d5dbe3'; c.beginPath(); c.moveTo(-230, 40); c.lineTo(-250, -150); c.lineTo(-150, -300); c.lineTo(160, -300); c.lineTo(250, -170); c.lineTo(230, 40); c.closePath(); c.fill();
  c.fillStyle = '#aeb6c2'; c.beginPath(); c.moveTo(-230, 40); c.lineTo(-240, -60); c.lineTo(240, -60); c.lineTo(230, 40); c.closePath(); c.fill();
  rr(-60, -330, 120, 34, 10, '#8f98a6');
  // cutaway of the cabin: the crew stood in the lunar module; two fit, a third squeezes in behind
  c.save(); c.beginPath(); c.moveTo(-210, -60); c.lineTo(-225, -150); c.lineTo(-140, -280); c.lineTo(140, -280); c.lineTo(220, -160); c.lineTo(210, -60); c.closePath(); c.clip();
  c.fillStyle = '#16233a'; c.fillRect(-260, -320, 520, 280);
  glow(0, -170, 260, '#3a6fb0', .3);
  rr(-200, -250, 400, 40, 8, '#22304b');
  for (let k = 0; k < 9; k++) circle(-170 + k * 42, -230, 6, (k % 3) ? 'rgba(111,211,255,.8)' : 'rgba(255,179,71,.8)');
  const three = SS((t - B.three) * 30);
  const figure = (x, y, s, al) => {
    c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = al;
    rr(-46, -10, 92, 120, 30, '#e6ebf0'); rr(-46, 60, 92, 50, 20, '#c9d1db'); rr(-20, 10, 40, 26, 6, '#8f98a6');
    cap([-44, 10, -66, 80], 26, '#d9e1ea'); cap([44, 10, 66, 80], 26, '#d9e1ea');
    helmet(0, -46, 40, 0);
    c.restore();
  };
  if (three > 0) figure(0, -140 + (1 - three) * 20, .78 * lerp(.94, 1, three), clamp((t - B.three) * 10) * .85);
  figure(-95 - 18 * three, -120, 1, 1); figure(95 + 18 * three, -120, 1, 1);
  c.restore();
  c.strokeStyle = '#8f98a6'; c.lineWidth = 8; c.beginPath(); c.moveTo(-210, -60); c.lineTo(-225, -150); c.lineTo(-140, -280); c.lineTo(140, -280); c.lineTo(220, -160); c.lineTo(210, -60); c.closePath(); c.stroke();
  scr();
  const da = 1 - inv(B.cut4 - .4, B.cut4 - .06, t);              // fade out before the cut
  label(1480, 360, 'BUILT FOR', 32, t - B.built, 'rgba(6,20,40,.8)', '#8fd8e6', da);
  label(1480, 450, '2 PEOPLE · 2 DAYS', 52, t - B.built - .12, undefined, undefined, da);
  label(1480, 610, 'NOW', 32, t - B.three, 'rgba(60,10,10,.85)', '#ff9a7a', da);
  label(1480, 700, '3 PEOPLE · 4 DAYS', 52, t - B.three - .12, '#d8433f', '#fff4e8', da);
  vignette(.6);
}

// ---------- shot E: the cabin. Power down, the cold, the poisoned air, and the fix ----------
const PANEL = [-700, -150], THERMO = [-320, -170], LAMP = [-60, -280], PORT = [640, 170], FILTER0 = [190, 170], BOX = [400, 170];
function shotE(t) {
  const u = t - B.cut4;
  // every key frames all of its subjects (checked against the layout: x -900..900, y -380..360)
  // one smooth spline through framings that each hold all their subjects (layout x -900..900, y -380..360);
  // every key is a little tighter than the one before it, so the camera never parks and never stops at a key
  const keys = [[B.cut4, -250, -30, .86], [B.cut4 + 1.2, -250, -32, .875],
    [B.cabin, -240, -40, .9], [B.freezing + .3, -230, -40, .93],
    [B.breath, -200, -35, .945], [B.toxic + .4, -120, -20, .955],
    [B.square - .3, 0, -10, .95], [B.round_ + .2, 35, 10, .97],
    [B.builds, 160, -10, 1.02], [B.tape, 120, -30, 1.07],
    [B.works + .6, 135, 30, 1.13], [B.cut5, 140, 40, 1.16]];     // crew stays whole; the panel is clearly cropped       // the panel is whole or clearly cropped, never a near-miss      // a steady push onto the fix (~3 %/s); the panel leaves the frame on purpose         // zoom only ever pushes in
  let [cx, cy, z] = splineCam(t, keys);
  const w = clamp((t - (B.cut5 - .55)) / .55);
  if (w > 0) z *= lz(1, .45, Math.pow(w, 2.2));                  // pulls back, accelerating into the cut
  window.CAM = [cx, cy, z];
  scr();
  const dark = 0;                                                 // the lights going off carry the power-down; no muddy dimming layer
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2f5f92'); g.addColorStop(1, '#173a66');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  cam(cx, cy, z);
  // wall structure
  for (let i = -7; i <= 7; i++) rr(i * 520 - 30, -2400, 60, 4800, 8, 'rgba(10,20,40,.35)');
  rr(-4000, 345, 8000, 40, 8, 'rgba(10,20,40,.4)'); c.fillStyle = 'rgba(10,20,40,.18)'; c.fillRect(-4000, 385, 8000, 2400);
  // control panel: lights switch off in a wave on "shut almost everything down"
  rr(PANEL[0] - 230, PANEL[1] - 170, 460, 340, 26, '#8fa3bf'); rr(PANEL[0] - 212, PANEL[1] - 152, 424, 304, 18, '#1b2a45');
  for (let r = 0; r < 5; r++) for (let k = 0; k < 8; k++) {
    const x = PANEL[0] - 175 + k * 50, y = PANEL[1] - 116 + r * 58;
    const off = ss(inv(B.shut + k * .09 + r * .03, B.shut + k * .09 + r * .03 + .35, t));   // each light dims over 0.35 s
    const col = (r + k) % 3 === 0 ? '#ffb347' : (r + k) % 3 === 1 ? '#73dd9e' : '#6fd3ff';
    const on = 1 - off * (k % 7 === 3 && r === 2 ? 0 : 1);       // one light stays on
    circle(x, y, 12, '#141d30');
    if (on > .01) { glow(x, y, 30, col, .5 * on); circle(x, y, 8, rgba(col, on)); }
  }
  // the crew, standing, breathing: the CO2 comes from them
  const CREW = [[-620, 250], [-470, 262], [-320, 250]];
  for (const [x, y] of CREW) {
    c.save(); c.translate(x, y + 2 * Math.sin(t * 1.6 + x)); c.scale(.9, .9);
    rr(-46, -10, 92, 120, 30, '#e6ebf0'); rr(-46, 60, 92, 50, 20, '#c9d1db'); rr(-20, 10, 40, 26, 6, '#8f98a6');
    cap([-44, 10, -66, 80], 26, '#d9e1ea'); cap([44, 10, 66, 80], 26, '#d9e1ea'); helmet(0, -46, 40, .4);
    c.restore();
  }
  // CO2: molecules that build up from "breath", sucked into the box on "it works"
  if (t > B.breath) {
    const n = Math.floor(24 * clamp((t - B.breath) / 3));
    const suck = eio(inv(B.works + .3, B.works + .7, t));             // the fix pulls the CO2 out
    for (let i = 0; i < 24; i++) {
      if (i >= n && suck <= 0) continue;
      const born = B.breath + i / 24 * 3, age = t - born;
      if (age < 0) continue;
      const [bx, by] = CREW[i % 3], dr = Math.min(age, 2.5);       // exhaled from a helmet, then drifting up and out
    const tx = -200 + 480 * hash(i + 200), ty = -190 + 200 * hash(i + 201), k2 = eo(clamp(age / 1.6));   // rest region: right of the thermometer, under the lamp
      let x = lerp(bx, tx, k2) + fl(i, t, 18, .7), y = lerp(by - 70, ty, k2) - 40 * Math.sin(k2 * Math.PI) + fl(i + 9, t, 12, .9);
      x = lerp(x, BOX[0], suck); y = lerp(y, BOX[1], suck);
      const s = SS(age * 30) * (1 - suck);
      if (s <= .01) continue;
      c.save(); c.translate(x, y); c.scale(s, s); c.rotate(hash(i) * 3 + t * .3);
      circle(-24, 0, 16, '#0f1a2e'); circle(24, 0, 16, '#0f1a2e'); circle(-22, 0, 13, '#eef2f8'); circle(22, 0, 13, '#eef2f8'); circle(0, 0, 19, '#0f1a2e'); circle(0, 0, 16, '#ff7a4a'); circle(-5, -5, 4, 'rgba(255,255,255,.45)');   // O=C=O, high contrast
      c.restore();
    }
  }
  // thermometer
  rr(THERMO[0] - 34, THERMO[1] - 150, 68, 300, 34, '#e6ebf0'); rr(THERMO[0] - 16, THERMO[1] - 130, 32, 250, 16, '#20304d');
  const temp = lerp(70, 38, eo(inv(B.cabin + .1, B.freezing + .2, t)));
  const lvl = (temp - 30) / 45;
  rr(THERMO[0] - 16, THERMO[1] + 120 - 250 * lvl, 32, 250 * lvl, 16, temp > 50 ? '#ff7a4a' : '#6fd3ff');
  circle(THERMO[0], THERMO[1] + 150, 44, '#e6ebf0'); circle(THERMO[0], THERMO[1] + 150, 32, temp > 50 ? '#ff7a4a' : '#6fd3ff');
  // CO2 warning lamp
  const toxic = t > B.toxic, fx_k = ss(inv(B.works + .6, B.works + .7, t)), fixed = fx_k >= 1, lampIn = clamp((t - B.toxic) * 8);   // red to green over 6 frames
  rr(LAMP[0] - 110, LAMP[1] - 60, 220, 120, 24, '#8fa3bf');
  const blink = toxic ? (.55 + .45 * Math.sin((t - B.toxic) * 9)) * lampIn * (1 - fx_k) + fx_k : 0;
  const lampCol = fx_k > .5 ? '#73dd9e' : '#ff5a3d';
  if (toxic) { glow(LAMP[0], LAMP[1], 200, '#ff5a3d', .5 * blink * (1 - fx_k)); glow(LAMP[0], LAMP[1], 200, '#73dd9e', .45 * fx_k); }
  rr(LAMP[0] - 90, LAMP[1] - 42, 180, 84, 18, '#3a2830'); if (toxic) { rr(LAMP[0] - 90, LAMP[1] - 42, 180, 84, 18, rgba('#ff5a3d', (.55 + .45 * blink) * lampIn * (1 - fx_k))); rr(LAMP[0] - 90, LAMP[1] - 42, 180, 84, 18, rgba('#73dd9e', fx_k)); }
  c.fillStyle = toxic ? '#1a0c10' : '#5a4048'; c.font = '700 44px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '2px';
  c.fillText('CO₂', LAMP[0], LAMP[1] + 3);
  // the round hole (the lunar module's air system)
  circle(PORT[0], PORT[1], 120, '#8fa3bf'); circle(PORT[0], PORT[1], 84, '#0c1424'); circle(PORT[0], PORT[1], 84 * .82, '#121c30');
  if (t > B.round_ - .1) { const k = SS((t - B.round_ + .1) * 30); c.strokeStyle = rgba('#ffd98a', k); c.lineWidth = 6; c.beginPath(); c.arc(PORT[0], PORT[1], 100 + 10 * (1 - k), 0, TAU); c.stroke(); }
  // on-board items, popping in one by one
  const items = [['cover', B.cover, 190], ['bag', B.bags, 390], ['tape', B.tape, 580], ['sock', B.sock, 770]];
  const asmAll = inv(B.works - .3, B.works + .4, t);             // the fix comes together ON "It works"
  for (const [n, t0, ix] of items) {
    const k_ = items.findIndex(q => q[0] === n), asmI = eio(clamp((asmAll - k_ * .12) / .64));   // one after another
    if (t < t0 - .05 || asmI >= 1) continue;
    const a = SS((t - t0 + .05) * 30), x = lerp(ix, BOX[0], asmI), y = lerp(-170 + (1 - a) * 20, BOX[1], asmI), s = lerp(.94, 1, a) * (1 - asmI * .85);
    c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = clamp((t - t0 + .05) * 10);   // solid while flying in: no ghosting
    if (n === 'cover') { rr(-70, -90, 140, 180, 8, '#cfe6ff'); rr(-70, -90, 140, 34, 8, '#6fa8dc'); for (let k = 0; k < 4; k++) rr(-50, -30 + k * 26, 100 - k * 12, 10, 5, '#7a9cc4'); }
    if (n === 'bag') { c.strokeStyle = 'rgba(225,240,255,.95)'; c.lineWidth = 12; for (const hx2 of [-34, 34]) { c.beginPath(); c.arc(hx2, -52, 22, Math.PI, TAU); c.stroke(); } c.fillStyle = 'rgba(225,240,255,.93)'; c.beginPath(); c.moveTo(-70, -54); c.lineTo(70, -54); c.lineTo(82, 70); c.quadraticCurveTo(84, 90, 62, 90); c.lineTo(-62, 90); c.quadraticCurveTo(-84, 90, -82, 70); c.closePath(); c.fill(); for (const k of [-10, 30]) cap([-50, k, 46, k + 10], 3, 'rgba(120,150,190,.45)'); ell(-46, 22, 9, 34, .2, 'rgba(255,255,255,1)'); }   // a carrier bag with handles
    if (n === 'tape') { circle(0, 0, 70, '#9aa2ae'); circle(0, 0, 34, '#1d2f4f'); circle(-14, -14, 20, 'rgba(255,255,255,.18)'); rr(40, 40, 70, 22, 4, '#9aa2ae'); }
    if (n === 'sock') { c.fillStyle = '#eef2f6'; c.beginPath(); c.moveTo(-30, -80); c.lineTo(20, -80); c.lineTo(20, 20); c.quadraticCurveTo(70, 30, 70, 60); c.quadraticCurveTo(70, 90, 20, 90); c.lineTo(-10, 90); c.quadraticCurveTo(-30, 90, -30, 60); c.closePath(); c.fill(); rr(-34, -86, 58, 24, 8, '#c9d1db'); }
    c.restore();
    const names = { cover: 'FLIGHT-PLAN COVER', bag: 'BAG', tape: 'DUCT TAPE', sock: 'SOCK' };
    const ia = 1 - clamp(asmI * 5);                                // each label leaves as its item starts to fly
    if (ia > 0) { const [px, py] = [W / 2 + (ix - cx) * z, H / 2 + (-170 - 125 - cy) * z]; c.save(); scr(); label(px, py, names[n], 22, t - t0 - .05, undefined, undefined, ia); c.restore(); cam(cx, cy, z); }
  }
  // the square filter: arrives on "square", tries the round hole and stops dead, then the fix
  if (t > B.square - .05) {
    const a = SS((t - B.square + .05) * 30);
    let fx = FILTER0[0], fy = FILTER0[1] + (1 - a) * 30;
    const tryP = inv(B.round_ + .35, B.round_ + .75, t), back = inv(B.round_ + .75, B.round_ + 1.1, t);
    fx += 270 * eio(tryP) - 100 * eo(back);                        // hits the rim of the round hole, bounces back                  // slides at the hole, hits the rim, bounces back
    const asm = eio(inv(B.works + .05, B.works + .55, t));
    fx = lerp(fx, BOX[0], asm); fy = lerp(fy, BOX[1], asm);
    c.save(); c.globalAlpha = clamp((t - B.square + .05) * 10);
    if (asm > 0) {                                               // hose from the box to the round hole
      c.strokeStyle = '#8f98a6'; c.lineWidth = 46 * asm; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx + 90, fy); c.lineTo(PORT[0], PORT[1]); c.stroke();
      c.strokeStyle = '#6b7484'; c.lineWidth = 12 * asm; c.beginPath(); c.moveTo(fx + 90, fy); c.lineTo(PORT[0], PORT[1]); c.stroke();
    }
    rr(fx - 110, fy - 110, 220, 220, 16, '#cfd6df'); rr(fx - 110, fy + 40, 220, 70, 16, '#a7b0bd');
    for (let i = 0; i < 5; i++) rr(fx - 85, fy - 80 + i * 32, 170, 12, 6, '#7d8796');
    if (t > B.works + .3) {                                       // bag over the box, tape across it, cover as a stiffener (grow in)
      const sp = SS((t - B.works - .3) * 30 / 2); c.save(); c.translate(fx, fy); c.scale(lerp(.3, 1, sp), lerp(.3, 1, sp)); c.globalAlpha = clamp((t - B.works - .3) * 10);   // grows in over ~10 frames
      rr(-128, -128, 256, 256, 30, 'rgba(235,246,255,.35)');
      for (const k of [-60, 60]) rr(-140, k - 14, 280, 28, 4, '#9aa2ae');
      rr(-128, -150, 256, 40, 8, '#6fa8dc'); c.restore();
    }
    c.restore();
  }
  // the power-down darkens the whole cabin; frost grows from the edges as it gets cold
  scr();
  if (dark > 0) { c.fillStyle = `rgba(3,6,18,${dark})`; c.fillRect(0, 0, W, H); }
  const frost = eo(inv(B.cabin, B.freezing + .4, t));
  if (frost > 0) {
    const fg = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .62);
    fg.addColorStop(0, 'rgba(210,240,255,0)'); fg.addColorStop(.62, 'rgba(210,240,255,0)'); fg.addColorStop(1, `rgba(210,240,255,${.42 * frost})`);
    c.fillStyle = fg; c.fillRect(0, 0, W, H);
    // (frost is the haze on the edges only: crystal strokes read as bird footprints)
  }
  if (t > B.cabin + .1) {
    const [px, py] = [W / 2 + (THERMO[0] - cx) * z, H / 2 + (THERMO[1] + 240 - cy) * z];   
    label(px, py, `${Math.round(temp)}°F`, 46, t - B.cabin - .1, 'rgba(6,20,40,.82)', temp > 50 ? '#ffb08a' : '#bfe9ff', 1 - inv(B.cut5 - .7, B.cut5 - .45, t));
  }
  if (t > B.works + .55) {
    const [px, py] = [W / 2 + (BOX[0] - cx) * z, H / 2 + (BOX[1] - 210 - cy) * z];
    label(px, py - 70, 'IT WORKS', 60, t - B.works - .55, '#2f9e5f', '#eaf5ee', 1 - inv(B.cut5 - .3, B.cut5 - .12, t));   // >= 0.6 s at full
  }
  vignette(.6);
}

// ---------- shot F: round the far side of the Moon, farther from Earth than anyone had been ----------
function shipPathF(t) {
  const s = clamp((t - B.cut5) / (B.cut6 - B.cut5));
  const ramp = x => .06 * Math.log1p(Math.exp(x / .06));          // a soft max(0, x): the orbit widens and heads home without a corner
  const ang = .4 - s * 3.0, r = 560 + 160 * ramp(s - .55) * 4;
  return [Math.cos(ang) * r * 1.05 - ramp(s - .62) * 450, Math.sin(ang) * r * .8 - 60, ang];   // outside the Moon's disk in front; behind it over the top   // stays in frame while it heads home
}
function shotF(t) {
  const u = t - B.cut5;
  const [sx, sy, ang] = shipPathF(t);
  let z = lz(1.6, .78, EA(u * 30, .1));                          // enters still pulling back (continues E), settles
  let [cx, cy] = [0, -110];                                       // room above the Moon for the ship's path over the top
  // "and fall back home": the camera locks onto the capsule and pushes in, accelerating to the cut
  z *= Math.exp(.04 * Math.max(0, u - 1.5));                     // a creep; the ship flies out toward Earth, the cut is at rest
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  const behind = Math.sin(ang) < -.15 && Math.abs(Math.cos(ang)) < .75;   // on the far side the ship passes behind the Moon
  c.setLineDash([12, 12]); c.strokeStyle = 'rgba(115,221,158,.55)'; c.lineWidth = 4; c.beginPath();
  for (let i = 0; i <= 240; i++) { const [px, py] = shipPathF(B.cut5 + (B.cut6 - B.cut5) * i / 240); i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.stroke(); c.setLineDash([]);
  const [nx, ny] = shipPathF(t + 1 / 60), dir = Math.atan2(ny - sy, nx - sx);
  const drawShip = () => { glow(sx, sy, 70, '#9fd8ff', .25); ship(t, sx, sy, .2, dir, { hole: true }); };   // lander leads, as in shot A; the stack stays whole
  if (behind) drawShip();
  moon(0, 0, 420);
  if (!behind) drawShip();
  scr();
  if (t > B.fall - .1) { const [px, py] = [W / 2 + (sx - cx) * z, H / 2 + (sy - cy) * z]; label(clamp(px + 40, 260, W - 260), clamp(py + 95, 100, H - 100), '← BACK TO EARTH', 34, t - B.fall + .1, 'rgba(6,40,30,.88)', '#73dd9e', 1 - inv(B.cut6 - .35, B.cut6 - .06, t)); }
  if (t > B.farther) {
    const mi = Math.round(lerp(200000, 248655, eo(clamp((t - B.farther) / 1.1))));
    const fa = 1 - inv(B.fall - .6, B.fall - .2, t);
    label(430, 92, `${mi.toLocaleString('en-US')} MILES FROM EARTH`, 38, t - B.farther, 'rgba(6,20,40,.82)', '#ffd98a', fa);
    label(430, 152, 'FARTHER THAN ANY HUMAN HAD EVER BEEN', 28, t - B.farther - .5, 'rgba(6,20,40,.7)', '#8fd8e6', fa);
  }
  vignette(.6);
}

// ---------- shot G: three parachutes over the Pacific, all three came home ----------
function shotG(t) {
  const u = t - B.cut6;
  const splash = B.all3 - .15;
  const dy = Math.min(t, splash);
  const capY = lerp(-420, 300, clamp((dy - B.cut6) / (splash - B.cut6)));
  const capX = 40 + 30 * Math.sin(u * .8);
  let z = lz(.74, .92, eo(ss(inv(0, 1.8, u))));                  // F ends at rest: G leaves rest (zero across the cut)
  z *= Math.exp(.05 * u);                                        // never parks, through the end card
  const [cx, cy] = aim(capX, capY, 0, lerp(0, -120, eo(ss(inv(B.cut6, B.cut6 + 2.4, t)))) * 0 + 0, z);
  const camY = lerp(capY, 120, inv(splash - .6, splash + .8, t));
  const C2 = [capX, Math.min(capY - 230, camY)];                  // framed above the capsule so all three canopies fit
  window.CAM = [C2[0], C2[1] - 80 / z, z];
  scr();
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0b1e4a'); sky.addColorStop(.6, '#3d4f8a'); sky.addColorStop(1, '#f3a96b');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  cam(C2[0] * .3, (C2[1] - 80 / z) * .3, 1 + (z - 1) * .3);
  glow(-500, 330, 520, '#ffc27a', .55); circle(-500, 330, 70, '#ffe2b0');
  const ta = 1 - .95 * inv(B.title - .7, B.title - .1, t);            // clouds clear away from the end-card type
  for (let i = 0; i < 6; i++) { const x = -1600 + i * 620 + fl(i, t, 20, .2), y = -300 + hash(i + 400) * 400, a = ta; rr(x, y, 300 + hash(i) * 200, 46, 23, `rgba(255,230,210,${.35 * a})`); rr(x + 60, y - 30, 180, 46, 23, `rgba(255,230,210,${.3 * a})`); }
  cam(C2[0], C2[1] - 80 / z, z);
  // ocean
  c.fillStyle = '#16488f'; c.fillRect(-4000, 340, 8000, 3000);
  for (let i = 0; i < 14; i++) { const y = 360 + i * i * 9; c.fillStyle = i % 2 ? 'rgba(10,40,100,.35)' : 'rgba(80,160,230,.18)'; c.fillRect(-4000, y, 8000, 6 + i * 2); }
  for (let i = 0; i < 40; i++) { const x = ((hash(i + 500) * 6000 + t * 40) % 6000) - 3000, y = 370 + hash(i + 501) * 900; rr(x, y, 60 + hash(i) * 80, 6, 3, 'rgba(255,220,190,.35)'); }
  // splash and rings
  if (t > splash) {
    const k = t - splash;
    for (let r = 0; r < 3; r++) { const a = clamp(k * .6 - r * .25); if (a <= 0) continue; c.strokeStyle = rgba('#eaf6ff', .6 * (1 - a)); c.lineWidth = 6; c.beginPath(); c.ellipse(capX, 340, 80 + a * 420, (80 + a * 420) * .18, 0, 0, TAU); c.stroke(); }
    for (let i = 0; i < 40; i++) { const a = -Math.PI * (.1 + .8 * hash(i + 600)), sp = 200 + hash(i + 601) * 500, px = capX + Math.cos(a) * sp * k, py = 330 + Math.sin(a) * sp * k + 900 * k * k; if (py > 345) continue; circle(px, py, 6 + hash(i) * 8, 'rgba(234,246,255,.8)'); }
  }
  const bob = t > splash ? Math.sin((t - splash) * 3) * 6 * Math.exp(-(t - splash)) : 0;
  const chutes = 1 - eo(inv(splash + .1, splash + 1.6, t));       // 1 = open overhead, 0 = settled on the sea and gone
  capsule(capX, Math.min(capY, 300) + bob, 1, .05 * Math.sin(u * 1.3) * (t < splash ? 1 : .3), chutes);
  scr();
  label(330, 150, 'APRIL 17, 1970', 34, t - B.april2);
  if (t > B.title) {
    c.textBaseline = 'alphabetic';
    [['MADE WITH', 0, '#eaf5ee', 600, 84], ['OPUS', 1, '#ffd36b', 700, 150]].forEach(([wd, k, col, wt, size]) => {
      const tt = t - B.title - k * .12; if (tt <= 0) return;
      const e = eo5(clamp(tt / .55)), y = k ? 560 : 400;
      c.font = `${wt} ${size}px Fredoka`; c.letterSpacing = `${size * .05}px`; c.textAlign = 'left';
      c.save(); c.beginPath(); c.rect(0, y - size * 1.1, W, size * 1.35); c.clip();
      c.fillStyle = rgba(col, clamp(tt / .05)); c.fillText(wd, 170, y + (1 - e) * size * 1.3); c.restore();
    });
  }
  vignette(.55);
}

// ---------- timeline ----------
function draw(t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  if (t < B.cut1) shotA(t);
  else if (t < B.cut2) shotB(t);
  else if (t < B.cut3) shotC(t);
  else if (t < B.cut4) shotD(t);
  else if (t < B.cut5) shotE(t);
  else if (t < B.cut6) shotF(t);
  else shotG(t);
}
const CUTS = ['cut1', 'cut2', 'cut3', 'cut4', 'cut5', 'cut6'].map(k => Math.round(B[k] * 60));
window.seekFrame = F => { window.F = F; draw(F / window.FPS); };
window.seekSub = (F, off) => {
  const f = Math.floor(F); let lo = 0, hi = window.LAST_FRAME + .999;
  for (const k of CUTS) { if (k <= f) lo = k; else { hi = Math.min(hi, k - .001); break; } }
  return window.seekFrame(clamp(F + off, lo, hi));
};
window.seek = t => window.seekFrame(t * window.FPS);
})();
