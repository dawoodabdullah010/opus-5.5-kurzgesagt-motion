// Shared helpers copied from film/film.js (measured curves, drawing, starfield, pills, planet).
const W = 1920, H = 1080;
const c = document.getElementById('c').getContext('2d');
const TAU = Math.PI * 2;

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const eo5 = t => 1 - Math.pow(1 - t, 5);
const ei = t => t * t * t;
const lz = (z0, z1, e) => Math.exp(lerp(Math.log(z0), Math.log(z1), e));
const ss = t => t * t * (3 - 2 * t);
const SS = n => n <= 0 ? 0 : n < 1 ? .39 * n : 1 - .61 * Math.pow(.78, n - 1);   // snap-settle (craft 3.1)
const EA = (n, k = .14) => n <= 0 ? 0 : 1 - Math.pow(1 - k, n);                  // exponential arrival (craft 3.2)
const EX = (n, N) => n <= 0 ? 0 : n >= N ? 1 : (Math.pow(1.5, n) - 1) / (Math.pow(1.5, N) - 1); // whip exit (craft 3.3)
// one straight zoom: world point (fx, fy) sits at screen offset (sx, sy) from the centre at zoom z
const aim = (fx, fy, sx, sy, z) => [fx - sx / z, fy - sy / z];
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// damped spring step response, t in seconds
const spring = (t, f = 15, d = .55) => {
  if (t <= 0) return 0;
  const wd = f * Math.sqrt(1 - d * d);
  return 1 - Math.exp(-d * f * t) * (Math.cos(wd * t) + d / Math.sqrt(1 - d * d) * Math.sin(wd * t));
};
const fl = (i, t, a = 1, sp = .6) => Math.sin(t * sp + hash(i) * TAU) * a; // ambient float

// ---------- colour ----------
const rgbCache = {};
const rgba = (hex, a = 1) => {
  let v = rgbCache[hex];
  if (!v) { const n = parseInt(hex.slice(1), 16); v = rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  return `rgba(${v[0]},${v[1]},${v[2]},${clamp(a)})`;
};

// ---------- drawing ----------
const cam = (x, y, z, rot = 0) => { c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.rotate(rot); c.scale(z, z); c.translate(-x, -y); };
const scr = () => c.setTransform(1, 0, 0, 1, 0, 0);
const circle = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.fill(); };
const ell = (x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); c.fill(); };
const rr = (x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
const cap = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
const sstroke = (pts, w, col) => { // smooth curve through a polyline
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]);
  const n = pts.length / 2;
  for (let i = 1; i < n - 1; i++) c.quadraticCurveTo(pts[2 * i], pts[2 * i + 1], (pts[2 * i] + pts[2 * i + 2]) / 2, (pts[2 * i + 1] + pts[2 * i + 3]) / 2);
  if (n > 1) c.lineTo(pts[2 * n - 2], pts[2 * n - 1]); c.stroke();
};
const glow = (x, y, r, col, a = 1) => {
  if (r <= 0 || a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.3, rgba(col, a * .5)); g.addColorStop(1, rgba(col, 0));
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
};
const pill = (x, y, text, size, bg, fg, t0 = 0, scale = 1, alpha = 1) => {   // t0 = seconds since it started entering
  if (t0 <= 0 || alpha <= 0) return;
  const p = SS(t0 * 30), s = lerp(.94, 1, p) * scale;
  c.save(); c.translate(x, y + (1 - p) * 16); c.scale(s, s); c.globalAlpha = clamp(t0 * 30 / 3) * alpha;
  c.font = `700 ${size}px Fredoka`; c.letterSpacing = `${size * .06}px`;
  const w = c.measureText(text).width + size * 1.1, h = size * 1.55;
  rr(-w / 2, -h / 2, w, h, h / 2, bg);
  c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, size * .06);
  c.restore();
};
// four-point sparkle star
const sparkle = (x, y, r, col) => {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
};

