/* ===== Hub: Papierdorf mit Händlerin, Schmied, dem alten Index und dem Tintentor ===== */
defTpl("hub", "hub", 44, 26, B => {
  B.fill(5, 2, 10, 4, "#"); B.fill(33, 2, 38, 4, "#"); B.fill(18, 1, 25, 3, "#"); B.fill(21, 1, 22, 3, ".");
  for (const [x, y] of [[14, 8], [29, 8], [8, 14], [35, 14], [14, 20], [29, 20], [26, 12], [18, 12]]) B.set(x, y, "o");
  B.pts("b", [[3, 7], [12, 5], [31, 5], [40, 7], [4, 22], [39, 22], [20, 21], [24, 21]]);
});
const HUB_NPC = [
  { id: "marga", n: "Marga Makulatur", sub: "Händlerin", x: 7.5 * TS, y: 6.2 * TS },
  { id: "bruno", n: "Bruno Bleisatz", sub: "Schmied", x: 35.5 * TS, y: 6.2 * TS },
  { id: "index", n: "Der alte Index", sub: "Erzähler", x: 15.5 * TS, y: 15 * TS },
  { id: "tor", n: "Tintentor", sub: "Zu den Dungeons", x: 22 * TS, y: 4.6 * TS, gate: true },
];
function npcSpr(id, fr) {
  return spr("npc|" + id + "|" + fr, 80, 90, c0 => {
    const c = sketchCtx(c0, strSeed("npc" + id), 28); c0.translate(0, 8); c.lineWidth = 3; const b = fr ? 1.5 : 0;
    const body = (col, w, h) => { c.beginPath(); c.moveTo(-w, h * .3); c.quadraticCurveTo(-w * 1.1, -h * .5, 0, -h * .7 - b); c.quadraticCurveTo(w * 1.1, -h * .5, w, h * .3); c.lineTo(w * .8, h * .65); c.lineTo(-w * .8, h * .65); c.closePath(); c0.fillStyle = col; c.fill(); c.stroke(); };
    const head = (y, r, col) => { c.beginPath(); c.arc(0, y - b, r, 0, TAU); c0.fillStyle = col || "#f4e6c4"; c.fill(); c.stroke(); c0.fillStyle = INK; for (const d of [-1, 1]) { c0.beginPath(); c0.arc(d * r * .38, y - b, 2.2, 0, TAU); c0.fill(); } c.lineWidth = 2; c.beginPath(); c.arc(0, y + r * .3 - b, r * .3, .2, PI - .2); c.stroke(); c.lineWidth = 3; };
    if (id === "marga") { body("#c97d12", 20, 52); c0.fillStyle = "#f6efd9"; c.beginPath(); c.rect(-12, -2, 24, 22); c.fill(); c.stroke(); head(-30, 13); c0.fillStyle = "#b8473a"; c.beginPath(); c.moveTo(-15, -36 - b); c.quadraticCurveTo(0, -56 - b, 15, -36 - b); c.closePath(); c.fill(); c.stroke(); c0.fillStyle = "#b9803a"; c.beginPath(); c.ellipse(24, 6, 10, 13, .2, 0, TAU); c.fill(); c.stroke(); }
    else if (id === "bruno") { body("#6a7388", 24, 52); c0.fillStyle = "#8a5a34"; c.beginPath(); c.rect(-15, -4, 30, 26); c.fill(); c.stroke(); head(-31, 14, "#e9d2a8"); c0.fillStyle = "#1d2742"; c.beginPath(); c.rect(-15, -43 - b, 30, 7); c.fill(); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(26, -2); c.lineTo(30, -26); c.stroke(); c0.fillStyle = "#9aa3b2"; c.beginPath(); c.rect(22, -34, 16, 10); c.fill(); c.stroke(); }
    else if (id === "index") { body("#c4a46a", 15, 64); head(-38, 12); c.lineWidth = 2.4; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 5, -38 - b, 5, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-1, -38 - b); c.lineTo(1, -38 - b); c.stroke(); c0.fillStyle = "#2b7a86"; c.lineWidth = 3; c.beginPath(); c.rect(12, -8, 16, 20); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-20, -6); c.lineTo(-30, -30); c.stroke(); c0.fillStyle = "#f6efd9"; c.beginPath(); c.moveTo(-30, -30); c.lineTo(-38, -44); c.lineTo(-24, -38); c.closePath(); c.fill(); c.stroke(); }
  }, SS);
}
function gateSpr() { return spr("tintentor", 130, 90, c0 => { const c = sketchCtx(c0, strSeed("tor"), 40); c.lineWidth = 4; c.beginPath(); c.moveTo(-48, 40); c.lineTo(-48, -10); c.quadraticCurveTo(-48, -40, 0, -40); c.quadraticCurveTo(48, -40, 48, -10); c.lineTo(48, 40); c.closePath(); c0.fillStyle = "#14224f"; c.fill(); c.stroke(); c0.fillStyle = "#2a3a80"; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 18, 30, 10, 0, 0, TAU); c.fill(); c.stroke(); c.lineWidth = 3.6; c.beginPath(); c.moveTo(-48, 40); c.lineTo(-48, -10); c.moveTo(48, 40); c.lineTo(48, -10); c.stroke(); }, SS); }
/* Fortschritt für Erzählungen des Alten Index */
const storyStage = () => DUNGEONS.slice(0, 8).filter(d => SV.done[d.id]).length;
const INDEX_LINES = [
  ["Ah, ein neues Blatt. Zerknüllt, aber lesbar.", "Willkommen im Papierdorf. Wir sind alles, was von einem verworfenen Roman übrig ist.", "Der Rotstift streicht unsere Kapitel. Seine Streichungen kriechen durch die Bibliothek im Norden.", "Geh durch das Tintentor, Held. Der Lesesaal ist der erste Schritt."],
  ["Der Lesesaal ist frei. Das Kapitel steht wieder, wenn auch noch wacklig.", "Im Archiv der Randnotizen soll ein Korrekturgolem hausen. Er liest nur, was er löschen kann."],
  ["Du riechst nach Staub und Tinte. Das steht dir.", "Manche Seiten erinnern sich beim Sieg an etwas. An eine Hand, die schrieb."],
  ["Der Autor schrieb mit Liebe. Ich war sein Inhaltsverzeichnis, ich weiß das."],
  ["Der Lektor ist gefallen. Dahinter liegt das Tintenmeer, dort sind die Kapitel nie trocken geworden."],
  ["Das Meer ist wild. Aber auch dort wurde einmal geschrieben."],
  ["Du bist näher an der Wahrheit, als dir lieb ist. Bleib tapfer."],
  ["Ein Strudel hat dich ausgespuckt? Gut. Der Rotstift wartet am Ende von allem."],
  ["Das Ende ist geschrieben, aber die Tiefe hört nie auf. Wer will, steigt weiter hinab."],
];
const MARGA_LINES = ["Ein Blatt Papier ist wertlos, bis jemand drauf schreibt. Du bist wertvoller, als du denkst!", "Frisch gedruckt, gut gebunden, alles Bestes aus gestrichenen Kapiteln.", "Ich nehme alles: Waffen, Rüstung, Artefakte. Nur keine Tintenflecken."];
const BRUNO_LINES = ["Aus Papier wird Stahl, wenn man es oft genug faltet.", "Bring mir deine Sachen, ich mach sie stärker.", "Verzaubern? Das kostet Punkte, nicht nur Taler."];
SCENES.hub = {
  enter(arg) {
    calcStats(); const th = THEMES[2]; this.room = buildRoom("hub", { theme: 2, seed: 4242, doors: {} }); const room = this.room;
    const sp = (arg && arg.fromDungeon) ? { x: 22 * TS, y: 7 * TS } : { x: 22 * TS, y: 14 * TS }; plReset(sp.x, sp.y); plUnstuck(room); PL.hp = PL.max; btReset(room, 1, 0); BT.active = false; ADM && 0;
    CAM.x = PL.x; CAM.y = PL.y; CAM.z = 1.2; IN.show = true; music("hub"); scrapsInit(26, V.W, V.H); this.t = 0; this.near = null; DG.def = null; saveGame();
    if (arg && arg.isNew) setTimeout(() => this.firstTalk(), 700);
  },
  async firstTalk() { const n = HUB_NPC[2]; await say(n.n, INDEX_LINES[0]); SV.flags.met = 1; saveGame(); },
  update(dt) {
    this.t += dt; scrapsUpdate(dt); CAM.z = approach(CAM.z, 1, dt * .5); if (G.talk) return;
    plUpdate(dt, this.room, { attack: () => this.interact() }); camFollow(PL.x, PL.y, { w: this.room.w * TS, h: this.room.h * TS }, dt); fxUpdate(dt);
    this.near = null; let bd = 52; for (const n of HUB_NPC) { const d = dist(PL.x, PL.y, n.x, n.y); if (d < bd) { bd = d; this.near = n; } }
    if (wasPressed("menu")) this.menu();
  },
  interact() { if (this.near && wasPressed("atk")) { const n = this.near; sfx("click"); if (n.id === "marga") this.marga(); else if (n.id === "bruno") this.bruno(); else if (n.id === "index") this.index(); else this.gate(); } },
  async marga() { const c = await dlg("Marga Makulatur", pick(MARGA_LINES), ["Handeln", "Tschüss"]); if (c === 0) openShop(); },
  async bruno() { const c = await dlg("Bruno Bleisatz", pick(BRUNO_LINES), ["Schmieden", "Tschüss"]); if (c === 0) openInventory("smith"); },
  async index() { const s = Math.min(storyStage(), INDEX_LINES.length - 1); await say("Der alte Index", INDEX_LINES[s]); },
  gate() { openGate(); },
  menu() {
    sfx("page"); const w = winOpen(`<h2><span>Pause</span><span class="sp"></span></h2><div class="body" style="display:flex;flex-direction:column;gap:8px;align-items:stretch"><button class="btn big" id="r">Weiter</button><button class="btn big" id="b">${gi("bag", INK)} Rucksack</button><button class="btn" id="o">Einstellungen</button><button class="btn" id="c">Spielstand-Code</button><button class="btn" id="m">Zum Titel</button></div>`); w.style.width = "min(70vw,340px)";
    w.querySelector("#r").onclick = () => { sfx("click"); winClose(); }; w.querySelector("#b").onclick = () => { sfx("click"); openInventory("bag"); }; w.querySelector("#o").onclick = () => { sfx("click"); openSettings(); }; w.querySelector("#c").onclick = () => { sfx("click"); openCodeOut(); };
    w.querySelector("#m").onclick = () => { sfx("click"); winClose(); saveGame(); transition(() => setScene("title")); };
  },
  draw(c) {
    const room = this.room, th = THEMES[2]; c.fillStyle = th.bgCol; c.fillRect(0, 0, V.W, V.H); scrapsDraw(c, CAM.x, CAM.y, .5, 0, .6);
    camBegin(c); drawRoomBG(c, room); drawTorchSprites(c, room, G.t); this.decor(c);
    const L = HUB_NPC.filter(n => !n.gate).map(n => [n.y, () => { blit(c, shadowSpr(), n.x, n.y + 24, { s: 1.1 }); blit(c, npcSpr(n.id, Math.floor(this.t * 1.6) % 2), n.x, n.y); }]); L.push([PL.y, () => { drawPlayer(c); }]); BT.props.forEach(p => L.push([p.y, () => propDraw(c, p)])); L.sort((a, b) => a[0] - b[0]).forEach(x => x[1]()); fxDraw(c);
    if (this.near) { const n = this.near; c.save(); c.font = "20px 'Caveat Brush'"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = P1; const y = n.y - (n.gate ? 40 : 48); c.strokeText(n.n, n.x, y); c.fillText(n.n, n.x, y); c.font = "14px 'Patrick Hand'"; c.strokeText(n.sub, n.x, y + 14); c.fillText(n.sub, n.x, y + 14); c.restore(); }
    drawTorches(c, room, G.t); camEnd(c); drawLighting(c, th.dark, [{ x: V.W / 2, y: V.H / 2, r: 700 }]); drawVignette(c, .5);
    drawControls(c, { btns: { atk: { glyph: this.near ? "speech" : "speech", col: this.near ? "#ffd45a" : P2, dim: !this.near }, dodge: { glyph: "roll", col: P2, cd: PL.rollCd, cdMax: ST.rollCd } } });
  },
  decor(c) {
    const sign = (x, y, t) => { c.save(); c.font = "26px 'Caveat Brush'"; c.textAlign = "center"; c.lineWidth = 5; c.strokeStyle = INK; c.fillStyle = "#ffd45a"; c.strokeText(t, x, y); c.fillText(t, x, y); c.restore(); };
    sign(7.5 * TS + 16, 2.8 * TS, "Händlerin"); sign(35.5 * TS + 16, 2.8 * TS, "Schmiede"); blit(c, gateSpr(), 22 * TS, 2.2 * TS); sign(22 * TS, .75 * TS, "Tintentor");
    c.save(); c.globalAlpha = .55 + Math.sin(this.t * 2) * .1; c.strokeStyle = "#7bc8e0"; c.lineWidth = 2.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(22 * TS, 3.6 * TS, 16 - i * 4, 5 - i, this.t * (i % 2 ? 1 : -1), 0, TAU); c.stroke(); } c.restore();
    c.save(); c.fillStyle = "#6e4425"; c.strokeStyle = INK; c.lineWidth = 3; c.fillRect(34.2 * TS, 7.2 * TS, 38, 14); c.strokeRect(34.2 * TS, 7.2 * TS, 38, 14); c.restore();
  },
};
/* ----- Dungeon-Auswahl ----- */
function dgUnlocked(d) { if (d.endless) return !!SV.done[7]; return d.id === 0 || !!SV.done[d.id - 1]; }
function openGate() {
  let sel = Math.min(DUNGEONS.findIndex(d => dgUnlocked(d) && !SV.done[d.id]) < 0 ? 8 : DUNGEONS.findIndex(d => dgUnlocked(d) && !SV.done[d.id]), 8), tier = Math.min(SV.stufe || 0, SV.stufeMax || 0);
  const w = winOpen(`<h2>${gi("book" in {} ? "page" : "page", ACC)}<span>Tintentor</span><span class="sp"></span><button class="mini" id="x">${gi("cross", INK)}</button></h2><div class="body" id="bd" style="display:flex;gap:10px"></div>`); w.style.width = "min(96vw,780px)"; w.querySelector("#x").onclick = () => { sfx("click"); winClose(); };
  const render = () => {
    const d = DUNGEONS[sel], K = d.K0 + tier * 2, run = SV.run;
    let l = `<div style="flex:1;min-width:0;max-height:300px;overflow-y:auto">`; DUNGEONS.forEach((q, i) => { const ok = dgUnlocked(q); l += `<button class="btn" data-i="${i}" style="display:flex;width:100%;justify-content:space-between;margin-bottom:4px;${i === sel ? "background:var(--marker)" : ""}" ${ok ? "" : "disabled"}><span>${ok ? "" : gi("lock", MUTED) + " "}${esc(q.ch)}: ${esc(q.n)}</span><span>${SV.done[q.id] ? gi("check", GOOD) : ""}</span></button>`; }); l += `</div>`;
    let r = `<div style="width:260px;flex:none"><div class="info"><b>${esc(d.n)}</b><div class="dim">${esc(d.ch)} · ${d.area ? "Tintenmeer" : "Bibliothek"} · ${d.rooms} Räume</div><div class="st"><span>Kraftstufe</span><span>${K}</span></div>${d.boss ? `<div class="st"><span>Endgegner</span><span>${gi("skull", BAD)}</span></div>` : ""}</div>`;
    r += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><span>Stufe</span><button class="mini" id="tm">${gi("minus", INK)}</button><b style="font:400 26px var(--f-display);min-width:30px;text-align:center">${tier}</b><button class="mini" id="tp">${gi("plus", INK)}</button><span class="dim">bis ${SV.stufeMax || 0}</span></div>`;
    r += `<button class="btn big" id="go" style="width:100%" ${dgUnlocked(d) ? "" : "disabled"}>Betreten</button>`; if (run) r += `<button class="btn" id="rs" style="width:100%;margin-top:6px">Lauf fortsetzen: ${esc(DUNGEONS[run.did].n)}</button>`; r += `</div>`;
    const b = w.querySelector("#bd"); b.innerHTML = l + r;
    b.querySelectorAll("[data-i]").forEach(e => e.onclick = () => { sfx("click"); sel = +e.dataset.i; render(); });
    b.querySelector("#tm").onclick = () => { if (tier > 0) { tier--; sfx("click"); render(); } }; b.querySelector("#tp").onclick = () => { if (tier < (SV.stufeMax || 0)) { tier++; sfx("click"); render(); } else sfx("deny"); };
    b.querySelector("#go").onclick = () => { SV.stufe = tier; SV.run = null; winClose(); startDungeon(d.id, tier, false); };
    const rs = b.querySelector("#rs"); if (rs) rs.onclick = () => { winClose(); startDungeon(SV.run.did, SV.run.tier, true); };
  };
  render();
}
/* ----- Händlerin: kaufen, verkaufen, zurückkaufen ----- */
function shopLvl() { let m = 1; for (const d of DUNGEONS) if (SV.done[d.id]) m = Math.max(m, d.K0 + (SV.done[d.id] - 1) * 2 + 1); return m + (SV.stufe || 0); }
function shopStock() {
  if (SV.shop && SV.shop.stock) return SV.shop; const L = shopLvl(), sl = ["melee", "ranged", "armor", "artifact", "artifact", "melee", "armor", "ranged"], st = [];
  sl.forEach(s => st.push(genItem(L + Math.floor(Math.random() * 2), pick([0, 0, 1, 1, 1, 2]), s))); SV.shop = { stock: st, back: (SV.shop && SV.shop.back) || [] }; return SV.shop;
}
function openShop() {
  let tab = "buy", sel = null; const w = winOpen(`<h2>${gi("coin", "#e9b73a")}<span>Marga Makulatur</span><span class="sp"></span><span class="dim" id="gd" style="font-size:19px"></span><button class="mini" id="x">${gi("cross", INK)}</button></h2><div class="tabs"><button class="tab" data-t="buy">Kaufen</button><button class="tab" data-t="sell">Verkaufen</button><button class="tab" data-t="back">Rückkauf</button></div><div class="body" id="bd" style="display:flex;gap:10px"></div>`, "inv");
  w.style.width = "min(96vw,780px)"; w.querySelector("#x").onclick = () => { sfx("click"); winClose(); }; w.querySelectorAll(".tab").forEach(t => t.onclick = () => { sfx("click"); tab = t.dataset.t; sel = null; render(); });
  const render = () => {
    const S = shopStock(), list = tab === "buy" ? S.stock : tab === "sell" ? SV.inv : S.back; if (sel && !list.find(x => x.id === sel.id)) sel = null;
    w.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.t === tab)); w.querySelector("#gd").innerHTML = `${gi("coin", "#e9b73a")} ${SV.gold}`;
    const price = it => tab === "buy" ? buyPrice(it) : sellPrice(it);
    let l = `<div class="sg" style="flex:1;max-height:270px;overflow-y:auto">${list.map(it => slotHtml(it, sel && sel.id === it.id ? "sel" : "")).join("") || `<div class="dim">Nichts da.</div>`}</div>`;
    let r = `<div style="width:290px;flex:none"><div class="info" style="min-height:120px;max-height:190px;overflow-y:auto">${itemTip(sel)}${sel ? cmpHtml(sel) : ""}</div><div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">`;
    if (sel) r += `<button class="btn" id="act" ${tab !== "sell" && SV.gold < price(sel) ? "disabled" : ""}>${tab === "sell" ? "Verkaufen" : tab === "buy" ? "Kaufen" : "Zurückkaufen"} ${gi("coin", "#e9b73a")} ${price(sel)}</button>`;
    if (tab === "sell") r += `<button class="btn warn" id="all">Alle gewöhnlichen</button>`; r += `</div></div>`;
    const b = w.querySelector("#bd"); b.innerHTML = l + r; b.querySelectorAll(".slot[data-id]").forEach(e => e.onclick = () => { sfx("click"); sel = list.find(x => x.id === e.dataset.id); render(); });
    const a = b.querySelector("#act"); if (a) a.onclick = () => {
      if (tab === "buy" || tab === "back") { if (SV.inv.length >= BAG_MAX) { toast("Der Rucksack ist voll."); sfx("deny"); return; } SV.gold -= price(sel); SV.inv.push(sel); list.splice(list.indexOf(sel), 1); sfx("buy"); }
      else { SV.gold += price(sel); SV.inv = SV.inv.filter(x => x.id !== sel.id); S.back.unshift(sel); if (S.back.length > 12) S.back.pop(); sfx("coin"); } sel = null; saveGame(); render();
    };
    const al = b.querySelector("#all"); if (al) al.onclick = () => { const c = SV.inv.filter(x => x.rar === 0); if (!c.length) { sfx("deny"); return; } c.forEach(x => { SV.gold += sellPrice(x); S.back.unshift(x); }); S.back = S.back.slice(0, 12); SV.inv = SV.inv.filter(x => x.rar !== 0); sfx("coin"); saveGame(); render(); };
  };
  render();
}
function openSettings() {
  const s = SV.sets = SV.sets || { sfx: .8, mus: .6 }; const w = winOpen(`<h2><span>Einstellungen</span><span class="sp"></span><button class="mini" id="x">${gi("cross", INK)}</button></h2><div class="body"><div class="opt">Effekte <input type="range" id="s1" min="0" max="1" step=".05" value="${s.sfx}"></div><div class="opt">Musik <input type="range" id="s2" min="0" max="1" step=".05" value="${s.mus}"></div></div>`); w.style.width = "min(80vw,380px)";
  w.querySelector("#x").onclick = () => { saveGame(); winClose(); }; w.querySelector("#s1").oninput = e => { s.sfx = +e.target.value; auVol("sfx", s.sfx); }; w.querySelector("#s2").oninput = e => { s.mus = +e.target.value; auVol("mus", s.mus); };
}
function openCodeOut() {
  const w = winOpen(`<h2><span>Spielstand-Code</span><span class="sp"></span><button class="mini" id="x">${gi("cross", INK)}</button></h2><div class="body"><div class="dim">Kopiere diesen Text, um deinen Fortschritt woanders einzufügen.</div><textarea class="txtin" id="cd" rows="5" style="width:100%" readonly>${exportCode()}</textarea><button class="btn" id="cp" style="margin-top:6px">Kopieren</button></div>`); w.style.width = "min(90vw,520px)";
  w.querySelector("#x").onclick = () => winClose(); w.querySelector("#cp").onclick = () => { try { navigator.clipboard.writeText(w.querySelector("#cd").value); toast("Kopiert"); } catch (e) { w.querySelector("#cd").select(); } };
}
