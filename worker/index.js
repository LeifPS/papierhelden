// Mehrspieler-Anwesenheit für Papierhelden: Der Worker liefert die Seite (public/) aus und reicht
// unter /ws WebSockets an ein Durable Object ("Dorf") weiter. Es gibt nur Positionen, nur im Hub.
import { DurableObject } from "cloudflare:workers";

const MAX_PLAYERS = 40;
const MAX_MSG = 300;      // Bytes pro Nachricht
const MIN_GAP_MS = 45;    // höchstens ~20 Positionen pro Sekunde je Spieler
const WORLD_W = 60 * 32, WORLD_H = 40 * 32;

const num = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(+v) ? Math.round(+v) : lo));
const clean = (s, n) => String(s ?? "").replace(/[<>&"\\]/g, "").trim().slice(0, n);

export class Dorf extends DurableObject {
  async fetch(request) {
    const sockets = this.ctx.getWebSockets();
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    if (sockets.length >= MAX_PLAYERS) { server.send(JSON.stringify({ t: "full" })); server.close(1013, "voll"); return new Response(null, { status: 101, webSocket: client }); }
    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id, joined: false, x: 0, y: 0, f: 1, m: 0, c: "", n: "", lv: 1, last: 0 });
    const players = sockets.map(w => w.deserializeAttachment()).filter(a => a && a.joined).map(({ id, x, y, f, m, c, n, lv }) => ({ id, x, y, f, m, c, n, lv }));
    server.send(JSON.stringify({ t: "hi", id, players }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_MSG) return;
    let m; try { m = JSON.parse(message); } catch { return; }
    if (!m || m.t !== "p") return;
    const a = ws.deserializeAttachment(); if (!a) return;
    const now = Date.now(); if (now - a.last < MIN_GAP_MS) return;
    Object.assign(a, { joined: true, last: now, x: num(m.x, 0, WORLD_W), y: num(m.y, 0, WORLD_H), f: m.f < 0 ? -1 : 1, m: m.m ? 1 : 0, c: clean(m.c, 12), n: clean(m.n, 14) || "Held", lv: num(m.lv, 1, 99) });
    ws.serializeAttachment(a);
    const out = JSON.stringify({ t: "p", id: a.id, x: a.x, y: a.y, f: a.f, m: a.m, c: a.c, n: a.n, lv: a.lv });
    for (const other of this.ctx.getWebSockets()) if (other !== ws) { try { other.send(out); } catch {} }
  }

  webSocketClose(ws) { this.#leave(ws); }
  webSocketError(ws) { this.#leave(ws); }

  #leave(ws) {
    const a = ws.deserializeAttachment(); if (!a || !a.joined) return;
    const out = JSON.stringify({ t: "l", id: a.id });
    for (const other of this.ctx.getWebSockets()) if (other !== ws) { try { other.send(out); } catch {} }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket erwartet", { status: 426 });
      return env.DORF.get(env.DORF.idFromName("dorf")).fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
