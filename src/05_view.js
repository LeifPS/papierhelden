/* ===== Bildschirm: feste Logikhöhe 360, Breite folgt dem Seitenverhältnis; Kamera mit Wackeln und Zoom ===== */
const cv = $("cv"), gx = cv.getContext("2d", { alpha: false });
const V = { W: 640, H: 360, sc: 1, ox: 0, oy: 0, cw: 0, ch: 0, dpr: 1, sl: 0, sr: 0, st: 0, sb: 0 };
let probe = null;
function readSafe() {
  if (!probe) { probe = document.createElement("div"); probe.style.cssText = "position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)"; document.body.appendChild(probe); }
  const s = getComputedStyle(probe); return { t: parseFloat(s.paddingTop) || 0, r: parseFloat(s.paddingRight) || 0, b: parseFloat(s.paddingBottom) || 0, l: parseFloat(s.paddingLeft) || 0 };
}
function resize() {
  const iw = innerWidth, ih = innerHeight; let dpr = Math.min(window.devicePixelRatio || 1, 2);
  while (iw * ih * dpr * dpr > 1.9e6 && dpr > 1) dpr = Math.max(1, dpr - .25);
  cv.width = Math.round(iw * dpr); cv.height = Math.round(ih * dpr); V.cw = cv.width; V.ch = cv.height; V.dpr = dpr;
  V.W = clamp(Math.round(360 * iw / ih), 560, 900); V.H = 360;
  V.sc = Math.min(V.cw / V.W, V.ch / V.H); V.ox = (V.cw - V.W * V.sc) / 2; V.oy = (V.ch - V.H * V.sc) / 2;
  const sf = readSafe(), k = dpr / V.sc; V.sl = sf.l * k; V.sr = sf.r * k; V.st = sf.t * k; V.sb = sf.b * k;
  SS = clamp(Math.ceil(V.sc), 2, 3);
  if (window.layoutControls) layoutControls();
  if (window.G && G.scene && G.scene.resize) G.scene.resize();
}
addEventListener("resize", () => setTimeout(resize, 30)); addEventListener("orientationchange", () => setTimeout(resize, 200));
const toLogical = (cx, cy) => ({ x: (cx * V.dpr - V.ox) / V.sc, y: (cy * V.dpr - V.oy) / V.sc });

/* Kamera */
const CAM = { x: 0, y: 0, z: 1, shake: 0, sx: 0, sy: 0, tx: null, ty: null, tz: 1 };
function camShake(a) { CAM.shake = Math.max(CAM.shake, a); }
function camBegin(c) {
  const sh = CAM.shake; if (sh > .1) { CAM.sx = (Math.random() - .5) * sh; CAM.sy = (Math.random() - .5) * sh; } else { CAM.sx = CAM.sy = 0; }
  c.save(); c.translate(V.W / 2, V.H / 2); c.scale(CAM.z, CAM.z); c.translate(-Math.round(CAM.x * 2) / 2 + CAM.sx, -Math.round(CAM.y * 2) / 2 + CAM.sy);
}
const camEnd = c => c.restore();
const w2s = (x, y) => ({ x: (x - CAM.x) * CAM.z + V.W / 2, y: (y - CAM.y) * CAM.z + V.H / 2 });
function camFollow(x, y, bounds, dt, k) {
  const vw = V.W / CAM.z, vh = V.H / CAM.z; let tx = x, ty = y;
  if (bounds) { const bw = bounds.w, bh = bounds.h; tx = bw <= vw ? bw / 2 + (bounds.x || 0) : clamp(tx, (bounds.x || 0) + vw / 2, (bounds.x || 0) + bw - vw / 2); ty = bh <= vh ? bh / 2 + (bounds.y || 0) : clamp(ty, (bounds.y || 0) + vh / 2, (bounds.y || 0) + bh - vh / 2); }
  const f = 1 - Math.exp(-(k || 9) * dt); CAM.x += (tx - CAM.x) * f; CAM.y += (ty - CAM.y) * f;
}
