/* Handgezeichneter Look (aus Tonlinge übernommen): Linien wackeln leicht, die Kontur wird doppelt gezogen, die Farbe sitzt minimal neben dem Strich. TEUER: nur in Vorrender-Funktionen verwenden. */
function sketchCtx(c, seed, s) {
  let subs = [], cur = null, lx = 0, ly = 0; const seg = s * .07, amp = Math.max(.7, s * .02), TAU = Math.PI * 2;
  const add = (x, y) => { if (!cur) { cur = { p: [], closed: false }; subs.push(cur); } cur.p.push([x, y]); lx = x; ly = y; };
  const line = (x, y) => { if (!cur) return add(x, y); const n = Math.max(1, Math.ceil(Math.hypot(x - lx, y - ly) / seg)), x0 = lx, y0 = ly; for (let i = 1; i <= n; i++) add(x0 + (x - x0) * i / n, y0 + (y - y0) * i / n); };
  const nz = (i, k) => Math.sin(i * .85 + seed * 12.9 + k * 3.1) * .62 + Math.sin(i * 2.1 + seed * 7.3 + k) * .38;
  const emit = (k, a, ox, oy) => { c.beginPath(); for (const sb of subs) { if (sb.p.length < 2) continue; sb.p.forEach((p, i) => { const x = p[0] + nz(i, k) * a + ox, y = p[1] + nz(i + 40, k) * a + oy; i ? c.lineTo(x, y) : c.moveTo(x, y); }); if (sb.closed) c.closePath(); } };
  const arcPts = (x, y, rx, ry, rot, a0, a1, ccw) => { let d = a1 - a0; if (!ccw) { while (d < 0) d += TAU; if (d > TAU) d = TAU; } else { while (d > 0) d -= TAU; if (d < -TAU) d = -TAU; }
    const n = Math.max(10, Math.ceil(Math.abs(d) * Math.max(rx, ry) / seg)), co = Math.cos(rot), si = Math.sin(rot);
    for (let i = 0; i <= n; i++) { const a = a0 + d * i / n, px = Math.cos(a) * rx, py = Math.sin(a) * ry, X = x + px * co - py * si, Y = y + px * si + py * co; i === 0 ? line(X, Y) : add(X, Y); }
    if (Math.abs(d) >= TAU - .01 && cur) cur.closed = true; };
  const O = {
    beginPath() { subs = []; cur = null; },
    moveTo(x, y) { cur = null; add(x, y); },
    lineTo: line,
    quadraticCurveTo(cx, cy, x, y) { const x0 = lx, y0 = ly, n = Math.max(4, Math.ceil((Math.hypot(cx - x0, cy - y0) + Math.hypot(x - cx, y - cy)) / seg)); for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; add(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y); } },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { const x0 = lx, y0 = ly, n = Math.max(5, Math.ceil((Math.hypot(c1x - x0, c1y - y0) + Math.hypot(c2x - c1x, c2y - c1y) + Math.hypot(x - c2x, y - c2y)) / seg)); for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; add(u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x, u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y); } },
    arc(x, y, r, a0, a1, ccw) { arcPts(x, y, r, r, 0, a0, a1, ccw); },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) { arcPts(x, y, rx, ry, rot, a0, a1, ccw); },
    rect(x, y, w, h) { cur = null; add(x, y); line(x + w, y); line(x + w, y + h); line(x, y + h); O.closePath(); },
    roundRect(x, y, w, h) { O.rect(x, y, w, h); },
    closePath() { if (cur && cur.p.length) { cur.closed = true; const f = cur.p[0]; lx = f[0]; ly = f[1]; } },
    fill() { const lw = c.lineWidth; emit(3, amp * .8, lw * .45, lw * .4); c.fill(); },
    stroke() { const lw = c.lineWidth; emit(1, amp, 0, 0); c.stroke(); c.save(); c.globalAlpha *= .5; c.lineWidth = Math.max(1, lw * .5); emit(2, amp * 1.3, lw * .3, -lw * .25); c.stroke(); c.restore(); },
    clip() { emit(1, amp * .5, 0, 0); c.clip(); }
  };
  return new Proxy(c, { get(t, p) { if (p in O) return O[p]; const v = t[p]; return typeof v === "function" ? v.bind(t) : v; }, set(t, p, v) { t[p] = v; return true; } });
}
const strSeed = str => [...str].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7) / 97;
