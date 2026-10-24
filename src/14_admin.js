/* ===== Admin-Feld zum Testen (F2 oder fünfmal auf den Titel tippen) ===== */
const ADM = { invul: false, god: false };
function adminToggle() { const a = $("admin"); if (a.style.display === "block") { a.style.display = "none"; G.menu = false; return; } adminBuild(); a.style.display = "block"; G.menu = true; }
function adminBuild() {
  const a = $("admin"); const B = (t, id) => `<button class="btn" data-a="${id}">${t}</button>`;
  a.innerHTML = `<div class="row"><h2 style="margin:0;font:400 28px var(--f-display);color:var(--accent)">Admin</h2><span style="flex:1"></span><button class="btn" data-a="close">Schließen</button></div>
  <h3>Allgemein</h3>${B("Unverwundbar " + (ADM.invul ? "AN" : "aus"), "invul")}${B("FPS " + (G.showFps ? "AN" : "aus"), "fps")}${B("Volle Heilung", "heal")}${B("Titelbild", "title")}${B("Übungsraum", "arena")}${B("Spielstand löschen", "wipe")}
  <h3>Beute und Stufen</h3>${B("Stufe +5", "lv5")}${B("+1000 Taler", "gold")}${B("+10 Punkte", "vp")}${B("Zufallsbeute x5", "loot")}${B("Legendär", "leg")}${B("Einzigartig", "uni")}${B("Dungeon-Stufe + " + (SV.stufe || 0), "st+")}${B("Dungeon-Stufe -", "st-")}${B("Rucksack/Schmiede", "inv")}${B("Schmiede", "smith")}`;
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
    case "lv5": SV.lvl = Math.min(50, SV.lvl + 5); SV.vp += 5; toast("Stufe " + SV.lvl); break;
    case "gold": SV.gold += 1000; break; case "vp": SV.vp += 10; break;
    case "loot": for (let i = 0; i < 5; i++) SV.inv.push(genItem(Math.max(1, SV.stufe || 1) + 1)); toast("5 Gegenstände"); break;
    case "leg": SV.inv.push(genItem(Math.max(1, SV.stufe || 1) + 2, 3)); break; case "uni": SV.inv.push(genItem(Math.max(1, SV.stufe || 1) + 2, 4)); break;
    case "st+": SV.stufe = (SV.stufe || 0) + 1; adminBuild(); break; case "st-": SV.stufe = Math.max(0, (SV.stufe || 0) - 1); adminBuild(); break;
    case "inv": adminToggle(); openInventory("bag"); return; case "smith": adminToggle(); openInventory("smith"); return;
    case "wipe": if (confirm("Wirklich alles löschen?")) { localStorage.removeItem(SV_KEY); SV = defaultSave(); toast("Gelöscht"); } break;
  }
  adminBuild();
}
