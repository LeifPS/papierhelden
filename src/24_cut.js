/* ===== Zwischenszenen: Comic-Tafeln mit animierten Figuren, Schreibmaschine, Abspann ===== */
const CUT = { def: null, i: 0, t: 0, typed: 0, cb: null, prev: null, prevName: "", tap: false, credits: false, mus: "", cache: {}, skipHold: 0 };
const SCENE_DEFS = {
  intro: { music: "story", panels: [
    { bg: "desk", a: [{ k: "author", x: .5, y: .62, s: 1.5, an: "write" }, { k: "lamp", x: .2, y: .3, s: 1 }], t: "Es war einmal ein Mann, der schrieb eine Geschichte. Jeden Abend, bei einer Lampe, die nie ganz hell wurde." },
    { bg: "desk", a: [{ k: "author", x: .42, y: .62, s: 1.4, an: "write" }, { k: "hand", x: .72, y: .66, s: 1.2, an: "write" }, { k: "lamp", x: .2, y: .3, s: 1 }], t: "Seine Tochter malte die Bilder dazu. Gemeinsam füllten sie Seite um Seite mit Helden, Tinte und Mut." },
    { bg: "night", a: [{ k: "moon", x: .7, y: .3, s: 1.5, an: "pulse" }, { k: "star", x: .3, y: .2, s: 1, an: "fall" }], t: "Dann kam eine Nacht ohne Lampe. Und eine Hand, die nie wieder malte." },
    { bg: "red", a: [{ k: "pencil", x: .5, y: .45, s: 1.2, an: "swipe" }], t: "Er nahm den Rotstift. Strich ein Kapitel. Dann noch eins. Bis nichts mehr stehen blieb." },
    { bg: "white", a: [{ k: "page", x: .3, y: .6, s: 1.8, an: "drift" }], t: "Und die erste Fassung, die ehrliche, flog zerknüllt in die Ecke." },
    { bg: "library", a: [{ k: "hero", x: .5, y: .66, s: 1.6, an: "bob" }], t: "…und wachte auf." },
  ] },
  mem1: { music: "story", panels: [
    { bg: "desk", a: [{ k: "author", x: .4, y: .62, s: 1.4, an: "write" }, { k: "hand", x: .72, y: .66, s: 1.2, an: "write" }], t: "Du erinnerst dich: Er schrieb damals schnell. Sie lachte über jeden Satz, in dem ein Held stolperte." },
    { bg: "desk", a: [{ k: "hand", x: .6, y: .62, s: 1.6, an: "write" }, { k: "heart", x: .6, y: .3, s: 1.2, an: "pulse" }], t: "„Lass ihn hinfallen“, sagte sie. „Dann steht er wieder auf.“" },
    { bg: "white", a: [{ k: "hero", x: .5, y: .66, s: 1.6, an: "bob" }], t: "Der Golem löschte Randnotizen. Aber diese eine nicht." },
  ] },
  mem2: { music: "story", panels: [
    { bg: "night", a: [{ k: "author", x: .5, y: .64, s: 1.5, an: "bob" }], t: "Nach jener Nacht las er alles noch einmal. Jedes Wort erinnerte ihn." },
    { bg: "red", a: [{ k: "page", x: .5, y: .55, s: 1.8, an: "shake" }], t: "Er suchte Fehler, die nicht da waren. Der Lektor war nur seine Strenge, die zu laut geworden war." },
    { bg: "red", a: [{ k: "pencil", x: .5, y: .5, s: 1.4, an: "pulse" }], t: "Und so erwachte der Rotstift." },
  ] },
  mem3: { music: "story", panels: [
    { bg: "sea", a: [{ k: "ink", x: .3, y: .5, s: 1.4, an: "fall" }, { k: "ink", x: .6, y: .3, s: 1, an: "fall" }, { k: "moon", x: .8, y: .22, s: 1, an: "pulse" }], t: "Die Tinte im Meer ist keine Tinte. Es sind die Nächte, in denen er nicht schlafen konnte." },
    { bg: "sea", a: [{ k: "hero", x: .5, y: .62, s: 1.6, an: "bob" }, { k: "page", x: .75, y: .5, s: 1.2, an: "drift" }], t: "Und doch steht in jeder Welle noch ein Wort." },
  ] },
  rotstift_intro: { music: "finalboss", panels: [
    { bg: "red", a: [{ k: "pencil", x: .5, y: .5, s: 1.6, an: "pulse" }], t: "Der Rotstift: „Du bist die erste Fassung. Die ehrliche. Und ich bin der Grund, dass ihn niemand mehr liest.“" },
    { bg: "red", a: [{ k: "pencil", x: .6, y: .45, s: 1.3, an: "swipe" }, { k: "hero", x: .25, y: .7, s: 1.4, an: "bob" }], t: "„Ein Ende ist ein Abschied. Lass mich dich streichen, kleine Seite.“" },
    { bg: "red", a: [{ k: "hero", x: .5, y: .66, s: 1.8, an: "bob" }], t: "„Ich bin nicht gekommen, um gestrichen zu werden.“" },
  ] },
  endA: { music: "story", panels: [
    { bg: "white", a: [{ k: "hero", x: .5, y: .66, s: 1.7, an: "bob" }, { k: "pencil", x: .8, y: .3, s: .8, an: "drift" }], t: "Du hobst den Stift auf, den der Rotstift verlor." },
    { bg: "white", a: [{ k: "page", x: .5, y: .55, s: 2, an: "pulse" }], t: "Die Seite schrieb sich selbst weiter. Wort für Wort, bis das Ende stand." },
    { bg: "desk", a: [{ k: "author", x: .45, y: .62, s: 1.5, an: "write" }, { k: "lamp", x: .2, y: .3, s: 1.6 }, { k: "hand", x: .75, y: .66, s: 1.2, an: "write" }], t: "Irgendwo setzte sich ein Mann an einen Tisch und nahm den Stift in die Hand." },
    { bg: "white", a: [{ k: "heart", x: .5, y: .5, s: 2, an: "pulse" }], t: "Er schrieb: Ende. Und dann, ganz klein: Fortsetzung folgt." },
  ] },
  endB: { music: "story", panels: [
    { bg: "white", a: [{ k: "hero", x: .5, y: .66, s: 1.7, an: "bob" }], t: "Du faltetest dich zusammen, so klein, wie du konntest." },
    { bg: "night", a: [{ k: "page", x: .5, y: .55, s: 1.6, an: "drift" }, { k: "moon", x: .8, y: .25, s: 1.2, an: "pulse" }], t: "Manche Geschichten brauchen kein Ende. Nur jemanden, der sie liebhat." },
    { bg: "desk", a: [{ k: "author", x: .45, y: .62, s: 1.5, an: "bob" }, { k: "page", x: .72, y: .7, s: 1, an: "bob" }], t: "Der Mann legte die zerknüllte Seite in eine Schublade, neben ein Kinderbild. Und schloss sie sanft." },
  ] },
};
const CREDITS = ["Papierhelden", "", "Ein Spiel von Leif", "", "Entwicklung", "Leif und Claude", "", "Alle Bilder und Töne", "entstanden im Code", "", "Musik", "von Leif", "", "Du, kleine Seite", "warst die erste Fassung", "", "Danke fürs Spielen", "", "Ende"];
/* Hintergründe (einmal pro Tafel gezeichnet) */
function cutBg(kind, w, h) {
  return offscreen(w, h, 2, c => {
    const s = sketchCtx(c, strSeed("cb" + kind), 30), r = RNG(strSeed(kind));
    const grad = (a, b) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h); };
    if (kind === "desk") { grad("#2b2238", "#4a3326"); c.fillStyle = "#12203a"; c.fillRect(w * .06, h * .1, w * .22, h * .38); c.fillStyle = "#f6efd9"; c.beginPath(); c.arc(w * .21, h * .26, 12, 0, TAU); c.fill(); c.fillStyle = "#6e4425"; c.fillRect(0, h * .72, w, h * .28); const g = c.createRadialGradient(w * .2, h * .3, 10, w * .2, h * .3, w * .5); g.addColorStop(0, "rgba(255,210,120,.5)"); g.addColorStop(1, "rgba(255,210,120,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#e9e1c8"; c.fillRect(w * .55, h * .66, w * .2, h * .06); }
    else if (kind === "night") { grad("#0e1530", "#27305a"); c.fillStyle = "#f6efd9"; for (let i = 0; i < 40; i++) { c.globalAlpha = .3 + r() * .7; c.fillRect(r() * w, r() * h * .7, 2, 2); } c.globalAlpha = 1; c.fillStyle = "#12203a"; c.fillRect(0, h * .8, w, h * .2); }
    else if (kind === "library") { grad("#3a2a1e", "#6e4425"); for (let y = 0; y < 4; y++) { c.fillStyle = "#4a2f1a"; c.fillRect(0, y * h * .26 + h * .2, w, 5); let x = 6; while (x < w - 10) { const bw = 7 + r() * 8; c.fillStyle = ["#b8473a", "#2b7a86", "#c97d12", "#3a8450", "#7a4fb0", "#d9c597"][Math.floor(r() * 6)]; c.fillRect(x, y * h * .26 + h * .2 - 34 - r() * 8, bw, 34 + r() * 8); x += bw + 1; } } c.fillStyle = "#e8d9b0"; c.fillRect(0, h * .84, w, h * .16); }
    else if (kind === "sea") { grad("#0e1a44", "#1d2d6a"); c.strokeStyle = "rgba(160,200,230,.4)"; c.lineWidth = 2; for (let y = h * .35; y < h; y += 18) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 20) c.lineTo(x, y + Math.sin(x * .07 + y) * 5); c.stroke(); } }
    else if (kind === "red") { c.fillStyle = "#efe3c4"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(184,71,58,.85)"; c.lineWidth = 7; c.lineCap = "round"; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(r() * w, r() * h); c.lineTo(r() * w, r() * h); c.stroke(); } c.fillStyle = "rgba(60,20,20,.25)"; c.fillRect(0, 0, w, h); }
    else { c.fillStyle = "#f6efd9"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(43,122,134,.25)"; c.lineWidth = 1.5; for (let y = 24; y < h; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.strokeStyle = "rgba(184,71,58,.35)"; c.beginPath(); c.moveTo(w * .12, 0); c.lineTo(w * .12, h); c.stroke(); }
  });
}
function actorSpr(k) {
  return spr("act|" + k, 140, 140, c0 => {
    const c = sketchCtx(c0, strSeed("ac" + k), 40); c.lineWidth = 3.2;
    if (k === "author") { c.beginPath(); c.moveTo(-30, 50); c.quadraticCurveTo(-40, -10, -10, -22); c.quadraticCurveTo(24, -22, 34, 50); c.closePath(); c0.fillStyle = "#2a3a5a"; c.fill(); c.stroke(); c.beginPath(); c.arc(-4, -40, 17, 0, TAU); c0.fillStyle = "#e9d2a8"; c.fill(); c.stroke(); c.beginPath(); c.moveTo(24, 0); c.lineTo(52, 22); c.stroke(); c0.fillStyle = "#1d2742"; c.beginPath(); c.arc(-9, -42, 2.2, 0, TAU); c0.fill(); }
    else if (k === "hand") { c.beginPath(); c.ellipse(0, 4, 13, 9, .2, 0, TAU); c0.fillStyle = "#f1cfa8"; c.fill(); c.stroke(); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-36, 10); c.lineWidth = 4; c0.strokeStyle = "#c97d12"; c.stroke(); c0.strokeStyle = INK; }
    else if (k === "lamp") { c.beginPath(); c.moveTo(-14, 10); c.lineTo(-8, -18); c.lineTo(8, -18); c.lineTo(14, 10); c.closePath(); c0.fillStyle = "#ffd45a"; c.fill(); c.stroke(); c.beginPath(); c.rect(-5, 10, 10, 26); c0.fillStyle = "#6e4425"; c.fill(); c.stroke(); }
    else if (k === "moon") { c.beginPath(); c.arc(0, 0, 26, 0, TAU); c0.fillStyle = "#f6efd9"; c.fill(); c.stroke(); c0.fillStyle = "rgba(29,39,66,.2)"; for (const [x, y, r] of [[-8, -6, 6], [8, 8, 4]]) { c0.beginPath(); c0.arc(x, y, r, 0, TAU); c0.fill(); } }
    else if (k === "star" || k === "heart") { drawGlyph(c0, k, 0, 0, 70, k === "heart" ? BAD : "#ffd45a"); }
    else if (k === "ink") { c.beginPath(); c.moveTo(0, -34); c.quadraticCurveTo(26, 4, 16, 24); c.quadraticCurveTo(0, 38, -16, 24); c.quadraticCurveTo(-26, 4, 0, -34); c0.fillStyle = "#2a3a80"; c.fill(); c.stroke(); }
    else if (k === "page") { c.beginPath(); c.moveTo(-30, -20); c.lineTo(-6, -34); c.lineTo(24, -26); c.lineTo(34, 4); c.lineTo(20, 30); c.lineTo(-14, 34); c.lineTo(-34, 10); c.closePath(); c0.fillStyle = "#f6efd9"; c.fill(); c.stroke(); c.lineWidth = 1.6; c0.strokeStyle = "rgba(29,39,66,.35)"; c.beginPath(); c.moveTo(-18, -14); c.lineTo(8, 0); c.lineTo(22, -10); c.moveTo(8, 0); c.lineTo(-4, 22); c.stroke(); c0.strokeStyle = INK; }
  }, 2);
}
function cutActorDraw(c, a, t, pw, ph) {
  const x = a.x * pw, y = a.y * ph, s = a.s || 1; let ox = 0, oy = 0, rot = a.r || 0, sc = s, al = 1;
  switch (a.an) { case "bob": oy = Math.sin(t * 2.4) * 4; break; case "write": ox = Math.sin(t * 5) * 3; oy = Math.cos(t * 7) * 1.5; break; case "shake": ox = Math.sin(t * 40) * 2; break; case "pulse": sc = s * (1 + Math.sin(t * 2.6) * .06); break; case "drift": ox = Math.sin(t * .9) * 22; oy = Math.cos(t * 1.3) * 8; rot = Math.sin(t) * .3; break; case "fall": oy = ((t * 40) % (ph * .6)) - ph * .15; al = 1 - Math.max(0, (oy + ph * .15) / (ph * .6) - .7) * 3; break; case "swipe": ox = Math.sin(t * 1.8) * 70; rot = Math.sin(t * 1.8) * .35; break; }
  const px = x + ox, py = y + oy;
  if (a.k === "hero") { c.save(); c.translate(px, py); c.scale(sc, sc); drawHeroFig(c, { x: 0, y: 0, dir: PI / 2, moving: a.an === "bob" && false, t, paper: PAPERS[SV.paper || "creme"], scarf: "#2b7a86", roll: 0, alpha: 1 }); c.restore(); return; }
  if (a.k === "pencil") { const sp = enSpr("rotstift", Math.floor(t * 3) % 2, 0); blit(c, sp, px, py, { s: sc * .9, r: rot }); return; }
  if (a.k === "lamp") { const g = c.createRadialGradient(px, py, 4, px, py, 90 * sc); g.addColorStop(0, "rgba(255,210,120,.45)"); g.addColorStop(1, "rgba(255,210,120,0)"); c.fillStyle = g; c.fillRect(px - 100, py - 100, 200, 200); }
  blit(c, actorSpr(a.k), px, py, { s: sc, r: rot, a: al });
}
function cutPlay(id, done) {
  if (CUT.def) return; const d = SCENE_DEFS[id]; if (!d) { done && done(); return; }
  CUT.def = d; CUT.id = id; CUT.i = 0; CUT.t = 0; CUT.typed = 0; CUT.cb = done || null; CUT.prev = G.scene; CUT.prevName = G.sceneName; CUT.prevMusic = AU.cur || ""; CUT.credits = false; CUT.pcache = {}; CUT.inT = 0;
  G.scene = SCENES.cut; G.sceneName = "cut"; IN.show = false; cineBars(true); music(d.music || "story");
}
function cutEnd() {
  const cb = CUT.cb, prev = CUT.prev, name = CUT.prevName; CUT.def = null; CUT.cb = null; cineBars(false); sfx("page"); if (CUT.prevMusic) music(CUT.prevMusic);
  if (prev) { G.scene = prev; G.sceneName = name; IN.show = !!(name === "dungeon" || name === "hub"); }
  if (cb) cb();
}
function cutAdvance() { const p = CUT.def.panels[CUT.i]; if (CUT.typed < p.t.length) { CUT.typed = p.t.length; return; } if (CUT.i < CUT.def.panels.length - 1) { CUT.i++; CUT.t = 0; CUT.typed = 0; CUT.inT = 0; sfx("page"); } else cutEnd(); }
SCENES.cut = {
  enter() { },
  update(dt) {
    if (!CUT.def) { if (CUT.prev) { G.scene = CUT.prev; G.sceneName = CUT.prevName; } return; }
    if (CUT.credits) { CUT.t += dt; scrapsUpdate(dt); if (CUT.t > CREDITS.length * 1.05 + 5 || CUT.tap) { if (CUT.t > 3 && CUT.tap) { CUT.tap = false; cutEnd(); } } CUT.tap = false; return; }
    CUT.t += dt; CUT.inT += dt; const p = CUT.def.panels[CUT.i]; if (CUT.inT > .5) { const before = Math.floor(CUT.typed); CUT.typed = Math.min(p.t.length, CUT.typed + 34 * dt); if (Math.floor(CUT.typed) % 3 === 0 && Math.floor(CUT.typed) !== before) sfx("type", 25); }
    if (CUT.tap) { CUT.tap = false; if (CUT.inT > .4) cutAdvance(); }
  },
  draw(c) {
    c.fillStyle = "#141a2e"; c.fillRect(0, 0, V.W, V.H); if (!CUT.def) return;
    if (CUT.credits) { scrapsDraw(c, 0, CUT.t * 20, .5, 0, .6); c.save(); c.textAlign = "center"; CREDITS.forEach((l, i) => { const y = V.H + 30 - CUT.t * 38 + i * 36; if (y < -20 || y > V.H + 20) return; const a = clamp(Math.min(y / 80, (V.H - y) / 80 + .3), 0, 1); c.globalAlpha = a; c.font = (i === 0 ? "60px" : "30px") + " 'Caveat Brush'"; c.fillStyle = i === 0 ? "#ffd45a" : P1; c.fillText(l, V.W / 2, y); }); c.restore(); return; }
    const p = CUT.def.panels[CUT.i], pw = Math.min(V.W - 120, 620), ph = Math.min(V.H * .5, 200), k = easeOut(clamp(CUT.inT / .5, 0, 1)), px = V.W / 2, py = V.H * .44;
    const key = CUT.id + CUT.i; let bg = CUT.pcache[key]; if (!bg) bg = CUT.pcache[key] = cutBg(p.bg, pw, ph);
    c.save(); c.translate(px + (1 - k) * 220, py); c.rotate((1 - k) * .1 - .012); c.globalAlpha = k;
    c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(-pw / 2 + 6, -ph / 2 + 8, pw, ph); c.drawImage(bg, -pw / 2, -ph / 2, pw, ph);
    c.save(); c.beginPath(); c.rect(-pw / 2, -ph / 2, pw, ph); c.clip(); c.translate(-pw / 2, -ph / 2); const zoom = 1 + CUT.t * .012; c.translate(pw / 2, ph / 2); c.scale(zoom, zoom); c.translate(-pw / 2, -ph / 2); p.a.forEach(a => cutActorDraw(c, a, CUT.t, pw, ph)); c.restore();
    c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(-pw / 2, -ph / 2, pw, ph); c.restore();
    c.font = "21px 'Patrick Hand'"; c.textAlign = "center"; const tw = Math.min(V.W - 140, 640), txt = p.t.slice(0, Math.floor(CUT.typed)), lines = wrapText(c, p.t, tw); let rem = txt.length;
    lines.forEach((l, i) => { const part = l.slice(0, Math.max(0, Math.min(l.length, rem))); rem -= l.length + 1; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = P1; c.strokeText(part, V.W / 2, V.H * .44 + ph / 2 + 34 + i * 24); c.fillText(part, V.W / 2, V.H * .44 + ph / 2 + 34 + i * 24); });
    c.textAlign = "right"; c.font = "16px 'Patrick Hand'"; c.fillStyle = "rgba(246,239,217,.7)"; c.fillText("Tippen: weiter · Halten oben rechts: überspringen", V.W - 14, V.H - 38);
    c.textAlign = "left"; c.fillText((CUT.i + 1) + " / " + CUT.def.panels.length, 14, V.H - 38);
  },
};
cv.addEventListener("pointerdown", e => { if (G.sceneName !== "cut") return; const p = toLogical(e.clientX, e.clientY); if (p.x > V.W - 130 && p.y < 90) { cutSkipAll(); return; } CUT.tap = true; });
window.addEventListener("keydown", e => { if (G.sceneName === "cut" && (e.key === " " || e.key === "Enter")) CUT.tap = true; if (G.sceneName === "cut" && e.key === "Escape") cutSkipAll(); });
function cutSkipAll() { if (!CUT.def) return; if (CUT.credits) { cutEnd(); return; } cutEnd(); }
function creditsPlay(done) { if (CUT.def) return; CUT.def = { panels: [{ t: "" }] }; CUT.i = 0; CUT.t = 0; CUT.cb = done; CUT.prev = G.scene; CUT.prevName = G.sceneName; CUT.credits = true; CUT.id = "credits"; G.scene = SCENES.cut; G.sceneName = "cut"; IN.show = false; cineBars(false); music("sieg"); scrapsInit(30, V.W, V.H); }
/* ----- Finale: Enden und Abspann ----- */
async function endingFlow() {
  const c = await dlg("Die Seite", "Der Rotstift liegt still. In deiner Hand: ein Stift, der schreiben könnte. Was tust du?", ["Die Geschichte zu Ende schreiben", "Die Seite zerknüllen und loslassen"]);
  SV.ending = c === 0 ? 1 : 2; saveGame();
  cutPlay(c === 0 ? "endA" : "endB", () => creditsPlay(() => { SV.flags.ended = 1; saveGame(); transition(() => { DG.def = null; setScene("hub", { fromDungeon: true }); }); }));
}
