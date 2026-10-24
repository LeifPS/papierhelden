/* ===== Kern: Farben, Zufall, Hilfsfunktionen, Sprite-Cache ===== */
const INK = "#1d2742", P1 = "#f6efd9", P2 = "#ebe0c0", ACC = "#2b7a86", WARM = "#c97d12", GOOD = "#3a8450", BAD = "#b8473a", PURP = "#7a4fb0", MUTED = "#5c6684";
const pick = a => a[Math.floor(Math.random() * a.length)];
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const ang = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; };
const approach = (v, t, d) => v < t ? Math.min(t, v + d) : Math.max(t, v - d);
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - (1 - t) * (1 - t);
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };
const mix = (h1, h2, t) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const f = (s) => Math.round(lerp(a >> s & 255, b >> s & 255, t)); return "#" + ((1 << 24) | f(16) << 16 | f(8) << 8 | f(0)).toString(16).slice(1); };
const shade = (h, k) => mix(h, k < 0 ? "#000000" : "#ffffff", Math.abs(k));

/* Seed-Zufall (mulberry32) mit Hilfsmethoden */
function RNG(seed) {
  let s = (seed >>> 0) || 1;
  const f = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.int = (a, b) => a + Math.floor(f() * (b - a + 1));
  f.rng = (a, b) => a + f() * (b - a);
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.chance = p => f() < p;
  f.w = ws => { let t = 0; for (const w of ws) t += w; let r = f() * t; for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r < 0) return i; } return ws.length - 1; };
  f.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  return f;
}
const rnd = RNG((Math.random() * 4294967296) >>> 0);   // freier Zufall für Kampf und Beute
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* Sprite-Cache: einmal mit sketchCtx vorrendern, dann nur noch drawImage.
   draw(c, w, h) zeichnet mit Ursprung in der Mitte (0,0). ss = Auflösungsfaktor. */
const SPR = new Map();
function spr(key, w, h, draw, ss) {
  let s = SPR.get(key); if (s) return s;
  ss = ss || SS;
  const cv = document.createElement("canvas"); cv.width = Math.ceil(w * ss); cv.height = Math.ceil(h * ss);
  const c = cv.getContext("2d"); c.scale(ss, ss); c.translate(w / 2, h / 2); c.lineJoin = c.lineCap = "round"; c.strokeStyle = INK;
  try { draw(c, w, h); } catch (e) { console.error("spr", key, e); }
  s = { cv, w, h, ss }; SPR.set(key, s); return s;
}
/* Sprite zeichnen: Mitte bei (x,y), optional gespiegelt, gedreht, skaliert */
function blit(c, s, x, y, o) {
  if (!o) { c.drawImage(s.cv, x - s.w / 2, y - s.h / 2, s.w, s.h); return; }
  const sc = o.s || 1, sx = o.sx === undefined ? sc : o.sx, sy = o.sy === undefined ? sc : o.sy;
  c.save(); c.translate(x, y); if (o.r) c.rotate(o.r); c.scale((o.fl ? -1 : 1) * sx, sy);
  if (o.a !== undefined) c.globalAlpha *= o.a;
  c.drawImage(s.cv, -s.w / 2 - (o.ox || 0), -s.h / 2 - (o.oy || 0), s.w, s.h); c.restore();
}
let SS = 2;   // Vorrender-Auflösung (wird beim Start je nach Gerät gesetzt)
const sk = (c, key, size) => sketchCtx(c, strSeed(key), size);
/* Einmaliges Zeichnen auf ein neues Offscreen-Canvas (für Hintergründe) */
function offscreen(w, h, ss, draw) {
  const cv = document.createElement("canvas"); cv.width = Math.ceil(w * ss); cv.height = Math.ceil(h * ss);
  const c = cv.getContext("2d"); c.scale(ss, ss); c.lineJoin = c.lineCap = "round"; c.strokeStyle = INK; draw(c, w, h); return cv;
}
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + " Mio" : n >= 1e4 ? (n / 1e3).toFixed(1) + " k" : String(Math.round(n));