// stars in screen space with parallax from the camera
function starfield(t, cx, cy, z, seed, n, depth, alpha = 1) {
  scr();
  const s = Math.pow(z, depth * .6);
  const PW = W + 300, PH = H + 300;
  for (let i = 0; i < n; i++) {
    const hx = hash(seed + i * 3.1), hy = hash(seed + i * 7.7), hs = hash(seed + i * 1.3);
    let x = (hx * PW - PW / 2 - cx * depth) * s, y = (hy * PH - PH / 2 - cy * depth) * s;
    x = ((x + PW / 2) % PW + PW) % PW - 150; y = ((y + PH / 2) % PH + PH) % PH - 150;
    const tw = .5 + .5 * Math.sin(t * (1.2 + hs * 2.5) + hs * 40);
    const a = alpha * (.35 + .65 * tw) * (.4 + hs * .6);
    if (hs > .88) { sparkle(x, y, (5 + hs * 6) * Math.min(1.6, s), rgba('#eaf5ee', a)); glow(x, y, 14 * Math.min(1.6, s), '#9fd8ff', a * .35); }
    else circle(x, y, (.9 + hs * 1.8) * Math.min(1.8, s), rgba('#dfe8ff', a));
  }
}

function bloom(a, col = '#ffd9a0') {
  if (a <= .002) return;
  scr(); c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .75);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, a * .7));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function vignette(a = .6) {
  scr();
  const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(4,3,20,0)'); g.addColorStop(1, `rgba(4,3,20,${a})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}


function planet(t, x, y, R, wedge) {
  glow(x, y, R * 1.5, '#5fc8ff', .35);
  const g = c.createRadialGradient(x - R * .35, y - R * .35, R * .1, x, y, R);
  g.addColorStop(0, '#4fb4f2'); g.addColorStop(1, '#1d5bb3');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
  const rot = t * .09 * R;
  for (let i = 0; i < 6; i++) {
    const bx = x - R * 1.4 + ((hash(i + 60) * R * 2.8 + rot) % (R * 2.8)), by = y + (hash(i + 61) - .5) * R * 1.3;
    c.fillStyle = i % 2 ? '#24bc39' : '#3fcf62'; c.beginPath();
    for (let k = 0; k <= 12; k++) { const a = k / 12 * TAU, rr2 = R * (.18 + hash(i * 13 + k) * .12); c[k ? 'lineTo' : 'moveTo'](bx + Math.cos(a) * rr2 * 1.3, by + Math.sin(a) * rr2); }
    c.fill(); ell(bx - R * .05, by - R * .05, R * .12, R * .06, 0, 'rgba(115,221,158,.6)');
  }
  for (let i = 0; i < 5; i++) {
    const bx = x - R * 1.4 + ((hash(i + 80) * R * 2.8 + rot * 1.4) % (R * 2.8)), by = y + (hash(i + 81) - .5) * R * 1.5;
    for (const [dx, dy, rr2] of [[-.14, .01, .07], [0, -.02, .09], [.13, .01, .065], [.05, .03, .06]]) circle(bx + dx * R, by + dy * R, rr2 * R, 'rgba(234,245,238,.85)');   // puffy cloud
  }
  const sh = c.createLinearGradient(x - R, y, x + R, y);   // lit from the young sun on the left
  sh.addColorStop(0, 'rgba(10,8,53,0)'); sh.addColorStop(.55, 'rgba(10,8,53,.1)'); sh.addColorStop(1, 'rgba(10,8,53,.78)');
  c.fillStyle = sh; c.fillRect(x - R, y - R, R * 2, R * 2);
  c.restore();
  if (wedge > .001) {
    const a0 = -.35 - wedge * .7, a1 = -.35 + wedge * .7;
    c.save(); c.beginPath(); c.moveTo(x, y); c.arc(x, y, R * 1.002, a0, a1); c.closePath(); c.clip();
    circle(x, y, R, '#a8452a'); circle(x, y, R * .94, '#e0582a'); circle(x, y, R * .55, '#ffae3d'); circle(x, y, R * .52, '#ffbf3a');
    circle(x, y, R * .3, '#ffc94d'); circle(x, y, R * .27, '#ffd36b'); circle(x, y, R * .12, '#ffe7a0');
    c.restore();
    glow(x, y, R * .6, '#ffc94d', .5 * wedge);
  }
}
