/* ===== Ausrüstung: Seltenheiten, Waffen, Rüstungen, Artefakte, Zusatzwerte, Verzauberungen, Einzigartige ===== */
const RAR = [
  { n: "Gewöhnlich", col: "#5c6684", mul: 1.0, aff: 0, w: 62 }, { n: "Selten", col: "#2b7a86", mul: 1.1, aff: 1, w: 27 },
  { n: "Episch", col: "#7a4fb0", mul: 1.22, aff: 2, w: 9.5 }, { n: "Legendär", col: "#c97d12", mul: 1.38, aff: 3, w: 1.5 }, { n: "Einzigartig", col: "#b8473a", mul: 1.5, aff: 3, w: 0 },
];
const pw = L => Math.pow(1.09, Math.max(0, L - 1));   // Wachstum je Kraftstufe
/* Nahkampf: kind slash/thrust/slam/dual; spd = Angriffe pro Sekunde */
const MELEE = {
  feder: { n: "Federkiel-Schwert", kind: "slash", range: 52, arc: 2.1, dmg: 1.0, spd: 2.3, kb: 90, d: "Ausgewogen. Drei Hiebe, der dritte trifft härter." },
  schere: { n: "Zwillingsschere", kind: "dual", range: 44, arc: 2.5, dmg: .62, spd: 2.0, kb: 60, d: "Zwei schnelle Schnitte pro Angriff." },
  lineal: { n: "Zeichenlineal-Speer", kind: "thrust", range: 88, arc: .42, dmg: 1.12, spd: 1.8, kb: 120, d: "Große Reichweite, trifft alles in einer Linie." },
  hefter: { n: "Riesenhefter", kind: "slam", range: 62, arc: 6.3, dmg: 1.95, spd: .95, kb: 260, d: "Langsam, aber wuchtig: trifft im Kreis." },
  brief: { n: "Brieföffner", kind: "slash", range: 40, arc: 1.6, dmg: .55, spd: 4.2, kb: 40, d: "Sehr schnell und leicht." },
  radier: { n: "Radiergummi-Keule", kind: "slash", range: 58, arc: 2.5, dmg: 1.5, spd: 1.35, kb: 200, d: "Schwer. Schleudert Gegner weg." },
  klaue: { n: "Tintenklaue", kind: "dual", range: 46, arc: 2.6, dmg: .7, spd: 2.9, kb: 55, d: "Reißende Doppelhiebe." },
};
const RANGED = {
  bogen: { n: "Papierbogen", pr: "arrow", spd: 520, dmg: 1.0, rate: 1.7, cnt: 1, spread: 0, pierce: 1, d: "Ein sauberer Pfeil." },
  schleuder: { n: "Gummiband-Schleuder", pr: "stone", spd: 440, dmg: .82, rate: 2.3, cnt: 1, spread: .05, pierce: 0, d: "Schnelle Schüsse." },
  pistole: { n: "Tintenpistole", pr: "ink", spd: 420, dmg: .38, rate: 4.6, cnt: 1, spread: .12, pierce: 0, d: "Spritzt in Serie." },
  flieger: { n: "Papierflieger-Werfer", pr: "plane", spd: 330, dmg: .5, rate: 1.1, cnt: 3, spread: .28, pierce: 0, hom: 1, d: "Drei Flieger, die leicht lenken." },
  armbrust: { n: "Büroklammer-Armbrust", pr: "bolt", spd: 640, dmg: 2.1, rate: .9, cnt: 1, spread: 0, pierce: 3, d: "Langsam, durchbohrt mehrere Ziele." },
  sterne: { n: "Origami-Sterne", pr: "star", spd: 380, dmg: .72, rate: 1.9, cnt: 2, spread: .2, pierce: 1, d: "Zwei Wurfsterne, prallen nicht ab." },
};
const ARMOR = {
  zeitung: { n: "Zeitungsmantel", hp: 1.0, prot: 4, col: "#b8b4a4", d: "Leicht und billig." },
  karton: { n: "Kartonpanzer", hp: 1.25, prot: 8, move: -4, col: "#b9803a", d: "Robust, aber sperrig." },
  pergament: { n: "Pergamentrobe", hp: .9, prot: 3, dmg: 6, col: "#e6d3a6", d: "Stärkt deine Schläge." },
  buchdeckel: { n: "Buchdeckelpanzer", hp: 1.5, prot: 12, move: -8, col: "#8a5a34", d: "Schwerer Schutz." },
  notizzettel: { n: "Notizzettelweste", hp: .85, prot: 2, move: 6, dodge: 10, col: "#f1d84a", d: "Flink und wendig." },
  einband: { n: "Ledereinband", hp: 1.15, prot: 7, col: "#7a4fb0", d: "Solide Mitte." },
};
/* Artefakte: aktive Fähigkeiten mit Abklingzeit (cd in Sekunden) */
const ARTS = {
  tinte: { n: "Tintenfass-Wurf", cd: 9, d: "Wirft ein Tintenfass: Pfütze, die Gegner verlangsamt und verätzt." },
  radierer: { n: "Radierwelle", cd: 11, d: "Druckwelle um dich: Schaden und Rückstoß." },
  lesezeichen: { n: "Lesezeichen-Sprung", cd: 7, d: "Schneller Sprung nach vorn, unverwundbar." },
  klammer: { n: "Büroklammer-Kette", cd: 10, d: "Blitzkette springt auf bis zu fünf Gegner." },
  salve: { n: "Papierflieger-Salve", cd: 8, d: "Fächer aus sieben Fliegern." },
  tintenschild: { n: "Tintenschild", cd: 16, d: "Schild, das Schaden aufsaugt." },
  federkiel: { n: "Federkiel-Segen", cd: 22, d: "Heilt einen Teil deines Lebens." },
  lupe: { n: "Lupe der Zeit", cd: 18, d: "Verlangsamt alle Gegner im Feld." },
  falle: { n: "Fußnoten-Falle", cd: 12, d: "Legt eine Mine, die bei Annäherung explodiert." },
  riss: { n: "Seitenriss", cd: 9, d: "Breiter Schnitt nach vorn mit hohem Schaden." },
};
/* Zusatzwerte: lo..hi je Wert (wird mit der Seltenheit angehoben) */
const AFX = {
  dmg: { n: "Schaden", u: "%", lo: 4, hi: 10, s: ["melee", "ranged", "artifact", "armor"] }, crit: { n: "Kritchance", u: "%", lo: 3, hi: 8, s: ["melee", "ranged"] },
  critd: { n: "Krit-Schaden", u: "%", lo: 12, hi: 30, s: ["melee", "ranged"] }, spd: { n: "Angriffstempo", u: "%", lo: 4, hi: 10, s: ["melee", "ranged"] },
  move: { n: "Lauftempo", u: "%", lo: 3, hi: 7, s: ["armor", "artifact"] }, hp: { n: "Leben", u: "%", lo: 6, hi: 14, s: ["armor", "artifact"] },
  prot: { n: "Schutz", u: "%", lo: 2, hi: 5, s: ["armor", "artifact"] }, cd: { n: "Abklingzeit", u: "%", lo: 5, hi: 12, s: ["artifact", "armor"] },
  luck: { n: "Beuteglück", u: "%", lo: 5, hi: 12, s: ["melee", "ranged", "armor", "artifact"] }, regen: { n: "Regeneration", u: "/s", lo: .4, hi: 1, s: ["armor", "artifact"] },
  life: { n: "Lebensraub", u: "%", lo: 1, hi: 2.6, s: ["melee", "ranged"] }, dodge: { n: "Rollenschutz", u: "%", lo: 5, hi: 11, s: ["armor", "artifact"] },
};
const ENCH = {
  schaerfe: { n: "Schärfe", s: ["melee", "ranged"], v: [8, 16, 26], u: "% Schaden" }, eile: { n: "Eile", s: ["melee", "ranged"], v: [8, 15, 24], u: "% Angriffstempo" },
  treffer: { n: "Treffsicher", s: ["melee", "ranged"], v: [4, 8, 14], u: "% Kritchance" }, wucht: { n: "Wucht", s: ["melee"], v: [30, 60, 100], u: "% Rückstoß" },
  feuer: { n: "Tintenbrand", s: ["melee", "ranged"], v: [25, 50, 85], u: "% Brandschaden" }, frost: { n: "Frost", s: ["melee", "ranged"], v: [15, 28, 45], u: "% Verlangsamen" },
  blitz: { n: "Kettenblitz", s: ["melee", "ranged"], v: [15, 28, 45], u: "% Kettenchance" }, vampir: { n: "Aussauger", s: ["melee", "ranged"], v: [2, 4, 7], u: "% Lebensraub" },
  explosion: { n: "Explosion", s: ["melee", "ranged"], v: [25, 45, 70], u: "% Todesexplosion" }, glueck: { n: "Glück", s: ["melee", "ranged", "armor", "artifact"], v: [8, 16, 26], u: "% Beuteglück" },
  zaeh: { n: "Zähigkeit", s: ["armor"], v: [8, 15, 25], u: "% Leben" }, stachel: { n: "Stachel", s: ["armor"], v: [10, 20, 35], u: "% Rückschaden" },
  schutz: { n: "Schutzschicht", s: ["armor"], v: [3, 6, 10], u: "% Schutz" }, gewandt: { n: "Gewandtheit", s: ["armor"], v: [8, 15, 25], u: "% Rollen-Abklingzeit" },
  segen: { n: "Segen", s: ["armor", "artifact"], v: [5, 10, 18], u: "% Heilung nach Raum" }, echo: { n: "Echo", s: ["artifact"], v: [8, 15, 25], u: "% Abklingzeit" },
  macht: { n: "Machtausbruch", s: ["artifact"], v: [10, 20, 35], u: "% Stärke" },
};
const ENCH_COST = [1, 2, 4];
/* Einzigartige: feste Eigenschaften und eine Besonderheit */
const UNIQ = {
  feder: { slot: "melee", base: "feder", n: "Ewige Feder", aff: [["crit", 12], ["spd", 12], ["dmg", 10]], sp: "inktrail", t: "Jeder Hieb hinterlässt eine Tintenspur, die Gegner verätzt." },
  rotsplitter: { slot: "melee", base: "brief", n: "Rotstift-Splitter", aff: [["crit", 15], ["critd", 40], ["spd", 10]], sp: "execute", t: "Kritische Treffer streichen Gegner unter 20% Leben sofort aus." },
  erstausgabe: { slot: "armor", base: "buchdeckel", n: "Erstausgabe", aff: [["prot", 8], ["hp", 14], ["dodge", 8]], sp: "thorns", t: "Gegner, die dich treffen, erleiden 25% des Schadens zurück." },
  tintenherz: { slot: "armor", base: "einband", n: "Tintenherz", aff: [["regen", 1.6], ["hp", 18], ["life", 2]], sp: "regen", t: "Heilt dich nach jedem Raum zusätzlich um 10%." },
  letztekapitel: { slot: "ranged", base: "armbrust", n: "Das letzte Kapitel", aff: [["dmg", 14], ["crit", 10], ["spd", 8]], sp: "explode5", t: "Jeder fünfte Schuss explodiert." },
  manuskript: { slot: "ranged", base: "sterne", n: "Manuskript der Trauer", aff: [["dmg", 12], ["luck", 10], ["critd", 30]], sp: "bounce", t: "Sterne prallen zweimal von Wänden und Gegnern ab." },
  fussnote: { slot: "artifact", base: "klammer", n: "Die Fußnote", aff: [["cd", 18], ["dmg", 12], ["luck", 8]], sp: "cdr", t: "Alle deine Artefakte laden 25% schneller." },
  lesezeichenautor: { slot: "artifact", base: "lesezeichen", n: "Lesezeichen des Autors", aff: [["cd", 25], ["move", 6], ["dodge", 10]], sp: "shieldroll", t: "Nach jedem Sprung oder jeder Rolle erhältst du kurz ein Schutzschild." },
};
let _uid = 1; const newUid = () => (Date.now().toString(36) + (_uid++).toString(36) + Math.floor(Math.random() * 1e4).toString(36));
const SLOTN = { melee: "Nahkampf", ranged: "Fernwaffe", armor: "Rüstung", artifact: "Artefakt" };
function baseDef(it) { return it.slot === "melee" ? MELEE[it.base] : it.slot === "ranged" ? RANGED[it.base] : it.slot === "armor" ? ARMOR[it.base] : ARTS[it.base]; }
/* Zufälligen Gegenstand erzeugen. rar: 0..4 oder undefined (zufällig). luck: Prozent Beuteglück */
function genItem(ilvl, rar, slot, o) {
  o = o || {}; const r = o.rng || rnd; ilvl = Math.max(1, Math.round(ilvl));
  if (slot === undefined) slot = ["melee", "ranged", "armor", "artifact"][r.w([32, 22, 24, 22])];
  if (rar === undefined) { const luck = 1 + (o.luck || 0) / 100; rar = r.w([RAR[0].w, RAR[1].w * luck, RAR[2].w * luck * luck, RAR[3].w * luck * luck * luck]); if (o.minRar !== undefined) rar = Math.max(rar, o.minRar); }
  let it = { id: newUid(), slot, base: "", rar, ilvl, aff: [], ench: [null, null, null] };
  if (rar === 4) { const pool = Object.keys(UNIQ).filter(k => !slot || UNIQ[k].slot === slot); const u = UNIQ[r.pick(pool.length ? pool : Object.keys(UNIQ))]; it.slot = u.slot; it.base = u.base; it.uniq = Object.keys(UNIQ).find(k => UNIQ[k] === u); it.aff = u.aff.map(([k, v]) => ({ k, v })); return it; }
  const bases = Object.keys(slot === "melee" ? MELEE : slot === "ranged" ? RANGED : slot === "armor" ? ARMOR : ARTS); it.base = r.pick(bases);
  const keys = Object.keys(AFX).filter(k => AFX[k].s.includes(slot)); r.shuffle(keys);
  for (let i = 0; i < RAR[rar].aff && i < keys.length; i++) { const a = AFX[keys[i]]; let v = r.rng(a.lo, a.hi) * (1 + .12 * rar); v = a.u === "/s" ? Math.round(v * 10) / 10 : Math.round(v * 10) / 10; it.aff.push({ k: keys[i], v }); }
  return it;
}
function itemName(it) {
  if (it.uniq) return UNIQ[it.uniq].n; const b = baseDef(it); if (!b) return "?"; if (it.rar === 0) return b.n;
  const e = [["Kleine Zeile", "Schneller Satz", "Stiller Reim", "Frischer Strich"], ["Dunkles Kapitel", "Roter Absatz", "Tinten-Echo", "Letzter Vers"], ["Erster Entwurf", "Goldener Schnitt", "Wahre Fassung", "Ewiges Wort"]][it.rar - 1];
  return b.n + " „" + e[hashStr(it.id) % e.length] + "“";
}
const itemCol = it => RAR[it.rar].col;
/* Grundwert: Waffenschaden, Rüstungsleben, Artefaktstärke */
function itemBase(it) {
  const m = RAR[it.rar].mul, p = pw(it.ilvl), b = baseDef(it);
  if (it.slot === "melee") return 15 * p * m * b.dmg; if (it.slot === "ranged") return 15 * p * m * b.dmg; if (it.slot === "armor") return 62 * p * m * b.hp; return p * m;
}
function sellPrice(it) { return Math.max(1, Math.round((3 + it.ilvl * 1.5) * Math.pow(2.4, it.rar) * (1 + it.ench.filter(Boolean).length * .15))); }
const buyPrice = it => sellPrice(it) * 4 + 10;
const upgradeCost = it => Math.round(25 * Math.pow(1.17, it.ilvl) * (1 + it.rar * .5));
/* Werte-Summe aus Zusatzwerten und Verzauberungen */
function sumAff(it, k) { let v = 0; for (const a of it.aff) if (a.k === k) v += a.v; return v; }
function enchLv(it, id) { const i = it.ench.findIndex(e => e && e.id === id); return i < 0 ? 0 : it.ench[i].lv; }
function enchVal(it, id) { const l = enchLv(it, id); return l ? ENCH[id].v[l - 1] : 0; }
/* Gesamtwerte berechnen: ST füllen */
function calcStats() {
  const eq = SV.eq, items = ["melee", "ranged", "armor", "a0", "a1", "a2"].map(k => eq[k]).filter(Boolean);
  const arm = eq.armor, m = eq.melee, rg = eq.ranged, arts = [eq.a0, eq.a1, eq.a2];
  const g = k => items.reduce((s, it) => s + sumAff(it, k), 0), ge = id => items.reduce((s, it) => s + enchVal(it, id), 0);
  const ab = arm ? ARMOR[arm.base] : { hp: 0, prot: 0 };
  const hpPct = g("hp") + ge("zaeh"), prot = (arm ? ab.prot : 0) + g("prot") + ge("schutz");
  ST.max = Math.round(40 + (arm ? itemBase(arm) : 0) * (1 + hpPct / 100)); ST.prot = Math.min(75, prot) / 100;
  ST.move = 1 + ((arm ? ab.move || 0 : 0) + g("move")) / 100; ST.luck = g("luck") + ge("glueck"); ST.regen = g("regen");
  ST.dodge = ((arm ? ab.dodge || 0 : 0) + g("dodge")) / 100; ST.rollCd = Math.max(.3, .65 * (1 - (ST.dodge + ge("gewandt") / 100)));
  ST.cdr = Math.min(.6, (g("cd") + ge("echo")) / 100); ST.heal = ge("segen") / 100; ST.thorns = ge("stachel") / 100; ST.artPow = 1 + ge("macht") / 100;
  ST.sp = {}; items.forEach(it => { if (it.uniq) ST.sp[UNIQ[it.uniq].sp] = 1; }); if (ST.sp.thorns) ST.thorns += .25; if (ST.sp.cdr) ST.cdr = Math.min(.6, ST.cdr + .25); if (ST.sp.regen) ST.heal += .10; if (ST.sp.regen) ST.regen += 0;
  const armDmg = ((arm ? ab.dmg || 0 : 0) + [arm, ...arts].reduce((s2, it) => s2 + (it ? sumAff(it, "dmg") : 0), 0)) / 100;
  const wp = (it, defs) => { if (!it) return null; const d = defs[it.base], loc = k => sumAff(it, k) + enchVal(it, k); return {
    it, d, kind: d.kind, pr: d.pr, base: itemBase(it) * (1 + (sumAff(it, "dmg") + enchVal(it, "schaerfe")) / 100 + armDmg),
    spd: (d.rate || d.spd) * (1 + (sumAff(it, "spd") + enchVal(it, "eile")) / 100), crit: .05 + (sumAff(it, "crit") + enchVal(it, "treffer")) / 100, critd: .5 + sumAff(it, "critd") / 100,
    life: (sumAff(it, "life") + enchVal(it, "vampir")) / 100, kb: (d.kb || 0) * (1 + enchVal(it, "wucht") / 100), burn: enchVal(it, "feuer") / 100, frost: enchVal(it, "frost") / 100, chain: enchVal(it, "blitz") / 100, boom: enchVal(it, "explosion") / 100,
    range: d.range, arc: d.arc, dm: d.dmg, spdv: d.spd, cnt: d.cnt || 1, spread: d.spread || 0, pierce: d.pierce || 0, hom: d.hom || 0, pspd: d.spd };
  };
  ST.m = wp(m, MELEE); ST.r = wp(rg, RANGED); ST.arts = arts.map(a => a ? { it: a, d: ARTS[a.base], pot: itemBase(a) * ST.artPow * (1 + (sumAff(a, "dmg") + armDmg * 100) / 100), cd: ARTS[a.base].cd * (1 - ST.cdr) * (1 - sumAff(a, "cd") / 100 * 0) } : null);
  const ratio = PL.max > 0 ? PL.hp / PL.max : 1; PL.max = ST.max; PL.hp = clamp(Math.round(ST.max * ratio), 1, ST.max);
}
function armorColor() { const a = SV.eq && SV.eq.armor; return a ? ARMOR[a.base].col : "#2b7a86"; }
/* Ausrüstung: anlegen aus dem Rucksack */
function slotKey(it, idx) { return it.slot === "artifact" ? "a" + (idx === undefined ? firstFreeArt() : idx) : it.slot; }
function firstFreeArt() { for (let i = 0; i < 3; i++) if (!SV.eq["a" + i]) return i; return 0; }
function equipItem(it, idx) {
  const i = SV.inv.findIndex(x => x.id === it.id); if (i < 0) return; const key = slotKey(it, idx), old = SV.eq[key];
  SV.inv.splice(i, 1); if (old) SV.inv.push(old); SV.eq[key] = it; calcStats(); sfx("equip");
}
function unequip(key) { const it = SV.eq[key]; if (!it) return; if (SV.inv.length >= BAG_MAX) { toast("Der Rucksack ist voll."); return; } delete SV.eq[key]; SV.inv.push(it); calcStats(); sfx("click"); }
const BAG_MAX = 60;
function starterGear() {
  SV.inv = []; SV.eq = { melee: { id: newUid(), slot: "melee", base: "feder", rar: 0, ilvl: 1, aff: [], ench: [null, null, null] }, ranged: { id: newUid(), slot: "ranged", base: "bogen", rar: 0, ilvl: 1, aff: [], ench: [null, null, null] }, armor: { id: newUid(), slot: "armor", base: "zeitung", rar: 0, ilvl: 1, aff: [], ench: [null, null, null] }, a0: { id: newUid(), slot: "artifact", base: "radierer", rar: 0, ilvl: 1, aff: [], ench: [null, null, null] } };
  calcStats(); PL.hp = PL.max;
}
/* Beschreibung als HTML (für Info-Felder) */
function itemTip(it, cmp) {
  if (!it) return `<div class="dim">Nichts ausgewählt.</div>`; const b = baseDef(it), col = RAR[it.rar].col; let h = `<b style="color:${col}">${esc(itemName(it))}</b><div class="dim">${SLOTN[it.slot]} · ${RAR[it.rar].n} · Stufe ${it.ilvl}</div>`;
  if (it.slot === "melee" || it.slot === "ranged") h += `<div class="st"><span>Schaden</span><b style="font-size:20px">${Math.round(itemBase(it) * (1 + (sumAff(it, "dmg") + enchVal(it, "schaerfe")) / 100))}</b></div>`;
  else if (it.slot === "armor") h += `<div class="st"><span>Leben</span><b style="font-size:20px">+${Math.round(itemBase(it))}</b></div><div class="st"><span>Schutz</span><span>${b.prot}%</span></div>`;
  else h += `<div class="st"><span>Abklingzeit</span><span>${b.cd} s</span></div>`;
  h += `<div class="dim" style="margin:2px 0">${esc(b.d)}</div>`;
  it.aff.forEach(a => { const A = AFX[a.k]; h += `<div class="st"><span>${A.n}</span><span class="good">+${a.v}${A.u}</span></div>`; });
  if (it.uniq) h += `<div class="r4" style="margin-top:3px">${esc(UNIQ[it.uniq].t)}</div>`;
  const ens = it.ench.map((e, i) => e ? `<div class="st"><span>${gi("star", "#c97d12")} ${ENCH[e.id].n} ${["I", "II", "III"][e.lv - 1]}</span><span class="warm">${ENCH[e.id].v[e.lv - 1]}${ENCH[e.id].u}</span></div>` : `<div class="dim">${gi("ring", "#9aa3b2")} Verzauberung frei</div>`).join(""); h += ens;
  return h;
}
/* ----- Symbole der Gegenstände (als Bild für HTML, einmal gezeichnet) ----- */
const ICON_CACHE = {};
function itemIcon(it) {
  const key = it.slot + "|" + it.base + "|" + it.rar; if (ICON_CACHE[key]) return ICON_CACHE[key];
  const cv = document.createElement("canvas"); cv.width = cv.height = 96; const c0 = cv.getContext("2d"); c0.scale(2, 2); c0.translate(24, 24); c0.lineJoin = c0.lineCap = "round"; c0.strokeStyle = INK;
  try { ICONP[it.slot](c0, it.base, it.rar); } catch (e) { console.error("icon", e); }
  return ICON_CACHE[key] = cv.toDataURL("image/png");
}
const ICONP = {
  melee(c0, base) { const s = wpnSpr(base); c0.rotate(-.78); const k = base === "lineal" ? .52 : .7; c0.drawImage(s.cv, -s.w * k * .5 - 4, -s.h * k * .5, s.w * k, s.h * k); },
  ranged(c0, base) {
    const c = sketchCtx(c0, strSeed("ri" + base), 30); c.lineWidth = 3;
    switch (base) {
      case "bogen": c0.save(); c0.translate(-3, 0); c.beginPath(); c.moveTo(6, -17); c.quadraticCurveTo(22, 0, 6, 17); c0.strokeStyle = "#b9803a"; c0.lineWidth = 4; c.stroke(); c0.strokeStyle = INK; c0.lineWidth = 1.5; c.beginPath(); c.moveTo(6, -17); c.lineTo(6, 17); c.stroke(); c0.lineWidth = 2.6; c.beginPath(); c.moveTo(-14, 0); c.lineTo(16, 0); c.stroke(); c0.restore(); break;
      case "schleuder": c.beginPath(); c.moveTo(0, 16); c.lineTo(0, 0); c.lineTo(-10, -12); c.moveTo(0, 0); c.lineTo(10, -12); c0.lineWidth = 5; c0.strokeStyle = "#b9803a"; c.stroke(); c0.strokeStyle = "#b8473a"; c0.lineWidth = 2.4; c.beginPath(); c.moveTo(-10, -12); c.lineTo(10, -12); c.stroke(); break;
      case "pistole": c0.fillStyle = "#2a3a80"; c.beginPath(); c.rect(-16, -6, 26, 11); c.fill(); c.stroke(); c.beginPath(); c.rect(-12, 4, 8, 12); c.fill(); c.stroke(); c0.fillStyle = "#5a78c8"; c.beginPath(); c.ellipse(14, -1, 6, 4, 0, 0, TAU); c.fill(); c.stroke(); break;
      case "flieger": c0.fillStyle = P1; c.beginPath(); c.moveTo(-16, 4); c.lineTo(16, -8); c.lineTo(-4, 12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-16, 4); c.lineTo(-4, 4); c.lineTo(16, -8); c.stroke(); break;
      case "armbrust": c0.fillStyle = "#b9803a"; c.beginPath(); c.rect(-16, -3, 30, 7); c.fill(); c.stroke(); c0.strokeStyle = "#9aa3b2"; c0.lineWidth = 3.4; c.beginPath(); c.moveTo(-2, -16); c.quadraticCurveTo(10, 0, -2, 16); c.stroke(); c0.strokeStyle = INK; c0.lineWidth = 1.5; c.beginPath(); c.moveTo(-2, -16); c.lineTo(-2, 16); c.stroke(); break;
      default: c0.fillStyle = "#f1d84a"; for (let k = -1; k <= 1; k += 2) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = i % 2 ? 4 : 11; c[i ? "lineTo" : "moveTo"](k * 8 + Math.cos(a) * r, k * -5 + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
    }
  },
  armor(c0, base) { const c = sketchCtx(c0, strSeed("ai" + base), 30), col = ARMOR[base].col; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -14); c.lineTo(-6, -17); c.quadraticCurveTo(0, -9, 6, -17); c.lineTo(14, -14); c.lineTo(18, -4); c.lineTo(11, -1); c.lineTo(11, 17); c.lineTo(-11, 17); c.lineTo(-11, -1); c.lineTo(-18, -4); c.closePath(); c0.fillStyle = col; c.fill(); c.stroke(); c0.strokeStyle = "rgba(29,39,66,.45)"; c0.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 17); c.moveTo(-8, 4); c.lineTo(8, 4); c.stroke(); },
  artifact(c0, base) {
    const c = sketchCtx(c0, strSeed("ar" + base), 30); c.lineWidth = 3;
    switch (base) {
      case "tinte": c0.fillStyle = "#2a3a80"; c.beginPath(); c.moveTo(-10, -4); c.lineTo(-6, -12); c.lineTo(6, -12); c.lineTo(10, -4); c.lineTo(14, 14); c.lineTo(-14, 14); c.closePath(); c.fill(); c.stroke(); c0.fillStyle = "#e9edff"; c.beginPath(); c.rect(-5, -17, 10, 6); c.fill(); c.stroke(); break;
      case "radierer": c0.fillStyle = "#f4b6c2"; c.beginPath(); c.rect(-15, -9, 30, 18); c.fill(); c.stroke(); c0.fillStyle = "#4a79b8"; c.beginPath(); c.rect(-15, -9, 10, 18); c.fill(); c.stroke(); break;
      case "lesezeichen": c0.fillStyle = "#b8473a"; c.beginPath(); c.moveTo(-8, -17); c.lineTo(8, -17); c.lineTo(8, 17); c.lineTo(0, 9); c.lineTo(-8, 17); c.closePath(); c.fill(); c.stroke(); break;
      case "klammer": c0.strokeStyle = INK; c0.lineWidth = 6; c.beginPath(); c.moveTo(-6, 6); c.lineTo(-6, -10); c.quadraticCurveTo(-6, -17, 0, -17); c.quadraticCurveTo(10, -17, 10, -8); c.lineTo(10, 12); c.quadraticCurveTo(10, 17, 3, 17); c.quadraticCurveTo(-3, 17, -3, 10); c.lineTo(-3, -4); c.stroke(); c0.strokeStyle = "#cfd6e0"; c0.lineWidth = 3; c.stroke(); break;
      case "salve": for (let i = -1; i <= 1; i++) { c0.save(); c0.rotate(i * .5); c0.translate(0, 0); c0.fillStyle = P1; c.beginPath(); c.moveTo(-6, 12); c.lineTo(0, -15); c.lineTo(6, 12); c.closePath(); c.fill(); c.stroke(); c0.restore(); } break;
      case "tintenschild": c.beginPath(); c.moveTo(0, -17); c.lineTo(15, -11); c.quadraticCurveTo(15, 10, 0, 18); c.quadraticCurveTo(-15, 10, -15, -11); c.closePath(); c0.fillStyle = "#2a3a80"; c.fill(); c.stroke(); c0.fillStyle = "#7bc8e0"; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill(); break;
      case "federkiel": c0.fillStyle = "#e8eef5"; c.beginPath(); c.moveTo(-14, 16); c.quadraticCurveTo(-12, -10, 14, -16); c.quadraticCurveTo(12, 6, -10, 12); c.closePath(); c.fill(); c.stroke(); c0.strokeStyle = "#3a8450"; c0.lineWidth = 3; c.beginPath(); c.moveTo(-14, 16); c.lineTo(8, -8); c.stroke(); break;
      case "lupe": c0.strokeStyle = "#b9803a"; c0.lineWidth = 5; c.beginPath(); c.moveTo(6, 6); c.lineTo(16, 16); c.stroke(); c0.strokeStyle = INK; c0.lineWidth = 3; c.beginPath(); c.arc(-3, -3, 12, 0, TAU); c0.fillStyle = "rgba(150,210,230,.7)"; c.fill(); c.stroke(); break;
      case "falle": c0.fillStyle = "#9aa3b2"; c.beginPath(); c.rect(-15, 2, 30, 10); c.fill(); c.stroke(); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 6 - 3, 2); c.lineTo(i * 6, -10); c.lineTo(i * 6 + 3, 2); c.stroke(); } break;
      default: c0.fillStyle = P1; c.beginPath(); c.moveTo(-14, -16); c.lineTo(14, -16); c.lineTo(14, 16); c.lineTo(-14, 16); c.closePath(); c.fill(); c.stroke(); c0.strokeStyle = "#b8473a"; c0.lineWidth = 3; c.beginPath(); c.moveTo(-18, -6); c.lineTo(-6, 0); c.lineTo(-12, 8); c.lineTo(2, 14); c.lineTo(-2, 4); c.lineTo(10, 0); c.stroke();
    }
  },
};
/* Rucksack-Feld (HTML) */
function slotHtml(it, extra) { return `<button class="slot ${extra || ""}" data-r="${it.rar}" data-id="${it.id}"><img src="${itemIcon(it)}"><span class="lv">${it.ilvl}</span></button>`; }
