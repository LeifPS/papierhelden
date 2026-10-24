/* ===== Kino: Letterbox, Seitenumblättern, Licht und Vignette, Parallaxe-Papierfetzen, Partikel und Zahlen ===== */
const CINE = { bars: 0, barT: 0, fade: 0, fadeT: 0, fadeCol: "#141a2e", flashA: 0, flashCol: "#fff" };
function cineBars(on) { CINE.barT = on ? 1 : 0; }
function cineFlash(col, a) { CINE.flashCol = col || "#fff"; CINE.flashA = a === undefined ? .8 : a; }
function cineUpdate(dt) {
  CINE.bars = approach(CINE.bars, CINE.barT, dt * 1.6); CINE.flashA = Math.max(0, CINE.flashA - dt * 2.2);
  CINE.fade = approach(CINE.fade, CINE.fadeT, dt * 1.4); CAM.shake = Math.max(0, CAM.shake - dt * 40);
}
function cineDraw(c) {
  if (CINE.bars > .001) { const h = V.H * .12 * ease(CINE.bars), s = Math.max(V.sl, 0); c.fillStyle = "#0b0e1a"; c.fillRect(-4, -4, V.W + 8, h + 4); c.fillRect(-4, V.H - h, V.W + 8, h + 4); c.fillStyle = "#0b0e1a"; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= V.W; x += 14) c.lineTo(x, h + 3 + ((x * 7) % 5)); c.lineTo(V.W, h); c.fill(); c.beginPath(); c.moveTo(0, V.H - h); for (let x = 0; x <= V.W; x += 14) c.lineTo(x, V.H - h - 3 - ((x * 11) % 5)); c.lineTo(V.W, V.H - h); c.fill(); }
  if (CINE.fade > .001) { c.globalAlpha = CINE.fade; c.fillStyle = CINE.fadeCol; c.fillRect(-4, -4, V.W + 8, V.H + 8); c.globalAlpha = 1; }
  if (CINE.flashA > .001) { c.globalAlpha = CINE.flashA; c.fillStyle = CINE.flashCol; c.fillRect(-4, -4, V.W + 8, V.H + 8); c.globalAlpha = 1; }
}
/* Seitenumblättern als Übergang: cb wird aufgerufen, wenn der Bildschirm ganz bedeckt ist */
const TR = { st: 0, t: 0, cb: null, d1: .6, d2: .55, page: null, busy: false };
function transition(cb, o) {
  if (TR.busy) return; o = o || {}; TR.busy = true; TR.st = 1; TR.t = 0; TR.cb = cb; TR.d1 = o.d1 || .6; TR.d2 = o.d2 || .55; sfx("page", 0);
}
function trUpdate(dt) {
  if (!TR.st) return; TR.t += dt;
  if (TR.st === 1 && TR.t >= TR.d1) { TR.st = 2; TR.t = 0; try { TR.cb && TR.cb(); } catch (e) { console.error(e); } TR.cb = null; }
  else if (TR.st === 2 && TR.t >= TR.d2) { TR.st = 0; TR.busy = false; }
}
function pageSpr() {
  return TR.page = TR.page || offscreen(900, 360, 1, c => {
    const g = c.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, "#efe5c6"); g.addColorStop(1, "#f6efd9"); c.fillStyle = g; c.fillRect(0, 0, 900, 360);
    c.strokeStyle = "rgba(43,122,134,.28)"; c.lineWidth = 1.4; for (let y = 34; y < 360; y += 26) { c.beginPath(); c.moveTo(0, y); c.lineTo(900, y); c.stroke(); }
    c.strokeStyle = "rgba(184,71,58,.35)"; c.lineWidth = 2; c.beginPath(); c.moveTo(70, 0); c.lineTo(70, 360); c.stroke();
    c.fillStyle = "rgba(29,39,66,.18)"; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse((i * 211) % 900, (i * 97) % 360, 3 + i % 5, 2 + i % 3, 0, 0, TAU); c.fill(); }
    c.strokeStyle = "rgba(29,39,66,.16)"; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(120 + i * 130, 60 + (i % 3) * 90); c.quadraticCurveTo(160 + i * 130, 20 + (i % 3) * 90, 210 + i * 130, 70 + (i % 3) * 90); c.stroke(); }
  });
}
function trDraw(c) {
  if (!TR.st) return; const W = V.W, H = V.H, pg = pageSpr();
  const k = TR.st === 1 ? ease(clamp(TR.t / TR.d1, 0, 1)) : ease(clamp(TR.t / TR.d2, 0, 1)); const curl = 64;
  const bx = TR.st === 1 ? lerp(W + 4, -curl - 4, k) : lerp(-curl - 4, W + 4, k);
  c.save(); c.beginPath(); c.rect(bx, -4, W - bx + 8, H + 8); c.clip(); c.drawImage(pg, 0, 0, 900, 360, 0, 0, Math.max(W, 900) * 1, H); c.restore();
  // Rollkante mit Schatten
  const x0 = Math.max(bx, -curl), gR = c.createLinearGradient(bx, 0, bx + 40, 0); gR.addColorStop(0, "rgba(20,26,46,.45)"); gR.addColorStop(1, "rgba(20,26,46,0)");
  c.fillStyle = gR; c.fillRect(bx, -4, 40, H + 8);
  const fl = c.createLinearGradient(bx - curl, 0, bx, 0); fl.addColorStop(0, "rgba(246,239,217,0)"); fl.addColorStop(.55, "#fbf6e3"); fl.addColorStop(1, "#d9cca3");
  c.fillStyle = fl; c.beginPath(); c.moveTo(bx, -4); for (let y = -4; y <= H + 4; y += 24) c.lineTo(bx - curl * (.9 + .1 * Math.sin(y * .05 + TR.t * 6)), y); c.lineTo(bx, H + 4); c.closePath(); c.fill();
  c.strokeStyle = INK; c.lineWidth = 2; c.globalAlpha = .6; c.beginPath(); c.moveTo(bx, -4); c.lineTo(bx, H + 4); c.stroke(); c.globalAlpha = 1;
}
/* Licht: dunkles Overlay mit Loch um den Spieler; Fackeln als additive Lichtkegel */
/* Beleuchtung: kleines Dunkelheits-Bild (1/5 Auflösung); Lichter stanzen Löcher hinein, danach wird es weich auf den Schirm gezogen. Keine Nähte. */
const LT = { cv: null, c: null, w: 0, h: 0 }, LK = 5;
function holeSpr() { return spr("hole", 128, 128, c => { const g = c.createRadialGradient(0, 0, 0, 0, 0, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.35, "rgba(255,255,255,.92)"); g.addColorStop(.7, "rgba(255,255,255,.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(-64, -64, 128, 128); }, 1); }
function drawLighting(c, amount, lights) {
  if (amount <= .01) return; const w = Math.ceil(V.W / LK), h = Math.ceil(V.H / LK);
  if (!LT.cv || LT.w !== w || LT.h !== h) { LT.cv = document.createElement("canvas"); LT.cv.width = LT.w = w; LT.cv.height = LT.h = h; LT.c = LT.cv.getContext("2d"); }
  const l = LT.c; l.globalCompositeOperation = "source-over"; l.clearRect(0, 0, w, h); l.fillStyle = "rgba(8,10,24," + amount + ")"; l.fillRect(0, 0, w, h);
  l.globalCompositeOperation = "destination-out"; const hs = holeSpr();
  for (const L of lights) { l.globalAlpha = L.k === undefined ? 1 : L.k; const r = L.r / LK; l.drawImage(hs.cv, L.x / LK - r, L.y / LK - r, r * 2, r * 2); }
  l.globalAlpha = 1; l.globalCompositeOperation = "source-over"; c.imageSmoothingEnabled = true; c.drawImage(LT.cv, 0, 0, w, h, 0, 0, w * LK, h * LK);
}
function glowSpr(col) { return spr("glow|" + col, 128, 128, c => { const g = c.createRadialGradient(0, 0, 0, 0, 0, 64); g.addColorStop(0, hexA(col, .9)); g.addColorStop(.4, hexA(col, .3)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.fillRect(-64, -64, 128, 128); }, 1); }
function vignetteSpr() { return spr("vig", 512, 288, c => { const g = c.createRadialGradient(0, 0, 90, 0, 0, 300); g.addColorStop(0, "rgba(10,12,28,0)"); g.addColorStop(1, "rgba(10,12,28,.62)"); c.fillStyle = g; c.fillRect(-256, -144, 512, 288); }, 1); }
function drawVignette(c, k) { c.save(); c.globalAlpha = k === undefined ? 1 : k; c.drawImage(vignetteSpr().cv, 0, 0, V.W, V.H); c.restore(); }
function drawTorches(c, room, t) {
  c.save(); c.globalCompositeOperation = "lighter";
  for (const tc of room.torches) { const f = .8 + Math.sin(t * 9 + tc.x) * .12 + Math.sin(t * 15 + tc.x * 2) * .06; blit(c, glowSpr("#ffb64a"), tc.x, tc.y + 18, { s: 1.9 * f, a: .55 }); }
  c.restore();
}
function drawTorchSprites(c, room, t) {
  for (const tc of room.torches) { const f = Math.sin(t * 11 + tc.x) * 1.2; c.fillStyle = INK; c.fillRect(tc.x - 2, tc.y + 6, 4, 9); c.fillStyle = "#e27d2c"; c.beginPath(); c.moveTo(tc.x - 5, tc.y + 6); c.quadraticCurveTo(tc.x - 4, tc.y - 4 + f, tc.x + f, tc.y - 9); c.quadraticCurveTo(tc.x + 5, tc.y - 3, tc.x + 5, tc.y + 6); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.fillStyle = "#ffe08a"; c.beginPath(); c.ellipse(tc.x, tc.y + 3, 2.2, 4, 0, 0, TAU); c.fill(); }
}
/* Parallaxe: schwebende Papierfetzen in mehreren Ebenen */
const SCRAPS = [];
function scrapSpr(i) { return spr("scrap" + i, 44, 44, c0 => { const c = sketchCtx(c0, i * 1.7, 24); c.lineWidth = 2.4; const r = RNG(i * 77 + 5); c.beginPath(); const n = 5 + (i % 3); for (let k = 0; k < n; k++) { const a = k / n * TAU, rr = 12 + r() * 8; c[k ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr * .8); } c.closePath(); c0.fillStyle = ["#f6efd9", "#ebe0c0", "#e6d3a6", "#f2e8c8"][i % 4]; c.fill(); c.stroke(); c0.strokeStyle = "rgba(29,39,66,.35)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-8, -3); c.lineTo(7, -4); c.moveTo(-8, 3); c.lineTo(5, 4); c.stroke(); }, 2); }
function scrapsInit(n, W, H) { SCRAPS.length = 0; const r = RNG(99); for (let i = 0; i < n; i++) SCRAPS.push({ x: r() * W, y: r() * H, z: .25 + r() * .9, rot: r() * TAU, vr: (r() - .5) * .8, sp: 6 + r() * 14, ph: r() * TAU, sp2: r() * 8, i: i % 8 }); }
function scrapsUpdate(dt) { for (const s of SCRAPS) { s.x -= s.sp * s.z * dt; s.y += Math.sin(G.t * .6 + s.ph) * 6 * dt + s.sp2 * s.z * dt * .4; s.rot += s.vr * dt; if (s.x < -50) s.x += V.W + 100; if (s.y > V.H + 50) s.y -= V.H + 100; } }
function scrapsDraw(c, camx, camy, alpha, minZ, maxZ) { for (const s of SCRAPS) { if (s.z < (minZ || 0) || s.z > (maxZ || 9)) continue; const px = ((s.x - (camx || 0) * s.z * .3) % (V.W + 100) + V.W + 100) % (V.W + 100) - 50, py = ((s.y - (camy || 0) * s.z * .3) % (V.H + 100) + V.H + 100) % (V.H + 100) - 50; blit(c, scrapSpr(s.i), px, py, { s: s.z * 1.1, r: s.rot, a: alpha === undefined ? .8 : alpha * Math.min(1, s.z + .2) }); } }
/* Partikel und schwebende Zahlen (alles einfache Formen, keine Sketch-Aufrufe) */
const FXL = [];
function fxPart(o) { if (FXL.length > 360) FXL.shift(); FXL.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: .5, t: 0, col: "#fff", sz: 3, rot: 0, vr: 0, shape: "dot", drag: 0 }, o)); }
function fxBurst(x, y, n, col, spd, life, shape, sz, g) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = spd * (.3 + Math.random() * .7); fxPart({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * (.6 + Math.random() * .6), col: Array.isArray(col) ? col[i % col.length] : col, sz: sz || 3, shape: shape || "dot", g: g || 0, rot: Math.random() * TAU, vr: (Math.random() - .5) * 8, drag: 2 }); } }
function fxText(x, y, s, col, sz, o) { FXL.push(Object.assign({ shape: "text", x: x, y: y, vx: (Math.random() - .5) * 14, vy: -42, g: 60, life: .8, t: 0, txt: s, col: col || "#fff", sz: sz || 16, drag: 1, big: 0 }, o || {})); }
function fxRing(x, y, r1, r2, life, col) { FXL.push({ shape: "ring", x, y, vx: 0, vy: 0, g: 0, life, t: 0, r1, r2, col, sz: 3, drag: 0 }); }
function fxUpdate(dt) { for (let i = FXL.length - 1; i >= 0; i--) { const p = FXL[i]; p.t += dt; if (p.t >= p.life) { FXL.splice(i, 1); continue; } const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy = p.vy * d + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; } }
function fxDraw(c) {
  for (const p of FXL) {
    const k = p.t / p.life, a = 1 - k * k; c.globalAlpha = Math.max(0, a);
    if (p.shape === "text") { c.font = (p.big ? "" : "") + p.sz + "px 'Caveat Brush'"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = INK; c.lineJoin = "round"; c.strokeText(p.txt, p.x, p.y); c.fillStyle = p.col; c.fillText(p.txt, p.x, p.y); }
    else if (p.shape === "ring") { c.strokeStyle = p.col; c.lineWidth = 3 * (1 - k) + 1; c.beginPath(); c.arc(p.x, p.y, lerp(p.r1, p.r2, easeOut(k)), 0, TAU); c.stroke(); }
    else if (p.shape === "bit") { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.strokeStyle = INK; c.lineWidth = 1.2; c.fillRect(-p.sz, -p.sz * .6, p.sz * 2, p.sz * 1.2); c.strokeRect(-p.sz, -p.sz * .6, p.sz * 2, p.sz * 1.2); c.restore(); }
    else if (p.shape === "spark") { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); c.moveTo(0, -p.sz * 2); c.lineTo(p.sz * .5, 0); c.lineTo(0, p.sz * 2); c.lineTo(-p.sz * .5, 0); c.closePath(); c.fill(); c.restore(); }
    else { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.sz * (1 - k * .5), 0, TAU); c.fill(); }
  }
  c.globalAlpha = 1;
}
