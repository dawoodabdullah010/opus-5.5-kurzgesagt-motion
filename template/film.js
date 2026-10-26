// Apollo 13 in 60 seconds. Every frame is a pure function of t. Helpers come from lib.js.
// Camera rules (see SKILL.md and EVAL.md): every zoom is straight about one aim point, direction continues or
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
  if (chutes > 0) {
    const cols = [['#ff8f4a', '#fff4e8'], ['#fff4e8', '#ff8f4a'], ['#ff8f4a', '#fff4e8']];
    [-230, 0, 230].forEach((dx, i) => {
      const cy = -470 - (i === 1 ? 50 : 0), r = 150 * chutes;
      c.strokeStyle = 'rgba(230,235,245,.55)'; c.lineWidth = 2.5;
      for (const k of [-.9, -.3, .3, .9]) { c.beginPath(); c.moveTo(dx + k * r, cy); c.lineTo(0, -70); c.stroke(); }
      c.save(); c.beginPath(); c.ellipse(dx, cy, r, r * .62, 0, Math.PI, TAU); c.closePath(); c.clip();
      for (let k = 0; k < 6; k++) { c.fillStyle = cols[i][k % 2]; c.beginPath(); c.moveTo(dx, cy); c.arc(dx, cy, r + 2, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6); c.fill(); }
      c.restore();
      ell(dx, cy, r, r * .1, 0, 'rgba(120,40,20,.35)');
    });
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
  c.setLineDash([14, 16]); c.strokeStyle = 'rgba(234,245,238,.28)'; c.lineWidth = 4 / z * 1.5;
  c.beginPath(); c.moveTo(EARTH[0] + 300, EARTH[1]); c.quadraticCurveTo(0, -60, MOON[0] - 230, MOON[1] + 10); c.stroke(); c.setLineDash([]);
  glow(sx, sy, 60, '#9fd8ff', .25);
  ship(t, sx, sy, .16, -.05);
  scr();
  label(330, 150, 'APRIL 13, 1970', 34, t - B.april);
  const mi = Math.round(200000 * EA((t - B.miles) * 30, .2));
  if (t > B.miles) label(1560, 150, `${mi.toLocaleString('en-US')} MILES FROM EARTH`, 30, t - B.miles, 'rgba(6,20,40,.78)', '#ffd98a');
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
  const g = eio(inv(B.lander - 1.07, B.lander - .47, t));
  if (g > 0) {
    const zc = z, z2 = 5.2 * Math.exp(.04 * Math.max(0, t - B.lander));
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
    c.setLineDash([16, 14]); c.strokeStyle = 'rgba(115,221,158,.95)'; c.lineWidth = 6 / Math.max(1, z * .8); c.beginPath();
    for (let i = 0; i <= N * q; i++) { const [px, py] = wayHome(i / N); i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke(); c.setLineDash([]);
    const [ax, ay] = wayHome(q), [bx, by] = wayHome(Math.max(0, q - .01)), ang = Math.atan2(ay - by, ax - bx);
    c.save(); c.translate(ax, ay); c.rotate(ang); c.fillStyle = '#73dd9e'; c.beginPath(); c.moveTo(22, 0); c.lineTo(-12, -14); c.lineTo(-12, 14); c.closePath(); c.fill(); c.restore();
    tip = [ax, ay];
  }
  const rotC = SHIPROT_C;
  const [hx, hy] = holeAt(sx, sy, .16, rotC);
  vent(t, hx, hy, .1, 1 - .6 * inv(B.cut2, B.cut2 + 3, t));      // still leaking, thinning out
  glow(sx, sy, 60, '#9fd8ff', .25);
  ship(t, sx, sy, .16, rotC, { hole: true });
  // the crew moves from the command module into the lander: three helmets along the ship's own axis
  const lk = eo(inv(B.lander - .9, B.lander - .4, t));
  const toW = (lx, ly) => [sx + (Math.cos(rotC) * lx - Math.sin(rotC) * ly) * .16, sy + (Math.sin(rotC) * lx + Math.cos(rotC) * ly) * .16];
  if (lk > 0) { const [gx, gy] = toW(110, 0); glow(gx, gy, 26, '#ffd36b', .35 * lk); }
  for (let i = 0; i < 3; i++) {                                  // strictly one at a time, during "They move into the lunar lander"
    const t0 = B.lander - .5 + i * .25;
    if (t < t0 - .03 || t > t0 + .25) continue;
    const k = eio(inv(t0, t0 + .24, t));
    const [ax, ay] = toW(lerp(-6, 104, k), lerp(-58, -26, k) - 22 * Math.sin(k * Math.PI));
    c.save(); c.translate(ax, ay); c.rotate(rotC + .3 * Math.sin(k * Math.PI)); c.globalAlpha = clamp((t - t0 + .03) * 20) * (1 - inv(.8, 1, k));
    rr(-3.2, 1.5, 6.4, 8, 2.6, '#e6ebf0'); cap([-3, 3, -5.5, 7.5], 2.2, '#d9e1ea'); cap([3, 3, 5.5, 7.5], 2.2, '#d9e1ea');   // a tiny astronaut
    circle(0, -1.5, 3.4, '#f3f7fb'); ell(.5, -1.3, 2.3, 1.8, 0, '#0f2236');
    c.restore();
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
    label(px, py - 70, 'LUNAR LANDER', 32, t - B.lander + .9, 'rgba(6,20,40,.85)', '#ffd98a');
  }
  vignette(.6);
}

// ---------- shot D: the lunar module, a lifeboat built for two ----------
function shotD(t) {
  const u = t - B.cut3;
  let z = lz(.82, 1, eo(ss(inv(0, 1.4, u)))) * Math.exp(.03 * u);   // C ends on a creep: D leaves rest and pushes in gently
  const wx = 30, wy = -150;                                      // the window into the cabin
  const w = clamp((t - (B.cut4 - .9)) / .9);
  let [cx, cy] = aim(wx, wy, -wx * z * .0, (0 - wy) * 0, z);
  cx = 330; cy = -40;                                            // lander on the left third, the numbers on the right
  if (w > 0) { const e = Math.pow(w, 3), ze = lz(z, z * 5, e); [cx, cy] = aim(wx, wy, (wx - 330) * z * (1 - e), (wy + 40) * z * (1 - e), ze); z = ze; }
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
  label(1480, 360, 'BUILT FOR', 32, t - B.built, 'rgba(6,20,40,.8)', '#8fd8e6');
  label(1480, 450, '2 PEOPLE · 2 DAYS', 52, t - B.built - .12);
  label(1480, 610, 'NOW', 32, t - B.three, 'rgba(60,10,10,.85)', '#ff9a7a');
  label(1480, 700, '3 PEOPLE · 4 DAYS', 52, t - B.three - .12, '#d8433f', '#fff4e8');
  vignette(.6);
}

// ---------- shot E: the cabin. Power down, the cold, the poisoned air, and the fix ----------
const PANEL = [-760, -120], THERMO = [-120, -250], LAMP = [260, -260], PORT = [760, 150], FILTER0 = [180, 150];
function shotE(t) {
  const u = t - B.cut4;
  const keys = [[B.cut4, -700, -100, .62], [B.cut4 + 1.4, -700, -100, 1.05],
    [B.cabin - .3, -700, -100, 1.12], [B.cabin + 1.0, THERMO[0], THERMO[1] + 60, 1.35],
    [B.breath - .4, THERMO[0] + 20, THERMO[1] + 60, 1.42], [B.breath + .9, 120, -120, 1.0],
    [B.square - .6, 140, -110, 1.06], [B.square + .6, 470, 80, 1.15],
    [B.builds - .3, 470, 70, 1.2], [B.builds + 1.0, 470, 40, .95],
    [B.works + .25, 470, 0, 1.02]];
  let [cx, cy, z] = aimCam(t, keys);
  if (u < 1.4) z = lz(.36, 1.05, EA(u * 30, .14));               // enters still pushing in (continues D, ~8 %/frame)
  z *= Math.exp(.04 * u); cx += 14 * u; // never parks: a creep and a drift
  const w = clamp((t - (B.cut5 - .55)) / .55);
  if (w > 0) z *= lz(1, .45, Math.pow(w, 2.2));                  // pulls back, accelerating into the cut
  window.CAM = [cx, cy, z];
  scr();
  const dark = .32 * eo(inv(B.shut, B.shut + 1.6, t));
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a4470'); g.addColorStop(1, '#16284a');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  cam(cx, cy, z);
  // wall structure
  for (let i = -3; i <= 3; i++) rr(i * 520 - 30, -900, 60, 1800, 8, 'rgba(10,20,40,.35)');
  rr(-1400, 330, 2800, 40, 8, 'rgba(10,20,40,.4)');
  // control panel: lights switch off in a wave on "shut almost everything down"
  rr(PANEL[0] - 330, PANEL[1] - 220, 660, 440, 26, '#2a3a58'); rr(PANEL[0] - 310, PANEL[1] - 200, 620, 400, 18, '#22304b');
  for (let r = 0; r < 6; r++) for (let k = 0; k < 10; k++) {
    const x = PANEL[0] - 270 + k * 60, y = PANEL[1] - 160 + r * 62;
    const off = inv(B.shut + k * .09 + r * .03, B.shut + k * .09 + r * .03 + .12, t);
    const col = (r + k) % 3 === 0 ? '#ffb347' : (r + k) % 3 === 1 ? '#73dd9e' : '#6fd3ff';
    const on = 1 - off * (k % 7 === 3 && r === 2 ? 0 : 1);       // one light stays on
    circle(x, y, 13, '#141d30');
    if (on > .01) { glow(x, y, 34, col, .5 * on); circle(x, y, 9, rgba(col, on)); }
  }
  // thermometer
  rr(THERMO[0] - 34, THERMO[1] - 150, 68, 300, 34, '#e6ebf0'); rr(THERMO[0] - 16, THERMO[1] - 130, 32, 250, 16, '#20304d');
  const temp = lerp(70, 38, eo(inv(B.cabin + .1, B.freezing + .2, t)));
  const lvl = (temp - 30) / 45;
  rr(THERMO[0] - 16, THERMO[1] + 120 - 250 * lvl, 32, 250 * lvl, 16, temp > 50 ? '#ff7a4a' : '#6fd3ff');
  circle(THERMO[0], THERMO[1] + 150, 44, '#e6ebf0'); circle(THERMO[0], THERMO[1] + 150, 32, temp > 50 ? '#ff7a4a' : '#6fd3ff');
  // CO2 warning lamp
  const toxic = t > B.toxic, fixed = t > B.works + .2, lampIn = clamp((t - B.toxic) * 8);
  rr(LAMP[0] - 110, LAMP[1] - 60, 220, 120, 24, '#22304b');
  const blink = toxic && !fixed ? (.55 + .45 * Math.sin((t - B.toxic) * 9)) * lampIn : 0;
  const lampCol = fixed ? '#73dd9e' : '#ff5a3d';
  if (toxic) glow(LAMP[0], LAMP[1], 200, lampCol, fixed ? .45 : .5 * blink);
  rr(LAMP[0] - 90, LAMP[1] - 42, 180, 84, 18, '#3a2830'); if (toxic) rr(LAMP[0] - 90, LAMP[1] - 42, 180, 84, 18, rgba(lampCol, (fixed ? 1 : .55 + .45 * blink) * lampIn));
  c.fillStyle = toxic ? '#1a0c10' : '#5a4048'; c.font = '700 44px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '2px';
  c.fillText('CO₂', LAMP[0], LAMP[1] + 3);
  // the round hole (the lunar module's air system)
  circle(PORT[0], PORT[1], 120, '#3a4a68'); circle(PORT[0], PORT[1], 84, '#0c1424'); circle(PORT[0], PORT[1], 84 * .82, '#121c30');
  if (t > B.round_ - .1) { const k = SS((t - B.round_ + .1) * 30); c.strokeStyle = rgba('#ffd98a', k); c.lineWidth = 6; c.beginPath(); c.arc(PORT[0], PORT[1], 100 + 10 * (1 - k), 0, TAU); c.stroke(); }
  // the square filter: arrives on "square", tries the round hole and stops dead, then the fix
  if (t > B.square - .05) {
    const a = SS((t - B.square + .05) * 30);
    let fx = FILTER0[0], fy = FILTER0[1] + (1 - a) * 30;
    const tryP = inv(B.round_ + .35, B.round_ + .75, t), back = inv(B.round_ + .75, B.round_ + 1.1, t);
    fx += 380 * eio(tryP) - 120 * eo(back) * 1;                  // slides at the hole, hits the rim, bounces back
    const asm = eio(inv(B.works - .35, B.works + .25, t));
    fx = lerp(fx, 470, asm); fy = lerp(fy, 150, asm);
    c.save(); c.globalAlpha = clamp((t - B.square + .05) * 10);
    if (asm > 0) {                                               // hose from the box to the round hole
      c.strokeStyle = '#8f98a6'; c.lineWidth = 46 * asm; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx + 90, fy); c.lineTo(PORT[0], PORT[1]); c.stroke();
      c.strokeStyle = '#6b7484'; c.lineWidth = 12 * asm; c.beginPath(); c.moveTo(fx + 90, fy); c.lineTo(PORT[0], PORT[1]); c.stroke();
    }
    rr(fx - 110, fy - 110, 220, 220, 16, '#cfd6df'); rr(fx - 110, fy + 40, 220, 70, 16, '#a7b0bd');
    for (let i = 0; i < 5; i++) rr(fx - 85, fy - 80 + i * 32, 170, 12, 6, '#7d8796');
    if (asm > 0) {                                               // bag over the box, tape across it, cover as a stiffener
      rr(fx - 128, fy - 128, 256, 256, 30, rgba('#dff3ff', .38 * asm));
      for (const k of [-60, 60]) rr(fx - 140, fy + k - 14, 280, 28, 4, rgba('#9aa2ae', asm));
      rr(fx - 128, fy - 150, 256, 40, 8, rgba('#6fa8dc', asm));
    }
    c.restore();
  }
  // on-board items, popping in one by one
  const items = [['cover', B.cover, 200], ['bag', B.bags, 390], ['tape', B.tape, 570], ['sock', B.sock, 740]];
  const asmI = eio(inv(B.works - .35, B.works + .1, t));
  for (const [n, t0, ix] of items) {
    if (t < t0 - .05 || asmI >= 1) continue;
    const a = SS((t - t0 + .05) * 30), x = lerp(ix, 470, asmI), y = lerp(-40 + (1 - a) * 20, 150, asmI), s = lerp(.94, 1, a) * (1 - asmI * .7);
    c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = clamp((t - t0 + .05) * 10) * (1 - asmI);
    if (n === 'cover') { rr(-70, -90, 140, 180, 8, '#6fa8dc'); rr(-50, -60, 100, 14, 5, '#eaf5ee'); rr(-50, -36, 70, 10, 5, 'rgba(234,245,238,.6)'); }
    if (n === 'bag') { rr(-75, -85, 150, 170, 34, 'rgba(223,243,255,.55)'); rr(-60, -85, 120, 18, 8, 'rgba(255,255,255,.7)'); }
    if (n === 'tape') { circle(0, 0, 70, '#9aa2ae'); circle(0, 0, 34, '#1d2f4f'); circle(-14, -14, 20, 'rgba(255,255,255,.18)'); rr(40, 40, 70, 22, 4, '#9aa2ae'); }
    if (n === 'sock') { c.fillStyle = '#eef2f6'; c.beginPath(); c.moveTo(-30, -80); c.lineTo(20, -80); c.lineTo(20, 20); c.quadraticCurveTo(70, 30, 70, 60); c.quadraticCurveTo(70, 90, 20, 90); c.lineTo(-10, 90); c.quadraticCurveTo(-30, 90, -30, 60); c.closePath(); c.fill(); rr(-34, -86, 58, 24, 8, '#c9d1db'); }
    c.restore();
  }
  // CO2: molecules that build up from "breath", sucked into the box on "it works"
  if (t > B.breath) {
    const n = Math.floor(34 * clamp((t - B.breath) / 3));
    const suck = eio(inv(B.works, B.works + 1.0, t));
    for (let i = 0; i < 34; i++) {
      if (i >= n && suck <= 0) continue;
      const born = B.breath + i / 34 * 3, age = t - born;
      if (age < 0) continue;
      let x = -900 + hash(i + 200) * 2000 + fl(i, t, 40, .7), y = -350 + hash(i + 201) * 700 + fl(i + 9, t, 30, .9);
      x = lerp(x, 470, suck); y = lerp(y, 150, suck);
      const s = SS(age * 30) * (1 - suck);
      if (s <= .01) continue;
      c.save(); c.translate(x, y); c.scale(s, s); c.rotate(hash(i) * 3 + t * .3);
      circle(-22, 0, 14, '#9aa2b4'); circle(22, 0, 14, '#9aa2b4'); circle(0, 0, 18, '#454a5a'); circle(-5, -6, 5, 'rgba(255,255,255,.25)');
      c.restore();
    }
  }
  // the power-down darkens the whole cabin; frost grows from the edges as it gets cold
  scr();
  if (dark > 0) { c.fillStyle = `rgba(3,6,18,${dark})`; c.fillRect(0, 0, W, H); }
  const frost = eo(inv(B.cabin, B.freezing + .4, t));
  if (frost > 0) {
    const fg = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .62);
    fg.addColorStop(0, 'rgba(200,235,255,0)'); fg.addColorStop(.7, 'rgba(200,235,255,0)'); fg.addColorStop(1, `rgba(200,235,255,${.3 * frost})`);
    c.fillStyle = fg; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 46; i++) {
      const a = hash(i + 300) * TAU, r = 1 - .18 * frost * hash(i + 301);
      const x = W / 2 + Math.cos(a) * W * .62 * r, y = H / 2 + Math.sin(a) * H * .62 * r;
      sparkle(x, y, (10 + 18 * hash(i + 302)) * frost, rgba('#eaf8ff', .7 * frost));
    }
  }
  if (t > B.cabin + .1) {
    const [px, py] = [W / 2 + (THERMO[0] + 150 - cx) * z, H / 2 + (THERMO[1] - cy) * z];
    label(px + 90, py, `${Math.round(temp)}°F`, 46, t - B.cabin - .1, 'rgba(6,20,40,.82)', temp > 50 ? '#ffb08a' : '#bfe9ff');
  }
  if (t > B.works) {
    const [px, py] = [W / 2 + (470 - cx) * z, H / 2 + (150 - 210 - cy) * z];
    label(px, py - 40, 'IT WORKS', 40, t - B.works - .1, '#2f9e5f', '#eaf5ee');
  }
  vignette(.6);
}

