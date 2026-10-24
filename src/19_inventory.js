/* ===== Inventar, Vergleich, Aufwerten und Verzaubern (Schmiede nutzt dieselbe Oberfläche) ===== */
const EQ_KEYS = ["melee", "ranged", "armor", "a0", "a1", "a2"], EQ_NAMES = { melee: "Nahkampf", ranged: "Fernwaffe", armor: "Rüstung", a0: "Artefakt 1", a1: "Artefakt 2", a2: "Artefakt 3" };
const enchCostTotal = it => it.ench.reduce((s, e) => s + (e ? ENCH_COST.slice(0, e.lv).reduce((a, b) => a + b, 0) : 0), 0);
function enchantApply(it, i, id) {
  const cur = it.ench[i], need = cur && cur.id === id ? (cur.lv >= 3 ? 99 : ENCH_COST[cur.lv]) : ENCH_COST[0], refund = cur && cur.id !== id ? ENCH_COST.slice(0, cur.lv).reduce((a, b) => a + b, 0) : 0;
  if (cur && cur.id === id && cur.lv >= 3) return false; if (SV.vp + refund < need) return false;
  SV.vp += refund - need; it.ench[i] = cur && cur.id === id ? { id, lv: cur.lv + 1 } : { id, lv: 1 }; calcStats(); sfx("enchant"); return true;
}
function enchantReset(it) { const r = enchCostTotal(it); if (!r) return false; const cost = 20 * it.ilvl + 40 * r; if (SV.gold < cost) return false; SV.gold -= cost; SV.vp += r; it.ench = [null, null, null]; calcStats(); sfx("buy"); return true; }
function upgradeItem(it) { const c = upgradeCost(it); if (SV.gold < c || it.ilvl >= 99) return false; SV.gold -= c; it.ilvl++; calcStats(); sfx("buy"); return true; }
function findItem(id) { for (const k of EQ_KEYS) if (SV.eq[k] && SV.eq[k].id === id) return { it: SV.eq[k], key: k }; const it = SV.inv.find(x => x.id === id); return it ? { it, key: null } : null; }
function dmgOf(it) { return Math.round(itemBase(it) * (1 + (sumAff(it, "dmg") + enchVal(it, "schaerfe")) / 100)); }
function cmpHtml(it) {
  const cur = it.slot === "artifact" ? null : SV.eq[it.slot]; if (!cur || cur.id === it.id) return "";
  const dl = (a, b, u) => { const d = Math.round(a - b); return d ? `<span class="${d > 0 ? "good" : "bad"}">${d > 0 ? "+" : ""}${d}${u || ""}</span>` : ""; };
  if (it.slot === "armor") return `<div class="st"><span>Leben gg. getragen</span>${dl(itemBase(it), itemBase(cur))}</div>`;
  return `<div class="st"><span>Schaden gg. getragen</span>${dl(dmgOf(it), dmgOf(cur))}</div>`;
}
function openInventory(mode, onClose) {
  mode = mode || "bag"; let sel = null, tab = "gear", page = 0;
  const w = winOpen(`<h2>${gi(mode === "smith" ? "hammer" : "bag", ACC)}<span>${mode === "smith" ? "Schmiede" : "Rucksack"}</span><span class="sp"></span><span class="dim" id="gd" style="font-size:19px"></span><button class="mini" id="x">${gi("cross", INK)}</button></h2><div class="body" id="bd" style="display:flex;gap:10px"></div>`, "inv");
  if (onClose) G.onWinClose = onClose; w.style.width = "min(96vw,880px)";
  w.querySelector("#x").onclick = () => { sfx("click"); winClose(); };
  const render = () => {
    const f = sel && findItem(sel.id); if (!f) sel = null; else sel = f.it; const eqKey = f ? f.key : null;
    w.querySelector("#gd").innerHTML = `${gi("coin", "#e9b73a")} ${SV.gold} &nbsp; ${gi("star", WARM)} ${SV.vp} Punkte`;
    let left = `<div style="width:190px;flex:none"><div class="dim" style="margin-bottom:2px">Getragen</div><div class="eq">${EQ_KEYS.map(k => SV.eq[k] ? slotHtml(SV.eq[k], sel && sel.id === SV.eq[k].id ? "sel" : "") : `<button class="slot" disabled title="${EQ_NAMES[k]}" style="opacity:.5">${gi(k === "armor" ? "armor" : k === "melee" ? "sword" : k === "ranged" ? "bow" : "star", MUTED)}</button>`).join("")}</div>`;
    left += `<div class="dim" style="margin:6px 0 2px">Rucksack ${SV.inv.length}/${BAG_MAX}</div><div class="sg" style="max-height:${mode === "smith" ? 0 : 150}px;overflow-y:auto">${SV.inv.map(it => slotHtml(it, sel && sel.id === it.id ? "sel" : "")).join("")}</div></div>`;
    let right = `<div style="flex:1;min-width:0"><div class="info" style="min-height:120px">${itemTip(sel)}${sel ? cmpHtml(sel) : ""}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">`;
    if (sel) {
      if (!eqKey) right += `<button class="btn" id="eq">Anlegen</button>`; else right += `<button class="btn" id="ue">Ablegen</button>`;
      if (mode === "smith") right += `<button class="btn" id="up" ${SV.gold < upgradeCost(sel) ? "disabled" : ""}>Aufwerten ${gi("coin", "#e9b73a")} ${upgradeCost(sel)}</button>`;
      else if (!eqKey) right += `<button class="btn warn" id="ds">Zerreißen ${gi("coin", "#e9b73a")} ${Math.max(1, Math.floor(sellPrice(sel) / 2))}</button>`;
    }
    right += `</div>`;
    if (mode === "smith" && sel) {
      right += `<div class="dim" style="margin-top:6px">Verzaubern (Punkte: ${SV.vp})</div>`;
      sel.ench.forEach((e, i) => { right += `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><span class="dim" style="width:90px">${e ? ENCH[e.id].n + " " + ["I", "II", "III"][e.lv - 1] : "Platz " + (i + 1)}</span><button class="btn" data-en="${i}">${e ? "Ändern" : "Wählen"}</button></div>`; });
      if (enchCostTotal(sel)) right += `<button class="btn warn" id="rs" style="margin-top:4px">Zurücksetzen ${gi("coin", "#e9b73a")} ${20 * sel.ilvl + 40 * enchCostTotal(sel)}</button>`;
    }
    right += `</div>`;
    w.querySelector("#bd").innerHTML = left + right;
    const b = w.querySelector("#bd"); b.querySelectorAll(".slot[data-id]").forEach(el => el.onclick = () => { sfx("click"); sel = findItem(el.dataset.id).it; render(); });
    const on = (id, fn) => { const el = b.querySelector("#" + id); if (el) el.onclick = fn; };
    on("eq", () => { equipItem(sel); saveGame(); render(); }); on("ue", () => { unequip(eqKey); saveGame(); render(); });
    on("up", () => { if (upgradeItem(sel)) { saveGame(); render(); } else sfx("deny"); });
    on("ds", () => { const g = Math.max(1, Math.floor(sellPrice(sel) / 2)); SV.inv = SV.inv.filter(x => x.id !== sel.id); SV.gold += g; sel = null; sfx("coin"); saveGame(); render(); });
    on("rs", () => { if (enchantReset(sel)) { saveGame(); render(); } else { sfx("deny"); toast("Zu wenig Papiertaler."); } });
    b.querySelectorAll("[data-en]").forEach(el => el.onclick = () => { sfx("click"); enchPicker(sel, +el.dataset.en, render); });
  };
  render();
}
function enchPicker(it, idx, done) {
  const ids = Object.keys(ENCH).filter(k => ENCH[k].s.includes(it.slot)), cur = it.ench[idx];
  const w = document.createElement("div"); w.className = "panel"; w.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,520px);max-height:90vh;overflow:auto;padding:8px 12px;z-index:9;box-shadow:0 0 0 9999px rgba(29,39,66,.5)";
  const draw = () => { w.innerHTML = `<h2 style="margin:0 0 4px;font:400 26px var(--f-display);color:var(--accent)">Verzauberung wählen <span class="dim" style="font-size:18px">${SV.vp} Punkte</span></h2>` + ids.map(id => { const e = it.ench[idx], same = e && e.id === id, need = same ? (e.lv >= 3 ? 0 : ENCH_COST[e.lv]) : ENCH_COST[0], lv = same ? e.lv : 0, can = !(same && e.lv >= 3) && SV.vp + (e && !same ? ENCH_COST.slice(0, e.lv).reduce((a, b) => a + b, 0) : 0) >= need; return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;border-bottom:1px dashed var(--muted);padding:2px 0"><span>${ENCH[id].n} <span class="dim">${ENCH[id].v.map((v, k) => (k === lv - 1 ? "[" + v + "]" : v)).join("/")}${ENCH[id].u}</span></span><button class="btn" data-id="${id}" ${can ? "" : "disabled"}>${same ? (e.lv >= 3 ? "Max" : "Stufe " + (e.lv + 1) + " · " + need) : "Wählen · " + need}</button></div>`; }).join("") + `<button class="btn" id="cl" style="margin-top:6px">Fertig</button>`;
    w.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { if (enchantApply(it, idx, b.dataset.id)) { saveGame(); fxBurst(PL.x, PL.y, 8, "#ffd45a", 80, .5, "spark", 2); draw(); done(); } else sfx("deny"); });
    w.querySelector("#cl").onclick = () => { sfx("click"); w.remove(); done(); };
  };
  draw(); $("ui").appendChild(w);
}
