/* ===== Ton: synthetische Effekte (WebAudio) und Musik (MP3 aus /musik oder eingebauter Ersatz) ===== */
const AU = { ctx: null, master: null, sfxG: null, musG: null, vol: { sfx: .8, mus: .6 }, on: false, cur: null, bufs: {}, fail: {}, wantTrack: null, noiseBuf: null, last: {} };
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === "suspended") AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; AU.ctx = new C();
    AU.master = AU.ctx.createGain(); AU.master.connect(AU.ctx.destination);
    AU.sfxG = AU.ctx.createGain(); AU.sfxG.connect(AU.master); AU.musG = AU.ctx.createGain(); AU.musG.connect(AU.master);
    AU.sfxG.gain.value = AU.vol.sfx; AU.musG.gain.value = AU.vol.mus;
    const n = AU.ctx.sampleRate * 1.5, b = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; AU.noiseBuf = b;
    AU.on = true; if (AU.wantTrack) { const t = AU.wantTrack; AU.wantTrack = null; AU.cur = null; music(t); }
  } catch (e) { AU.on = false; }
}
["pointerdown", "keydown", "touchstart"].forEach(ev => addEventListener(ev, auInit, { passive: true }));
function auVol(kind, v) { AU.vol[kind] = v; if (AU.ctx) (kind === "sfx" ? AU.sfxG : AU.musG).gain.value = v; }

