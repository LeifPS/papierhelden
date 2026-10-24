/* ===== Spielrahmen: Spielstand, Hauptschleife, Szenen (Titel, Übungsraum) ===== */
const G = { t: 0, last: 0, freeze: 0, slowT: 0, slowK: 1, menu: false, talk: false, paused: false, fps: 60, fpsN: 0, fpsT: 0, scene: null, sceneName: "", inv: false, showFps: false };
const SV_KEY = "papierhelden_v1";
let SV = defaultSave();
function defaultSave() { return { v: 1, name: "Held", paper: "creme", lvl: 1, xp: 0, vp: 0, gold: 0, inv: [], eq: { melee: { base: "feder", rar: 0, ilvl: 1 } }, flags: {}, done: {}, stufe: 0, stufeMax: 0, run: null, sets: { sfx: .8, mus: .6 }, ending: 0, stats: { kills: 0, deaths: 0, runs: 0 } }; }
function saveGame() { try { localStorage.setItem(SV_KEY, JSON.stringify(SV)); } catch (e) {} }
function loadGame() { try { const s = localStorage.getItem(SV_KEY); if (!s) return false; const o = JSON.parse(s); if (!o || o.v !== 1) return false; SV = Object.assign(defaultSave(), o); return true; } catch (e) { return false; } }
const hasSave = () => { try { return !!localStorage.getItem(SV_KEY); } catch (e) { return false; } };
function hitstop(s) { G.freeze = Math.max(G.freeze, s); }
function slowmo(s, k) { G.slowT = Math.max(G.slowT, s); G.slowK = k || .3; }
const SCENES = {};
function setScene(name, arg) { if (G.scene && G.scene.leave) G.scene.leave(); G.sceneName = name; G.scene = SCENES[name]; IN.show = false; if (G.scene.enter) G.scene.enter(arg); }
function frame(ts) {
  requestAnimationFrame(frame);
  const raw = Math.min(.05, (ts - (G.last || ts)) / 1000); G.last = ts; G.t += raw;
  G.fpsT += raw; G.fpsN++; if (G.fpsT > .5) { G.fps = Math.round(G.fpsN / G.fpsT); G.fpsN = 0; G.fpsT = 0; }
  let dt = raw; if (G.freeze > 0) { G.freeze -= raw; dt = 0; } else if (G.slowT > 0) { G.slowT -= raw; dt = raw * G.slowK; }
  inputUpdate(raw);
  if (!G.menu && G.scene && G.scene.update) G.scene.update(dt, raw);
  cineUpdate(raw); trUpdate(raw);
  gx.setTransform(1, 0, 0, 1, 0, 0); gx.fillStyle = "#0b0e1a"; gx.fillRect(0, 0, V.cw, V.ch);
  gx.setTransform(V.sc, 0, 0, V.sc, V.ox, V.oy); gx.save(); gx.beginPath(); gx.rect(0, 0, V.W, V.H); gx.clip();
  if (G.scene && G.scene.draw) G.scene.draw(gx);
  cineDraw(gx); trDraw(gx);
  if (G.showFps) { gx.fillStyle = "#fff"; gx.font = "14px 'Patrick Hand'"; gx.textAlign = "left"; gx.fillText(G.fps + " fps", V.sl + 8, V.H - 8); }
  gx.restore();
}
/* ----- Titelbild ----- */
let titleTaps = [];
SCENES.title = {
  enter() { scrapsInit(26, V.W, V.H); music("hub"); cineBars(false); CINE.fadeT = 0; CAM.x = V.W / 2; CAM.y = V.H / 2; CAM.z = 1; this.t = 0; titleMenu(); },
  leave() { $("ui").querySelectorAll(".tmenu").forEach(e => e.remove()); },
  update(dt) { this.t += dt; scrapsUpdate(dt); if (IN.tap) { const p = IN.tap; IN.tap = null; if (Math.abs(p.x - V.W / 2) < 190 && p.y > 40 && p.y < 170) { const now = G.t; titleTaps = titleTaps.filter(t => now - t < 3); titleTaps.push(now); if (titleTaps.length >= 5) { titleTaps = []; adminToggle(); } } } },
  draw(c) {
    const g = c.createLinearGradient(0, 0, 0, V.H); g.addColorStop(0, "#1d2742"); g.addColorStop(1, "#2b3a66"); c.fillStyle = g; c.fillRect(0, 0, V.W, V.H);
    scrapsDraw(c, 0, 0, .55, 0, .6);
    // Lichtschein hinter dem Helden
    c.save(); c.globalCompositeOperation = "lighter"; blit(c, glowSpr("#ffb64a"), V.W / 2, V.H * .62, { s: 3.2, a: .35 + Math.sin(this.t * 2) * .05 }); c.restore();
    const ty = 100 + Math.sin(this.t * 1.5) * 3; c.save(); c.translate(V.W / 2, ty); c.rotate(-.02); c.textAlign = "center"; c.font = "92px 'Caveat Brush'"; c.lineJoin = "round"; c.lineWidth = 14; c.strokeStyle = INK; c.strokeText("Papierhelden", 3, 5); c.fillStyle = "#0b0e1a"; c.fillText("Papierhelden", 4, 6); c.strokeStyle = INK; c.strokeText("Papierhelden", 0, 0); c.fillStyle = P1; c.fillText("Papierhelden", 0, 0);
    c.strokeStyle = BAD; c.lineWidth = 5; c.lineCap = "round"; c.beginPath(); c.moveTo(-215, 22); c.quadraticCurveTo(-60, 12, 20, 26); c.quadraticCurveTo(110, 36, 214, 18); c.stroke(); c.restore();
    c.font = "21px 'Patrick Hand'"; c.textAlign = "center"; c.fillStyle = P2; c.fillText("Eine zerknüllte Seite. Eine Geschichte, die nicht enden wollte.", V.W / 2, 150);
    scrapsDraw(c, 0, 0, .3, .6, 2);
    drawHeroFig(c, { x: V.W / 2, y: V.H * .6 + Math.abs(Math.sin(this.t * 3)) * -4, dir: Math.PI / 2, moving: false, t: this.t, paper: PAPERS[SV.paper] || PAPERS.creme, scarf: ACC });
    drawVignette(c, .9);
  },
};
function titleMenu() {
  const ui = $("ui"); ui.querySelectorAll(".tmenu").forEach(e => e.remove());
  const d = document.createElement("div"); d.className = "tmenu row"; d.style.cssText = `position:absolute;left:50%;transform:translateX(-50%);bottom:${Math.max(14, V.sb * V.sc / V.dpr + 14)}px;gap:12px`;
  const mk = (t, f, big) => { const b = document.createElement("button"); b.className = "btn" + (big ? " big" : ""); b.innerHTML = t; b.onclick = () => { auInit(); sfx("click"); f(); }; d.appendChild(b); };
  if (hasSave()) mk("Weiter", () => { loadGame(); auVol("sfx", SV.sets.sfx); auVol("mus", SV.sets.mus); startGame(); }, true);
  mk(hasSave() ? "Neues Spiel" : "Neues Spiel", () => { if (hasSave() && !confirm("Der alte Spielstand wird überschrieben. Neu anfangen?")) return; newGameDialog(); }, !hasSave());
  mk("Code laden", () => codeDialog());
  ui.appendChild(d);
}
function newGameDialog() {
  let paper = "creme"; const w = winOpen(`<h2>Wer bist du?</h2><div class="body"><div class="col"><div class="dim">Du wachst als zerknüllte Seite auf. Wie heißt du?</div><input id="nm" class="txtin" maxlength="12" value="" placeholder="Name"><div class="dim">Welches Papier bist du?</div><div class="row wrap" id="sw"></div></div></div><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn" id="bx">Zurück</button><button class="btn big" id="bg">Los geht's</button></div>`, "narrow");
  w.style.width = "min(94vw,520px)";
  const sw = w.querySelector("#sw"); Object.keys(PAPERS).forEach(k => { const s = document.createElement("div"); s.className = "sw" + (k === paper ? " on" : ""); s.style.background = PAPERS[k]; s.title = PAPER_NAMES[k]; s.onclick = () => { paper = k; sw.querySelectorAll(".sw").forEach(e => e.classList.remove("on")); s.classList.add("on"); sfx("click"); }; sw.appendChild(s); });
  w.querySelector("#bx").onclick = () => { sfx("click"); winClose(); };
  w.querySelector("#bg").onclick = () => { const nm = (w.querySelector("#nm").value || "").replace(/[<>&"]/g, "").trim() || "Held"; sfx("click"); SV = defaultSave(); SV.name = nm; SV.paper = paper; if (window.starterGear) starterGear(); saveGame(); winClose(); startGame(true); };
}
function startGame(isNew) { SV.sets = SV.sets || { sfx: .8, mus: .6 }; transition(() => { setScene(SCENES.hub ? "hub" : "arena", { isNew }); }); }
function codeDialog() {
  const w = winOpen(`<h2>Code laden</h2><div class="body"><div class="dim">Füge hier deinen Exportcode ein:</div><textarea class="code" id="cd"></textarea></div><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn" id="bx">Zurück</button><button class="btn big" id="bg">Laden</button></div>`);
  w.style.width = "min(94vw,560px)"; w.querySelector("#bx").onclick = () => { sfx("click"); winClose(); };
  w.querySelector("#bg").onclick = async () => { const ok = await importCode(w.querySelector("#cd").value); if (ok) { winClose(); sfx("buy"); toast("Spielstand geladen"); titleMenu(); } else { sfx("deny"); toast("Der Code passt nicht."); } };
}
/* ----- Start ----- */
function exportCode() { return "PH0:" + btoa(unescape(encodeURIComponent(JSON.stringify(SV)))); }
async function importCode(s) { try { s = (s || "").trim(); if (!s.startsWith("PH0:")) return false; const o = JSON.parse(decodeURIComponent(escape(atob(s.slice(4))))); if (!o || o.v !== 1) return false; SV = Object.assign(defaultSave(), o); saveGame(); return true; } catch (e) { return false; } }
async function boot() {
  resize(); try { await Promise.all([document.fonts.load("40px 'Caveat Brush'"), document.fonts.load("20px 'Patrick Hand'")]); } catch (e) {}
  if (hasSave()) loadGame(); layoutControls(); setScene("title"); requestAnimationFrame(frame);
}
boot();
