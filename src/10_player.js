/* ===== Spielfigur: Bewegung, Ausweichrolle, Angriff (Kampfwerte kommen aus Ausrüstung) ===== */
const ST = { hp: 100, dmg: 12, atkSpd: 1, move: 1, prot: 0, crit: .05, critd: .5, rollT: .34, rollCd: .65, cdr: 0, luck: 0, regen: 0, life: 0 };
const PL = { x: 0, y: 0, vx: 0, vy: 0, r: 11, hb: 11, dir: 0, hp: 100, max: 100, t: 0, moving: false, st: "idle", stT: 0, roll: 0, rollCd: 0, atkT: 0, atkCd: 0, combo: 0, inv: 0, flash: 0, step: 0, aim: 0, swing: null, shield: 0, dead: false, alpha: 1 };
const SPD = 128;
function plReset(x, y) { Object.assign(PL, { x, y, vx: 0, vy: 0, st: "idle", stT: 0, roll: 0, rollCd: 0, atkT: 0, atkCd: 0, combo: 0, inv: 0, flash: 0, swing: null, shield: 0, dead: false, alpha: 1, hp: PL.max }); }
function plUpdate(dt, room, ctx) {
  PL.t += dt; PL.flash = Math.max(0, PL.flash - dt); PL.inv = Math.max(0, PL.inv - dt); PL.rollCd = Math.max(0, PL.rollCd - dt); PL.atkCd = Math.max(0, PL.atkCd - dt);
  if (PL.dead) return;
  let mx = IN.mx, my = IN.my; const mag = Math.hypot(mx, my);
  if (PL.st === "roll") {
    PL.stT += dt; const k = PL.stT / ST.rollT; PL.roll = k; const sp = 330 * (1 - k * .45);
    moveEnt(room, PL, Math.cos(PL.rdir) * sp * dt, Math.sin(PL.rdir) * sp * dt);
    PL.inv = Math.max(PL.inv, .05); if (k >= 1) { PL.st = "idle"; PL.roll = 0; PL.inv = .06; }
    return;
  }
  if (wasPressed("dodge") && PL.rollCd <= 0 && PL.st !== "hurt") {
    PL.st = "roll"; PL.stT = 0; PL.rdir = mag > .1 ? Math.atan2(my, mx) : PL.dir; PL.rollCd = ST.rollCd; PL.inv = ST.rollT; PL.swing = null; sfx("roll"); if (ctx.onRoll) ctx.onRoll();
    return;
  }
  const busy = PL.swing && PL.swing.t < PL.swing.dur;
  const spd = SPD * ST.move * (busy ? .55 : 1);
  PL.moving = mag > .08;
  if (PL.moving) { const ax = mx, ay = my; PL.vx = ax * spd; PL.vy = ay * spd; PL.step += dt; if (!busy) PL.dir = Math.atan2(my, mx); }
  else { PL.vx = PL.vy = 0; }
  if (PL.moving) moveEnt(room, PL, PL.vx * dt, PL.vy * dt);
  if (ctx.attack) ctx.attack(dt);
  if (PL.swing) { PL.swing.t += dt; if (PL.swing.t >= PL.swing.dur + .05) PL.swing = null; }
}
function drawPlayer(c) {
  const sv = window.SV || {}; const paper = PAPERS[sv.paper || "creme"] || PAPERS.creme, scarf = (window.armorColor && armorColor()) || "#2b7a86";
  const blink = PL.flash > 0 && Math.floor(PL.flash * 20) % 2 === 0;
  const hit = PL.swing;
  // Waffe hinter oder vor dem Helden je nach Blickrichtung
  const behind = Math.sin(PL.dir) < -.3;
  if (hit && behind) drawWeapon(c);
  if (!blink) drawHeroFig(c, { x: PL.x, y: PL.y, dir: PL.dir, moving: PL.moving || PL.st === "roll", t: PL.t, paper, scarf, roll: PL.st === "roll" ? PL.roll : 0, alpha: PL.st === "roll" ? .95 : 1 });
  if (hit && !behind) drawWeapon(c);
  if (PL.shield > 0) { c.save(); c.globalAlpha = .45 + Math.sin(PL.t * 8) * .1; c.strokeStyle = "#2b7a86"; c.lineWidth = 3; c.fillStyle = "rgba(43,122,134,.18)"; c.beginPath(); c.arc(PL.x, PL.y, 24, 0, TAU); c.fill(); c.stroke(); c.restore(); }
}
/* Waffe und Schwung zeichnen */
function drawWeapon(c) {
  const s = PL.swing; if (!s) return; const k = clamp(s.t / s.dur, 0, 1), w = s.w || { len: 34, arc: 2 };
  const a0 = s.a - s.arc / 2 * s.dirSign, a1 = s.a + s.arc / 2 * s.dirSign, a = s.kind === "thrust" ? s.a : lerp(a0, a1, easeOut(k));
  const reach = s.kind === "thrust" ? 8 + 26 * Math.sin(Math.min(k, 1) * PI) : 8, spr0 = wpnSpr(s.base);
  if (s.kind !== "thrust" && k < 1) {   // Schwung-Spur
    c.save(); c.globalAlpha = (1 - k) * .55; c.strokeStyle = s.col || "#ffffff"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.arc(PL.x, PL.y - 4, s.range * .78, a0, a, s.dirSign < 0); c.stroke(); c.restore();
  }
  c.save(); c.translate(PL.x + Math.cos(a) * reach, PL.y - 4 + Math.sin(a) * reach); c.rotate(a); c.drawImage(spr0.cv, -spr0.w * .2, -spr0.h / 2, spr0.w, spr0.h); c.restore();
}
/* Waffen-Sprites (nach rechts zeigend, Griff links) */
function wpnSpr(base) {
  return spr("wpn|" + base, 72, 40, (c0) => {
    const c = sketchCtx(c0, strSeed("w" + base), 30), L = 36; c.lineWidth = 3; c0.translate(-L + 14, 0);
    const blade = (len, wd, col) => { c.beginPath(); c.moveTo(14, -wd); c.lineTo(14 + len, -wd * .6); c.lineTo(18 + len, 0); c.lineTo(14 + len, wd * .6); c.lineTo(14, wd); c.closePath(); c0.fillStyle = col; c.fill(); c.stroke(); };
    const grip = () => { c0.fillStyle = "#b9803a"; c.beginPath(); c.rect(0, -2.5, 14, 5); c.fill(); c.stroke(); c.beginPath(); c.moveTo(13, -7); c.lineTo(13, 7); c.lineWidth = 4; c.stroke(); c.lineWidth = 3; };
    switch (base) {
      case "schere": grip(); blade(30, 3, "#dfe6ee"); c.beginPath(); c.moveTo(14, -2); c.lineTo(44, 5); c.stroke(); break;
      case "lineal": c0.fillStyle = "#e9b73a"; c.beginPath(); c.rect(-4, -4, 62, 8); c.fill(); c.stroke(); c.lineWidth = 1.6; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(i * 7, -4); c.lineTo(i * 7, i % 2 ? -1 : 1); c.stroke(); } c.lineWidth = 3; c.beginPath(); c.moveTo(58, -6); c.lineTo(70, 0); c.lineTo(58, 6); c.closePath(); c0.fillStyle = "#dfe6ee"; c.fill(); c.stroke(); break;
      case "hefter": c0.fillStyle = "#b9803a"; c.beginPath(); c.rect(0, -3, 38, 6); c.fill(); c.stroke(); c0.fillStyle = "#9aa3b2"; c.beginPath(); c.rect(30, -13, 26, 26); c.fill(); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(34, -6); c.lineTo(52, -6); c.moveTo(34, 6); c.lineTo(52, 6); c.stroke(); break;
      case "brief": grip(); blade(26, 2.6, "#e9edff"); break;
      case "radier": c0.fillStyle = "#b9803a"; c.beginPath(); c.rect(0, -2.5, 30, 5); c.fill(); c.stroke(); c0.fillStyle = "#f4b6c2"; c.beginPath(); c.rect(26, -11, 28, 22); c.fill(); c.stroke(); c0.fillStyle = "#4a79b8"; c.beginPath(); c.rect(26, -11, 9, 22); c.fill(); c.stroke(); break;
      case "klaue": c0.fillStyle = "#2a3a80"; c.beginPath(); c.rect(0, -4, 16, 8); c.fill(); c.stroke(); [-7, 0, 7].forEach(y => { c.beginPath(); c.moveTo(14, y); c.quadraticCurveTo(30, y - 3, 40, y + 3); c.quadraticCurveTo(28, y + 1, 14, y + 3); c.closePath(); c0.fillStyle = "#e8eef5"; c.fill(); c.stroke(); }); break;
      case "bogen": case "bogen_f": c0.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(24, -26); c.quadraticCurveTo(52, 0, 24, 26); c.stroke(); c0.strokeStyle = "#b9803a"; c.lineWidth = 3; c.stroke(); c0.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(24, -26); c.lineTo(24, 26); c.stroke(); break;
      default: grip(); blade(30, 4.5, "#f1f5fa"); c.lineWidth = 1.6; c.beginPath(); c.moveTo(18, 0); c.lineTo(42, 0); c.stroke(); // Federkiel-Schwert
    }
  });
}
