/* ===== Raumvorlagen: handgebaut (per Code), pro Durchlauf zufällig zusammengesetzt, gespiegelt und mit Gegnern gefüllt =====
   Zeichen: # Wand, . Boden, o Säule, ~ Loch/Tintenpfuhl, g Gitter, s Gegner, r Fernkämpfer, e Elite, f Flieger, X Boss,
   c Truhe, b Fass, ^ Stacheln, x Platte, y Kristall, T Pfeilfalle (Wand), h Tintenbrunnen */
const TPL = {};
function defTpl(id, type, w, h, build, o) { TPL[id] = Object.assign({ id, type, w, h, build }, o || {}); }
function tplGrid(t) {
  const g = []; for (let y = 0; y < t.h; y++) { const r = []; for (let x = 0; x < t.w; x++) r.push(x === 0 || y === 0 || x === t.w - 1 || y === t.h - 1 ? "#" : "."); g.push(r); }
  const B = {
    w: t.w, h: t.h, g,
    set(x, y, ch) { if (x >= 0 && y >= 0 && x < t.w && y < t.h) g[y][x] = ch; return B; },
    fill(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) B.set(x, y, ch); return B; },
    pts(ch, list) { list.forEach(p => B.set(p[0], p[1], ch)); return B; },
    sym(ch, x, y) { B.set(x, y, ch); B.set(t.w - 1 - x, y, ch); B.set(x, t.h - 1 - y, ch); B.set(t.w - 1 - x, t.h - 1 - y, ch); return B; },
    symX(ch, x, y) { B.set(x, y, ch); B.set(t.w - 1 - x, y, ch); return B; },
    ring(ch, x0, y0, x1, y1) { for (let x = x0; x <= x1; x++) { B.set(x, y0, ch); B.set(x, y1, ch); } for (let y = y0; y <= y1; y++) { B.set(x0, y, ch); B.set(x1, y, ch); } return B; },
  };
  t.build(B); return g.map(r => r.join(""));
}
function doorCells(w, h) { return { N: [[(w >> 1) - 1, 0], [w >> 1, 0]], S: [[(w >> 1) - 1, h - 1], [w >> 1, h - 1]], W: [[0, (h >> 1) - 1], [0, h >> 1]], E: [[w - 1, (h >> 1) - 1], [w - 1, h >> 1]] };
}
/* Vorlage zu einem Raum machen. o: {theme, seed, doors:{N:kind...}, flipX, flipY} */
function buildRoom(tid, o) {
  const t = TPL[tid], rows = tplGrid(t), rng = RNG(o.seed), w = t.w, h = t.h;
  const room = { id: tid, type: t.type, w, h, g: new Uint8Array(w * h), theme: o.theme, seed: o.seed, spawns: [], props: [], torches: [], doors: {}, bg: null };
  const fx = !!o.flipX, fy = !!o.flipY;
  const DM = { N: fy ? "S" : "N", S: fy ? "N" : "S", W: fx ? "E" : "W", E: fx ? "W" : "E" };   // gespiegelte Seiten
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[fy ? h - 1 - y : y][fx ? w - 1 - x : x]; const i = y * w + x; let tl = TL.F;
    if (ch === "#") tl = TL.W; else if (ch === "o") tl = TL.P; else if (ch === "~") tl = TL.H; else if (ch === "g") tl = TL.G;
    room.g[i] = tl;
    const px = x * TS + TS / 2, py = y * TS + TS / 2;
    if ("serfX".includes(ch) && ch !== ".") room.spawns.push({ x: px, y: py, k: ch });
    else if ("cb^xyTh".includes(ch)) room.props.push({ k: ch, x: px, y: py, tx: x, ty: y });
  }
  // Türen (jede Tür zwei Kacheln breit) aus Nachbarn
  const dc = doorCells(w, h);
  for (const s of ["N", "S", "W", "E"]) {
    const kind = o.doors && o.doors[s]; if (!kind) continue;
    room.doors[s] = { kind, open: false, to: kind.to, cells: dc[s], secret: !!kind.secret };
    dc[s].forEach(([x, y]) => { room.g[y * w + x] = kind.secret ? TL.S : TL.D; });
    // freie Fläche vor der Tür
    const dir = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] }[s]; dc[s].forEach(([x, y]) => { for (let k = 1; k <= 2; k++) { const xx = x + dir[0] * k, yy = y + dir[1] * k; const i = yy * w + xx; if (room.g[i] === TL.P || room.g[i] === TL.H) room.g[i] = TL.F; } });
  }
  // Fackeln an der oberen Wand
  for (let x = 3; x < w - 3; x += 5 + rng.int(0, 3)) if (room.g[x] === TL.W && room.g[w + x] !== TL.W) room.torches.push({ x: x * TS + TS / 2, y: TS - 8 });
  // Erreichbarkeit: Spawns/Props auf unerreichbaren Zellen entfernen
  const reach = floodFrom(room, doorFront(room));
  room.reach = reach;
  room.spawns = room.spawns.filter(s => reach[Math.floor(s.y / TS) * w + Math.floor(s.x / TS)]);
  room.props = room.props.filter(p => p.k === "T" || reach[p.ty * w + p.tx] || p.k === "c");
  return room;
}
function doorFront(room) { for (const s of ["N", "S", "W", "E"]) { const d = room.doors[s]; if (d) { const [x, y] = d.cells[0], dir = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] }[s]; return [x + dir[0], y + dir[1]]; } } return [room.w >> 1, room.h >> 1]; }
function floodFrom(room, [sx, sy]) {
  const w = room.w, h = room.h, seen = new Uint8Array(w * h), q = [[sx, sy]]; if (isSolidTile(room.g[sy * w + sx], false)) return seen; seen[sy * w + sx] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const i = ny * w + nx; if (seen[i]) continue; const t = room.g[i]; if (t === TL.W || t === TL.P || t === TL.H || t === TL.S) continue; if (t === TL.G) { seen[i] = 1; continue; } seen[i] = 1; q.push([nx, ny]); } }
  return seen;
}
/* ----- Vorlagen-Sammlung (wird in Etappe 4 weiter ausgebaut) ----- */
defTpl("arena1", "combat", 22, 13, B => {
  B.sym("o", 5, 3).sym("o", 5, 4).sym("o", 10, 2).sym("o", 7, 5);
  B.pts("s", [[8, 4], [13, 4], [8, 8], [13, 8], [10, 6], [11, 6]]); B.pts("b", [[2, 2], [19, 2]]);
});
