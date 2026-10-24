/* ===== Dungeons: Aufbau auf einem Raster, Raumwechsel, Türen, Wellen, Fallen, Rätsel, Karte, Speichern ===== */
const DUNGEONS = [
  { id: 0, n: "Der verlassene Lesesaal", ch: "Kapitel 1", area: 0, K0: 1, rooms: 6, boss: null },
  { id: 1, n: "Archiv der Randnotizen", ch: "Kapitel 2", area: 0, K0: 3, rooms: 7, boss: "golem" },
  { id: 2, n: "Das Giftregal", ch: "Kapitel 3", area: 0, K0: 5, rooms: 8, boss: null },
  { id: 3, n: "Der Lektorenturm", ch: "Kapitel 4", area: 0, K0: 7, rooms: 8, boss: "lektor" },
  { id: 4, n: "Tintenstrand", ch: "Kapitel 5", area: 1, K0: 10, rooms: 7, boss: null },
  { id: 5, n: "Tropfsteinhöhle", ch: "Kapitel 6", area: 1, K0: 12, rooms: 8, boss: null },
  { id: 6, n: "Der Schwarze Strudel", ch: "Kapitel 7", area: 1, K0: 14, rooms: 8, boss: "krake" },
  { id: 7, n: "Das Rotstift-Sanktum", ch: "Kapitel 8", area: 1, K0: 17, rooms: 9, boss: "rotstift" },
  { id: 8, n: "Endlose Tiefe", ch: "Nachwort", area: 0, K0: 20, rooms: 8, boss: null, endless: true },
];
const DG = { def: null, tier: 0, K: 1, seed: 0, nodes: [], cur: 0, from: null, room: null, state: "idle", wave: 0, portal: null, hint: null };
const DIRS = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] }, OPP = { N: "S", S: "N", W: "E", E: "W" };
function dgGenerate(def, seed) {
  const r = RNG(seed), n = def.rooms; let path;
  for (let tries = 0; tries < 80; tries++) { path = [[0, 0]]; const used = new Set(["0,0"]); while (path.length < n) { const [x, y] = path[path.length - 1], opts = Object.values(DIRS).map(d => [x + d[0], y + d[1]]).filter(p => !used.has(p[0] + "," + p[1])); if (!opts.length) break; const p = r.pick(opts); path.push(p); used.add(p[0] + "," + p[1]); } if (path.length === n) break; }
  const nodes = path.map((p, i) => ({ gx: p[0], gy: p[1], type: "combat", door: {}, cleared: false, visited: false, chests: [], solved: false, used: false, seed: seed * 31 + i * 977 }));
  nodes[0].type = "start"; const last = n - 1; nodes[last].type = def.boss ? "boss" : "exit"; if (n >= 5) nodes[last - 1].type = "shrine"; if (n >= 5) nodes[last - 2].type = "elite";
  const mids = []; for (let i = 1; i < last - (n >= 5 ? 2 : 0); i++) mids.push(i); const sp = r.shuffle(mids.slice(1));
  if (n >= 6 && sp.length) nodes[sp.pop()].type = "puzzle"; if (n >= 7 && sp.length) nodes[sp.pop()].type = "trap"; if (n >= 9 && sp.length) nodes[sp.pop()].type = "elite";
  const link = (a, b, d, secret) => { nodes[a].door[d] = { to: b, secret: !!secret }; nodes[b].door[OPP[d]] = { to: a, secret: !!secret }; };
  for (let i = 0; i < last; i++) { const d = Object.keys(DIRS).find(k => nodes[i].gx + DIRS[k][0] === nodes[i + 1].gx && nodes[i].gy + DIRS[k][1] === nodes[i + 1].gy); link(i, i + 1, d); }
  const occ = () => new Set(nodes.map(q => q.gx + "," + q.gy));
  const branch = (type, secret, from) => { const o = occ(), cands = []; for (const i of from) for (const k in DIRS) { if (nodes[i].door[k]) continue; const x = nodes[i].gx + DIRS[k][0], y = nodes[i].gy + DIRS[k][1]; if (!o.has(x + "," + y)) cands.push([i, k, x, y]); } if (!cands.length) return; const [i, k, x, y] = r.pick(cands); nodes.push({ gx: x, gy: y, type, door: {}, cleared: false, visited: false, chests: [], solved: false, used: false, seed: seed * 31 + nodes.length * 977 }); link(i, nodes.length - 1, k, secret); };
  const mid = []; for (let i = 1; i < last; i++) if (nodes[i].type === "combat" || nodes[i].type === "puzzle" || nodes[i].type === "trap") mid.push(i);
  if (mid.length) branch("treasure", false, mid); if (n >= 6 && mid.length) branch("secret", true, mid); if (n >= 8 && mid.length) branch("treasure", false, mid);
  nodes.forEach(nd => { const ids = TPL_BY[nd.type === "boss" ? "boss" : nd.type] || TPL_BY.combat; nd.tpl = nd.type === "boss" ? "boss" + (1 + (def.id % 4)) : r.pick(ids); nd.flipX = r() < .5; nd.flipY = r() < .5; if (nd.type === "start" || nd.type === "exit" || nd.type === "shrine") nd.flipX = nd.flipY = false; });
  return nodes;
}
const dgK = () => DG.def.K0 + DG.tier * 2;
function dgSave() { if (!DG.def) return; SV.run = { did: DG.def.id, tier: DG.tier, seed: DG.seed, cur: DG.cur, nodes: DG.nodes.map(n => ({ c: n.cleared, v: n.visited, ch: n.chests, s: n.solved, u: n.used, rv: Object.keys(n.door).filter(k => n.door[k].rev) })), hp: Math.round(PL.hp) }; saveGame(); }
function startDungeon(did, tier, resume, seed) {
  const def = DUNGEONS[did]; DG.def = def; DG.tier = tier || 0;
  if (resume && SV.run && SV.run.did === did) { const R = SV.run; DG.tier = R.tier; DG.seed = R.seed; DG.nodes = dgGenerate(def, DG.seed); DG.nodes.forEach((n, i) => { const s = R.nodes[i]; if (s) { n.cleared = s.c; n.visited = s.v; n.chests = s.ch || []; n.solved = s.s; n.used = s.u; (s.rv || []).forEach(k => { if (n.door[k]) n.door[k].rev = true; }); } }); DG.cur = R.cur; DG.fromSide = null; }
  else { DG.seed = seed || (Math.random() * 1e9) | 0; DG.nodes = dgGenerate(def, DG.seed); DG.cur = 0; DG.fromSide = null; SV.stats.runs++; SV.run = null; }
  DG.K = dgK(); transition(() => setScene("dungeon", { fresh: !(resume && SV.run) }));
}
function doorSpawn(room, side) { const d = room.doors[side]; if (!d) return { x: room.w * TS / 2, y: room.h * TS / 2 }; const [a, b] = d.cells, dir = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] }[side], cx = (a[0] + b[0]) / 2 + .5, cy = (a[1] + b[1]) / 2 + .5; return { x: (cx + dir[0] * 2) * TS, y: (cy + dir[1] * 2) * TS }; }
function setDoors(room, open) { for (const s in room.doors) { const d = room.doors[s]; if (d.secret && !d.rev) continue; d.open = open; d.cells.forEach(([x, y]) => { room.g[y * room.w + x] = open ? TL.F : TL.D; }); } }
function fightSpawns(room, nd) { return room.spawns.filter(s => s.k !== "X"); }
function enemyFor(k, area, K) { const P = EN_POOL[area] || EN_POOL[0]; if (k === "e") return pick(P.elite); if (k === "r") return pick(P.fern); if (k === "f") { const fl = P.fuss.filter(i => EN[i].fly); return fl.length ? pick(fl) : pick(P.fern); } return pick(P.fuss); }
function modsFor(k, K) { if (k === "e") return K >= 15 && Math.random() < .5 ? [pick(ELITE_MOD_IDS), pick(ELITE_MOD_IDS)] : K >= 3 ? [pick(ELITE_MOD_IDS)] : []; return K >= 6 && Math.random() < .08 ? [pick(ELITE_MOD_IDS)] : []; }
/* Hinweise des Tutorials */
function hint(txt, ms) { DG.hint = { txt, t: 0, ms: ms || 5 }; }
function titleCard(a, b, ms) {
  let el = $("card"); if (!el) { el = document.createElement("div"); el.id = "card"; el.style.cssText = "position:fixed;inset:0;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .8s;text-align:center;color:#f6efd9;text-shadow:0 3px 0 #1d2742,0 0 18px #000"; document.body.appendChild(el); }
  el.innerHTML = `<div style="font:400 24px var(--f-body);letter-spacing:4px;opacity:.9">${esc(a)}</div><div style="font:400 56px/1.05 var(--f-display);margin-top:4px">${esc(b)}</div><div style="width:200px;height:4px;background:#f6efd9;margin-top:10px;border-radius:3px;opacity:.8"></div>`; cineBars(true);
  requestAnimationFrame(() => el.style.opacity = 1); setTimeout(() => { el.style.opacity = 0; cineBars(false); }, ms || 2600);
}
SCENES.dungeon = {
  enter(arg) {
    const def = DG.def; calcStats(); music(def.area === 1 ? "bereich2" : "bereich1"); scrapsInit(20, V.W, V.H); IN.show = true; DG.state = "idle";
    if (SV.run && SV.run.did === def.id && SV.run.hp && !(arg && arg.fresh)) PL.hp = Math.min(PL.max, Math.max(PL.hp, SV.run.hp)); else PL.hp = PL.max;
    this.load(DG.cur, DG.fromSide, true); BT.onDeath = () => { SV.stats.deaths++; toast("Zerknüllt! Du beginnst den Raum neu. Fortschritt bleibt."); transition(() => { const nd = DG.nodes[DG.cur]; nd.cleared = nd.cleared; DG.fromSide = DG.entrySide; this.load(DG.cur, DG.entrySide, false); PL.hp = PL.max; PL.dead = false; }, { d1: .5, d2: .5 }); };
    if (arg && arg.fresh) titleCard(def.ch, def.n, 3000);
  },
  load(idx, side, first) {
    const nd = DG.nodes[idx], def = DG.def, K = DG.K; DG.cur = idx; nd.visited = true; DG.entrySide = side;
    const doors = {}; for (const k in nd.door) doors[k] = nd.door[k]; const room = buildRoom(nd.tpl, { theme: def.area === 1 ? 1 : 0, seed: nd.seed, doors, flipX: nd.flipX, flipY: nd.flipY }); DG.room = room;
    for (const k in room.doors) if (nd.door[k].secret && nd.door[k].rev) { room.doors[k].rev = true; room.doors[k].cells.forEach(([x, y]) => room.g[y * room.w + x] = TL.F); }
    const sp = side ? doorSpawn(room, side) : (nd.type === "start" ? { x: room.w * TS / 2, y: room.h * TS / 2 } : doorSpawn(room, Object.keys(room.doors)[0]));
    plReset(sp.x, sp.y); const hp = PL.hp; PL.hp = hp || PL.max; btReset(room, K, def.area); BT.active = true; BT.cdArt = BT.cdArt && BT.cdArt.length ? BT.cdArt : [0, 0, 0]; this.mkProps(nd, room);
    CAM.x = PL.x; CAM.y = PL.y; CAM.z = 1.15; DG.portal = null; DG.wave = 0; DG.waves = 1; this.t = 0; DG.rt = 0;
    const fight = ["combat", "elite", "boss"].includes(nd.type) && !nd.cleared;
    if (fight) { setDoors(room, false); DG.state = "intro"; DG.introT = 0; DG.waves = nd.type === "combat" ? 2 : 1; if (nd.type === "boss") { music("boss1"); } }
    else { setDoors(room, true); DG.state = "free"; if (nd.cleared && ["combat", "elite", "boss"].includes(nd.type)) { } }
    if (nd.type === "exit" || (nd.type === "boss" && nd.cleared)) this.mkPortal(room);
    if (nd.solved) this.openCage(room, true);
    dgSave();
  },
  mkProps(nd, room) {
    for (const p of room.props) { const key = p.tx + "," + p.ty; let o; 
      if (p.k === "b") o = addProp("barrel", p.x, p.y); else if (p.k === "c") { o = addProp("chest", p.x, p.y); o.open = nd.chests.includes(key); }
      else if (p.k === "^") { o = addProp("spike", p.x, p.y); o.ph = (p.tx * .37 + p.ty * .21) % 2.4; o.hurt = false; } else if (p.k === "y") { o = addProp("crystal", p.x, p.y); o.hurt = true; o.lit = nd.solved; o.rad = 15; }
      else if (p.k === "x") { o = addProp("plate", p.x, p.y); o.hurt = false; o.lit = nd.solved; } else if (p.k === "h") { o = addProp("fountain", p.x, p.y); o.hurt = false; o.used = nd.used; }
      else if (p.k === "T") { o = addProp("turret", p.x, p.y); o.hurt = false; o.ph = (p.ty * .5) % 2.4; const dirs = [[1, 0, 0], [-1, 0, Math.PI], [0, 1, Math.PI / 2], [0, -1, -Math.PI / 2]]; for (const d of dirs) if (rTile(room, p.tx + d[0], p.ty + d[1]) === TL.F) { o.a = d[2]; break; } }
      if (o) o.key = key; }
  },
  mkPortal(room) { DG.portal = { x: room.w * TS / 2, y: room.h * TS / 2 + (DG.nodes[DG.cur].type === "boss" ? 0 : 0), t: 0 }; sfx("gate"); },
  openCage(room, quiet) { let any = false; for (let i = 0; i < room.g.length; i++) if (room.g[i] === TL.G) { room.g[i] = TL.F; any = true; const x = (i % room.w) * TS + 16, y = Math.floor(i / room.w) * TS + 16; if (!quiet) fxBurst(x, y, 4, "#cfd6e0", 70, .4, "dot", 2); } if (any && !quiet) { sfx("gate"); camShake(3); toast("Der Käfig öffnet sich!"); } },
  spawnWave() {
    const nd = DG.nodes[DG.cur], room = DG.room, K = DG.K, area = DG.def.area; DG.wave++; let sp = fightSpawns(room, nd);
    if (DG.wave > 1) sp = r2(sp, Math.ceil(sp.length * .6));
    if (nd.type === "boss") { const bx = room.w * TS / 2, by = room.h * TS / 2; const b = (typeof spawnBossFor === "function") ? spawnBossFor(DG.def, bx, by) : null; if (!b) { const e = spawnEnemy("waelzer", bx, by, { K, hpMul: 6 }); e.big = true; BT.boss = e; e.d = Object.assign({}, e.d, { n: DG.def.boss ? "Wächter" : "Wächter" }); } return; }
    sp.forEach(s => { const id = enemyFor(s.k, area, K); spawnEnemy(id, s.x, s.y, { K, mods: modsFor(s.k, K), wave: DG.wave }); });
    if (DG.wave > 1) { toast("Noch eine Welle!"); sfx("warn"); }
  },
  update(dt) {
    this.t += dt; DG.rt += dt; scrapsUpdate(dt); CAM.z = approach(CAM.z, 1, dt * .35); const nd = DG.nodes[DG.cur], room = DG.room;
    combatUpdate(dt); this.props(dt, nd, room); this.tutorial(dt, nd);
    if (DG.state === "intro") { DG.introT += dt; if (DG.introT > .9) { DG.state = "fight"; this.spawnWave(); if (nd.type === "boss") { sfx("roar"); camShake(8); } } }
    else if (DG.state === "fight") {
      const alive = BT.en.some(e => !e.dead);
      if (!alive && !PL.dead) { if (DG.wave < DG.waves) { DG.waveT = (DG.waveT || 0) + dt; if (DG.waveT > 1.3) { DG.waveT = 0; this.spawnWave(); } } else this.cleared(nd, room); }
    }
    if (DG.portal) { DG.portal.t += dt; if (!PL.dead && dist(PL.x, PL.y, DG.portal.x, DG.portal.y) < 22) this.finish(); }
    this.doorCheck(nd, room); this.secret(nd, room);
    if (PL.dead) { } const tg = PL.dead ? null : nearestEnemy(PL.x, PL.y, 140); camFollow(PL.x + (tg ? (tg.x - PL.x) * .15 : 0), PL.y + (tg ? (tg.y - PL.y) * .15 : 0), { w: room.w * TS, h: room.h * TS }, dt);
    if (wasPressed("menu")) pauseMenu();
  },
  cleared(nd, room) {
    DG.state = "free"; nd.cleared = true; setDoors(room, true); sfx("door"); camShake(3); if (ST.heal) healPlayer(PL.max * ST.heal);
    if (nd.type === "boss") { slowmo(1.2, .25); cineFlash("#fff", .6); this.mkPortal(room); music(DG.def.area === 1 ? "bereich2" : "bereich1"); const it = genItem(DG.K + 2, undefined, undefined, { luck: ST.luck + 60, minRar: 2 }); addPickup("item", room.w * TS / 2, room.h * TS / 2 + 40, { it }); }
    else if (Math.random() < .3 || nd.type === "elite") { const p = { x: room.w * TS / 2, y: room.h * TS / 2 }; const c = addProp("chest", p.x, p.y); c.key = "r"; }
    dgSave();
  },
  props(dt, nd, room) {
    const K = DG.K, t = BT.t; let plates = 0, platesOn = 0, cry = 0, cryOn = 0;
    for (const p of BT.props) {
      if (p.k === "chest" && p.open && p.key && !nd.chests.includes(p.key)) { nd.chests.push(p.key); dgSave(); }
      if (p.k === "spike") { const c = (t + p.ph) % 2.4; p.up = c > 1.5 && c < 2.0; p.warn = c > 1.0 && c <= 1.5; if (p.up && !PL.dead && PL.inv <= 0 && PL.st !== "roll" && dist(p.x, p.y, PL.x, PL.y) < 15) hurtPlayer(9 * pw(K + 2), null, {}); }
      if (p.k === "turret") { p.c = ((p.c === undefined ? p.ph : p.c) + dt); if (p.c > 2.6) { p.c = 0; const a = p.a || 0, ox = p.x, oy = p.y; addTele({ k: "rect", x: ox, y: oy, a, len: 420, w: 14, dur: .55, col: BAD, fn: () => { addProj({ x: ox + Math.cos(a) * 18, y: oy + Math.sin(a) * 18, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, dmg: 8 * pw(K + 2), own: "e", kind: "bolt", life: 2.4 }); sfx("eshoot", 40); } }); sfx("tele", 120); } }
      if (p.k === "plate") { plates++; if (!p.lit && dist(p.x, p.y, PL.x, PL.y) < 18) { p.lit = true; sfx("plate"); fxRing(p.x, p.y, 4, 26, .4, "#ffd45a"); } if (p.lit) platesOn++; }
      if (p.k === "crystal") { cry++; if (p.lit) cryOn++; }
      if (p.k === "fountain" && !p.used && dist(p.x, p.y, PL.x, PL.y) < 30) { p.used = true; nd.used = true; healPlayer(PL.max * .6); sfx("heal"); fxBurst(p.x, p.y, 14, "#7bc8e0", 90, .8, "dot", 2.5); toast("Der Tintenbrunnen heilt dich."); dgSave(); }
    }
    if (!nd.solved && (plates + cry) > 0 && platesOn + cryOn === plates + cry) { nd.solved = true; this.openCage(room); dgSave(); }
  },
  doorCheck(nd, room) {
    if (DG.state === "leaving" || PL.dead) return;
    for (const s in room.doors) { const d = room.doors[s]; if (!d.open) continue; if (d.secret && !d.rev) continue; const tx = Math.floor(PL.x / TS), ty = Math.floor(PL.y / TS); if (d.cells.some(([x, y]) => x === tx && y === ty)) { this.go(d.to, OPP[s]); return; } }
  },
  go(to, side) { DG.state = "leaving"; for (const p of BT.pk.slice()) collect(p); BT.pk.length = 0; transition(() => { this.load(to, side, false); }, { d1: .32, d2: .4 }); },
  secret(nd, room) {
    if (!PL.swing || PL.swing.sx) return; PL.swing.sx = 1;
    for (const s in room.doors) { const d = room.doors[s]; if (!d.secret || d.rev) continue; const c = d.cells[0], x = (c[0] + 1) * TS, y = (c[1] + .5) * TS; if (dist(PL.x, PL.y, x, y) < 90) { d.rev = true; nd.door[s].rev = true; d.open = true; d.cells.forEach(([cx, cy]) => room.g[cy * room.w + cx] = TL.F); sfx("crack"); camShake(4); fxBurst(x, y, 14, "#8a5a34", 130, .6, "bit", 3, 200); toast("Ein Geheimgang!"); dgSave(); }
    }
  },
  tutorial(dt, nd) {
    if (DG.def.id !== 0 || DG.tier > 0 || SV.flags.tutDone) return; const T = SV.flags.tut = SV.flags.tut || {};
    if (DG.hint) { DG.hint.t += dt; if (DG.hint.t > DG.hint.ms) DG.hint = null; }
    if (!T.move) { if (!DG.hint && DG.rt > 3.2) hint("Ziehe mit dem Daumen links, um dich zu bewegen.", 99); if (PL.moving && (DG.rt > 1.5)) { T.move = 1; DG.hint = null; } return; }
    if (!T.atk) { if (!DG.hint) hint("Tippe oder halte das Schwert: Angriff. Je schneller du tippst, desto mehr Hiebe.", 99); if (PL.swing) { T.atk = 1; DG.hint = null; } return; }
    if (!T.dodge && BT.tele.length && !DG.hint) hint("Rote Flächen sind Warnungen. Rolle hindurch (Ausweichen): währenddessen bist du unverwundbar!", 99);
    if (PL.st === "roll" && DG.hint && !T.dodge) { T.dodge = 1; DG.hint = null; }
    if (!T.rng && T.dodge && !DG.hint && ST.r) { hint("Halte den Bogen rechts: Fernkampf mit Zielhilfe.", 99); } if (IN.down.rng && DG.hint && !T.rng) { T.rng = 1; DG.hint = null; }
    if (!T.art && T.rng && !DG.hint && ST.arts[0]) { hint("Die Artefakte (Kreise mit Sternen) haben eine Abklingzeit. Probier eins aus!", 99); } if ((BT.cdArt[0] > 0 || BT.cdArt[1] > 0) && !T.art) { T.art = 1; DG.hint = null; }
    if (T.move && T.atk && T.dodge && T.rng && T.art) SV.flags.tutDone = 1;
  },
  finish() {
    if (DG.state === "done") return; DG.state = "done"; const def = DG.def; SV.done[def.id] = Math.max(SV.done[def.id] || 0, DG.tier + 1); if (DG.tier >= (SV.stufeMax || 0) && !def.endless) SV.stufeMax = DG.tier + 1; if (def.endless) SV.stufeMax = Math.max(SV.stufeMax || 0, DG.tier + 1);
    const bonus = Math.round(40 * pw(DG.K) * (def.boss ? 3 : 1)); SV.gold += bonus; SV.run = null; saveGame(); sfx("victory"); cineFlash("#fff", .7); titleCard("Kapitel geschafft", def.n, 2600); toast(`+${bonus} Papiertaler`);
    setTimeout(() => transition(() => { DG.def = null; setScene(SCENES.hub ? "hub" : "title"); }), 2400);
  },
  draw(c) {
    const room = DG.room, th = THEMES[room.theme]; c.fillStyle = th.bgCol; c.fillRect(0, 0, V.W, V.H); scrapsDraw(c, CAM.x, CAM.y, .5, 0, .6);
    camBegin(c); drawRoomBG(c, room); this.drawDoors(c, room); drawTorchSprites(c, room, G.t); this.drawProps(c); if (DG.portal) this.drawPortal(c); combatDraw(c); drawTorches(c, room, G.t); camEnd(c);
    const s = w2s(PL.x, PL.y), L = [{ x: s.x, y: s.y, r: 240 }]; room.torches.forEach(t => { const q = w2s(t.x, t.y + 14); L.push({ x: q.x, y: q.y, r: 120, k: .8 }); }); if (DG.portal) { const q = w2s(DG.portal.x, DG.portal.y); L.push({ x: q.x, y: q.y, r: 150, k: .9 }); }
    for (const sd in room.doors) { const d = room.doors[sd]; if (d.open) { const cc = d.cells[0], q = w2s((cc[0] + 1) * TS, (cc[1] + .5) * TS); L.push({ x: q.x, y: q.y, r: 90, k: .6 }); } }
    drawLighting(c, th.dark * .9, L); scrapsDraw(c, CAM.x, CAM.y, .35, 1, 3); drawVignette(c, .8); hudDraw(c); this.drawMap(c); this.drawHint(c); drawControls(c, { btns: combatBtns() });
  },
  drawDoors(c, room) { for (const sd in room.doors) { const d = room.doors[sd]; if (d.secret && !d.rev) continue; const [a, b] = d.cells, x = Math.min(a[0], b[0]) * TS, y = Math.min(a[1], b[1]) * TS, w = Math.abs(a[0] - b[0]) * TS + TS, h = Math.abs(a[1] - b[1]) * TS + TS; if (!d.open) { blit(c, doorSpr(w, h), x + w / 2, y + h / 2); } else { c.save(); c.globalAlpha = .5 + Math.sin(G.t * 3) * .1; c.fillStyle = "rgba(255,230,150,.45)"; c.fillRect(x, y, w, h); c.restore(); } } },
  drawProps(c) { for (const p of BT.props) { if (p.k === "spike") blit(c, spikeSpr(p.up ? 2 : p.warn ? 1 : 0), p.x, p.y); else if (p.k === "plate") blit(c, plateSpr(p.lit), p.x, p.y); else if (p.k === "crystal") blit(c, crystalSpr(p.lit), p.x, p.y - 4, { s: 1 + (p.lit ? Math.sin(G.t * 4) * .04 : 0) }); else if (p.k === "fountain") blit(c, fountSpr(p.used), p.x, p.y); else if (p.k === "turret") { c.save(); c.translate(p.x, p.y); c.rotate(p.a || 0); c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.fillStyle = BAD; c.fillRect(2, -3, 10, 6); c.restore(); } } },
  drawPortal(c) { const p = DG.portal, t = p.t; for (let i = 0; i < 3; i++) { c.save(); c.globalAlpha = .75 - i * .15; c.strokeStyle = i % 2 ? "#ffd45a" : "#f6efd9"; c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.y, 22 - i * 5 + Math.sin(t * 3 + i) * 2, 13 - i * 3, t * (i % 2 ? 1 : -1) * .6, 0, TAU); c.stroke(); c.restore(); } blit(c, glyphSpr("page", 22), p.x, p.y - 4 + Math.sin(t * 3) * 2); },
  drawMap(c) {
    const cell = 12, gap = 4, nodes = DG.nodes; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; nodes.forEach(n => { if (n.visited) { x0 = Math.min(x0, n.gx); x1 = Math.max(x1, n.gx); y0 = Math.min(y0, n.gy); y1 = Math.max(y1, n.gy); } });
    const ox = V.W - (V.sr || 0) - 70, oy = (V.st || 0) + 64, cur = nodes[DG.cur]; c.save(); c.globalAlpha = .9; c.lineWidth = 2; c.font = "10px 'Patrick Hand'";
    const pos = n => [ox + (n.gx - cur.gx) * (cell + gap), oy + (n.gy - cur.gy) * (cell + gap)]; c.strokeStyle = INK;
    nodes.forEach(n => { if (!n.visited) return; for (const k in n.door) { const m = nodes[n.door[k].to]; if (n.door[k].secret && !n.door[k].rev) continue; const [ax, ay] = pos(n), [bx, by] = pos(m); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); } });
    nodes.forEach(n => { const vis = n.visited || Object.values(n.door).some(d => !(d.secret && !d.rev) && nodes[d.to].visited); if (!vis) return; const [x, y] = pos(n); c.fillStyle = n === cur ? ACC : n.visited ? (n.cleared || ["start", "shrine", "treasure", "exit"].includes(n.type) ? P1 : "#d9b0a8") : "rgba(246,239,217,.35)"; c.strokeStyle = INK; c.fillRect(x - cell / 2, y - cell / 2, cell, cell); c.strokeRect(x - cell / 2, y - cell / 2, cell, cell);
      const g = { boss: "skull", elite: "skull", treasure: "chest", puzzle: "gear", shrine: "heart", exit: "page", secret: "star", trap: "cross" }[n.type]; if (g && n.visited) drawGlyph(c, g, x, y, 9, n.type === "boss" ? BAD : INK); });
    c.restore();
  },
  drawHint(c) { const h = DG.hint; if (!h) return; const a = clamp(Math.min(h.t * 3, 1), 0, 1); c.save(); c.globalAlpha = a; c.font = "20px 'Patrick Hand'"; c.textAlign = "center"; const lines = wrapText(c, h.txt, Math.min(V.W - 240, 520)); const y = V.H * .2; const w = Math.max(...lines.map(l => c.measureText(l).width)) + 28, hh = lines.length * 22 + 14; c.fillStyle = "rgba(29,39,66,.82)"; c.fillRect(V.W / 2 - w / 2, y - 20, w, hh); c.fillStyle = P1; lines.forEach((l, i) => c.fillText(l, V.W / 2, y + i * 22)); c.restore(); },
};
const r2 = (arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
function wrapText(c, t, w) { const words = t.split(" "), out = []; let cur = ""; for (const x of words) { const test = cur ? cur + " " + x : x; if (c.measureText(test).width > w && cur) { out.push(cur); cur = x; } else cur = test; } out.push(cur); return out; }
/* Sprites für Türen und Fallen */
function doorSpr(w, h) { return spr("door|" + w + "|" + h, w + 8, h + 8, c0 => { const c = sketchCtx(c0, strSeed("dr" + w), 22); c.lineWidth = 3; c0.fillStyle = "#6e4425"; c.beginPath(); c.rect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4); c.fill(); c.stroke(); c0.fillStyle = "#8a5a34"; c.lineWidth = 2.4; const hor = w > h; for (let i = 1; i < (hor ? 5 : 3); i++) { c.beginPath(); if (hor) { c.moveTo(-w / 2 + i * w / 5, -h / 2 + 3); c.lineTo(-w / 2 + i * w / 5, h / 2 - 3); } else { c.moveTo(-w / 2 + 3, -h / 2 + i * h / 5); c.lineTo(w / 2 - 3, -h / 2 + i * h / 5); } c.stroke(); } c0.fillStyle = "#ffd45a"; c0.beginPath(); c0.arc(0, 0, 4, 0, TAU); c0.fill(); c.beginPath(); c.arc(0, 0, 4, 0, TAU); c.stroke(); }, 2); }
function spikeSpr(st) { return spr("spk|" + st, 34, 34, c0 => { const c = sketchCtx(c0, strSeed("sp" + st), 12); c.lineWidth = 2.4; if (st === 0) { c0.fillStyle = "rgba(29,39,66,.5)"; for (const [x, y] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { c0.beginPath(); c0.arc(x, y, 2.5, 0, TAU); c0.fill(); } return; } const h = st === 2 ? 11 : 4; for (const [x, y] of [[-7, -5], [7, -5], [0, 6]]) { c.beginPath(); c.moveTo(x - 4, y + 4); c.lineTo(x, y + 4 - h); c.lineTo(x + 4, y + 4); c.closePath(); c0.fillStyle = st === 2 ? "#cfd6e0" : "#b8473a"; c.fill(); c.stroke(); } }, 2); }
function plateSpr(on) { return spr("plt|" + on, 34, 34, c0 => { const c = sketchCtx(c0, strSeed("pl"), 12); c.lineWidth = 2.6; c.beginPath(); c.rect(-11, -11, 22, 22); c0.fillStyle = on ? "#ffd45a" : "#b8b4a4"; c.fill(); c.stroke(); c0.fillStyle = on ? "#fff" : "#8a8a8a"; c0.beginPath(); c0.arc(0, 0, 4, 0, TAU); c0.fill(); }, 2); }
function crystalSpr(on) { return spr("cry|" + on, 40, 44, c0 => { const c = sketchCtx(c0, strSeed("cr"), 14); c.lineWidth = 2.8; c.beginPath(); c.moveTo(0, -17); c.lineTo(10, -3); c.lineTo(6, 14); c.lineTo(-6, 14); c.lineTo(-10, -3); c.closePath(); c0.fillStyle = on ? "#ffd45a" : "#7aa0c0"; c.fill(); c.stroke(); c0.fillStyle = "rgba(255,255,255,.5)"; c0.beginPath(); c0.moveTo(-2, -12); c0.lineTo(3, -4); c0.lineTo(-3, 4); c0.closePath(); c0.fill(); }, 2); }
function fountSpr(used) { return spr("fo|" + used, 52, 52, c0 => { const c = sketchCtx(c0, strSeed("fo"), 18); c.lineWidth = 3; c.beginPath(); c.ellipse(0, 4, 20, 14, 0, 0, TAU); c0.fillStyle = "#9aa3b2"; c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 2, 15, 9, 0, 0, TAU); c0.fillStyle = used ? "#3a4a66" : "#2a6aa0"; c.fill(); c.stroke(); if (!used) { c0.fillStyle = "rgba(255,255,255,.5)"; c0.beginPath(); c0.ellipse(-4, 0, 5, 2, 0, 0, TAU); c0.fill(); } }, 2); }
