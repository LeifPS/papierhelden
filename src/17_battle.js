/* ===== Kampf-Laufzeit: Gegner, Telegraphen, Geschosse, Schaden, Beute ===== */
const BOSS = {};
const BT = { room: null, K: 1, area: 0, en: [], pj: [], tele: [], pk: [], haz: [], mines: [], zaps: [], props: [], slowAll: 0, hurtFlash: 0, cdArt: [0, 0, 0], rCd: 0, shots: 0, boss: null, onClear: null, onDeath: null, active: false, kills: 0, loot: [], t: 0 };
const kScale = (K, e) => Math.pow(1.09, K - 1) * (e || 1);
function btReset(room, K, area) {
  Object.assign(BT, { room, K, area, en: [], pj: [], tele: [], pk: [], haz: [], mines: [], zaps: [], props: [], slowAll: 0, hurtFlash: 0, boss: null, active: false, kills: 0 }); FXL.length = 0;
}
/* ----- Gegner erzeugen ----- */
function spawnEnemy(id, x, y, o) {
  o = o || {}; const d = EN[id] || BOSS[id], K = o.K || BT.K, tier = o.tier !== undefined ? o.tier : enTier(K);
  const mods = {}; (o.mods || []).forEach(m => Object.assign(mods, ELITE_MODS[m]));
  const hpMul = (d.role === "elite" ? 1 : 1) * (o.mods && o.mods.length ? 1.5 : 1) * (o.hpMul || 1);
  const e = { id, d, x, y, r: d.r, hb: d.r * .9, tier, K, hp: 0, max: 0, st: o.noSpawn ? "move" : "spawn", stT: 0, t: Math.random() * 5, face: Math.random() * TAU, fl: 1, cdT: .6 + Math.random() * .8, flash: 0, kx: 0, ky: 0, dead: false, slowT: 0, slowK: 0, burnT: 0, burnD: 0, mods, modIds: o.mods || [], tele: null, atk: null, alpha: 1, orb: Math.random() * TAU, sg: Math.random() < .5 ? 1 : -1, stuck: 0, wave: o.wave || 0, summoned: !!o.summoned, big: d.role === "boss" || d.role === "mini" };
  e.max = e.hp = Math.round(d.hp * kScale(K) * hpMul); e.dmgBase = d.dmg * Math.pow(1.09, (K - 1) * .94); e.spd = d.spd * (mods.spd || 1) * (1 + Math.min(.25, K * .004));
  if (d.role === "boss" || d.role === "mini") { e.max = e.hp = Math.round(d.hp * kScale(K)); BT.boss = e; }
  BT.en.push(e); if (!o.noSpawn) { fxRing(x, y, 4, e.r * 2.2, .5, "rgba(29,39,66,.6)"); fxBurst(x, y, 6, ["#1d2742", "#2a3a80"], 50, .5, "dot", 3); }
  return e;
}
const enAlive = () => BT.en.filter(e => !e.dead);
const enDmg = (e, a) => e.dmgBase * (a && a.m || 1);
/* ----- Telegraphen (Warnflächen) ----- */
function addTele(o) { const t = Object.assign({ k: "circle", x: 0, y: 0, a: 0, r: 40, arc: 1.5, len: 100, w: 24, t: 0, dur: .8, own: null, fn: null, fired: 0, col: BAD }, o); BT.tele.push(t); return t; }
function teleHit(t) {   // trifft die Fläche den Spieler?
  const px = PL.x, py = PL.y, pr = PL.r * .7;
  if (t.k === "circle") return dist(t.x, t.y, px, py) < t.r + pr;
  if (t.k === "cone") { const d = dist(t.x, t.y, px, py); if (d - pr > t.r) return false; if (d < 16) return true; return Math.abs(angDiff(t.a, ang(t.x, t.y, px, py))) <= t.arc / 2 + Math.atan2(pr, Math.max(d, 1)); }
  const dx = px - t.x, dy = py - t.y, ca = Math.cos(t.a), sa = Math.sin(t.a), al = dx * ca + dy * sa, pe = -dx * sa + dy * ca; return al > -pr && al < t.len + pr && Math.abs(pe) < t.w / 2 + pr;
}
function teleUpdate(dt) {
  for (let i = BT.tele.length - 1; i >= 0; i--) {
    const t = BT.tele[i]; if (t.dead || (t.own && t.own.dead)) { BT.tele.splice(i, 1); continue; }
    if (t.fired) { t.ft += dt; if (t.ft > .16) BT.tele.splice(i, 1); continue; }
    t.t += dt * (t.own && t.own.slowT > 0 ? 1 - t.own.slowK * .6 : 1) * (t.own ? (BT.slowAll > 0 ? .5 : 1) : 1);
    if (t.t >= t.dur) { t.fired = 1; t.ft = 0; if (t.fn) t.fn(t); }
  }
}
function teleDraw(c) {
  for (const t of BT.tele) {
    const k = t.fired ? 1 : clamp(t.t / t.dur, 0, 1), a = t.fired ? Math.max(0, .9 - t.ft * 6) : .16 + .26 * k, col = t.fired ? "#ffffff" : t.col; c.save(); c.globalAlpha = a; c.fillStyle = col; c.strokeStyle = t.col; c.lineWidth = 2.2;
    if (t.k === "circle") { c.beginPath(); c.arc(t.x, t.y, t.r, 0, TAU); c.fill(); c.globalAlpha = Math.min(1, a + .35); c.stroke(); if (!t.fired) { c.globalAlpha = a * .8; c.fillStyle = t.col; c.beginPath(); c.arc(t.x, t.y, t.r * k, 0, TAU); c.fill(); } }
    else if (t.k === "cone") { c.beginPath(); c.moveTo(t.x, t.y); c.arc(t.x, t.y, t.r, t.a - t.arc / 2, t.a + t.arc / 2); c.closePath(); c.fill(); c.globalAlpha = Math.min(1, a + .35); c.stroke(); if (!t.fired) { c.globalAlpha = a * .8; c.fillStyle = t.col; c.beginPath(); c.moveTo(t.x, t.y); c.arc(t.x, t.y, t.r * k, t.a - t.arc / 2, t.a + t.arc / 2); c.closePath(); c.fill(); } }
    else { c.translate(t.x, t.y); c.rotate(t.a); c.fillRect(0, -t.w / 2, t.len, t.w); c.globalAlpha = Math.min(1, a + .35); c.strokeRect(0, -t.w / 2, t.len, t.w); if (!t.fired) { c.globalAlpha = a * .8; c.fillStyle = t.col; c.fillRect(0, -t.w / 2, t.len * k, t.w); } }
    c.restore();
  }
}
/* ----- Geschosse ----- */
function addProj(o) { const p = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, r: 5, dmg: 5, own: "e", life: 2.5, t: 0, pierce: 0, kind: "ink", hit: null, hom: 0, bounce: 0, w: null, col: "#2a3a80", sp: 0 }, o); p.hit = new Set(); BT.pj.push(p); return p; }
function enShot(e, a, ang0, n, spread, speed, kind, dmgMul, extra) {
  for (let i = 0; i < n; i++) { const an = ang0 + (n > 1 ? (i / (n - 1) - .5) * spread : 0); addProj(Object.assign({ x: e.x + Math.cos(an) * (e.r + 4), y: e.y + Math.sin(an) * (e.r + 4), vx: Math.cos(an) * speed, vy: Math.sin(an) * speed, dmg: e.dmgBase * (dmgMul || 1) * (a && a.m || 1), own: "e", kind, r: kind === "glob" ? 9 : 5, life: 3.2, src: e, hom: kind === "plane" ? .6 : 0 }, extra || {})); }
}
const PRJ = {
  ink: ["#2a3a80", 5], glob: ["#3a3a90", 9], plane: ["#f6efd9", 6], arrow: ["#b9803a", 5], stone: ["#9aa3b2", 5], bolt: ["#cfd6e0", 5], star: ["#f1d84a", 6], red: ["#b8473a", 6], fire: ["#e27d2c", 6], pot: ["#2a3a80", 8],
};
function projSpr(kind) {
  return spr("pj|" + kind, 36, 36, c0 => {
    const c = sketchCtx(c0, strSeed("pj" + kind), 16); c.lineWidth = 2.4; const col = PRJ[kind] ? PRJ[kind][0] : "#fff";
    switch (kind) {
      case "plane": c.beginPath(); c.moveTo(9, 0); c.lineTo(-7, -6); c.lineTo(-3, 0); c.lineTo(-7, 6); c.closePath(); c0.fillStyle = col; c.fill(); c.stroke(); break;
      case "arrow": c.beginPath(); c.moveTo(-11, 0); c.lineTo(8, 0); c.stroke(); c.beginPath(); c.moveTo(11, 0); c.lineTo(5, -4); c.lineTo(5, 4); c.closePath(); c0.fillStyle = "#cfd6e0"; c.fill(); c.stroke(); c.beginPath(); c.moveTo(-11, 0); c.lineTo(-14, -3); c.moveTo(-11, 0); c.lineTo(-14, 3); c.stroke(); break;
      case "bolt": c.beginPath(); c.moveTo(-10, 0); c.lineTo(9, 0); c.lineWidth = 3.4; c.stroke(); c.beginPath(); c.moveTo(11, 0); c.lineTo(4, -5); c.lineTo(4, 5); c.closePath(); c0.fillStyle = "#cfd6e0"; c.fill(); c.stroke(); break;
      case "star": c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = i % 2 ? 3.5 : 10; c[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c0.fillStyle = col; c.fill(); c.stroke(); break;
      case "red": c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineWidth = 5; c0.strokeStyle = INK; c.stroke(); c0.strokeStyle = BAD; c.lineWidth = 2.6; c.stroke(); break;
      default: c.beginPath(); c.arc(0, 0, PRJ[kind] ? PRJ[kind][1] : 5, 0, TAU); c0.fillStyle = col; c.fill(); c.stroke(); c0.fillStyle = "rgba(255,255,255,.4)"; c0.beginPath(); c0.arc(-2, -2, 2, 0, TAU); c0.fill();
    }
  }, 2);
}
function projUpdate(dt) {
  for (let i = BT.pj.length - 1; i >= 0; i--) {
    const p = BT.pj[i]; p.t += dt * (p.own === "e" && BT.slowAll > 0 ? .5 : 1); if (p.t > p.life) { BT.pj.splice(i, 1); continue; }
    if (p.hom && p.own === "p") { let best = null, bd = 160; for (const e of BT.en) { if (e.dead || e.st === "spawn") continue; const d = dist(p.x, p.y, e.x, e.y); if (d < bd) { bd = d; best = e; } } if (best) { const sp = Math.hypot(p.vx, p.vy), a0 = Math.atan2(p.vy, p.vx), da = clamp(angDiff(a0, ang(p.x, p.y, best.x, best.y)), -p.hom * 4 * dt, p.hom * 4 * dt); p.vx = Math.cos(a0 + da) * sp; p.vy = Math.sin(a0 + da) * sp; } }
    else if (p.hom && p.own === "e") { const sp = Math.hypot(p.vx, p.vy), a0 = Math.atan2(p.vy, p.vx), da = clamp(angDiff(a0, ang(p.x, p.y, PL.x, PL.y)), -p.hom * 1.4 * dt, p.hom * 1.4 * dt); p.vx = Math.cos(a0 + da) * sp; p.vy = Math.sin(a0 + da) * sp; }
    const slow = p.own === "e" && BT.slowAll > 0 ? .5 : 1, sx = p.vx * dt * slow, sy = p.vy * dt * slow, n = Math.max(1, Math.ceil(Math.hypot(sx, sy) / 6)); let dead = false;
    for (let k = 0; k < n && !dead; k++) {
      p.x += sx / n; p.y += sy / n;
      if (solidAt(BT.room, p.x, p.y, true)) { if (p.bounce > 0) { p.bounce--; p.x -= sx / n; p.y -= sy / n; const hx = solidAt(BT.room, p.x + sx / n, p.y, true), hy = solidAt(BT.room, p.x, p.y + sy / n, true); if (hx || !hy) p.vx *= -1; if (hy) p.vy *= -1; if (!hx && !hy) { p.vx *= -1; p.vy *= -1; } break; } fxBurst(p.x, p.y, 4, PRJ[p.kind] ? PRJ[p.kind][0] : "#fff", 50, .25, "dot", 2); if (p.boom) projBoom(p); dead = true; break; }
      if (p.own === "p") {
        for (const e of BT.en) { if (e.dead || e.st === "spawn" || p.hit.has(e) || e.alpha < .5 && e.ghost) continue; if (dist(p.x, p.y, e.x, e.y) < e.r + p.r) { p.hit.add(e); hurtEnemy(e, p.dmg * (p.dmgm || 1), { a: Math.atan2(p.vy, p.vx), kb: 40, w: p.w, proj: 1, crit: p.crit }); if (p.boom) projBoom(p); if (p.pierce-- <= 0) { if (p.bounce > 0) { p.bounce--; p.vx *= -1; p.vy *= -1; p.hit.clear(); } else { dead = true; } break; } } }
        if (!dead && p.props !== false) for (const pr of BT.props) if (pr.hurt && !pr.dead && dist(p.x, p.y, pr.x, pr.y) < (pr.rad || 14) + p.r) { propHit(pr, p.dmg, p); if (p.pierce-- <= 0) { dead = true; break; } }
      } else if (PL.inv <= 0 && !PL.dead && dist(p.x, p.y, PL.x, PL.y) < PL.r * .75 + p.r) { hurtPlayer(p.dmg, p.src, { a: Math.atan2(p.vy, p.vx) }); dead = true; }
    }
    if (dead) BT.pj.splice(i, 1);
  }
}
function projBoom(p) { const w = p.w; fxRing(p.x, p.y, 4, 54, .35, "#e27d2c"); fxBurst(p.x, p.y, 10, ["#e27d2c", "#ffd45a"], 120, .4, "spark", 2); sfx("boom"); for (const e of BT.en) if (!e.dead && dist(p.x, p.y, e.x, e.y) < 56 + e.r) hurtEnemy(e, p.dmg * .8, { a: ang(p.x, p.y, e.x, e.y), kb: 100, noBoom: 1 }); p.boom = 0; }
function projDraw(c) {
  for (const p of BT.pj) {
    const s = projSpr(p.kind), a = Math.atan2(p.vy, p.vx), k = p.kind === "star" ? p.t * 14 : a; if (p.kind === "glob" || p.kind === "ink" || p.kind === "fire") { c.save(); c.globalAlpha = .25; c.fillStyle = PRJ[p.kind][0]; c.beginPath(); c.arc(p.x - p.vx * .02, p.y - p.vy * .02, p.r * 1.3, 0, TAU); c.fill(); c.restore(); }
    blit(c, s, p.x, p.y, { r: k, s: p.kind === "glob" ? 1.4 : 1 });
  }
}
/* ----- Schaden ----- */
const fireProof = e => e.mods && e.mods.fire;
function hurtEnemy(e, dmg, o) {
  o = o || {}; if (e.dead || e.st === "spawn" || e.invul) return 0; const w = o.w;
  if (e.mods.armor) dmg *= (1 - e.mods.armor);
  // Schild des Zensors (Vorderseite)
  if (e.d.shield && e.st !== "wind" && e.st !== "rec" && o.a !== undefined && !o.pierceShield) { const toHit = o.a + PI; if (Math.abs(angDiff(e.face, toHit)) < e.d.shield / 2) { sfx("deny"); fxText(e.x, e.y - e.r - 6, "Zensiert", "#9aa3b2", 15); fxBurst(e.x + Math.cos(e.face) * e.r, e.y + Math.sin(e.face) * e.r, 5, "#cfd6e0", 90, .25, "spark", 1.5); e.flash = .05; if (o.melee) { PL.swing && (PL.swing.t = Math.max(PL.swing.t, PL.swing.dur * .6)); } return 0; } }
  const crit = o.crit; dmg = Math.max(1, Math.round(dmg)); e.hp -= dmg; e.flash = .11; if (e.big) BT.bossHit = .15;
  const big = crit || dmg > e.max * .18; fxText(e.x + (Math.random() - .5) * 10, e.y - e.r - 6, String(dmg), crit ? "#ffd45a" : "#ffffff", crit ? 22 : 15);
  fxBurst(e.x, e.y, crit ? 8 : 4, [e.d.col || "#fff", "#fff"], 70, .3, "bit", 2.2, 80);
  sfx(crit ? "crit" : "hit", 45); if (crit) { hitstop(.07); camShake(5); } else if (o.melee) { hitstop(.03); camShake(2); }
  if (o.a !== undefined && o.kb && !e.d.fixed) { const res = e.big ? .15 : e.d.role === "elite" ? .45 : 1; e.kx += Math.cos(o.a) * o.kb * 3.2 * res / (e.r / 10); e.ky += Math.sin(o.a) * o.kb * 3.2 * res / (e.r / 10); }
  if (e.d.role === "fuss" && e.st === "wind" && e.tele && (dmg > e.max * .1 || Math.random() < .5)) { e.tele.dead = true; e.tele = null; e.st = "stun"; e.stT = 0; e.stunD = .4; e.cdT = Math.max(e.cdT, .5); }
  if (w) {
    if (w.life) healPlayer(dmg * w.life, true);
    if (w.burn && !fireProof(e)) { e.burnT = 3; e.burnD = Math.max(e.burnD, dmg * w.burn / 3); }
    if (w.frost && Math.random() < w.frost) { e.slowT = 2.2; e.slowK = .5; fxBurst(e.x, e.y, 5, "#bfe6f5", 60, .4, "dot", 2); }
    if (w.chain && !o.noChain && Math.random() < w.chain) chainZap(e, dmg * .55, 2, w);
  }
  if (e.hp <= 0) enKill(e, o);
  return dmg;
}
function chainZap(from, dmg, n, w) {
  let cur = from; const used = new Set([from]);
  for (let i = 0; i < n; i++) { let best = null, bd = 100; for (const e of BT.en) { if (e.dead || used.has(e) || e.st === "spawn") continue; const d = dist(cur.x, cur.y, e.x, e.y); if (d < bd) { bd = d; best = e; } } if (!best) break; used.add(best); BT.zaps.push({ x0: cur.x, y0: cur.y, x1: best.x, y1: best.y, t: 0 }); sfx("chain", 80); hurtEnemy(best, dmg, { noChain: 1, w: null }); cur = best; }
}
function healPlayer(n, quiet) { if (PL.dead || n <= 0) return; const before = PL.hp; PL.hp = Math.min(PL.max, PL.hp + n); if (!quiet && PL.hp > before) fxText(PL.x, PL.y - 28, "+" + Math.round(PL.hp - before), "#7fd28a", 16); }
function hurtPlayer(dmg, src, o) {
  if (PL.dead || PL.inv > 0 || (window.ADM && ADM.invul) || G.noHurt) return false; o = o || {};
  dmg = dmg * (1 - ST.prot); if (PL.shield > 0) { const ab = Math.min(PL.shield, dmg); PL.shield -= ab; dmg -= ab; fxBurst(PL.x, PL.y, 5, "#7bc8e0", 70, .3, "dot", 2); if (dmg <= .5) { sfx("shield"); PL.inv = .2; return false; } }
  dmg = Math.max(1, Math.round(dmg)); PL.hp -= dmg; PL.flash = .55; PL.inv = .6; BT.hurtFlash = .45; camShake(7); hitstop(.07); sfx("hurt");
  fxText(PL.x, PL.y - 26, String(dmg), "#ff8b78", 20); fxBurst(PL.x, PL.y, 8, ["#f6efd9", "#ebe0c0"], 100, .45, "bit", 2.4, 60);
  if (o.a !== undefined) moveEnt(BT.room, PL, Math.cos(o.a) * 10, Math.sin(o.a) * 10);
  if (src && ST.thorns && !src.dead) hurtEnemy(src, dmg * ST.thorns, { noChain: 1 });
  if (PL.hp <= 0) { PL.hp = 0; PL.dead = true; PL.st = "idle"; PL.swing = null; slowmo(1.2, .25); camShake(10); sfx("defeat"); if (BT.onDeath) setTimeout(BT.onDeath, 1100); }
  return true;
}
/* ----- Tod und Beute ----- */
function enKill(e, o) {
  if (e.dead) return; e.dead = true; e.hp = 0; BT.kills++; SV.stats.kills++; if (e.tele) e.tele.dead = true; sfx("kill", 30);
  const col = e.d.col || "#fff"; fxBurst(e.x, e.y, 12, [col, "#1d2742", "#f6efd9"], 130, .6, "bit", 2.6, 160); fxBurst(e.x, e.y, 6, "#2a3a80", 90, .5, "dot", 3, 120); fxRing(e.x, e.y, 6, e.r * 2.6, .35, "rgba(246,239,217,.8)");
  gainXp(Math.round(e.d.xp * (1 + (e.K - 1) * .35) * (e.modIds.length ? 2 : 1)));
  if (e.summoned) return;
  if (o && o.w && o.w.boom && !o.noBoom) { fxRing(e.x, e.y, 4, 60, .35, "#e27d2c"); for (const x of BT.en) if (!x.dead && dist(e.x, e.y, x.x, x.y) < 58 + x.r) hurtEnemy(x, e.max * o.w.boom * .5 + 6, { a: ang(e.x, e.y, x.x, x.y), kb: 90, noBoom: 1 }); }
  if (e.d.split || e.mods.split) { const sid = e.d.split || e.id; for (let i = 0; i < 2; i++) { const a = Math.random() * TAU, s = spawnEnemy(sid, e.x + Math.cos(a) * 14, e.y + Math.sin(a) * 14, { K: e.K, tier: e.tier, hpMul: e.mods.split ? .35 : 1, noSpawn: 1, summoned: !!e.mods.split, wave: e.wave }); s.kx = Math.cos(a) * 160; s.ky = Math.sin(a) * 160; if (e.mods.split) s.r *= .8; } }
  if (e.d.boom || e.mods.boomDie) { const R = e.d.boom || 54; addTele({ x: e.x, y: e.y, r: R, dur: .7, col: "#e27d2c", fn: t => { fxRing(t.x, t.y, 4, R, .35, "#e27d2c"); fxBurst(t.x, t.y, 12, ["#e27d2c", "#ffd45a"], 130, .45, "spark", 2); camShake(4); sfx("boom"); if (teleHit(t)) hurtPlayer(e.dmgBase * 1.3, null, { a: ang(t.x, t.y, PL.x, PL.y) }); } }); }
  if (e.mods.fire) BT.haz.push({ x: e.x, y: e.y, r: 34, life: 4, t: 0, own: "e", k: "fire", dps: e.dmgBase * .5 });
  if (ST.heal) healPlayer(PL.max * ST.heal * .03, true);
  dropLoot(e);
  if (e.big && e.d.onDie) e.d.onDie(e);
  else if (BT.active && enAlive().filter(x => !x.summoned).length === 0 && !BT.wavePending) { slowmo(.55, .3); if (!BT.noZoom) CAM.z = Math.min(CAM.z + .05, 1.1); }
}
function dropLoot(e) {
  const d = e.d, K = e.K, role = d.role, lk = ST.luck, r = rnd;
  const coins = role === "boss" ? 14 : role === "mini" ? 9 : role === "elite" ? 5 : 1 + (r() < .5 ? 1 : 0), per = Math.max(1, Math.round((2 + K * 1.5) * (role === "boss" ? 3 : role === "mini" ? 2 : e.modIds.length ? 1.6 : 1)));
  for (let i = 0; i < coins; i++) addPickup("coin", e.x, e.y, { v: Math.round(per * (.7 + r() * .6)) });
  if (r() < (role === "fuss" ? .07 : .15) + lk * .001) addPickup("heart", e.x, e.y, {});
  let chance = role === "fuss" ? .045 : role === "fern" ? .055 : role === "elite" ? .45 : 1; chance *= 1 + lk / 100; if (e.modIds.length) chance = Math.min(1, chance + .25);
  if (r() < chance) { const minRar = role === "boss" ? 2 : role === "mini" ? 1 : e.modIds.length ? 1 : 0; const n = role === "boss" ? 2 : 1; for (let i = 0; i < n; i++) { let it = genItem(K + (r() < .4 ? 1 : 0), undefined, undefined, { luck: lk + (role === "boss" ? 40 : 0), minRar }); if (role === "boss" && i === 0 && r() < .22 + lk * .002) it = genItem(K, 4); addPickup("item", e.x, e.y, { it }); } }
}
function addPickup(k, x, y, o) { for (let i = 0; i < 30 && solidAt(BT.room, x, y, false); i++) { const a = ang(x, y, PL.x, PL.y); x += Math.cos(a) * 10; y += Math.sin(a) * 10; } const a = Math.random() * TAU, s = k === "item" ? 40 : 70 + Math.random() * 60; BT.pk.push(Object.assign({ k, x, y, z: 0, vz: 150 + Math.random() * 80, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, got: false }, o)); }
const pickImg = {}; function itemImg(it) { const key = it.slot + it.base + it.rar; if (!pickImg[key]) { const im = new Image(); im.src = itemIcon(it); pickImg[key] = im; } return pickImg[key]; }
function pickupUpdate(dt) {
  for (let i = BT.pk.length - 1; i >= 0; i--) {
    const p = BT.pk[i]; p.t += dt; if (p.vz !== 0 || p.z > 0) { p.vz -= 520 * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = Math.abs(p.vz) > 60 ? -p.vz * .4 : 0; p.vx *= .5; p.vy *= .5; } const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt; if (!solidAt(BT.room, nx, p.y, false)) p.x = nx; else p.vx = 0; if (!solidAt(BT.room, p.x, ny, false)) p.y = ny; else p.vy = 0; p.vx *= Math.exp(-2 * dt); p.vy *= Math.exp(-2 * dt); }
    const d = dist(p.x, p.y, PL.x, PL.y); if (PL.dead) continue;
    if (p.k !== "item" && p.t > .35 && d < (ST.magnet || 78)) { const k = 260 * dt; p.x += (PL.x - p.x) / d * k * (1 + (78 - d) / 40); p.y += (PL.y - p.y) / d * k * (1 + (78 - d) / 40); }
    if (p.t > .3 && d < (p.k === "item" ? 22 : 17)) { collect(p); BT.pk.splice(i, 1); }
  }
}
function collect(p) {
  if (p.k === "coin") { SV.gold += p.v; sfx("coin", 50); fxText(PL.x + 10, PL.y - 24, "+" + p.v, "#ffd45a", 13, { life: .6 }); }
  else if (p.k === "heart") { healPlayer(PL.max * .2); sfx("heart"); fxBurst(PL.x, PL.y, 8, "#ff8b78", 80, .5, "dot", 2.4); }
  else if (p.k === "item") { const it = p.it; sfx(it.rar >= 3 ? "levelup" : "pick"); if (SV.inv.length >= BAG_MAX) { const g = sellPrice(it); SV.gold += g; toast(`Rucksack voll: ${esc(itemName(it))} für ${g} verkauft`); } else { SV.inv.push(it); toast(`${gi("page", RAR[it.rar].col)} <span style="color:${RAR[it.rar].col}">${esc(itemName(it))}</span>`); } if (it.rar >= 2) { fxRing(PL.x, PL.y, 6, 50, .5, RAR[it.rar].col); BT.newLoot = true; } }
}
function pickupDraw(c) {
  for (const p of BT.pk) {
    const bob = p.z + Math.sin(G.t * 4 + p.x) * 1.5 + (p.k === "item" ? 3 : 0); blit(c, shadowSpr(), p.x, p.y + 4, { s: .45, a: .8 });
    if (p.k === "item") { const col = RAR[p.it.rar].col; if (p.it.rar >= 1) { c.save(); c.globalCompositeOperation = "lighter"; const g = c.createLinearGradient(0, p.y - 70, 0, p.y); g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, .55)); c.fillStyle = g; c.fillRect(p.x - 7, p.y - 70, 14, 70); blit(c, glowSpr(col), p.x, p.y - bob, { s: .9, a: .8 }); c.restore(); } const im = itemImg(p.it); if (im.complete) { c.save(); c.translate(p.x, p.y - 8 - bob); c.rotate(Math.sin(G.t * 3 + p.x) * .12); c.drawImage(im, -14, -14, 28, 28); c.restore(); } }
    else if (p.k === "coin") { blit(c, glyphSpr("coin", 16), p.x, p.y - 6 - bob, { sx: .75 + Math.abs(Math.sin(G.t * 5 + p.x)) * .25, sy: 1 }); }
    else blit(c, glyphSpr("heart", 18), p.x, p.y - 8 - bob, { s: 1 + Math.sin(G.t * 6) * .07 });
  }
}
/* ----- Erfahrung ----- */
const xpNeed = L => Math.round(40 + 22 * Math.pow(L, 1.55));
function gainXp(n) {
  if (SV.lvl >= 50) return; SV.xp += n;
  while (SV.lvl < 50 && SV.xp >= xpNeed(SV.lvl)) { SV.xp -= xpNeed(SV.lvl); SV.lvl++; SV.vp += 1 + (SV.lvl % 10 === 0 ? 1 : 0); sfx("levelup"); toast(`${gi("star", "#ffd45a")} Stufe ${SV.lvl}! Du bekommst Verzauberungspunkte.`); fxRing(PL.x, PL.y, 6, 70, .7, "#ffd45a"); fxBurst(PL.x, PL.y, 14, "#ffd45a", 120, .8, "spark", 2); }
  if (SV.lvl >= 50) SV.xp = 0;
}
/* ----- Gefahrenflächen (Tintenpfützen, Feuer) ----- */
function hazUpdate(dt) {
  for (let i = BT.haz.length - 1; i >= 0; i--) {
    const h = BT.haz[i]; h.t += dt; if (h.t > h.life) { BT.haz.splice(i, 1); continue; }
    if (h.own === "p") { for (const e of BT.en) if (!e.dead && e.st !== "spawn" && dist(h.x, h.y, e.x, e.y) < h.r + e.r * .5) { e.slowT = Math.max(e.slowT, .3); e.slowK = .45; h.acc = (h.acc || 0) + dt; } if (h.acc >= .5) { h.acc = 0; for (const e of BT.en) if (!e.dead && e.st !== "spawn" && dist(h.x, h.y, e.x, e.y) < h.r + e.r * .5) hurtEnemy(e, h.dps * .5, { noChain: 1 }); } }
    else { h.acc = (h.acc || 0) + dt; if (h.acc >= .5) { h.acc = 0; if (dist(h.x, h.y, PL.x, PL.y) < h.r) hurtPlayer(h.dps * .5, null, {}); } }
  }
}
function hazDraw(c) { for (const h of BT.haz) { const k = h.t / h.life, a = Math.min(1, (1 - k) * 2.2) * .75; c.save(); c.globalAlpha = a; c.fillStyle = h.own === "p" ? "#1d2d6a" : "#e27d2c"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 14; i++) { const an = i / 14 * TAU, r = h.r * (1 + Math.sin(i * 2.3 + G.t * 2) * .07); c[i ? "lineTo" : "moveTo"](h.x + Math.cos(an) * r, h.y + Math.sin(an) * r * .8); } c.closePath(); c.fill(); c.stroke(); if (h.own !== "p") { c.globalAlpha = a * .8; c.fillStyle = "#ffd45a"; c.beginPath(); c.arc(h.x + Math.sin(G.t * 6) * 4, h.y - 3, h.r * .35, 0, TAU); c.fill(); } c.restore(); } }
