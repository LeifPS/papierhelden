/* ===== Oberfläche aus HTML: Hinweise, Dialog mit Schreibmaschine, Fenster ===== */
function toast(msg, ms) { const d = document.createElement("div"); d.innerHTML = msg; $("toast").appendChild(d); setTimeout(() => d.remove(), ms || 2200); while ($("toast").children.length > 4) $("toast").firstChild.remove(); }
let _win = null;
function winOpen(html, cls) { winClose(); const w = document.createElement("div"); w.className = "panel win " + (cls || ""); w.innerHTML = html; $("ui").appendChild(w); _win = w; G.menu = true; return w; }
function winClose() { if (_win) { _win.remove(); _win = null; } G.menu = false; if (G.onWinClose) { const f = G.onWinClose; G.onWinClose = null; f(); } }
/* Dialog: dlg(wer, text, {choices:[..]}) -> Promise<index>. Tippen überspringt die Schreibmaschine, dann weiter. */
const DLG = { open: false, res: null, full: "", pos: 0, timer: 0, choices: null };
function dlg(who, text, choices) {
  return new Promise(res => {
    const d = $("dlg"); DLG.open = true; DLG.res = res; DLG.full = text; DLG.pos = 0; DLG.choices = choices || null; G.talk = true;
    d.style.display = "block"; d.innerHTML = `<div class="who">${esc(who)}</div><div class="txt"></div><div class="ch"></div><div class="more" hidden>${gi("triDown", ACC)}</div>`;
    d.onpointerdown = e => { if (e.target.closest(".ch .btn")) return; e.stopPropagation(); if (DLG.pos < DLG.full.length) { DLG.pos = DLG.full.length; dlgRender(); } else if (!DLG.choices) dlgDone(0); };
    DLG.timer = setInterval(() => { if (DLG.pos < DLG.full.length) { DLG.pos += 1; if (DLG.pos % 3 === 0) sfx("type", 20); dlgRender(); } }, 24); dlgRender();
  });
}
function dlgRender() {
  const d = $("dlg"), done = DLG.pos >= DLG.full.length; d.querySelector(".txt").textContent = DLG.full.slice(0, DLG.pos);
  const more = d.querySelector(".more"); more.hidden = !(done && !DLG.choices);
  const ch = d.querySelector(".ch"); if (done && DLG.choices && !ch.children.length) { DLG.choices.forEach((t, i) => { const b = document.createElement("button"); b.className = "btn"; b.innerHTML = t; b.onclick = () => { sfx("click"); dlgDone(i); }; ch.appendChild(b); }); }
}
function dlgDone(i) { clearInterval(DLG.timer); const d = $("dlg"); d.style.display = "none"; d.innerHTML = ""; DLG.open = false; G.talk = false; const r = DLG.res; DLG.res = null; r && r(i); }
async function say(who, lines) { for (const l of [].concat(lines)) await dlg(who, l); }