/* Bausteine */
function tone(o) {   // {f, f2, d, type, v, at (Verzögerung), a (Einschwingzeit), cut}
  if (!AU.on) return; const t0 = AU.ctx.currentTime + (o.at || 0), d = o.d || .15;
  const os = AU.ctx.createOscillator(), g = AU.ctx.createGain(); os.type = o.type || "sine"; os.frequency.setValueAtTime(o.f, t0);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + d);
  const v = (o.v === undefined ? .3 : o.v), a = o.a || .005; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  os.connect(g); g.connect(o.dest || AU.sfxG); os.start(t0); os.stop(t0 + d + .05);
}
function noise(o) {   // {d, v, f, f2, q, type, at}
  if (!AU.on) return; const t0 = AU.ctx.currentTime + (o.at || 0), d = o.d || .15;
  const s = AU.ctx.createBufferSource(); s.buffer = AU.noiseBuf; s.loop = true; const fl = AU.ctx.createBiquadFilter(); fl.type = o.type || "bandpass"; fl.frequency.setValueAtTime(o.f || 1500, t0); if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t0 + d); fl.Q.value = o.q || 1;
  const g = AU.ctx.createGain(); const v = o.v === undefined ? .3 : o.v; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + (o.a || .005)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  s.connect(fl); fl.connect(g); g.connect(o.dest || AU.sfxG); s.start(t0, Math.random()); s.stop(t0 + d + .05);
}
const SFX = {
  click: () => tone({ f: 620, f2: 880, d: .07, type: "triangle", v: .18 }),
  deny: () => { tone({ f: 200, f2: 150, d: .15, type: "square", v: .12 }); },
  swing: () => noise({ d: .13, f: 1800, f2: 500, q: .8, v: .22 }),
  swing2: () => noise({ d: .11, f: 2600, f2: 800, q: .8, v: .2 }),
  heavy: () => { noise({ d: .22, f: 900, f2: 200, q: .7, v: .3 }); tone({ f: 120, f2: 60, d: .2, type: "sine", v: .25 }); },
  hit: () => { noise({ d: .08, f: 900, q: 1.2, v: .3 }); tone({ f: 260, f2: 120, d: .08, type: "triangle", v: .2 }); },
  crit: () => { noise({ d: .12, f: 1500, q: 1, v: .35 }); tone({ f: 520, f2: 180, d: .14, type: "square", v: .16 }); tone({ f: 880, d: .1, type: "triangle", v: .15, at: .02 }); },
  kill: () => { tone({ f: 300, f2: 90, d: .18, type: "triangle", v: .22 }); noise({ d: .16, f: 500, f2: 150, v: .2 }); },
  hurt: () => { tone({ f: 180, f2: 70, d: .22, type: "sawtooth", v: .22 }); noise({ d: .12, f: 400, v: .2 }); },
  roll: () => noise({ d: .22, f: 700, f2: 2400, q: .6, v: .2 }),
  shoot: () => { tone({ f: 700, f2: 300, d: .09, type: "triangle", v: .15 }); noise({ d: .07, f: 3000, v: .08 }); },
  arrow: () => { tone({ f: 420, f2: 180, d: .12, type: "triangle", v: .18 }); noise({ d: .1, f: 2200, f2: 700, v: .14 }); },
  eshoot: () => tone({ f: 330, f2: 200, d: .12, type: "square", v: .1 }),
  coin: () => { tone({ f: 1200, d: .07, type: "square", v: .08 }); tone({ f: 1700, d: .12, type: "square", v: .08, at: .06 }); },
  pick: () => { tone({ f: 500, f2: 800, d: .1, type: "triangle", v: .2 }); },
  heart: () => { tone({ f: 600, d: .1, type: "sine", v: .22 }); tone({ f: 900, d: .18, type: "sine", v: .22, at: .08 }); },
  chest: () => { noise({ d: .2, f: 300, f2: 900, v: .22 }); [0, .1, .2, .3].forEach((t, i) => tone({ f: 500 * Math.pow(1.26, i), d: .22, type: "triangle", v: .16, at: .1 + t })); },
  door: () => { noise({ d: .35, f: 200, f2: 80, q: .5, v: .35 }); tone({ f: 70, f2: 45, d: .3, type: "sine", v: .3 }); },
  slam: () => { tone({ f: 90, f2: 35, d: .4, type: "sine", v: .5 }); noise({ d: .3, f: 400, f2: 80, q: .5, v: .4 }); },
  boom: () => { tone({ f: 70, f2: 30, d: .6, type: "sine", v: .55 }); noise({ d: .5, f: 600, f2: 60, q: .4, v: .5 }); },
  tele: () => tone({ f: 260, f2: 520, d: .25, type: "sine", v: .07 }),
  levelup: () => [0, 1, 2, 3, 4].forEach(i => tone({ f: 440 * Math.pow(1.2599, i), d: .3, type: "triangle", v: .18, at: i * .09 })),
  page: () => { noise({ d: .45, f: 400, f2: 3200, q: .5, v: .22, a: .15 }); noise({ d: .2, f: 2500, f2: 600, q: .8, v: .12, at: .3 }); },
  type: () => tone({ f: 700 + Math.random() * 200, d: .03, type: "square", v: .04 }),
  ink: () => { noise({ d: .3, f: 300, f2: 700, q: 1, v: .25 }); tone({ f: 200, f2: 400, d: .2, type: "sine", v: .15 }); },
  wave: () => { tone({ f: 200, f2: 60, d: .35, type: "sine", v: .4 }); noise({ d: .3, f: 1200, f2: 200, v: .25 }); },
  dash: () => noise({ d: .2, f: 500, f2: 4000, q: .5, v: .25 }),
  chain: () => { for (let i = 0; i < 5; i++) tone({ f: 900 + Math.random() * 900, f2: 300, d: .08, type: "sawtooth", v: .1, at: i * .05 }); },
  fan: () => { for (let i = 0; i < 5; i++) noise({ d: .1, f: 2800, f2: 900, v: .1, at: i * .03 }); },
  shield: () => { tone({ f: 330, f2: 660, d: .3, type: "triangle", v: .2 }); tone({ f: 495, f2: 990, d: .3, type: "sine", v: .12, at: .05 }); },
  heal: () => [0, 1, 2].forEach(i => tone({ f: 520 * Math.pow(1.335, i), d: .3, type: "sine", v: .2, at: i * .11 })),
  slow: () => tone({ f: 500, f2: 120, d: .6, type: "sine", v: .25 }),
  trap: () => { tone({ f: 800, f2: 400, d: .1, type: "square", v: .12 }); },
  rip: () => { noise({ d: .3, f: 1500, f2: 5000, q: .4, v: .35 }); noise({ d: .2, f: 5000, f2: 800, q: .6, v: .2, at: .15 }); },
  spike: () => { noise({ d: .08, f: 2500, v: .22 }); tone({ f: 220, f2: 90, d: .1, type: "square", v: .12 }); },
  plate: () => { tone({ f: 330, d: .12, type: "triangle", v: .2 }); tone({ f: 495, d: .18, type: "triangle", v: .2, at: .08 }); },
  gate: () => { noise({ d: .5, f: 250, f2: 120, q: .6, v: .3 }); tone({ f: 100, f2: 70, d: .5, type: "sawtooth", v: .12 }); },
  crack: () => { noise({ d: .2, f: 800, f2: 200, q: 2, v: .3 }); },
  buy: () => { tone({ f: 700, d: .08, type: "square", v: .1 }); tone({ f: 1050, d: .16, type: "square", v: .1, at: .07 }); },
  equip: () => { tone({ f: 380, f2: 560, d: .12, type: "triangle", v: .2 }); noise({ d: .08, f: 2000, v: .1 }); },
  enchant: () => { for (let i = 0; i < 6; i++) tone({ f: 600 + i * 180, d: .25, type: "sine", v: .12, at: i * .05 }); },
  roar: () => { tone({ f: 110, f2: 55, d: .9, type: "sawtooth", v: .35 }); tone({ f: 82, f2: 40, d: 1, type: "square", v: .2 }); noise({ d: .8, f: 300, f2: 100, q: .5, v: .25 }); },
  bossdie: () => { tone({ f: 200, f2: 30, d: 1.6, type: "sawtooth", v: .4 }); noise({ d: 1.4, f: 1500, f2: 60, q: .4, v: .4 }); },
  victory: () => [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone({ f: 440 * Math.pow(2, s / 12), d: .5, type: "triangle", v: .2, at: i * .13 })),
  defeat: () => [0, -3, -7, -12].forEach((s, i) => tone({ f: 330 * Math.pow(2, s / 12), d: .6, type: "triangle", v: .2, at: i * .25 })),
  warn: () => { tone({ f: 440, d: .12, type: "square", v: .1 }); tone({ f: 440, d: .12, type: "square", v: .1, at: .18 }); },
};
function sfx(name, minGap) {
  if (!AU.on) return; const now = performance.now(), g = minGap === undefined ? 35 : minGap; if (AU.last[name] && now - AU.last[name] < g) return; AU.last[name] = now;
  const f = SFX[name]; if (f) try { f(); } catch (e) {}
}

