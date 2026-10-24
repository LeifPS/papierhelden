// Papierhelden: Der Worker liefert nur die Seite (public/) aus. Alles läuft lokal im Browser, kein Mehrspieler.
export default {
  async fetch(request, env) { return env.ASSETS.fetch(request); },
};
