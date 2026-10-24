/* ===== Eingabe: Touch-Steuerung (Stick links, Knöpfe rechts), Maus und Tastatur zum Testen ===== */
const IN = { mx: 0, my: 0, show: false, down: {}, buf: {}, ptrs: new Map(), stick: null, keys: {}, tap: null, lastDir: 0 };
const BTN = {};   // Name -> {x,y,r}
const BN = ["atk", "dodge", "rng", "a0", "a1", "a2", "menu"];
function layoutControls() {
  const W = V.W, H = V.H, R = V.sr + 16, B = V.sb + 14, ax = W - R - 50, ay = H - B - 50;
  BTN.atk = { x: ax, y: ay, r: 46 }; BTN.dodge = { x: ax - 98, y: ay + 20, r: 34 }; BTN.rng = { x: ax - 62, y: ay - 70, r: 30 };
  [100, 133, 166].forEach((deg, i) => { const a = deg * PI / 180; BTN["a" + i] = { x: ax + Math.cos(a) * 152, y: ay - Math.sin(a) * 152, r: 25 }; });
  BTN.menu = { x: W - V.sr - 30, y: V.st + 30, r: 20 };
}
function hitBtn(x, y) { for (const n of BN) { const b = BTN[n]; if (!b) continue; if (n === "menu") { if (dist(x, y, b.x, b.y) < b.r + 8) return n; continue; } if (dist(x, y, b.x, b.y) < b.r + 6) return n; } return null; }
function press(n) { IN.down[n] = true; IN.buf[n] = .2; }
function release(n) { IN.down[n] = false; }
cv.addEventListener("pointerdown", e => {
  e.preventDefault(); auInit(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  const p = toLogical(e.clientX, e.clientY); IN.tap = { x: p.x, y: p.y };
  if (!IN.show) return;
  const b = hitBtn(p.x, p.y);
  if (b) { IN.ptrs.set(e.pointerId, { b }); press(b); return; }
  if (p.x < V.W * .5 && !IN.stick) { IN.stick = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y }; IN.ptrs.set(e.pointerId, { s: 1 }); }
}, { passive: false });
cv.addEventListener("pointermove", e => {
  if (!IN.stick || IN.stick.id !== e.pointerId) return; const p = toLogical(e.clientX, e.clientY); IN.stick.x = p.x; IN.stick.y = p.y;
  const dx = p.x - IN.stick.ox, dy = p.y - IN.stick.oy, d = Math.hypot(dx, dy), R = 50;
  if (d > R * 1.5) { const k = (d - R * 1.5) / d; IN.stick.ox += dx * k; IN.stick.oy += dy * k; }   // Stick wandert mit dem Daumen
});
function endPtr(e) {
  const o = IN.ptrs.get(e.pointerId); if (!o) return; IN.ptrs.delete(e.pointerId);
  if (o.b) release(o.b); if (o.s) { IN.stick = null; IN.mx = IN.my = 0; }
}
cv.addEventListener("pointerup", endPtr); cv.addEventListener("pointercancel", endPtr);
cv.addEventListener("contextmenu", e => e.preventDefault());
const KMAP = { " ": "atk", j: "atk", k: "dodge", Shift: "dodge", l: "rng", "1": "a0", "2": "a1", "3": "a2", Escape: "menu", p: "menu" };
addEventListener("keydown", e => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (e.key === "F2") { e.preventDefault(); adminToggle(); return; }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; IN.keys[k] = true;
  const b = KMAP[k]; if (b && IN.show && !e.repeat) { press(b); e.preventDefault(); }
  if (k === " ") e.preventDefault();
});
addEventListener("keyup", e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; IN.keys[k] = false; const b = KMAP[k]; if (b) release(b); });
addEventListener("blur", () => { IN.keys = {}; BN.forEach(release); });
/* Pro Bild: Bewegungsvektor bestimmen und Zwischenspeicher für Knopfdrücke ablaufen lassen */
function inputUpdate(dt) {
  let mx = 0, my = 0;
  if (IN.stick) { const dx = IN.stick.x - IN.stick.ox, dy = IN.stick.y - IN.stick.oy, d = Math.hypot(dx, dy), R = 50; if (d > 6) { const m = Math.min(1, (d - 6) / (R - 6)); mx = dx / d * m; my = dy / d * m; } }
  const K = IN.keys; const kx = (K.d || K.ArrowRight ? 1 : 0) - (K.a || K.ArrowLeft ? 1 : 0), ky = (K.s || K.ArrowDown ? 1 : 0) - (K.w || K.ArrowUp ? 1 : 0);
  if (kx || ky) { const l = Math.hypot(kx, ky); mx = kx / l; my = ky / l; }
  IN.mx = mx; IN.my = my; if (mx || my) IN.lastDir = Math.atan2(my, mx);
  for (const n in IN.buf) if (IN.buf[n] > 0) IN.buf[n] -= dt;
}
const wasPressed = n => { if (IN.buf[n] > 0) { IN.buf[n] = 0; return true; } return false; };
/* Knöpfe zeichnen (vorgerenderte Sprites; Abklingzeit als Kuchenstück) */
function btnSpr(name, kind, col) {
  const b = BTN[name], r = b.r; return spr("btn|" + name + "|" + kind + "|" + col + "|" + r, r * 2 + 12, r * 2 + 12, c => {
    const s = sketchCtx(c, strSeed(name + kind), r); s.lineWidth = 3.4;
    s.beginPath(); s.arc(2.5, 3, r, 0, TAU); c.fillStyle = hexA(INK, .55); s.fill(); s.beginPath(); s.arc(0, 0, r, 0, TAU); c.fillStyle = col || P1; s.fill(); s.stroke();
    s.beginPath(); s.arc(0, 0, r * .8, .3, 2.3); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 2; s.stroke();
    drawGlyph(c, kind, 0, 0, r * 1.15);
  });
}
function drawControls(c, st) {
  if (!IN.show) return; c.save();
  const sg = IN.stick; if (sg) { c.globalAlpha = .55; c.strokeStyle = INK; c.lineWidth = 4; c.fillStyle = hexA(P1, .25); c.beginPath(); c.arc(sg.ox, sg.oy, 50, 0, TAU); c.fill(); c.stroke(); const dx = sg.x - sg.ox, dy = sg.y - sg.oy, d = Math.hypot(dx, dy), m = Math.min(d, 50), kx = sg.ox + (d ? dx / d * m : 0), ky = sg.oy + (d ? dy / d * m : 0); c.globalAlpha = .85; c.fillStyle = P1; c.beginPath(); c.arc(kx, ky, 24, 0, TAU); c.fill(); c.stroke(); }
  else { c.globalAlpha = .22; c.strokeStyle = P1; c.lineWidth = 3; c.setLineDash([5, 6]); c.beginPath(); c.arc(V.sl + 100, V.H - V.sb - 90, 50, 0, TAU); c.stroke(); c.setLineDash([]); }
  c.globalAlpha = 1;
  const defs = st.btns || {};
  for (const n of BN) {
    if (n === "menu") continue; const d = defs[n]; if (!d) continue; const b = BTN[n], pr = IN.down[n]; const s = btnSpr(n, d.glyph, d.col);
    c.globalAlpha = d.dim ? .45 : .88; blit(c, s, b.x, b.y, { s: pr ? .9 : 1 });
    if (d.cd > 0 && d.cdMax > 0) { c.globalAlpha = .6; c.fillStyle = INK; c.beginPath(); c.moveTo(b.x, b.y); c.arc(b.x, b.y, b.r - 2, -PI / 2, -PI / 2 + TAU * clamp(d.cd / d.cdMax, 0, 1)); c.closePath(); c.fill(); }
    if (d.badge) { c.globalAlpha = 1; c.fillStyle = INK; c.font = "20px 'Patrick Hand'"; c.textAlign = "center"; c.fillText(d.badge, b.x, b.y + b.r + 16); }
  }
  const m = BTN.menu; c.globalAlpha = .85; blit(c, btnSpr("menu", "pause", P1), m.x, m.y, { s: IN.down.menu ? .9 : 1 });
  c.restore();
}