// ---------- shot F: round the far side of the Moon, farther from Earth than anyone had been ----------
function shipPathF(t) {
  const s = clamp((t - B.cut5) / (B.cut6 - B.cut5));
  const ang = -1.1 + s * 3.6, r = 560 + 160 * Math.max(0, s - .55) * 4;
  return [Math.cos(ang) * r * 1.05 - Math.max(0, s - .62) * 1600, Math.sin(ang) * r * .55 - 60, ang];
}
function shotF(t) {
  const u = t - B.cut5;
  const [sx, sy, ang] = shipPathF(t);
  let z = lz(1.6, .78, EA(u * 30, .1));                          // enters still pulling back (continues E), settles
  let [cx, cy] = [0, -40];
  // "and fall back home": the camera locks onto the capsule and pushes in, accelerating to the cut
  const w = clamp((t - B.fall) / (B.cut6 - B.fall));
  if (w > 0) { const e = Math.pow(w, 2.4), ze = lz(z, z * 9, e); [cx, cy] = aim(sx, sy, (sx - cx) * z * (1 - e), (sy - cy) * z * (1 - e), ze); z = ze; }
  window.CAM = [cx, cy, z];
  spaceBg(t, cx, cy, z); cam(cx, cy, z);
  const behind = Math.sin(ang) < -.15 && Math.abs(Math.cos(ang)) < .75;   // on the far side the ship passes behind the Moon
  c.setLineDash([12, 12]); c.strokeStyle = 'rgba(115,221,158,.55)'; c.lineWidth = 4; c.beginPath();
  for (let i = 0; i <= 60; i++) { const [px, py] = shipPathF(B.cut5 + (B.cut6 - B.cut5) * i / 60); i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.stroke(); c.setLineDash([]);
  const drawShip = () => { glow(sx, sy, 70, '#9fd8ff', .25); ship(t, sx, sy, .2, Math.PI + ang + Math.PI / 2 - 1.57 + (sx < 0 ? Math.PI : 0) * 0, { sep: eo(inv(B.fall + .25, B.cut6, t)) }); };
  if (behind) drawShip();
  moon(0, 0, 420);
  if (!behind) drawShip();
  scr();
  if (t > B.farther) {
    const mi = Math.round(lerp(200000, 248655, eo(clamp((t - B.farther) / 1.1))));
    label(960, 140, `${mi.toLocaleString('en-US')} MILES FROM EARTH`, 34, t - B.farther, 'rgba(6,20,40,.82)', '#ffd98a');
    label(960, 214, 'FARTHER THAN ANY HUMAN HAD EVER BEEN', 24, t - B.farther - .5, 'rgba(6,20,40,.7)', '#8fd8e6');
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
  let z = lz(.5, .92, EA(u * 30, .12));                          // enters still pushing in (continues F), settles
  z *= Math.exp(.05 * u);                                        // never parks, through the end card
  const [cx, cy] = aim(capX, capY, 0, lerp(0, -120, eo(ss(inv(B.cut6, B.cut6 + 2.4, t)))) * 0 + 0, z);
  const camY = lerp(capY, 120, inv(splash - .6, splash + .8, t));
  const C2 = [capX, Math.min(capY, camY)];
  window.CAM = [C2[0], C2[1] - 80 / z, z];
  scr();
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0b1e4a'); sky.addColorStop(.6, '#3d4f8a'); sky.addColorStop(1, '#f3a96b');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  cam(C2[0] * .3, (C2[1] - 80 / z) * .3, 1 + (z - 1) * .3);
  glow(-500, 330, 520, '#ffc27a', .55); circle(-500, 330, 70, '#ffe2b0');
  for (let i = 0; i < 6; i++) { const x = -1600 + i * 620 + fl(i, t, 20, .2), y = -300 + hash(i + 400) * 400; rr(x, y, 300 + hash(i) * 200, 46, 23, 'rgba(255,230,210,.35)'); rr(x + 60, y - 30, 180, 46, 23, 'rgba(255,230,210,.3)'); }
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
  const chutes = t < splash + .2 ? 1 : Math.max(0, 1 - (t - splash - .2) * 1.5);
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
