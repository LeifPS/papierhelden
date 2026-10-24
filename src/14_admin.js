/* ===== Admin-Feld zum Testen (F2 oder fünfmal auf den Titel tippen) ===== */
const ADM = { invul: false, god: false };
function adminToggle() { const a = $("admin"); if (a.style.display === "block") { a.style.display = "none"; G.menu = false; return; } adminBuild(); a.style.display = "block"; G.menu = true; }
function adminBuild() {
  const a = $("admin"); const B = (t, id) => `<button class="btn" data-a="${id}">${t}</button>`;
  a.innerHTML = `<div class="row"><h2 style="margin:0;font:400 28px var(--f-display);color:var(--accent)">Admin</h2><span style="flex:1"></span><button class="btn" data-a="close">Schließen</button></div>
  <h3>Allgemein</h3>${B("Unverwundbar " + (ADM.invul ? "AN" : "aus"), "invul")}${B("FPS " + (G.showFps ? "AN" : "aus"), "fps")}${B("Volle Heilung", "heal")}${B("Titelbild", "title")}${B("Übungsraum", "arena")}${B("Spielstand löschen", "wipe")}`;
  a.onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; adminAct(b.dataset.a); };
}
function adminAct(id) {
  switch (id) {
    case "close": adminToggle(); return;
    case "invul": ADM.invul = !ADM.invul; toast("Unverwundbar: " + (ADM.invul ? "an" : "aus")); break;
    case "fps": G.showFps = !G.showFps; break;
    case "heal": PL.hp = PL.max; break;
    case "title": adminToggle(); transition(() => setScene("title")); return;
    case "arena": adminToggle(); transition(() => setScene("arena")); return;
    case "wipe": if (confirm("Wirklich alles löschen?")) { localStorage.removeItem(SV_KEY); SV = defaultSave(); toast("Gelöscht"); } break;
  }
  adminBuild();
}