/* ----- Musik -----
   Stücke: hub, bereich1, bereich2, boss1, finalboss, story, sieg. Liegt /musik/<name>.mp3 vor, wird es nahtlos geloopt.
   Fehlt die Datei, spielt ein kleiner eingebauter Ersatz mit dem gemeinsamen Hauptthema (D F A G E). */
const TRACKS = {
  hub: { bpm: 90, root: 62, mode: [0, 2, 4, 5, 7, 9, 11], prog: [0, 5, 3, 4], lead: "triangle", pad: "sine", drums: 0, vol: .8 },
  bereich1: { bpm: 80, root: 57, mode: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6], lead: "sine", pad: "triangle", drums: 0, vol: .7, minor: 1 },
  bereich2: { bpm: 100, root: 50, mode: [0, 2, 3, 5, 7, 8, 10], prog: [0, 0, 5, 4], lead: "sawtooth", pad: "sine", drums: 1, vol: .45, minor: 1 },
  boss1: { bpm: 140, root: 52, mode: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 6, 4], lead: "square", pad: "sawtooth", drums: 2, vol: .3, minor: 1 },
  finalboss: { bpm: 150, root: 50, mode: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 3, 4], lead: "sawtooth", pad: "square", drums: 2, vol: .3, minor: 1 },
  story: { bpm: 60, root: 62, mode: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 4], lead: "sine", pad: "triangle", drums: 0, vol: .8, minor: 1 },
  sieg: { bpm: 100, root: 62, mode: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 0], lead: "triangle", pad: "sine", drums: 0, vol: .8 },
};
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
function music(name) {
  if (name === AU.cur) return;
  if (!AU.on) { AU.wantTrack = name; return; }
  AU.cur = name; musicStop(1.2);
  const spec = TRACKS[name]; if (!spec) return;
  const myTok = AU.tok = (AU.tok || 0) + 1;
  const useSynth = () => { if (AU.tok === myTok && AU.cur === name) musicSynth(name, spec, myTok); };
  if (AU.fail[name]) return useSynth();
  const play = buf => {
    if (AU.tok !== myTok || AU.cur !== name) return;
    const s = AU.ctx.createBufferSource(); s.buffer = buf; s.loop = true; const g = AU.ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(1, AU.ctx.currentTime + 1.5);
    s.connect(g); g.connect(AU.musG); s.start(); AU.node = { stop(fade) { try { g.gain.cancelScheduledValues(AU.ctx.currentTime); g.gain.setValueAtTime(g.gain.value, AU.ctx.currentTime); g.gain.linearRampToValueAtTime(0, AU.ctx.currentTime + fade); s.stop(AU.ctx.currentTime + fade + .05); } catch (e) {} } };
  };
  if (AU.bufs[name]) return play(AU.bufs[name]);
  fetch("/musik/" + name + ".mp3").then(r => { if (!r.ok || !/audio|octet/.test(r.headers.get("content-type") || "audio")) throw 0; return r.arrayBuffer(); })
    .then(ab => AU.ctx.decodeAudioData(ab)).then(buf => { AU.bufs[name] = buf; play(buf); })
    .catch(() => { AU.fail[name] = 1; useSynth(); });
}
function musicStop(fade) {
  if (AU.node) { AU.node.stop(fade || .8); AU.node = null; }
  if (AU.timer) { clearInterval(AU.timer); AU.timer = null; }
}
function musicSynth(name, sp, tok) {
  const beat = 60 / sp.bpm; let step = 0, tNext = AU.ctx.currentTime + .1;
  const g = AU.ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(sp.vol * .5, AU.ctx.currentTime + 1.5); g.connect(AU.musG);
  const motif = sp.minor ? [0, 3, 7, 5, 2] : [0, 4, 7, 5, 2];
  const deg = d => { const n = sp.mode.length, o = Math.floor(d / n); return sp.mode[((d % n) + n) % n] + 12 * o; };
  const tickFn = () => {
    if (AU.tok !== tok) return;
    while (tNext < AU.ctx.currentTime + .5) {
      const bar = Math.floor(step / 8) % 4, st = step % 8, r = sp.root + deg(sp.prog[bar]), at = tNext - AU.ctx.currentTime;
      if (st === 0) { [0, 7, 12].forEach(iv => tone({ f: mf(r + iv - 12), d: beat * 4, type: sp.pad, v: .1, a: .4, at, dest: g })); }
      if (Math.floor(step / 32) % 2 === 0 && bar % 2 === 0 && st % 2 === 0 && st < 10) { const mi = st / 2; if (mi < 5) tone({ f: mf(sp.root + 12 + motif[mi]), d: beat * 1.6, type: sp.lead, v: .16, at, dest: g }); }
      else if (st % 2 === 1 || (bar % 2 === 1 && st % 2 === 0)) { const ch = [0, 4, 7, 11][((step >> 1) + bar) % 4]; if (Math.random() < .8) tone({ f: mf(r + 12 + (sp.minor && ch === 4 ? 3 : ch)), d: beat * .7, type: sp.lead, v: .07, at, dest: g }); }
      if (sp.drums) { if (st % 4 === 0) tone({ f: 120, f2: 40, d: .15, type: "sine", v: .3, at, dest: g }); if (st % 2 === 1) noise({ d: .05, f: 7000, type: "highpass", v: .06, at, dest: g }); if (sp.drums > 1 && st % 4 === 2) noise({ d: .12, f: 1800, v: .12, at, dest: g }); }
      step++; tNext += beat / 2;
    }
  };
  AU.timer = setInterval(tickFn, 120); tickFn();
  AU.node = { stop(fade) { try { g.gain.cancelScheduledValues(AU.ctx.currentTime); g.gain.setValueAtTime(g.gain.value, AU.ctx.currentTime); g.gain.linearRampToValueAtTime(0, AU.ctx.currentTime + fade); } catch (e) {} } };
}
