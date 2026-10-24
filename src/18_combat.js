/* ===== Kampf: Gegner-KI, Spielerangriffe, Artefakte, Requisiten, HUD ===== */
const enSpd = e => e.spd * (e.slowT > 0 ? 1 - e.slowK : 1) * (BT.slowAll > 0 ? .5 : 1);
function enMove(e, dx, dy, dt) {
  const ex = e.x, ey = e.y, hit = moveEnt(BT.room, e, dx * dt, dy * dt, e.d.fly);
  if (hit) { const l = Math.hypot(dx, dy) || 1; moveEnt(BT.room, e, -dy / l * e.sg * Math.hypot(dx, dy) * dt * .8, dx / l * e.sg * Math.hypot(dx, dy) * dt * .8, e.d.fly); e.stuck += dt; if (e.stuck > .8) { e.sg *= -1; e.stuck = 0; } } else e.stuck = 0;
}
function enPickAttack(e, d) {
  const ok = e.d.atk.filter(a => { if ((a.p || 1) > (e.phase || 1)) return false; if (a.t === "summon" && BT.en.filter(x => !x.dead && x.summoned).length > 4) return false; if (a.t === "rain" || a.t === "summon") return d < (a.range || 500); const rg = a.range || a.range === 0 ? a.range : 40; if (a.t === "melee" || a.t === "slam") return d < rg + e.r + PL.r * .5; if (a.t === "lunge") return d < rg && lineClear(BT.room, e.x, e.y, PL.x, PL.y); return d < rg && lineClear(BT.room, e.x, e.y, PL.x, PL.y); });
  return ok.length ? ok[Math.floor(Math.random() * ok.length)] : null;
}
function enStart(e, a) {
  e.atk = a; e.st = "wind"; e.stT = 0; e.face = ang(e.x, e.y, PL.x, PL.y); sfx("tele", 120);
  if (a.tp) { const bx = PL.x - Math.cos(PL.dir) * 44, by = PL.y - Math.sin(PL.dir) * 44; if (freeAt(BT.room, bx, by, e.r)) { fxBurst(e.x, e.y, 6, "#9aa3b2", 60, .3, "dot", 2); e.x = bx; e.y = by; fxBurst(e.x, e.y, 8, "#f6efd9", 70, .35, "bit", 2); e.face = ang(e.x, e.y, PL.x, PL.y); } }
  const dur = a.w * (e.big ? 1 : 1), base = { own: e, x: e.x, y: e.y, a: e.face, dur }, dm = enDmg(e, a), fin = (t) => { e.tele = null; };
  if (a.t === "melee") e.tele = addTele(Object.assign(base, { k: "cone", r: a.range + e.r, arc: a.arc, fn: t => { if (teleHit(t)) enHit(e, dm, ang(e.x, e.y, PL.x, PL.y)); fxRing(e.x + Math.cos(t.a) * 14, e.y + Math.sin(t.a) * 14, 4, a.range, .2, "#fff"); sfx("swing2", 60); endAct(e, a); } }));
  else if (a.t === "slam") e.tele = addTele(Object.assign(base, { k: "circle", r: a.r, fn: t => { if (teleHit(t)) enHit(e, dm, ang(t.x, t.y, PL.x, PL.y)); fxRing(t.x, t.y, 4, a.r, .35, "#fff"); fxBurst(t.x, t.y, 8, "#f6efd9", 90, .4, "bit", 2.5, 40); camShake(a.shake || 3); sfx("slam", 60); endAct(e, a); } }));
  else if (a.t === "lunge") e.tele = addTele(Object.assign(base, { k: "rect", len: a.dist + e.r, w: (a.wide || e.r) * 2, fn: () => { e.st = "act"; e.stT = 0; e.lunge = { a: e.face, left: a.dist, hit: false }; sfx("dash", 60); } }));
  else if (a.t === "shoot") e.tele = addTele(Object.assign(base, a.n > 1 ? { k: "cone", r: Math.min(a.range, 220), arc: a.spread + .12 } : { k: "rect", len: Math.min(a.range, 240), w: 5 }, { col: "#e27d2c", fn: t => { enShot(e, a, t.a, a.n, a.spread, a.ps, a.pr, 1); sfx("eshoot", 40); endAct(e, a); } }));
  else if (a.t === "summon") e.tele = addTele(Object.assign(base, { k: "circle", r: 46, col: PURP, fn: t => { for (let i = 0; i < a.n; i++) { const an = Math.random() * TAU, x = e.x + Math.cos(an) * 50, y = e.y + Math.sin(an) * 50; const s2 = spawnEnemy(a.id, freeAt(BT.room, x, y, 10) ? x : e.x, freeAt(BT.room, x, y, 10) ? y : e.y, { K: e.K, summoned: true }); } fxRing(e.x, e.y, 6, 60, .4, PURP); sfx("roar"); endAct(e, a); } }));
  else if (a.t === "rain") { const mk = (i) => { const jx = i ? (Math.random() - .5) * 150 : 0, jy = i ? (Math.random() - .5) * 150 : 0, x = PL.x + jx, y = PL.y + jy; return addTele({ k: "circle", own: e, x, y, r: a.r, dur: a.w + i * .22, col: BAD, fn: t => { if (teleHit(t)) enHit(e, dm, ang(t.x, t.y, PL.x, PL.y)); fxRing(t.x, t.y, 4, a.r, .3, "#fff"); fxBurst(t.x, t.y, 6, ["#b8473a", "#2a3a80"], 90, .4, "bit", 2.5); camShake(2); sfx("slam", 60); if (i === a.n - 1) endAct(e, a); } }); }; for (let i = 0; i < a.n; i++) { const t = mk(i); if (i === 0) e.tele = t; } e.teleKeep = 1; }
  else if (a.t === "beam") e.tele = addTele(Object.assign(base, { k: "rect", len: a.len, w: a.wid, fn: t => { if (teleHit(t)) enHit(e, dm * 1.2, t.a); fxBurst(t.x + Math.cos(t.a) * a.len / 2, t.y + Math.sin(t.a) * a.len / 2, 16, ["#b8473a", "#fff"], 160, .4, "spark", 2.4); cineFlash("#b8473a", .25); camShake(7); sfx("boom"); endAct(e, a); } }));
  else if (a.t === "burst") e.tele = addTele(Object.assign(base, { k: "circle", r: 36, col: "#e27d2c", fn: t => { const o = a.spin ? (G.t * 2) % TAU : 0; for (let i = 0; i < a.n; i++) { const an = o + i / a.n * TAU; addProj({ x: e.x + Math.cos(an) * 16, y: e.y + Math.sin(an) * 16, vx: Math.cos(an) * a.ps, vy: Math.sin(an) * a.ps, dmg: dm * .8, own: "e", kind: a.pr, src: e, life: 3 }); } fxRing(e.x, e.y, 6, 50, .3, "#2a3a80"); sfx("eshoot", 40); endAct(e, a); } }));
}
function endAct(e, a) { e.tele = null; e.teleKeep = 0; e.st = "rec"; e.stT = 0; e.recT = a.rec; e.cdT = (a.cd || 1) * (e.mods.cd || 1); }
function enHit(e, dmg, a) { if (hurtPlayer(dmg, e, { a })) { if (e.mods.vamp) { e.hp = Math.min(e.max, e.hp + dmg * .4); fxText(e.x, e.y - e.r, "+", "#7a4fb0", 14); } } }
function enUpdate(e, dt) {
  if (e.dead) return; e.t += dt; e.flash = Math.max(0, e.flash - dt); e.stT += dt; e.cdT -= dt;
  const kx = e.kx, ky = e.ky; if (Math.abs(kx) + Math.abs(ky) > 4) { moveEnt(BT.room, e, kx * dt, ky * dt, e.d.fly); e.kx *= Math.exp(-9 * dt); e.ky *= Math.exp(-9 * dt); } else { e.kx = e.ky = 0; }
  if (e.burnT > 0) { e.burnT -= dt; e.bacc = (e.bacc || 0) + dt; if (e.bacc >= .5) { e.bacc = 0; hurtEnemy(e, e.burnD * .5, { noChain: 1 }); } if (Math.random() < dt * 14) fxPart({ x: e.x + (Math.random() - .5) * e.r, y: e.y, vy: -40, life: .4, col: "#e27d2c", sz: 2.5 }); }
  if (e.slowT > 0) e.slowT -= dt; if (e.dead) return;
  if (e.big && e.d.phases && e.st !== "spawn") { const k = e.hp / e.max, ph = e.d.phases === 3 ? (k < .33 ? 3 : k < .66 ? 2 : 1) : (k < .5 ? 2 : 1); if (ph > (e.phase || 1)) bossPhase(e, ph); }
  const d = dist(e.x, e.y, PL.x, PL.y), toP = ang(e.x, e.y, PL.x, PL.y), sp = enSpd(e); if (PL.dead && e.st === "move") { e.face += dt; return; }
  switch (e.st) {
    case "spawn": e.alpha = clamp(e.stT / .6, 0, 1); if (e.stT >= .6) { e.st = "move"; e.alpha = 1; } break;
    case "stun": if (e.stT >= (e.stunD || .5)) { e.st = "move"; } break;
    case "wind": {
      const a = e.atk; if ((a.t === "lunge" || a.t === "shoot") && e.tele && e.stT < a.w * .6) { e.face = angTo(e.face, toP, dt * 7); e.tele.a = e.face; }
      if (e.tele && !e.teleKeep) { e.tele.x = e.x; e.tele.y = e.y; if (a.t === "melee" || a.t === "slam") e.tele.a = e.face = a.t === "melee" ? angTo(e.face, toP, dt * 5) : e.face; }
      break;
    }
    case "act": { const L = e.lunge, step = Math.min(L.left, e.atk.spd * dt * (BT.slowAll > 0 ? .5 : 1)); const hit = moveEnt(BT.room, e, Math.cos(L.a) * step, Math.sin(L.a) * step, e.d.fly); L.left -= step; if (Math.random() < .5) fxPart({ x: e.x, y: e.y, life: .25, col: "rgba(29,39,66,.35)", sz: e.r * .6, shape: "dot" });
      if (!L.hit && dist(e.x, e.y, PL.x, PL.y) < e.r + PL.r * .8 + (e.atk.wide || 0) * .6) { L.hit = true; enHit(e, enDmg(e, e.atk), L.a); }
      if (L.left <= 0.5 || hit) { if (hit) camShake(2); endAct(e, e.atk); } break; }
    case "rec": if (e.stT >= (e.recT || .5)) e.st = "move"; break;
    default: {
      const ai = e.d.ai; let mx = 0, my = 0; const kp = e.d.keep || [0, 0];
      if (ai === "chase" || ai === "tele" || ai === "charge") { if (d > e.r + PL.r * .6) { mx = Math.cos(toP); my = Math.sin(toP); } e.face = angTo(e.face, toP, dt * 8); }
      else if (ai === "keep") { e.face = angTo(e.face, toP, dt * 8); if (d > kp[1]) { mx = Math.cos(toP); my = Math.sin(toP); } else if (d < kp[0]) { mx = -Math.cos(toP); my = -Math.sin(toP); } else { mx = -Math.sin(toP) * e.sg * .4; my = Math.cos(toP) * e.sg * .4; } }
      else if (ai === "strafe") { e.face = angTo(e.face, toP, dt * 8); const f = d > kp[1] ? 1 : d < kp[0] ? -1 : 0; mx = Math.cos(toP) * f - Math.sin(toP) * e.sg * .8; my = Math.sin(toP) * f + Math.cos(toP) * e.sg * .8; if (Math.random() < dt * .3) e.sg *= -1; }
      else if (ai === "flit") { e.face = angTo(e.face, toP, dt * 8); const w = Math.sin(e.t * 3 + e.orb) * 1.2; mx = Math.cos(toP + w); my = Math.sin(toP + w); }
      else if (ai === "turret") { e.face = angTo(e.face, toP, dt * 3); }
      if (mx || my) { for (const o of BT.en) { if (o === e || o.dead) continue; const od = dist(e.x, e.y, o.x, o.y), mn = e.r + o.r; if (od < mn && od > .1) { mx += (e.x - o.x) / od * .7; my += (e.y - o.y) / od * .7; } } const l = Math.hypot(mx, my) || 1; enMove(e, mx / l * sp, my / l * sp, dt); }
      if (e.cdT <= 0 && !PL.dead) { const a = enPickAttack(e, d); if (a) enStart(e, a); }
    }
  }
  if (e.mods.fire && e.st === "move" && Math.random() < dt * 1.2) BT.haz.push({ x: e.x, y: e.y, r: 14, life: 2, t: 0, own: "e", k: "fire", dps: e.dmgBase * .3 });
}
function angTo(a, b, k) { return a + clamp(angDiff(a, b), -k, k); }
function enDraw(c, e) {
  const fr = Math.floor(e.t * (e.st === "move" ? 5 : 2)) % 2, sp = enSpr(e.id, fr, e.tier), big = e.big ? 1 : 1, fl = Math.cos(e.face) < 0, hov = e.d.fly ? Math.sin(e.t * 5 + e.orb) * 2.5 + 6 : 0;
  let sx = 1, sy = 1, ox = 0; if (e.st === "spawn") { const k = easeOut(e.alpha); sx = sy = .3 + .7 * k; } if (e.st === "wind") { const k = clamp(e.stT / e.atk.w, 0, 1); sx = 1 + .12 * k; sy = 1 - .1 * k; ox = Math.sin(e.stT * 60) * k * 1.6; }
  if (e.st === "act") { sx = 1.15; sy = .88; } if (e.st === "stun") ox = Math.sin(e.stT * 50) * 2;
  blit(c, shadowSpr(), e.x, e.y + e.r * .6, { s: e.r / 9 * (e.d.fly ? .7 : 1), a: .7 * e.alpha });
  for (const mid of e.modIds) { c.save(); c.globalAlpha = .55 * e.alpha; c.strokeStyle = ELITE_MODS[mid].col; c.lineWidth = 2.5; c.beginPath(); c.ellipse(e.x, e.y + e.r * .55, e.r * 1.2, e.r * .5, 0, 0, TAU); c.stroke(); c.restore(); break; }
  c.save(); c.globalAlpha = e.alpha; c.translate(e.x + ox, e.y - hov); c.scale((fl ? -1 : 1) * sx, sy);
  if (e.d.ai === "turret" || e.d.noFlip) { c.scale(fl ? -1 : 1, 1); }
  c.drawImage(sp.cv, -sp.w / 2, -sp.h / 2, sp.w, sp.h); if (e.flash > 0) { c.globalAlpha = Math.min(1, e.flash * 9) * e.alpha; c.drawImage(whiteOf(sp), -sp.w / 2, -sp.h / 2, sp.w, sp.h); } c.restore();
  if (!e.big && e.hp < e.max && e.st !== "spawn") { const w = Math.max(22, e.r * 2.2), y = e.y - e.r - 12 - hov; c.fillStyle = "rgba(29,39,66,.8)"; c.fillRect(e.x - w / 2 - 1.5, y - 1.5, w + 3, 6); c.fillStyle = e.modIds.length ? ELITE_MODS[e.modIds[0]].col : BAD; c.fillRect(e.x - w / 2, y, w * e.hp / e.max, 3); }
}
/* ----- Requisiten: Fässer und Truhen ----- */
function addProp(k, x, y) { const p = { k, x, y, hurt: k === "barrel", hp: 18, rad: 13, dead: false, open: false, rar: 0 }; BT.props.push(p); return p; }
function propHit(p, dmg) { if (p.k === "crystal") { if (!p.lit) { p.lit = true; sfx("plate"); fxRing(p.x, p.y, 4, 30, .4, "#ffd45a"); fxBurst(p.x, p.y, 8, "#ffd45a", 90, .5, "spark", 2); } return; } if (p.dead || p.k !== "barrel") return; p.hp -= dmg; p.sh = .12; sfx("crack", 60); if (p.hp <= 0) { p.dead = true; fxBurst(p.x, p.y, 10, ["#b9803a", "#8a5a34"], 120, .5, "bit", 3, 200); camShake(2); if (Math.random() < .7) addPickup("coin", p.x, p.y, { v: Math.round(2 + BT.K * 1.2) }); if (Math.random() < .15) addPickup("heart", p.x, p.y, {}); } }
function chestOpen(p) { if (p.open) return; p.open = true; sfx("chest"); camShake(3); fxBurst(p.x, p.y, 12, "#ffd45a", 140, .6, "spark", 2.2); for (let i = 0; i < 6; i++) addPickup("coin", p.x, p.y, { v: Math.round((4 + BT.K * 2) * (.8 + Math.random() * .4)) }); addPickup("item", p.x, p.y, { it: genItem(BT.K + 1, undefined, undefined, { luck: ST.luck + 40, minRar: 1 }) }); }
function propsUpdate(dt) { for (const p of BT.props) { p.sh = Math.max(0, (p.sh || 0) - dt); if (p.k === "chest" && !p.open && dist(p.x, p.y, PL.x, PL.y) < 24) chestOpen(p); } BT.props = BT.props.filter(p => !p.dead); }
function propSpr(k, open) { return spr("prop|" + k + open, 40, 40, c0 => { const c = sketchCtx(c0, strSeed("p" + k), 14); c.lineWidth = 2.8; if (k === "barrel") { c.beginPath(); c.moveTo(-9, -10); c.quadraticCurveTo(-13, 0, -9, 11); c.lineTo(9, 11); c.quadraticCurveTo(13, 0, 9, -10); c.closePath(); c0.fillStyle = "#b9803a"; c.fill(); c.stroke(); c.lineWidth = 2; [-4, 5].forEach(y => { c.beginPath(); c.moveTo(-11, y); c.lineTo(11, y); c.stroke(); }); c.beginPath(); c.ellipse(0, -10, 9, 4, 0, 0, TAU); c0.fillStyle = "#d9a85a"; c.fill(); c.stroke(); } else { c.beginPath(); c.rect(-13, -4, 26, 15); c0.fillStyle = "#a8703a"; c.fill(); c.stroke(); c.beginPath(); if (open) { c.rect(-13, -15, 26, 8); } else { c.moveTo(-13, -4); c.quadraticCurveTo(0, -17, 13, -4); } c0.fillStyle = "#c98a46"; c.fill(); c.stroke(); c0.fillStyle = "#ffd45a"; c.beginPath(); c.rect(-3, -3, 6, 7); c.fill(); c.stroke(); } }, SS); }
function propDraw(c, p) { if (p.k !== "barrel" && p.k !== "chest") return; blit(c, shadowSpr(), p.x, p.y + 8, { s: .8, a: .7 }); blit(c, propSpr(p.k, p.open ? 1 : 0), p.x + (p.sh ? Math.sin(p.sh * 120) * 2 : 0), p.y); }
/* ----- Spielerangriffe ----- */
function nearestEnemy(x, y, maxD, cone, dirA) { let b = null, bd = maxD; for (const e of BT.en) { if (e.dead || e.st === "spawn") continue; const d = dist(x, y, e.x, e.y) - e.r; if (d < bd && (cone === undefined || Math.abs(angDiff(dirA, ang(x, y, e.x, e.y))) < cone)) { bd = d; b = e; } } return b; }
function plDmg(w, mul) { const crit = Math.random() < w.crit; return { v: w.base * w.dm * (mul || 1) * (.92 + Math.random() * .16) * (crit ? 1.5 + w.critd : 1), crit }; }
function meleeHit(s) {
  const m = ST.m; if (!m) return; let any = false;
  for (const e of BT.en) {
    if (e.dead || e.st === "spawn") continue; const d = dist(PL.x, PL.y, e.x, e.y), a = ang(PL.x, PL.y, e.x, e.y); let hit;
    if (s.kind === "thrust") { const dx = e.x - PL.x, dy = e.y - PL.y, al = dx * Math.cos(s.a) + dy * Math.sin(s.a), pe = -dx * Math.sin(s.a) + dy * Math.cos(s.a); hit = al > 0 && al < s.range + e.r && Math.abs(pe) < e.r + 9; }
    else hit = d < s.range + e.r && (s.arc > 6 || Math.abs(angDiff(s.a, a)) < s.arc / 2 + Math.atan2(e.r * .6, Math.max(d, 1)));
    if (hit) { const r = plDmg(m, s.mul); if (hurtEnemy(e, r.v, { a, kb: m.kb * (s.mul > 1.2 ? 1.5 : 1), melee: 1, w: m, crit: r.crit })) any = true; }
  }
  for (const p of BT.props) if (p.hurt && !p.dead && dist(PL.x, PL.y, p.x, p.y) < s.range + 10) propHit(p, plDmg(m, 1).v);
  if (any) { fxBurst(PL.x + Math.cos(s.a) * s.range * .8, PL.y + Math.sin(s.a) * s.range * .8, 3, "#fff", 80, .2, "spark", 2); }
}
function plAttack(dt) {
  const m = ST.m, r = ST.r; PL.rCd = Math.max(0, (PL.rCd || 0) - dt); ammoUpdate(dt);
  if (PL.swing && !PL.swing.done && PL.swing.t >= PL.swing.dur * .35) { PL.swing.done = true; meleeHit(PL.swing); if (PL.swing.next) { const n = PL.swing.next; PL.swingQ = { at: PL.t + .09, s: n }; } }
  if (PL.swingQ && PL.t >= PL.swingQ.at) { const q = PL.swingQ.s; PL.swingQ = null; PL.swing = q; sfx("swing", 20); }
  if (PL.st === "roll" || PL.dead) return;
  if (m && (IN.down.atk || IN.buf.atk > 0) && PL.atkCd <= 0 && !PL.swing) {
    IN.buf.atk = 0; const tgt = nearestEnemy(PL.x, PL.y, m.range + 46, PL.moving ? 1.4 : 3.2, PL.moving ? PL.dir : 0); if (tgt) PL.dir = ang(PL.x, PL.y, tgt.x, tgt.y);
    const kind = m.kind, side = PL.combo % 2 ? -1 : 1, final = PL.combo % 3 === 2; PL.combo = (PL.combo + 1) % 3; const cd = 1 / m.spd; PL.atkCd = cd; PL.comboT = 1;
    const mk = (sd, mul) => ({ t: 0, dur: Math.min(.22, cd * .75), a: PL.dir, arc: m.arc * (final && kind === "slash" ? 1.25 : 1), dirSign: sd, kind: kind === "dual" ? "slash" : kind, base: m.it.base, range: m.range * (final && kind === "slash" ? 1.1 : 1), col: final ? "#ffd45a" : "#ffffff", mul: mul });
    PL.swing = mk(side, final && kind === "slash" ? 1.5 : 1); if (kind === "dual") PL.swing.next = Object.assign(mk(-side, 1), { a: PL.dir });
    sfx(kind === "slam" ? "heavy" : final ? "heavy" : "swing"); if (kind === "slam") { PL.swing.mul = 1; camShake(3); } moveEnt(BT.room, PL, Math.cos(PL.dir) * 7, Math.sin(PL.dir) * 7);
  }
  if (r && IN.down.rng && PL.rCd <= 0 && !(PL.swing) && PL.ammo < 1) { if (!PL.dryT || PL.t - PL.dryT > .4) { PL.dryT = PL.t; sfx("deny"); fxText(PL.x, PL.y - 26, "Leer", "#cfd6e0", 14); } }
  if (r && IN.down.rng && PL.rCd <= 0 && !(PL.swing) && PL.ammo >= 1) {
    PL.rCd = 1 / r.spd; PL.ammo -= 1; PL.ammoWait = .55; const tgt = nearestEnemy(PL.x, PL.y, 320, PL.moving ? .9 : 3.2, PL.dir), a0 = tgt ? ang(PL.x, PL.y, tgt.x, tgt.y) : PL.dir; PL.dir = a0;
    for (let i = 0; i < r.cnt; i++) { const an = a0 + (r.cnt > 1 ? (i / (r.cnt - 1) - .5) * r.spread * 2 : 0) + (Math.random() - .5) * r.spread, d = plDmg(r, 1); addProj({ x: PL.x + Math.cos(an) * 14, y: PL.y - 3 + Math.sin(an) * 14, vx: Math.cos(an) * r.pspd, vy: Math.sin(an) * r.pspd, dmg: d.v, crit: d.crit, own: "p", kind: r.pr, pierce: r.pierce, hom: r.hom ? 1 : 0, w: r, life: .9, r: 5 }); }
    sfx("shoot", 30); PL.recoil = .08;
  }
  ST.arts && ST.arts.forEach((a, i) => { if (a) { BT.cdArt[i] = Math.max(0, BT.cdArt[i] - dt); if (wasPressed("a" + i) && BT.cdArt[i] <= 0 && !PL.swing) { useArtifact(a, i); } } });
}
function ammoMax() { return ST.r ? Math.round(3 + ST.r.spd * 1.5) : 0; }
function ammoUpdate(dt) { const mx = ammoMax(); if (PL.ammo === undefined || PL.ammo > mx) PL.ammo = mx; PL.ammoWait = Math.max(0, (PL.ammoWait || 0) - dt); if (ST.r && PL.ammo < mx && PL.ammoWait <= 0) PL.ammo = Math.min(mx, PL.ammo + ST.r.spd * .6 * dt); }
function useArtifact(a, i) {
  const id = a.it.base, pot = a.pot, dir = PL.dir, tg = nearestEnemy(PL.x, PL.y, 300), aim = tg ? ang(PL.x, PL.y, tg.x, tg.y) : dir; BT.cdArt[i] = a.cd; sfx("pick"); let ok = true;
  const aoe = (x, y, R, dm, kb) => { for (const e of BT.en) if (!e.dead && e.st !== "spawn" && dist(x, y, e.x, e.y) < R + e.r) hurtEnemy(e, dm, { a: ang(x, y, e.x, e.y), kb: kb || 80, noChain: 1 }); for (const p of BT.props) if (p.hurt && dist(x, y, p.x, p.y) < R) propHit(p, dm); };
  switch (id) {
    case "tinte": { const d = tg ? Math.min(dist(PL.x, PL.y, tg.x, tg.y), 220) : 130, tx = PL.x + Math.cos(aim) * d, ty = PL.y + Math.sin(aim) * d; addTele({ x: tx, y: ty, r: 48, dur: .4, col: ACC, fn: t => { aoe(t.x, t.y, 48, pot * .6, 40); BT.haz.push({ x: t.x, y: t.y, r: 48, life: 5, t: 0, own: "p", dps: pot * .5 }); sfx("ink"); fxBurst(t.x, t.y, 12, "#2a3a80", 120, .5, "dot", 3); } }); break; }
    case "radierer": aoe(PL.x, PL.y, 96, pot * 1.1, 260); fxRing(PL.x, PL.y, 8, 96, .4, "#fff"); camShake(5); sfx("boom"); break;
    case "lesezeichen": { const dd = PL.moving ? PL.dir : dir; for (let k = 0; k < 8; k++) { moveEnt(BT.room, PL, Math.cos(dd) * 14, Math.sin(dd) * 14); fxPart({ x: PL.x, y: PL.y, life: .35, col: "#f6efd9", sz: 9, shape: "dot" }); } PL.inv = Math.max(PL.inv, .45); sfx("dash"); break; }
    case "klammer": if (tg) { hurtEnemy(tg, pot, { noChain: 1 }); chainZap(tg, pot * .9, 4, null); } else { ok = false; } break;
    case "salve": for (let k = 0; k < 7; k++) { const an = aim + (k - 3) * .17; addProj({ x: PL.x, y: PL.y, vx: Math.cos(an) * 340, vy: Math.sin(an) * 340, dmg: pot * .45, own: "p", kind: "plane", hom: 1, life: 1.1, pierce: 0 }); } sfx("fan"); break;
    case "tintenschild": PL.shield = Math.min(PL.max, PL.shield + pot * 1.4 + PL.max * .15); fxRing(PL.x, PL.y, 8, 40, .5, "#7bc8e0"); sfx("shield"); break;
    case "federkiel": healPlayer(PL.max * .4); sfx("heal"); fxBurst(PL.x, PL.y, 12, "#7fd28a", 90, .8, "dot", 2.5); break;
    case "lupe": BT.slowAll = 5; sfx("slow"); fxRing(PL.x, PL.y, 10, 300, .6, "#ffd45a"); break;
    case "falle": BT.mines.push({ x: PL.x, y: PL.y, dmg: pot * 2.2, arm: .6, t: 0 }); sfx("trap"); break;
    case "riss": { const len = 140; for (const e of BT.en) { if (e.dead || e.st === "spawn") continue; const dx = e.x - PL.x, dy = e.y - PL.y, al = dx * Math.cos(aim) + dy * Math.sin(aim), pe = -dx * Math.sin(aim) + dy * Math.cos(aim); if (al > -5 && al < len + e.r && Math.abs(pe) < 30 + e.r) hurtEnemy(e, pot * 1.7, { a: aim, kb: 220, noChain: 1 }); } for (let k = 0; k < 14; k++) fxPart({ x: PL.x + Math.cos(aim) * k * 10, y: PL.y + Math.sin(aim) * k * 10, life: .35, col: "#fff", sz: 6, shape: "dot" }); sfx("rip"); camShake(4); PL.dir = aim; break; }
  }
  if (!ok) BT.cdArt[i] = 0.3;
}
function minesUpdate(dt) { for (let i = BT.mines.length - 1; i >= 0; i--) { const m = BT.mines[i]; m.t += dt; if (m.t > m.arm) for (const e of BT.en) if (!e.dead && e.st !== "spawn" && dist(m.x, m.y, e.x, e.y) < 26 + e.r) { fxRing(m.x, m.y, 4, 64, .35, "#e27d2c"); fxBurst(m.x, m.y, 12, ["#e27d2c", "#ffd45a"], 140, .45, "spark", 2); camShake(5); sfx("boom"); for (const x of BT.en) if (!x.dead && dist(m.x, m.y, x.x, x.y) < 64 + x.r) hurtEnemy(x, m.dmg, { a: ang(m.x, m.y, x.x, x.y), kb: 160, noChain: 1 }); BT.mines.splice(i, 1); break; } } }
function zapsUpdate(dt) { for (let i = BT.zaps.length - 1; i >= 0; i--) { BT.zaps[i].t += dt; if (BT.zaps[i].t > .18) BT.zaps.splice(i, 1); } }
function zapsDraw(c) { for (const z of BT.zaps) { c.save(); c.globalAlpha = 1 - z.t / .18; c.strokeStyle = "#ffd45a"; c.lineWidth = 3; c.beginPath(); c.moveTo(z.x0, z.y0); const n = 5; for (let k = 1; k < n; k++) { const t = k / n; c.lineTo(lerp(z.x0, z.x1, t) + (Math.random() - .5) * 12, lerp(z.y0, z.y1, t) + (Math.random() - .5) * 12); } c.lineTo(z.x1, z.y1); c.stroke(); c.restore(); } for (const m of BT.mines) { c.save(); c.fillStyle = m.t > m.arm ? BAD : MUTED; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 7, 0, TAU); c.fill(); c.stroke(); c.restore(); } }
/* ----- Gesamt-Update, Zeichnen, HUD ----- */
function combatUpdate(dt) {
  BT.t += dt; BT.slowAll = Math.max(0, BT.slowAll - dt); BT.hurtFlash = Math.max(0, BT.hurtFlash - dt); BT.bossHit = Math.max(0, (BT.bossHit || 0) - dt);
  if (!BT.lockPl) plUpdate(dt, BT.room, { attack: plAttack });
  if (ST.regen && !PL.dead) PL.hp = Math.min(PL.max, PL.hp + ST.regen * dt);
  for (const e of BT.en) if (!BT.freezeEn || e.st === "spawn") enUpdate(e, dt); BT.en = BT.en.filter(e => !e.dead || (e.dieT = (e.dieT || 0) + dt) < 0 && false);
  teleUpdate(dt); projUpdate(dt); hazUpdate(dt); pickupUpdate(dt); propsUpdate(dt); minesUpdate(dt); zapsUpdate(dt); fxUpdate(dt);
  if (BT.boss && BT.boss.dead) BT.boss = null;
}
function combatDraw(c) {
  hazDraw(c); teleDraw(c);
  const L = []; for (const e of BT.en) L.push([e.y, () => enDraw(c, e)]); for (const p of BT.props) L.push([p.y, () => propDraw(c, p)]); L.push([PL.y, () => { drawPlayer(c); drawWeapon(c); }]);
  L.sort((a, b) => a[0] - b[0]); L.forEach(x => x[1]()); pickupDraw(c); projDraw(c); zapsDraw(c); fxDraw(c);
  if (PL.shield > 0) { c.save(); c.globalAlpha = .5; c.strokeStyle = "#7bc8e0"; c.lineWidth = 3; c.beginPath(); c.arc(PL.x, PL.y - 2, 19, 0, TAU); c.stroke(); c.restore(); }
}
function hudBar(c, x, y, w, h, k, col, bg) { c.fillStyle = "rgba(29,39,66,.85)"; c.fillRect(x - 2, y - 2, w + 4, h + 4); c.fillStyle = bg || "#5a2a26"; c.fillRect(x, y, w, h); c.fillStyle = col; c.fillRect(x, y, w * clamp(k, 0, 1), h); c.fillStyle = "rgba(255,255,255,.28)"; c.fillRect(x, y, w * clamp(k, 0, 1), h * .35); }
function hudDraw(c) {
  const sx = V.sl || 0, x0 = 14 + sx, y0 = 12; drawGlyph(c, "heart", x0 + 8, y0 + 8, 20, BAD); hudBar(c, x0 + 22, y0 + 3, 130, 11, PL.hp / PL.max, "#d4584a");
  if (PL.shield > 0) hudBar(c, x0 + 22, y0 + 3, 130, 4, PL.shield / PL.max, "#7bc8e0", "transparent");
  c.font = "14px 'Patrick Hand'"; c.fillStyle = INK; c.textAlign = "left"; c.fillStyle = P1; c.strokeStyle = INK; c.lineWidth = 3.5;
  const t1 = Math.ceil(PL.hp) + " / " + PL.max; c.strokeText(t1, x0 + 158, y0 + 14); c.fillText(t1, x0 + 158, y0 + 14);
  hudBar(c, x0 + 22, y0 + 20, 130, 5, SV.lvl >= 50 ? 1 : SV.xp / xpNeed(SV.lvl), "#4aa0b0", "#2b3a50"); c.strokeText("Lv " + SV.lvl, x0 + 158, y0 + 27); c.fillText("Lv " + SV.lvl, x0 + 158, y0 + 27);
  drawGlyph(c, "coin", x0 + 8, y0 + 40, 16, "#e9b73a"); c.fillStyle = P1; c.strokeStyle = INK; c.strokeText(String(SV.gold), x0 + 22, y0 + 46); c.fillText(String(SV.gold), x0 + 22, y0 + 46);
  const b = BT.boss; if (b && !b.dead) { const w = Math.min(360, V.W - 220), x = V.W / 2 - w / 2, y = V.H - 30; c.font = "22px 'Caveat Brush'"; c.textAlign = "center"; c.strokeText(b.d.n, V.W / 2, y - 8); c.fillText(b.d.n, V.W / 2, y - 8); hudBar(c, x, y, w, 10, b.hp / b.max, "#c0453a"); c.textAlign = "left"; }
  if (BT.hurtFlash > 0) { const g = c.createRadialGradient(V.W / 2, V.H / 2, V.H * .35, V.W / 2, V.H / 2, V.H * .95); g.addColorStop(0, "rgba(184,71,58,0)"); g.addColorStop(1, `rgba(184,71,58,${BT.hurtFlash * 1.1})`); c.fillStyle = g; c.fillRect(0, 0, V.W, V.H); }
}
function artBtns() { const o = {}; [0, 1, 2].forEach(i => { const a = ST.arts && ST.arts[i]; o["a" + i] = a ? { glyph: ARTGL[a.it.base] || "star", col: P2, cd: BT.cdArt[i], cdMax: a.cd } : { glyph: "star", col: P2, dim: 1 }; }); return o; }
const ARTGL = { tinte: "drop", radierer: "ring", lesezeichen: "arrowR", klammer: "bolt", salve: "page", tintenschild: "shield", federkiel: "feather", lupe: "eye", falle: "skull", riss: "pen" };
function combatBtns() { return Object.assign({ atk: { glyph: "sword", col: P1 }, dodge: { glyph: "roll", col: P2, cd: PL.rollCd, cdMax: ST.rollCd }, rng: ST.r ? { glyph: "bow", col: P2, cd: ammoMax() - Math.floor(PL.ammo || 0), cdMax: ammoMax(), badge: String(Math.floor(PL.ammo || 0)) } : { glyph: "bow", col: P2, dim: 1 } }, artBtns()); }
/* ----- Test-Arena mit Wellen (wird später durch Dungeons ersetzt) ----- */
SCENES.arena = {
  enter() {
    calcStats(); PL.hp = PL.max; this.room = buildRoom("arena1", { theme: 0, seed: 12345, doors: {} }); plReset(11 * TS, 6.5 * TS); PL.hp = PL.max; btReset(this.room, Math.max(1, SV.stufe || 1), 0); BT.active = true; BT.cdArt = [0, 0, 0];
    CAM.x = PL.x; CAM.y = PL.y; CAM.z = 1.4; IN.show = true; music("bereich1"); scrapsInit(20, V.W, V.H); this.wave = 0; this.wt = 1.5; this.t = 0; cineBars(true); setTimeout(() => cineBars(false), 1500);
    BT.onDeath = () => { SV.stats.deaths++; saveGame(); toast("Du wurdest zerknüllt. Fortschritt bleibt."); transition(() => setScene("arena")); };
    for (let i = 0; i < 4; i++) { const p = this.freePos(80); if (p) addProp("barrel", p.x, p.y); } const p = this.freePos(80); if (p) addProp("chest", p.x, p.y);
  },
  freePos(minD) { for (let i = 0; i < 60; i++) { const x = (2 + Math.random() * (this.room.w - 4)) * TS, y = (2 + Math.random() * (this.room.h - 4)) * TS; if (freeAt(this.room, x, y, 14) && dist(x, y, PL.x, PL.y) > minD) return { x, y }; } return null; },
  spawnWave() {
    this.wave++; const pool = EN_POOL[0], n = 3 + Math.min(5, this.wave), K = BT.K;
    for (let i = 0; i < n; i++) { const role = i < 2 || Math.random() < .4 ? "fuss" : "fern", id = pick(pool[role]), p = this.freePos(150); if (p) spawnEnemy(id, p.x, p.y, { wave: this.wave }); }
    if (this.wave % 2 === 0) { const p = this.freePos(150); if (p) spawnEnemy(pick(pool.elite), p.x, p.y, { mods: K >= 2 ? [pick(ELITE_MOD_IDS)] : [] }); }
    toast(`Welle ${this.wave}`); sfx("warn");
  },
  update(dt) {
    this.t += dt; scrapsUpdate(dt); CAM.z = approach(CAM.z, 1, dt * .4); combatUpdate(dt);
    const tgt = PL.dead ? null : nearestEnemy(PL.x, PL.y, 140); camFollow(PL.x + (tgt ? (tgt.x - PL.x) * .15 : 0), PL.y + (tgt ? (tgt.y - PL.y) * .15 : 0), { w: this.room.w * TS, h: this.room.h * TS }, dt);
    if (!BT.en.some(e => !e.dead)) { this.wt -= dt; if (this.wt <= 0) { this.wt = 2.2; this.spawnWave(); } }
    if (wasPressed("menu")) pauseMenu();
  },
  draw(c) {
    c.fillStyle = THEMES[0].bgCol; c.fillRect(0, 0, V.W, V.H); scrapsDraw(c, CAM.x, CAM.y, .5, 0, .6);
    camBegin(c); drawRoomBG(c, this.room); drawTorchSprites(c, this.room, G.t); combatDraw(c); drawTorches(c, this.room, G.t); camEnd(c);
    const s = w2s(PL.x, PL.y); drawLighting(c, .5, [{ x: s.x, y: s.y, r: 240 }].concat(this.room.torches.map(t => { const q = w2s(t.x, t.y + 14); return { x: q.x, y: q.y, r: 120, k: .8 }; }))); scrapsDraw(c, CAM.x, CAM.y, .35, 1, 3); drawVignette(c, .8);
    hudDraw(c); drawControls(c, { btns: combatBtns() });
  },
};

function pauseMenu() {
  sfx("page"); const w = winOpen(`<h2><span>Pause</span><span class="sp"></span></h2><div class="body" style="display:flex;flex-direction:column;gap:8px;align-items:stretch"><button class="btn big" id="r">Weiter</button><button class="btn big" id="b">${gi("bag", INK)} Rucksack</button>${DG.def && G.sceneName === "dungeon" ? `<button class="btn" id="h">Zurück ins Dorf (Lauf bleibt gespeichert)</button>` : ""}<button class="btn" id="m">Zum Titel</button></div>`); w.style.width = "min(70vw,340px)"; const hb = w.querySelector("#h"); if (hb) hb.onclick = () => { sfx("click"); winClose(); dgSave(); transition(() => setScene("hub", { fromDungeon: true })); };
  w.querySelector("#r").onclick = () => { sfx("click"); winClose(); }; w.querySelector("#b").onclick = () => { sfx("click"); openInventory("bag", () => { }); };
  w.querySelector("#m").onclick = () => { sfx("click"); winClose(); saveGame(); transition(() => setScene("title")); };
}
