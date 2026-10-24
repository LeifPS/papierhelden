/* ===== Räume aus Kacheln: Kollision, Hintergrund vorrendern ===== */
const TS = 32;
const TL = { F: 0, W: 1, P: 2, H: 3, G: 4, D: 5, S: 6 };   // Boden, Wand, Säule, Loch, Gitter, Tür, Geheimwand
const THEMES = [
  { name: "Bibliothek", floor: "#e8d9b0", floor2: "#dfcd9f", line: "#c7b27c", wall: "#8a5a34", wallTop: "#a8744a", wallFront: "#6e4425", pit: "#1d2742", pillar: "#a8744a", accent: "#c97d12", dark: .62, bgCol: "#141a2e" },
  { name: "Tintenmeer", floor: "#cfe0e0", floor2: "#c2d6d8", line: "#9db8c0", wall: "#34457a", wallTop: "#4b5f98", wallFront: "#26335e", pit: "#14224f", pillar: "#4b5f98", accent: "#2b7a86", dark: .7, bgCol: "#0e1530" },
  { name: "Hub", floor: "#ead9a4", floor2: "#e0cd96", line: "#c7b27c", wall: "#8a5a34", wallTop: "#a8744a", wallFront: "#6e4425", pit: "#1d2742", pillar: "#a8744a", accent: "#c97d12", dark: .1, bgCol: "#141a2e" },
];
const isSolidTile = (t, fly) => t === TL.W || t === TL.P || t === TL.G || t === TL.S || t === TL.D || (t === TL.H && !fly);
function rTile(room, tx, ty) { if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return TL.W; return room.g[ty * room.w + tx]; }
function solidAt(room, x, y, fly) { return isSolidTile(rTile(room, Math.floor(x / TS), Math.floor(y / TS)), fly); }
function boxHits(room, x, y, h, fly) {
  const x0 = Math.floor((x - h) / TS), x1 = Math.floor((x + h) / TS), y0 = Math.floor((y - h) / TS), y1 = Math.floor((y + h) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolidTile(rTile(room, tx, ty), fly)) return true; return false;
}
/* Bewegt eine Figur (x,y,r) um dx,dy mit Wandgleiten in Teilschritten */
function moveEnt(room, e, dx, dy, fly) {
  const h = (e.hb || e.r) * .78, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6)), sx = dx / n, sy = dy / n; let hitX = false, hitY = false;
  for (let i = 0; i < n; i++) {
    if (sx) { if (boxHits(room, e.x + sx, e.y, h, fly)) hitX = true; else e.x += sx; }
    if (sy) { if (boxHits(room, e.x, e.y + sy, h, fly)) hitY = true; else e.y += sy; }
  }
  return hitX || hitY;
}
/* Darf eine Figur an diese Stelle? (Spawn-Prüfung) */
const freeAt = (room, x, y, r, fly) => !boxHits(room, x, y, r * .8, fly);
/* Sichtlinie zwischen zwei Punkten (nur feste Wände zählen) */
function lineClear(room, x0, y0, x1, y1) { const d = dist(x0, y0, x1, y1), n = Math.ceil(d / 12); for (let i = 1; i < n; i++) { const t = i / n; if (solidAt(room, lerp(x0, x1, t), lerp(y0, y1, t), true)) return false; } return true; }

