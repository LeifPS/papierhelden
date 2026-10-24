/* ===== Der Papierheld: zerknüllte Seite. Alle Ansichten werden einmal vorgerendert (sketchCtx ist teuer) ===== */
const PAPERS = { creme: "#f6efd9", weiss: "#fbfaf4", blau: "#cfe6f2", rosa: "#f7d6dc", mint: "#d4ecd2", gelb: "#f7e9a3", lila: "#e0d6f0" };
const PAPER_NAMES = { creme: "Creme", weiss: "Weiß", blau: "Himmelblau", rosa: "Rosa", mint: "Mint", gelb: "Zitrone", lila: "Flieder" };
/* view: f=vorn, b=hinten, s=seitlich (nach rechts); frame 0..3 Laufzyklus; paper/scarf = Farben */
function heroSpr(view, frame, paper, scarf) {
  return spr(`hero|${view}|${frame}|${paper}|${scarf}`, 64, 72, (c0) => {
    const c = sketchCtx(c0, strSeed("hero" + view + frame), 40);
    const bob = frame === 1 || frame === 3 ? -1.5 : 0, st = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    c.lineWidth = 3;
    // Beine
    c0.strokeStyle = INK; c.lineWidth = 3.2;
    if (view === "s") { [[-1, 1], [1, -1]].forEach(([d, k]) => { c.beginPath(); c.moveTo(0, 14); c.lineTo(d * st * 6 * (k > 0 ? 1 : -1), 24); c.stroke(); c.beginPath(); c.ellipse(d * st * 6 * (k > 0 ? 1 : -1) + 3, 25, 5, 3, 0, 0, TAU); c.fillStyle = INK; c.fill(); }); }
    else { [-1, 1].forEach(d => { const lift = (st * d) > 0 ? -3 : 0; c.beginPath(); c.moveTo(d * 7, 14); c.lineTo(d * 8, 23 + lift); c.stroke(); c.beginPath(); c.ellipse(d * 8, 25 + lift, 5, 3, 0, 0, TAU); c.fillStyle = INK; c.fill(); }); }
    c0.save(); c0.translate(0, bob);
    // Körper: zerknüllte Seite (unregelmäßiger Klumpen)
    c.beginPath(); c.moveTo(-17, 2); c.lineTo(-19, -9); c.lineTo(-12, -20); c.lineTo(-4, -24); c.lineTo(5, -22); c.lineTo(13, -23); c.lineTo(20, -12); c.lineTo(18, 0); c.lineTo(21, 9); c.lineTo(11, 17); c.lineTo(-2, 19); c.lineTo(-13, 16); c.lineTo(-19, 10); c.closePath();
    c0.fillStyle = paper; c.fill(); c.stroke();
    // Knitterfalten
    c0.strokeStyle = "rgba(29,39,66,.35)"; c0.lineWidth = 1.6; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-12, -14); c.lineTo(-4, -6); c.lineTo(-9, 2); c.stroke(); c.beginPath(); c.moveTo(11, -15); c.lineTo(5, -6); c.lineTo(13, 3); c.lineTo(8, 11); c.stroke(); c.beginPath(); c.moveTo(-4, 8); c.lineTo(3, 12); c.stroke();
    c0.fillStyle = "rgba(160,140,90,.22)"; c0.beginPath(); c0.moveTo(-17, 2); c0.lineTo(-4, -6); c0.lineTo(-9, 2); c0.lineTo(-13, 16); c0.lineTo(-19, 10); c0.closePath(); c0.fill();
    c0.strokeStyle = INK; c0.lineWidth = 3;
    // umgeknickte Ecken wie Eselsohren
    c0.fillStyle = shade(paper, -.12); c.lineWidth = 2.6; c.beginPath(); c.moveTo(-12, -20); c.lineTo(-16, -29); c.lineTo(-4, -24); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(13, -23); c.lineTo(19, -30); c.lineTo(20, -12); c.closePath(); c.fill(); c.stroke();
    // Schal (Rüstungsfarbe)
    c0.fillStyle = scarf; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-16, 3); c.quadraticCurveTo(0, 8, 17, 3); c.lineTo(18, 8); c.quadraticCurveTo(0, 14, -17, 8); c.closePath(); c.fill(); c.stroke();
    if (view === "s") { c.beginPath(); c.moveTo(-14, 6); c.lineTo(-24, 12 + st * 2); c.lineTo(-22, 18 + st * 2); c.lineTo(-12, 10); c.closePath(); c.fill(); c.stroke(); }
    else { c.beginPath(); c.moveTo(10, 8); c.lineTo(14, 17); c.lineTo(8, 15); c.closePath(); c.fill(); c.stroke(); }
    // Gesicht
    c0.fillStyle = INK; c0.strokeStyle = INK; c.lineWidth = 2.4;
    if (view === "f") { [-1, 1].forEach(d => { c0.beginPath(); c0.ellipse(d * 7, -8, 2.6, 3.6, 0, 0, TAU); c0.fill(); }); c.beginPath(); c.moveTo(-3, -1); c.quadraticCurveTo(0, 2, 3, -1); c.stroke(); c0.fillStyle = "rgba(220,100,100,.4)"; [-1, 1].forEach(d => { c0.beginPath(); c0.arc(d * 13, -3, 3, 0, TAU); c0.fill(); }); }
    else if (view === "s") { c0.beginPath(); c0.ellipse(10, -8, 2.6, 3.6, 0, 0, TAU); c0.fill(); c.beginPath(); c.moveTo(14, -1); c.quadraticCurveTo(17, 1, 18, -2); c.stroke(); c0.fillStyle = "rgba(220,100,100,.4)"; c0.beginPath(); c0.arc(14, -3, 3, 0, TAU); c0.fill(); }
    else { c0.strokeStyle = "rgba(29,39,66,.3)"; c0.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -14); c.lineTo(6, -12); c.moveTo(-8, -6); c.lineTo(8, -4); c.stroke(); }
    c0.restore();
  }, 2);
}
function rollSpr(paper) {   // Ausweichrolle: zerknüllte Kugel
  return spr("heroRoll|" + paper, 56, 56, (c0) => {
    const c = sketchCtx(c0, strSeed("roll"), 36); c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 19 + (i % 3) * 2.5 - (i % 2); c[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c0.fillStyle = paper; c.fill(); c.stroke();
    c0.strokeStyle = "rgba(29,39,66,.35)"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-10, -8); c.lineTo(0, 0); c.lineTo(-6, 9); c.moveTo(0, 0); c.lineTo(11, 5); c.moveTo(4, -14); c.lineTo(8, -4); c.stroke();
  });
}
function shadowSpr() { return spr("shadow", 40, 20, c => { c.fillStyle = "rgba(20,26,46,.32)"; c.beginPath(); c.ellipse(0, 0, 17, 7, 0, 0, TAU); c.fill(); }, 1); }
/* Feldfigur: Held in der Umgebung zeichnen. o: {x,y,dir,moving,t,paper,scarf,roll,alpha} */
function drawHeroFig(c, o) {
  const a = o.dir, ca = Math.cos(a), sa = Math.sin(a);
  const view = Math.abs(ca) > Math.abs(sa) * .9 ? "s" : sa > 0 ? "f" : "b", fl = view === "s" && ca < 0;
  const fr = o.moving ? Math.floor(o.t * 9) % 4 : 0, breath = o.moving ? 0 : Math.sin(o.t * 2.4) * .02;
  blit(c, shadowSpr(), o.x, o.y + 22, { s: o.roll ? .8 : 1, a: o.alpha });
  if (o.roll) { const s = rollSpr(o.paper); blit(c, s, o.x, o.y + 6, { r: o.roll * TAU * 1.5 * (ca < 0 ? -1 : 1), a: o.alpha === undefined ? 1 : o.alpha }); return; }
  blit(c, heroSpr(view, fr, o.paper, o.scarf), o.x, o.y - 4, { fl, sy: 1 + breath, sx: 1 - breath, a: o.alpha });
}
