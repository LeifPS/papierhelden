/* ===== Handgezeichnete Symbole statt Sonderzeichen und Emojis =====
   drawGlyph(c, art, x, y, groesse, farbe) zeichnet auf ein Canvas; gi(art, farbe) liefert ein kleines Bild für Text (HTML). */
function drawGlyph(c, kind, x, y, s, fill) {
  c.save(); c.translate(x - s / 2, y - s / 2); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 3; c.strokeStyle = INK;
  const c0 = c; c = sketchCtx(c0, strSeed("g" + kind), 40); const F = col => { c.fillStyle = col; c.fill(); c.stroke(); };
  const col = fill || null;
  const thick = (col2, w) => { c.lineWidth = w + 4; c.strokeStyle = INK; c.stroke(); c.strokeStyle = col2; c.lineWidth = w; c.stroke(); };
  switch (kind) {
    case "heart": c.beginPath(); c.moveTo(20, 35); c.bezierCurveTo(2, 22, 4, 6, 14, 6); c.bezierCurveTo(18, 6, 20, 9, 20, 12); c.bezierCurveTo(20, 9, 22, 6, 26, 6); c.bezierCurveTo(36, 6, 38, 22, 20, 35); c.closePath(); F(col || BAD); break;
    case "coin": c.beginPath(); c.arc(20, 20, 14, 0, 7); F(col || "#e9b73a"); c.beginPath(); c.arc(20, 20, 8, 0, 7); c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(17, 20); c.lineTo(23, 20); c.stroke(); break;
    case "shield": c.beginPath(); c.moveTo(20, 4); c.lineTo(34, 9); c.quadraticCurveTo(34, 28, 20, 36); c.quadraticCurveTo(6, 28, 6, 9); c.closePath(); F(col || ACC); c.lineWidth = 2; c.beginPath(); c.moveTo(20, 8); c.lineTo(20, 32); c.stroke(); break;
    case "sword": c.beginPath(); c.moveTo(8, 32); c.lineTo(28, 12); thick(col || "#dfe6ee", 4); c.beginPath(); c.moveTo(24, 8); c.lineTo(32, 16); c.moveTo(6, 34); c.lineTo(12, 28); c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(29, 11); c.lineTo(34, 5); c.lineWidth = 5; c.stroke(); break;
    case "bow": c.beginPath(); c.moveTo(12, 4); c.quadraticCurveTo(36, 20, 12, 36); thick(col || "#b9803a", 3); c.beginPath(); c.moveTo(12, 4); c.lineTo(12, 36); c.lineWidth = 1.6; c.stroke(); c.beginPath(); c.moveTo(12, 20); c.lineTo(34, 20); c.lineWidth = 2.4; c.stroke(); c.beginPath(); c.moveTo(34, 20); c.lineTo(28, 15); c.moveTo(34, 20); c.lineTo(28, 25); c.stroke(); break;
    case "armor": c.beginPath(); c.moveTo(8, 8); c.lineTo(15, 5); c.quadraticCurveTo(20, 11, 25, 5); c.lineTo(32, 8); c.lineTo(35, 17); c.lineTo(29, 19); c.lineTo(29, 35); c.lineTo(11, 35); c.lineTo(11, 19); c.lineTo(5, 17); c.closePath(); F(col || "#c9bd96"); break;
    case "bolt": c.beginPath(); c.moveTo(23, 3); c.lineTo(9, 22); c.lineTo(19, 22); c.lineTo(15, 37); c.lineTo(31, 16); c.lineTo(21, 16); c.closePath(); F(col || "#f1c232"); break;
    case "flame": c.beginPath(); c.moveTo(20, 3); c.quadraticCurveTo(30, 14, 32, 24); c.quadraticCurveTo(32, 36, 20, 36); c.quadraticCurveTo(8, 36, 8, 25); c.quadraticCurveTo(10, 17, 15, 14); c.quadraticCurveTo(15, 20, 19, 22); c.quadraticCurveTo(16, 12, 20, 3); c.closePath(); F(col || "#e27d2c"); break;
    case "drop": c.beginPath(); c.moveTo(20, 4); c.quadraticCurveTo(33, 20, 31, 26); c.quadraticCurveTo(30, 36, 20, 36); c.quadraticCurveTo(10, 36, 9, 26); c.quadraticCurveTo(7, 20, 20, 4); c.closePath(); F(col || "#2a3a80"); break;
    case "snow": c.lineWidth = 3.4; for (let i = 0; i < 3; i++) { const a = i * PI / 3; c.beginPath(); c.moveTo(20 + Math.cos(a) * 15, 20 + Math.sin(a) * 15); c.lineTo(20 - Math.cos(a) * 15, 20 - Math.sin(a) * 15); c.stroke(); } c.strokeStyle = col || "#bfe6f5"; c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { const a = i * PI / 3; c.beginPath(); c.moveTo(20 + Math.cos(a) * 14, 20 + Math.sin(a) * 14); c.lineTo(20 - Math.cos(a) * 14, 20 - Math.sin(a) * 14); c.stroke(); } break;
    case "skull": c.beginPath(); c.arc(20, 17, 13, PI * .9, PI * 2.1); c.lineTo(28, 31); c.lineTo(12, 31); c.closePath(); F(col || "#f1ead3"); c.fillStyle = INK; [[14, 17], [26, 17]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 3.4, 0, 7); c.fill(); }); break;
    case "bag": c.beginPath(); c.moveTo(12, 12); c.quadraticCurveTo(6, 22, 7, 31); c.quadraticCurveTo(20, 38, 33, 31); c.quadraticCurveTo(34, 22, 28, 12); c.closePath(); F(col || "#b9803a"); c.beginPath(); c.moveTo(12, 12); c.quadraticCurveTo(20, 6, 28, 12); c.lineWidth = 3; c.stroke(); break;
    case "pause": c.lineWidth = 9; [13, 27].forEach(xx => { c.beginPath(); c.moveTo(xx, 8); c.lineTo(xx, 32); c.stroke(); }); c.lineWidth = 4; c.strokeStyle = col || P1; [13, 27].forEach(xx => { c.beginPath(); c.moveTo(xx, 8); c.lineTo(xx, 32); c.stroke(); }); break;
    case "play": c.beginPath(); c.moveTo(10, 5); c.lineTo(34, 20); c.lineTo(10, 35); c.closePath(); F(col || ACC); break;
    case "check": c.beginPath(); c.moveTo(7, 21); c.lineTo(16, 30); c.lineTo(34, 9); thick(col || "#4fc06a", 5); break;
    case "cross": c.beginPath(); c.moveTo(9, 9); c.lineTo(31, 31); c.moveTo(31, 9); c.lineTo(9, 31); thick(col || "#e0533a", 5); break;
    case "plus": c.beginPath(); c.moveTo(20, 7); c.lineTo(20, 33); c.moveTo(7, 20); c.lineTo(33, 20); thick(col || "#4fc06a", 5); break;
    case "minus": c.beginPath(); c.moveTo(7, 20); c.lineTo(33, 20); thick(col || "#e0533a", 5); break;
    case "arrowR": c.beginPath(); c.moveTo(5, 20); c.lineTo(33, 20); c.moveTo(22, 9); c.lineTo(34, 20); c.lineTo(22, 31); thick(col || P1, 4); break;
    case "arrowL": c.beginPath(); c.moveTo(35, 20); c.lineTo(7, 20); c.moveTo(18, 9); c.lineTo(6, 20); c.lineTo(18, 31); thick(col || P1, 4); break;
    case "arrowU": c.beginPath(); c.moveTo(20, 35); c.lineTo(20, 7); c.moveTo(9, 18); c.lineTo(20, 6); c.lineTo(31, 18); thick(col || P1, 4); break;
    case "arrowD": c.beginPath(); c.moveTo(20, 5); c.lineTo(20, 33); c.moveTo(9, 22); c.lineTo(20, 34); c.lineTo(31, 22); thick(col || P1, 4); break;
    case "lock": c.beginPath(); c.arc(20, 15, 8, PI, 0); c.lineWidth = 4; c.stroke(); c.beginPath(); c.rect(8, 16, 24, 18); F(col || "#c9a23a"); c.fillStyle = INK; c.beginPath(); c.arc(20, 25, 3, 0, 7); c.fill(); break;
    case "gear": c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * PI / 8, r = i % 2 ? 11 : 16; c[i ? "lineTo" : "moveTo"](20 + Math.cos(a) * r, 20 + Math.sin(a) * r); } c.closePath(); F(col || "#9aa3b2"); c.beginPath(); c.arc(20, 20, 5, 0, 7); c.stroke(); break;
    case "star": c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 8 : 18; c[i ? "lineTo" : "moveTo"](20 + Math.cos(a) * r, 21.5 + Math.sin(a) * r); } c.closePath(); F(col || "#ffd45a"); break;
    case "page": c.beginPath(); c.moveTo(8, 4); c.lineTo(26, 4); c.lineTo(33, 11); c.lineTo(33, 36); c.lineTo(8, 36); c.closePath(); F(col || P1); c.lineWidth = 2; c.beginPath(); c.moveTo(26, 4); c.lineTo(26, 11); c.lineTo(33, 11); c.moveTo(13, 19); c.lineTo(27, 19); c.moveTo(13, 25); c.lineTo(27, 25); c.moveTo(13, 31); c.lineTo(22, 31); c.stroke(); break;
    case "hammer": c.beginPath(); c.moveTo(10, 34); c.lineTo(24, 16); thick("#b9803a", 4); c.beginPath(); c.rect(18, 5, 17, 11); c.save(); c.translate(26, 11); c.rotate(.6); c.translate(-26, -11); c.beginPath(); c.rect(17, 5, 19, 11); F(col || "#9aa3b2"); c.restore(); break;
    case "roll": c.beginPath(); c.arc(20, 20, 12, PI * .2, PI * 1.7); thick(col || P1, 4); c.beginPath(); c.moveTo(26, 4); c.lineTo(32, 11); c.lineTo(22, 13); c.closePath(); F(col || P1); break;
    case "speech": c.beginPath(); c.moveTo(6, 8); c.lineTo(34, 8); c.lineTo(34, 27); c.lineTo(20, 27); c.lineTo(12, 35); c.lineTo(13, 27); c.lineTo(6, 27); c.closePath(); F(col || P1); c.lineWidth = 2; [14, 19, 24].forEach(xx => { c.beginPath(); c.arc(xx + 0, 17.5, 1.5, 0, 7); c.stroke(); }); break;
    case "chest": c.beginPath(); c.rect(5, 15, 30, 19); F(col || "#b9803a"); c.beginPath(); c.moveTo(5, 15); c.quadraticCurveTo(20, 2, 35, 15); c.closePath(); F(col || "#c98f45"); c.beginPath(); c.rect(17, 19, 6, 8); F("#e9b73a"); break;
    case "music": c.beginPath(); c.ellipse(13, 30, 7, 5.2, -.35, 0, 7); F(col || "#ffd45a"); c.beginPath(); c.moveTo(19.5, 28.5); c.lineTo(19.5, 6); c.quadraticCurveTo(27, 10, 31, 20); c.lineWidth = 3.2; c.stroke(); break;
    case "sound": c.beginPath(); c.moveTo(6, 15); c.lineTo(13, 15); c.lineTo(22, 7); c.lineTo(22, 33); c.lineTo(13, 25); c.lineTo(6, 25); c.closePath(); F(col || "#9aa3b2"); c.beginPath(); c.arc(24, 20, 7, -.9, .9); c.moveTo(0, 0); c.stroke(); c.beginPath(); c.arc(24, 20, 12, -.9, .9); c.stroke(); break;
    case "pen": c.beginPath(); c.moveTo(7, 33); c.lineTo(10, 24); c.lineTo(30, 4); c.lineTo(36, 10); c.lineTo(16, 30); c.closePath(); F(col || BAD); c.beginPath(); c.moveTo(7, 33); c.lineTo(10, 24); c.lineTo(16, 30); c.closePath(); F("#f1d9a6"); break;
    case "feather": c.beginPath(); c.moveTo(8, 34); c.quadraticCurveTo(10, 10, 32, 5); c.quadraticCurveTo(30, 24, 12, 31); c.closePath(); F(col || "#e8eef5"); c.beginPath(); c.moveTo(8, 34); c.lineTo(26, 12); c.lineWidth = 2; c.stroke(); break;
    case "dot": c.beginPath(); c.arc(20, 20, 11, 0, 7); F(col || BAD); break;
    case "ring": c.beginPath(); c.arc(20, 20, 11, 0, 7); c.strokeStyle = col || "#e0a020"; c.lineWidth = 6; c.stroke(); break;
    case "diamond": c.beginPath(); c.moveTo(20, 4); c.lineTo(35, 20); c.lineTo(20, 36); c.lineTo(5, 20); c.closePath(); F(col || "#fff"); break;
    case "triDown": c.beginPath(); c.moveTo(4, 9); c.lineTo(36, 9); c.lineTo(20, 35); c.closePath(); F(col || PURP); break;
    case "eye": c.beginPath(); c.moveTo(3, 20); c.quadraticCurveTo(20, 2, 37, 20); c.quadraticCurveTo(20, 38, 3, 20); c.closePath(); F(col || P1); c.beginPath(); c.arc(20, 20, 6, 0, 7); c.fillStyle = INK; c.fill(); break;
    default: c.beginPath(); c.arc(20, 20, 8, 0, 7); F(col || "#fff");
  }
  c0.restore();
}
const GI_CACHE = {};
/* Kleines Bild (HTML) für Text: Größe folgt der Schrift (1em) */
function gi(kind, col) {
  const key = kind + "|" + (col || "");
  if (!GI_CACHE[key]) { try { const cv = document.createElement("canvas"); cv.width = cv.height = 72; drawGlyph(cv.getContext("2d"), kind, 36, 36, 62, col); GI_CACHE[key] = cv.toDataURL("image/png"); } catch (e) { GI_CACHE[key] = ""; } }
  return `<img class="gi" alt="" src="${GI_CACHE[key]}">`;
}
/* Glyph als Sprite für den Canvas (HUD, Knöpfe) */
function glyphSpr(kind, size, col) { return spr("gl|" + kind + "|" + size + "|" + (col || ""), size + 6, size + 6, c => drawGlyph(c, kind, 0, 0, size, col)); }