/* Hintergrund einmal vorrendern (Boden, Wände, Pfützen, Dekoration) */
function renderRoomBG(room) {
  const th = THEMES[room.theme], W = room.w * TS, H = room.h * TS, r = RNG(room.seed ^ 0x9e3779b9), ss = Math.min(SS, 2);
  return offscreen(W, H, ss, (c) => {
    c.fillStyle = th.bgCol; c.fillRect(0, 0, W, H);
    const T = (x, y) => rTile(room, x, y);
    // Boden: Papierfliesen
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
      const t = T(x, y); if (t === TL.W || t === TL.S) continue;
      c.fillStyle = (x + y) % 2 ? th.floor : th.floor2; c.fillRect(x * TS, y * TS, TS, TS);
      if (r() < .1) { c.fillStyle = "rgba(120,90,40,.08)"; c.beginPath(); c.ellipse(x * TS + r() * TS, y * TS + r() * TS, 6 + r() * 7, 4 + r() * 5, r() * 3, 0, TAU); c.fill(); }
    }
    // Fugenlinien (leicht schief)
    c.strokeStyle = th.line; c.lineWidth = 1.2; c.globalAlpha = .7; c.beginPath();
    for (let y = 0; y <= room.h; y++) for (let x = 0; x < room.w; x++) { const a = T(x, y - 1), b = T(x, y); if ((a !== TL.W && a !== TL.S) || (b !== TL.W && b !== TL.S)) { c.moveTo(x * TS, y * TS + (r() - .5) * 1.5); c.lineTo(x * TS + TS, y * TS + (r() - .5) * 1.5); } }
    for (let y = 0; y < room.h; y++) for (let x = 0; x <= room.w; x++) { const a = T(x - 1, y), b = T(x, y); if ((a !== TL.W && a !== TL.S) || (b !== TL.W && b !== TL.S)) { c.moveTo(x * TS + (r() - .5) * 1.5, y * TS); c.lineTo(x * TS + (r() - .5) * 1.5, y * TS + TS); } }
    c.stroke(); c.globalAlpha = 1;
    // Schreibkritzel auf dem Boden
    c.strokeStyle = "rgba(29,39,66,.13)"; c.lineWidth = 1.4;
    for (let i = 0; i < room.w * room.h / 28; i++) { const x = r() * W, y = r() * H; if (T(Math.floor(x / TS), Math.floor(y / TS)) !== TL.F) continue; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) c.lineTo(x + k * 5, y + (r() - .5) * 6); c.stroke(); }
    // Löcher
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) if (T(x, y) === TL.H) { c.fillStyle = th.pit; c.fillRect(x * TS, y * TS, TS, TS); }
    const s = sketchCtx(c, strSeed("bg" + room.seed), TS);
    c.lineWidth = 3;
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) if (T(x, y) === TL.H) {
      s.beginPath(); let any = false;
      if (T(x, y - 1) !== TL.H) { s.moveTo(x * TS, y * TS); s.lineTo(x * TS + TS, y * TS); any = true; } if (T(x, y + 1) !== TL.H) { s.moveTo(x * TS, y * TS + TS); s.lineTo(x * TS + TS, y * TS + TS); any = true; }
      if (T(x - 1, y) !== TL.H) { s.moveTo(x * TS, y * TS); s.lineTo(x * TS, y * TS + TS); any = true; } if (T(x + 1, y) !== TL.H) { s.moveTo(x * TS + TS, y * TS); s.lineTo(x * TS + TS, y * TS + TS); any = true; }
      if (any) s.stroke();
      if (room.theme === 1) { c.strokeStyle = "rgba(160,200,230,.35)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x * TS + 5, y * TS + 12); c.quadraticCurveTo(x * TS + 12, y * TS + 6, x * TS + 19, y * TS + 12); c.quadraticCurveTo(x * TS + 26, y * TS + 18, x * TS + 30, y * TS + 12); c.stroke(); c.strokeStyle = INK; c.lineWidth = 3; }
    }
    // Wände: Oberseite, Vorderseite mit Büchern bzw. Tintenwellen
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
      const t = T(x, y); if (t !== TL.W && t !== TL.S) continue;
      c.fillStyle = th.wallTop; c.fillRect(x * TS, y * TS, TS, TS);
      const below = T(x, y + 1); if (below !== TL.W && below !== TL.S) {
        c.fillStyle = th.wallFront; c.fillRect(x * TS, y * TS + TS - 14, TS, 14);
        if (room.theme === 0) { let bx = x * TS + 1; while (bx < x * TS + TS - 3) { const bw = 3 + r() * 3; c.fillStyle = ["#b8473a", "#2b7a86", "#c97d12", "#3a8450", "#7a4fb0", "#d9c597"][Math.floor(r() * 6)]; c.fillRect(bx, y * TS + TS - 13, bw, 11 + r() * 2); bx += bw + .8; } }
        else { c.strokeStyle = "rgba(160,200,230,.4)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x * TS + 2, y * TS + TS - 6); c.quadraticCurveTo(x * TS + 10, y * TS + TS - 12, x * TS + 18, y * TS + TS - 6); c.quadraticCurveTo(x * TS + 26, y * TS + TS - 1, x * TS + 31, y * TS + TS - 6); c.stroke(); }
      }
      if (t === TL.S) { c.strokeStyle = "rgba(20,26,46,.55)"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x * TS + 6, y * TS + 4); c.lineTo(x * TS + 14, y * TS + 14); c.lineTo(x * TS + 9, y * TS + 22); c.moveTo(x * TS + 14, y * TS + 14); c.lineTo(x * TS + 24, y * TS + 18); c.stroke(); }
    }
    c.lineWidth = 3.4; c.strokeStyle = INK; s.beginPath();
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
      const t = T(x, y); if (t !== TL.W && t !== TL.S) continue;
      if (T(x, y - 1) !== TL.W && T(x, y - 1) !== TL.S && y > 0) { s.moveTo(x * TS, y * TS); s.lineTo(x * TS + TS, y * TS); }
      const b = T(x, y + 1); if (b !== TL.W && b !== TL.S && y < room.h - 1) { s.moveTo(x * TS, y * TS + TS); s.lineTo(x * TS + TS, y * TS + TS); }
      const l = T(x - 1, y); if (l !== TL.W && l !== TL.S && x > 0) { s.moveTo(x * TS, y * TS); s.lineTo(x * TS, y * TS + TS); }
      const rr = T(x + 1, y); if (rr !== TL.W && rr !== TL.S && x < room.w - 1) { s.moveTo(x * TS + TS, y * TS); s.lineTo(x * TS + TS, y * TS + TS); }
    }
    s.stroke();
    // Säulen: Bücherstapel bzw. Tintenfelsen
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) if (T(x, y) === TL.P) {
      const cx = x * TS + TS / 2, cy = y * TS + TS / 2;
      c.fillStyle = "rgba(20,26,46,.28)"; c.beginPath(); c.ellipse(cx, cy + 12, 17, 7, 0, 0, TAU); c.fill();
      if (room.theme === 0) { [[-1, 6, "#b8473a"], [1, -2, "#2b7a86"], [-1, -10, "#c97d12"]].forEach(([dx, dy, col]) => { c.fillStyle = col; s.beginPath(); s.rect(cx - 13 + dx * 2, cy + dy - 5, 26, 11); s.fill(); s.stroke(); c.fillStyle = P1; c.fillRect(cx - 10 + dx * 2, cy + dy - 1, 21, 3); }); }
      else { c.fillStyle = th.pillar; s.beginPath(); s.moveTo(cx - 14, cy + 12); s.lineTo(cx - 10, cy - 12); s.lineTo(cx + 2, cy - 17); s.lineTo(cx + 13, cy - 8); s.lineTo(cx + 15, cy + 12); s.closePath(); s.fill(); s.stroke(); }
    }
  });
}
function drawRoomBG(c, room) { if (!room.bg) room.bg = renderRoomBG(room); c.drawImage(room.bg, 0, 0, room.w * TS, room.h * TS); }
