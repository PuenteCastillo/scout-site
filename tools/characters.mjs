// Scout (built from the app's rig art) and his turkey friend (drawn here), plus falling leaves.
// `charactersScript()` returns a <script> that defines scout(t, opts), turkey(t, opts) and leaves(t, n) in the page.
// Each is a pure function of the time t in seconds, so a video is the same page drawn at t = 0, 1/30, 2/30…
import { readFileSync } from "node:fs";
import { join } from "node:path";

const APP = join(process.env.HOME, "Documents/cloudNomdas/Scout/scout-us-citizenship-test");
const png = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");
const PARTS = ["body", "head", "crest", "wingA", "wingB", "pupils", "brows", "lidL", "lidR"];

// Runs in the page. From src/components/scoutRig.ts (RIG.wave): the art is 765x872, each part padded 6px on every side.
function inPage() {
  const W = 765, H = 872, PAD = 6, NAVY = "#10204A";
  const WAVE = { neck: [297, 545], wingA: [478, 568], wingB: [140, 558] };
  const sin = (x) => Math.sin(x * Math.PI * 2);
  const up = (x) => Math.max(0, x) ** 0.8;

  /** Scout, `size` px tall, standing in a disc. mood "wave" waves one wing; "cheer" hops and flaps both. */
  window.scout = (t, { size = 460, disc = "#06B4E0", mood = "wave", phase = 0 } = {}) => {
    const k = size / H, tt = t + phase, cheer = mood === "cheer";
    const wingA = cheer ? -22 * up(sin(tt * 2)) : -14 * up(sin(tt * 1.6));
    const wingB = cheer ? 18 * up(sin(tt * 2 + 0.05)) : 3 * sin(tt * 0.7);
    const nod = cheer ? 3 * sin(tt * 2) : 4 * sin(tt * 0.5);
    const blink = (tt % 3.2) > 3.05 ? 1 : 0;
    const part = (n, extra = "") => `<img src="${ART[n]}" style="position:absolute;left:${-PAD}px;top:${-PAD}px;width:${W + PAD * 2}px;height:${H + PAD * 2}px;${extra}">`;
    const about = ([x, y], r) => `transform-origin:${x}px ${y}px;transform:rotate(${r}deg)`;
    const d = size * 0.86, r = d / 2, cx = 311 * k, cy = size - r;
    const clip = `path("M-400 -400 H${W * k + 400} V${cy} H${cx + r} A${r} ${r} 0 0 1 ${cx - r} ${cy} H-400 Z")`;
    return `<div style="position:relative;width:${W * k}px;height:${size}px">
      <div style="position:absolute;left:${cx - r}px;top:${size - d}px;width:${d}px;height:${d}px;border-radius:50%;background:${disc};box-shadow:0 0 0 ${Math.round(size / 70)}px ${NAVY}"></div>
      <div style="position:absolute;left:0;top:0;width:${W * k}px;height:${size}px;clip-path:${clip}">
        <div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0;transform:scale(${k})">
          ${part("wingB", about(WAVE.wingB, wingB))}${part("body")}
          <div style="position:absolute;inset:0;${about(WAVE.neck, nod)}">
            <div style="position:absolute;inset:0;${about([236, 120], 5 * sin(tt * 0.8 + 0.2))}">${part("crest")}</div>
            ${part("head")}${part("pupils")}${part("brows")}${part("lidL", `opacity:${blink}`)}${part("lidR", `opacity:${blink}`)}
          </div>
          ${part("wingA", about(WAVE.wingA, wingA))}
        </div>
      </div>
    </div>`;
  };

  const T = { o: NAVY, body: "#8A552E", dark: "#6E4223", belly: "#C88B52", head: "#B97A47",
    red: "#DC2F34", orange: "#FF8A1F", yellow: "#FFC233", beak: "#FFC233", cheek: "#F7A1A8", scarf: "#E8772E" };

  /** Scout's turkey friend, `size` px tall, in a disc. */
  window.turkey = (t, { size = 420, disc = "#FFC233", mood = "wave", phase = 0.4 } = {}) => {
    const tt = t + phase, cheer = mood === "cheer";
    const fan = cheer ? 7 * sin(tt * 2) : 4 * sin(tt * 0.9);
    const bob = cheer ? 10 * Math.abs(sin(tt)) : 6 * Math.abs(sin(tt * 1.1));
    const flap = cheer ? -30 * up(sin(tt * 2)) : -18 * up(sin(tt * 1.3 + 0.3));
    const blink = (tt % 2.7) > 2.55, s = 7, id = "tk" + Math.round(size) + Math.round(phase * 100);
    const feathers = [-72, -48, -24, 0, 24, 48, 72].map((a, i) => `<g transform="rotate(${a + fan * (i - 3) / 3} 200 265)">
      <path d="M200 265 C150 200 150 60 200 40 C250 60 250 200 200 265Z" fill="${[T.red, T.orange, T.yellow, T.red, T.yellow, T.orange, T.red][i]}" stroke="${T.o}" stroke-width="${s}" stroke-linejoin="round"/>
      <path d="M200 70 C188 110 188 170 200 230" fill="none" stroke="${T.o}" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/></g>`).join("");
    const eyes = blink
      ? `<path d="M158 196 q14 10 28 0 M214 196 q14 10 28 0" fill="none" stroke="${T.o}" stroke-width="6" stroke-linecap="round"/>`
      : `<circle cx="172" cy="194" r="19" fill="#fff" stroke="${T.o}" stroke-width="6"/><circle cx="228" cy="194" r="19" fill="#fff" stroke="${T.o}" stroke-width="6"/>
         <circle cx="175" cy="197" r="10" fill="${T.o}"/><circle cx="231" cy="197" r="10" fill="${T.o}"/>
         <circle cx="179" cy="192" r="3.6" fill="#fff"/><circle cx="235" cy="192" r="3.6" fill="#fff"/>`;
    return `<svg viewBox="0 0 400 440" width="${size * 400 / 440}" height="${size}" style="display:block;overflow:visible">
      <circle cx="200" cy="262" r="170" fill="${disc}" stroke="${T.o}" stroke-width="${s}"/>
      <clipPath id="${id}"><rect x="-200" y="-200" width="800" height="462"/><circle cx="200" cy="262" r="166"/></clipPath>
      <g clip-path="url(#${id})">
        ${feathers}
        <g transform="rotate(${flap} 108 300)"><path d="M108 300 C70 300 52 340 70 372 C92 380 112 360 118 335Z" fill="${T.dark}" stroke="${T.o}" stroke-width="${s}" stroke-linejoin="round"/></g>
        <g transform="rotate(${cheer ? -flap : 0} 292 300)"><path d="M292 300 C330 300 348 340 330 372 C308 380 288 360 282 335Z" fill="${T.dark}" stroke="${T.o}" stroke-width="${s}" stroke-linejoin="round"/></g>
        <ellipse cx="200" cy="350" rx="105" ry="110" fill="${T.body}" stroke="${T.o}" stroke-width="${s}"/>
        <ellipse cx="200" cy="372" rx="62" ry="70" fill="${T.belly}"/>
        <path d="M168 360 q8 8 16 0 M196 380 q8 8 16 0 M222 360 q8 8 16 0" fill="none" stroke="${T.dark}" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(0 ${-bob})">
          <path d="M142 262 C150 286 250 286 258 262 L250 300 C225 312 175 312 150 300Z" fill="${T.scarf}" stroke="${T.o}" stroke-width="6" stroke-linejoin="round"/>
          <ellipse cx="200" cy="205" rx="68" ry="72" fill="${T.head}" stroke="${T.o}" stroke-width="${s}"/>
          <path d="M182 142 C176 118 196 112 200 132 C204 112 224 118 218 142" fill="${T.red}" stroke="${T.o}" stroke-width="6" stroke-linejoin="round"/>
          <ellipse cx="152" cy="226" rx="13" ry="8" fill="${T.cheek}"/><ellipse cx="248" cy="226" rx="13" ry="8" fill="${T.cheek}"/>
          ${eyes}
          <path d="M186 214 L214 214 L200 240Z" fill="${T.beak}" stroke="${T.o}" stroke-width="6" stroke-linejoin="round"/>
          <path d="M211 222 C226 226 230 252 220 258 C211 256 210 240 207 228Z" fill="${T.red}" stroke="${T.o}" stroke-width="5" stroke-linejoin="round"/>
        </g>
      </g></svg>`;
  };

  // Falling autumn leaves across a 1080x1350 frame. Seeded, so every render matches; they loop every 6 s.
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  window.leaves = (t, n = 12, { w = 1080, h = 1350, loop = 6 } = {}) => {
    let out = "";
    for (let i = 0; i < n; i++) {
      const size = 34 + rnd(i) * 40, fall = h + 200, p = ((rnd(i + 50) + t / loop * (1 + Math.floor(rnd(i + 9) * 2))) % 1);
      const y = -100 + p * fall, x = rnd(i + 20) * w + 60 * sin(t / 3 + rnd(i + 30));
      const rot = rnd(i + 40) * 360 + t * (40 + rnd(i + 60) * 80) * (i % 2 ? 1 : -1);
      const color = ["#E8772E", "#DC2F34", "#FFC233", "#B5541C", "#F29A38"][i % 5];
      out += `<svg viewBox="-50 -50 100 100" width="${size}" height="${size}" style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg)">
        <path d="M0 -44 L9 -20 L30 -30 L22 -6 L44 -2 L22 12 L28 34 L4 24 L0 46 L-4 24 L-28 34 L-22 12 L-44 -2 L-22 -6 L-30 -30 L-9 -20Z" fill="${color}" stroke="rgba(16,32,74,.35)" stroke-width="3" stroke-linejoin="round"/>
        <path d="M0 46 L0 -30" stroke="rgba(16,32,74,.35)" stroke-width="3"/></svg>`;
    }
    return out;
  };
}

export function charactersScript() {
  const art = Object.fromEntries(PARTS.map((p) => [p, png(join(APP, "assets/scout/rig/wave", p + ".png"))]));
  // Data URLs become blob URLs once, so redrawing a frame never decodes the art again.
  return `<script>
    window.ART = ${JSON.stringify(art)};
    window.artReady = Promise.all(Object.keys(ART).map(async (k) => { ART[k] = URL.createObjectURL(await (await fetch(ART[k])).blob()); }));
    (${inPage.toString()})();
  </script>`;
}
