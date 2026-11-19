// Renders Scout's Instagram posts from tools/social-posts.mjs: 1080x1350 JPG slides, plus MP4 covers and end cards.
// Usage: node tools/make-social.mjs [postId ...]   (no ids = every post in the file)
// Output: social/<postId>/NN-name.jpg|mp4, and shared end cards in social/endcards/.
// Needs Google Chrome and ffmpeg. Drives one headless Chrome over the DevTools protocol (the `ws` package comes from the app's node_modules).
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { POSTS } from "./social-posts.mjs";
import { charactersScript } from "./characters.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WebSocket = createRequire(join(process.env.HOME, "Documents/cloudNomdas/Scout/scout-us-citizenship-test/package.json"))("ws");
const photo = (name) => `file://${join(ROOT, "tools/photos", name)}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
const L = "ABCD", FPS = 30;

const NAVY = "#12294B", INK = "#10204A";
const THEMES = {
  classic: { bg: "#fff", ink: INK, muted: "#4F5B78", line: "#E3E9F1", lineDeep: "#CBD5E3", go: "#06B4E0", goText: "#006F8F",
    soft: "#E4F7FC", why: "#F3F6FB", head: "Inter", headWeight: 800, track: "-0.035em", tick: INK },
  harvest: { bg: "#FFF8EF", ink: INK, muted: "#62574A", line: "#F0E0CA", lineDeep: "#E0C8A6", go: "#E8772E", goText: "#A34A00",
    soft: "#FDEBD9", why: "#FBEEDD", head: "Fraunces", headWeight: 700, track: "-0.015em", tick: "#fff" },
  night: { bg: NAVY, ink: "#FFFFFF", muted: "#A9B5CC", line: "#2A4470", lineDeep: "#4A6799", go: "#06B4E0", goText: "#7FD6EF",
    soft: "#1D3B66", why: "#1A3560", head: "Inter", headWeight: 800, track: "-0.035em", tick: INK, card: "#183258" },
};

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=block" rel="stylesheet">`;
const css = (T) => `<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:Inter,sans-serif;color:${T.ink};background:${T.bg};position:relative;-webkit-font-smoothing:antialiased}
.pad{position:absolute;inset:120px 90px 0 90px}
.top{display:flex;justify-content:space-between;align-items:center}
.pill{background:${T.soft};border-radius:99px;padding:16px 30px;font-size:29px;font-weight:600}
.num{font-size:28px;font-weight:500;color:${T.muted}}
.foot{position:absolute;left:90px;right:90px;top:1206px;display:flex;justify-content:space-between;align-items:center;font-size:29px}
.brand{display:flex;align-items:center;gap:14px}.dot{display:inline-block;width:18px;height:18px;border-radius:50%;background:${T.go}}
.brand b{font-weight:700}.brand span{color:${T.muted}}
.next{color:${T.goText};font-weight:700;font-size:30px}
:root{--ring-bg:${T.card || T.bg}}
h1{font-family:${T.head},Inter,sans-serif;font-weight:${T.headWeight};letter-spacing:${T.track};line-height:1.14}
.serif{font-family:Fraunces,serif;font-weight:700;letter-spacing:-0.015em}
.opts{display:flex;flex-direction:column}
.opt{display:flex;align-items:center;border:3px solid ${T.line};border-radius:26px;background:${T.card || "#fff"}}
.let{flex:none;border-radius:50%;border:3px solid ${T.lineDeep};display:flex;align-items:center;justify-content:center;font-weight:700}
.why{background:${T.why};border-radius:30px;padding:30px 40px 34px}
.why small{display:block;font-size:26px;font-weight:800;letter-spacing:.14em;color:${T.goText};margin-bottom:10px}
.why p{font-size:31px;line-height:1.4}
.fill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.layer{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.btn{display:inline-flex;align-items:center;gap:22px;height:100px;padding:0 44px;border-radius:99px;font-size:36px;font-weight:700}
</style>`;

// Runs in the page: draws every moving part for time t. data-char, data-kb (Ken Burns zoom), data-leaves, data-pulse, data-hop.
const frameScript = (dur) => `<script>
window.DUR = ${dur};
window.frame = async (t) => {
  await artReady;
  for (const el of document.querySelectorAll("[data-char]")) el.innerHTML = window[el.dataset.char](t, JSON.parse(el.dataset.opts || "{}"));
  for (const el of document.querySelectorAll("[data-kb]")) {
    const [z0, z1, dx, dy] = el.dataset.kb.split(",").map(Number), p = Math.min(1, t / DUR);
    el.style.transform = "scale(" + (z0 + (z1 - z0) * p) + ") translate(" + dx * p + "px," + dy * p + "px)";
  }
  for (const el of document.querySelectorAll("[data-leaves]")) el.innerHTML = leaves(t, +el.dataset.leaves, { w: el.clientWidth, h: el.clientHeight });
  for (const el of document.querySelectorAll("[data-countdown]")) {
    const [start, think] = el.dataset.countdown.split(",").map(Number), left = Math.max(0, Math.min(think, think - (t - start)));
    const go = getComputedStyle(el.parentNode).color, p = left / think;
    el.textContent = Math.ceil(left) || "✓";
    el.style.background = "radial-gradient(closest-side, var(--ring-bg, #fff) 78%, transparent 80% 100%), conic-gradient(" + go + " " + p * 360 + "deg, rgba(128,128,128,.22) 0)";
  }
  for (const el of document.querySelectorAll("[data-pulse]")) el.style.transform = "scale(" + (1 + 0.035 * Math.max(0, Math.sin(t * Math.PI * 2 / 1.5))) + ")";
  for (const el of document.querySelectorAll("[data-hop]")) el.style.transform = "translateY(" + (-26 * Math.abs(Math.sin((t + +el.dataset.hop) * Math.PI))) + "px)";
  await Promise.all([...document.images].map((i) => i.decode().catch(() => 0)));
};
</script>`;

const page = (T, body, { dur = 6, bg } = {}) =>
  `<!doctype html><meta charset=utf-8>${fonts}${css(T)}<body${bg ? ` style="background:${bg}"` : ""}>${body}${charactersScript()}${frameScript(dur)}</body>`;
const char = (name, opts) => `<div data-char="${name}" data-opts='${JSON.stringify(opts)}'></div>`;
const pair = (size, mood = "wave", gap = -50) => `<div style="display:flex;align-items:flex-end">${char("scout", { size, mood })}<div style="margin-left:${gap}px">${char("turkey", { size: size * 0.93, mood })}</div></div>`;
const footer = (T, next) => `<div class="foot"><div class="brand"><i class="dot"></i><b>Scout</b><span>${W("civics")}</span></div><div class="next">${esc(next)}&nbsp; →</div></div>`;
/** Reels play straight through, so nothing says "swipe". */
export const MODE = { reel: false, lang: "en" };
const W = (k) => ({
  en: { civics: "U.S. Civics Test", answerIn: "Answer in", play: "Play along", swipe: "Swipe to start" },
  es: { civics: "Examen de civismo", answerIn: "Responde en", play: "Juega con nosotros", swipe: "Desliza para empezar" },
})[MODE.lang][k];
const swipe = (bg, fg, text = MODE.reel ? W("play") : W("swipe")) => `<div class="btn" data-pulse style="background:${bg};color:${fg};transform-origin:left center">${esc(text)} <span>→</span></div>`;
const eyebrow = (text, color, dot = "#06B4E0") => `<div style="display:flex;align-items:center;gap:16px;font-size:29px;font-weight:700;letter-spacing:.13em;color:${color}"><i class="dot" style="width:18px;height:18px;background:${dot}"></i>${esc(text)}</div>`;

// ---------- Covers (videos) ----------
const COVERS = {
  // Photo across the top, navy panel below; Scout and the turkey stand on the seam.
  band: (c) => page(THEMES.classic, `
    <div style="position:absolute;left:0;top:0;width:1080px;height:800px;overflow:hidden"><img class="fill" data-kb="1,1.08,-14,-8" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
    <div class="layer" data-leaves="9" style="bottom:600px"></div>
    <div style="position:absolute;left:0;right:0;top:760px;bottom:0;background:${NAVY};border-radius:56px 56px 0 0"></div>
    <div style="position:absolute;right:30px;top:418px">${pair(360)}</div>
    <div style="position:absolute;left:90px;right:90px;top:830px;color:#fff">${eyebrow(c.eyebrow || "U.S. CITIZENSHIP TEST", "#D5E2F2")}
      <h1 style="font-size:${c.size || 76}px;margin-top:30px;color:#fff;letter-spacing:-0.04em;line-height:1.08">${esc(c.title)}</h1>
      <p style="font-size:35px;line-height:1.38;margin-top:24px;color:#C9D6EA;max-width:880px">${esc(c.sub)}</p></div>
    <div style="position:absolute;left:90px;top:1196px">${swipe("#06B4E0", INK)}</div>`),

  // Full-bleed photo with a dark top, serif title, the pair in the corner.
  full: (c) => page(THEMES.harvest, `
    <div class="layer"><img class="fill" data-kb="1.02,1.1,10,-6" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
    <div class="layer" style="background:linear-gradient(180deg,rgba(18,41,75,.94) 0%,rgba(18,41,75,.82) 38%,rgba(18,41,75,.15) 70%,rgba(18,41,75,.55) 100%)"></div>
    <div class="layer" data-leaves="10"></div>
    <div style="position:absolute;left:90px;right:90px;top:118px;color:#fff">${eyebrow(c.eyebrow, "#FFE3C4", "#E8772E")}
      <h1 class="serif" style="font-size:${c.size || 92}px;margin-top:44px;color:#fff;line-height:1.06">${esc(c.title)}</h1>
      <p style="font-size:38px;line-height:1.38;margin-top:34px;color:#F3E6D6;max-width:860px">${esc(c.sub)}</p>
      <div style="margin-top:40px">${swipe("#E8772E", "#fff")}</div></div>
    <div style="position:absolute;right:28px;bottom:26px">${pair(380)}</div>`),

  // A place card on the Thanksgiving table.
  placecard: (c) => page(THEMES.harvest, `
    <div class="layer"><img class="fill" data-kb="1.04,1.12,0,10" src="${photo(c.photo)}"></div>
    <div class="layer" style="background:rgba(30,18,8,.28)"></div>
    <div class="layer" data-leaves="8"></div>
    <div style="position:absolute;left:100px;right:100px;top:130px;height:830px;transform:rotate(-1.6deg);background:#FFF8EF;border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.35);padding:22px">
      <div style="height:100%;border:3px dashed #E0C8A6;border-radius:20px;padding:64px 56px 0;text-align:center">
        <div style="font-size:28px;font-weight:800;letter-spacing:.16em;color:#E8772E">${esc(c.eyebrow)}</div>
        <h1 class="serif" style="font-size:${c.size || 80}px;margin-top:34px;line-height:1.08;color:${INK}">${esc(c.title)}</h1>
        <div style="margin:34px auto 30px;width:160px;height:4px;border-radius:4px;background:#E8772E"></div>
        <p style="font-size:35px;line-height:1.4;color:#62574A">${esc(c.sub)}</p>
        <div style="margin-top:34px;font-size:32px;font-weight:700;color:#A34A00" data-pulse>${MODE.reel ? W("play") : W("swipe")}&nbsp; →</div>
      </div></div>
    <div style="position:absolute;left:0;right:0;bottom:24px;display:flex;justify-content:center">${pair(390, "wave", -40)}</div>`),

  // A tilted polaroid on cream, for the holiday card.
  polaroid: (c) => page(THEMES.harvest, `
    <div class="layer" data-leaves="11"></div>
    <div style="position:absolute;left:96px;top:86px;width:888px;padding:28px 28px 96px;background:#fff;transform:rotate(-2.2deg);box-shadow:0 24px 60px rgba(60,35,10,.22);border-radius:8px">
      <div style="height:560px;overflow:hidden;border-radius:4px;position:relative"><img class="fill" data-kb="1,1.08,-10,0" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
      <div class="serif" style="position:absolute;left:0;right:0;bottom:22px;left:44px;text-align:left;font-size:44px;color:#A34A00;font-weight:600">${esc(c.caption || "")}</div></div>
    <div style="position:absolute;left:90px;right:90px;top:880px">${eyebrow(c.eyebrow, "#A34A00", "#E8772E")}
      <h1 class="serif" style="font-size:${c.size || 86}px;margin-top:22px;line-height:1.06;color:${INK}">${esc(c.title)}</h1>
      <p style="font-size:36px;line-height:1.4;margin-top:24px;color:#62574A;max-width:880px">${esc(c.sub)}</p></div>
    <div style="position:absolute;right:30px;top:500px">${pair(320, "wave", -36)}</div>`, { bg: "#FFF8EF" }),
};


// Photo on top, a white sheet rising from the bottom, the pair peeking over its edge on the left.
COVERS.sheet = (c) => page(THEMES.classic, `
  <div class="layer" style="bottom:420px"><img class="fill" data-kb="1,1.08,0,-12" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
  <div class="layer" data-leaves="7" style="bottom:600px"></div>
  <div style="position:absolute;left:0;right:0;top:${c.sheetTop || 700}px;bottom:0;background:#fff;border-radius:60px 60px 0 0;box-shadow:0 -10px 40px rgba(16,32,74,.18)"></div>
  <div style="position:absolute;left:40px;top:${(c.sheetTop || 700) - 300}px">${pair(330)}</div>
  <div style="position:absolute;left:90px;right:90px;top:${(c.sheetTop || 700) + 70}px">${eyebrow(c.eyebrow || "U.S. CITIZENSHIP TEST", "#006F8F")}
    <h1 style="font-size:${c.size || 80}px;margin-top:26px;letter-spacing:-0.04em;line-height:1.06">${esc(c.title)}</h1>
    <p style="font-size:35px;line-height:1.38;margin-top:22px;color:#4F5B78">${esc(c.sub)}</p></div>
  <div style="position:absolute;left:90px;top:1196px">${swipe(NAVY, "#fff")}</div>`);

// Pumpkin-orange page, the photo cut into a round plate, serif title below.
COVERS.plate = (c) => page(THEMES.harvest, `
  <div class="layer" style="background:radial-gradient(circle at 50% 30%,#F08A3E,#D9621C)"></div>
  <div class="layer" data-leaves="12"></div>
  <div style="position:absolute;left:290px;top:70px;width:500px;height:500px;border-radius:50%;background:#fff;box-shadow:0 24px 50px rgba(90,30,0,.35);padding:26px">
    <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;position:relative;border:3px solid #F3E2CC"><img class="fill" data-kb="1.05,1.2,0,0" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div></div>
  <div style="position:absolute;left:90px;right:90px;top:630px;text-align:center;color:#fff">
    <div style="font-size:29px;font-weight:800;letter-spacing:.16em;color:#FFE3C4">${esc(c.eyebrow)}</div>
    <h1 class="serif" style="font-size:${c.size || 84}px;margin-top:20px;line-height:1.04;color:#fff">${esc(c.title)}</h1>
    <p style="font-size:35px;line-height:1.38;margin-top:22px;color:#FFEBD6">${esc(c.sub)}</p></div>
  <div style="position:absolute;left:90px;top:1196px">${swipe("#fff", "#A34A00")}</div>
  <div style="position:absolute;right:24px;bottom:22px">${pair(300)}</div>`);

// Navy page with the photo in an arched window.
COVERS.arch = (c) => page(THEMES.night, `
  <div class="layer" style="background:${NAVY}"></div>
  <div class="layer" data-leaves="6"></div>
  <div style="position:absolute;left:250px;top:70px;width:580px;height:640px;border-radius:290px 290px 28px 28px;overflow:hidden;border:10px solid #fff;box-shadow:0 24px 60px rgba(0,0,0,.35)"><img class="fill" data-kb="1,1.1,0,10" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
  <div style="position:absolute;left:90px;right:90px;top:760px;text-align:center;color:#fff">${`<div style="display:inline-flex">${eyebrow(c.eyebrow, "#D5E2F2")}</div>`}
    <h1 style="font-size:${c.size || 78}px;margin-top:22px;color:#fff;letter-spacing:-0.04em;line-height:1.06">${esc(c.title)}</h1>
    <p style="font-size:35px;line-height:1.38;margin-top:20px;color:#C9D6EA">${esc(c.sub)}</p></div>
  <div style="position:absolute;left:90px;top:1196px">${swipe("#06B4E0", INK)}</div>
  <div style="position:absolute;right:20px;top:440px">${pair(270)}</div>`);

// The turkey up front with a blank "Hello, my name is" sticker.
COVERS.nametag = (c) => page(THEMES.harvest, `
  <div class="layer" style="background:radial-gradient(circle at 50% 75%,#FFF1DE,#FBE3C4)"></div>
  <div class="layer" data-leaves="14"></div>
  <div style="position:absolute;left:90px;right:90px;top:96px;text-align:center">
    <div style="font-size:29px;font-weight:800;letter-spacing:.16em;color:#E8772E">${esc(c.eyebrow)}</div>
    <h1 class="serif" style="font-size:${c.size || 84}px;margin-top:18px;line-height:1.04">${esc(c.title)}</h1>
    <p style="font-size:35px;line-height:1.38;margin-top:20px;color:#62574A">${esc(c.sub)}</p></div>
  <div style="position:absolute;left:0;right:0;bottom:40px;display:flex;justify-content:center;align-items:flex-end">
    <div style="margin-right:-30px">${char("scout", { size: 430 })}</div>${char("turkey", { size: 650, phase: 0.2 })}</div>
  <div style="position:absolute;left:560px;top:1070px;width:250px;transform:rotate(-6deg);border-radius:22px;overflow:hidden;box-shadow:0 14px 30px rgba(90,40,0,.25);background:#fff;border:4px solid ${INK}">
    <div style="background:#DC2F34;color:#fff;text-align:center;padding:14px 0 12px;font-weight:900;font-size:36px;letter-spacing:.04em">HELLO</div>
    <div style="background:#DC2F34;color:#fff;text-align:center;padding:0 0 12px;font-weight:600;font-size:22px">my name is</div>
    <div class="serif" style="height:96px;display:flex;align-items:center;justify-content:center;font-size:68px;color:#B9A58C">???</div>
    <div style="background:#DC2F34;height:22px"></div></div>`);

// Navy page with a tear-off calendar page (c.month, c.day, c.weekday, c.holiday) above a serif title.
COVERS.calendar = (c) => page(THEMES.harvest, `
  <div class="layer" style="background:radial-gradient(circle at 50% 22%,#1D3B66,${NAVY} 62%)"></div>
  <div class="layer" data-leaves="9" style="bottom:700px"></div>
  <div style="position:absolute;left:320px;top:84px;width:440px;transform:rotate(3deg);border-radius:30px;overflow:hidden;background:#FFF8EF;box-shadow:0 30px 70px rgba(0,0,0,.45)">
    <div style="background:#DC2F34;color:#fff;text-align:center;padding:30px 0 24px;font-weight:800;font-size:40px;letter-spacing:.2em;position:relative">${esc(c.month)}
      <i style="position:absolute;left:96px;top:-16px;width:26px;height:50px;border-radius:13px;background:#FFF8EF;border:5px solid ${INK}"></i>
      <i style="position:absolute;right:96px;top:-16px;width:26px;height:50px;border-radius:13px;background:#FFF8EF;border:5px solid ${INK}"></i></div>
    <div style="text-align:center;font-size:27px;font-weight:800;letter-spacing:.2em;color:#62574A;margin-top:30px">${esc(c.weekday)}</div>
    <div class="serif" style="text-align:center;font-size:250px;line-height:.98;color:${INK}">${esc(c.day)}</div>
    <div style="margin:10px 34px 34px;border-radius:99px;background:#FDEBD9;color:#A34A00;text-align:center;padding:16px 0;font-size:31px;font-weight:700">${esc(c.holiday)}</div></div>
  <div style="position:absolute;left:90px;right:90px;top:668px;color:#fff">${eyebrow(c.eyebrow, "#FFE3C4", "#E8772E")}
    <h1 class="serif" style="font-size:${c.size || 84}px;margin-top:26px;color:#fff;line-height:1.05">${esc(c.title)}</h1>
    <p style="font-size:35px;line-height:1.38;margin-top:24px;color:#C9D6EA;max-width:800px">${esc(c.sub)}</p></div>
  <div style="position:absolute;left:90px;top:1196px">${swipe("#E8772E", "#fff")}</div>
  <div style="position:absolute;right:24px;bottom:22px">${pair(280)}</div>`);

// Family photo on top (no leaves: they would cross faces), cream page below with a recipe card (c.card = { title, tag, lines }).
COVERS.recipe = (c) => page(THEMES.harvest, `
  <div style="position:absolute;left:0;top:0;width:1080px;height:560px;overflow:hidden"><img class="fill" data-kb="1,1.08,-10,-6" src="${photo(c.photo)}" style="object-position:${c.focus || "center"}"></div>
  <div style="position:absolute;left:0;right:0;top:500px;bottom:0;background:#FFF8EF;border-radius:56px 56px 0 0"></div>
  <div style="position:absolute;left:90px;right:90px;top:566px">${eyebrow(c.eyebrow, "#A34A00", "#E8772E")}
    <h1 class="serif" style="font-size:${c.size || 82}px;margin-top:24px;line-height:1.05;color:${INK}">${esc(c.title)}</h1></div>
  <div style="position:absolute;left:90px;top:846px;width:590px;transform:rotate(-2deg);background:#fff;border-radius:18px;border:3px solid #E0C8A6;box-shadow:0 18px 40px rgba(90,40,0,.18);padding:22px 34px 20px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:4px solid #DC2F34;padding-bottom:12px">
      <div class="serif" style="font-size:40px;color:${INK}">${esc(c.card.title)}</div>
      <div style="font-size:21px;font-weight:800;letter-spacing:.14em;color:#A34A00">${esc(c.card.tag || "")}</div></div>
    ${c.card.lines.map((l) => `<div style="display:flex;gap:16px;align-items:center;border-bottom:2px solid #CFE3F2;padding:13px 0;font-size:31px;font-weight:600;color:${INK}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8772E" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${esc(l)}</div>`).join("")}</div>
  <div style="position:absolute;left:90px;top:1196px">${swipe("#E8772E", "#fff")}</div>
  <div style="position:absolute;right:20px;bottom:22px">${pair(290)}</div>`);

// ---------- End cards (videos) ----------
function endcard(e) {
  const es = e.lang === "es";
  const checks = es ? ["Todas las preguntas del examen oficial", "Responde en voz alta, como en la entrevista", "En inglés y en español"]
    : ["Every question on the official test", "Answer out loud, like the real interview", "In English and Español"];
  return page(THEMES.classic, `
    <div class="layer"><img class="fill" data-kb="1.06,1.14,0,-20" src="${photo("pie-leaves.jpg")}"></div>
    <div class="layer" style="background:linear-gradient(180deg,rgba(18,41,75,.93),rgba(18,41,75,.84) 60%,rgba(18,41,75,.6))"></div>
    <div class="layer" data-leaves="14"></div>
    <div style="position:absolute;left:90px;right:90px;top:104px;color:#fff">${eyebrow(e.eyebrow || "YOUR SCORE", "#D5E2F2")}
      <h1 style="font-size:84px;margin-top:26px;color:#fff;letter-spacing:-0.04em;line-height:1.05">${esc(e.title || "How many did you get?")}</h1>
      <p style="font-size:36px;margin-top:22px;color:#C9D6EA;line-height:1.35">${esc(e.sub)}</p>
      <div style="margin-top:40px;background:#fff;color:${INK};border-radius:34px;padding:38px 44px">
        <div style="font-size:46px;font-weight:800;letter-spacing:-0.025em">${es ? "Practica las 128 preguntas con Scout" : "Practice all 128 questions with Scout"}</div>
        ${checks.map((c) => `<div style="display:flex;gap:18px;align-items:center;margin-top:18px;font-size:31px;font-weight:500"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#06B4E0" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${esc(c)}</div>`).join("")}
      </div>
      <div style="display:flex;align-items:center;gap:30px;margin-top:34px">
        <div class="btn" data-pulse style="background:#06B4E0;color:${INK};height:92px;font-size:33px;transform-origin:left center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>${es ? "Descarga Scout en el App Store" : "Get Scout on the App Store"}</div>
        <div style="font-size:32px;font-weight:700">${es ? "Link en la bio" : "Link in bio"}</div></div>
      <p style="font-size:22px;margin-top:22px;color:#9FB0CB">${es ? "Scout es una app de estudio independiente. No está afiliada a USCIS ni al gobierno de EE. UU." : "Scout is an independent study app. Not affiliated with USCIS or the U.S. government."}</p>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:-30px;display:flex;justify-content:center;align-items:flex-end;gap:10px">
      <div data-hop="0">${char("scout", { size: 340, mood: "cheer" })}</div><div data-hop="0.5">${char("turkey", { size: 315, mood: "cheer" })}</div></div>`);
}

// ---------- Question slides (stills) ----------
const countdown = (T, { start, think }) => `<div style="display:flex;align-items:center;gap:18px;color:${T.goText};font-weight:700;font-size:30px">${W("answerIn")}
  <div data-countdown="${start},${think}" style="width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:${T.ink}">
  </div></div>`;

// Bilingual slides: the official English wording big, the official Spanish under it (s.es = { q, options, why }).
const foot = (T, right) => `<div class="foot"><div class="brand"><i class="dot"></i><b>Scout</b><span>${W("civics")}</span></div>${right}</div>`;
function questionBi(T, s, i, n, opts) {
  const big = s.q.length > 70 ? 46 : s.q.length > 45 ? 50 : 56;
  return page(T, `<div class="pad">
  <div class="top"><div class="pill">Pregunta ${i} de ${n}</div><div class="num">Pregunta oficial #${s.n}</div></div>
  <h1 style="font-size:${big}px;margin:44px 0 12px">${esc(s.q)}</h1>
  <p style="font-size:${big * 0.66}px;font-weight:600;line-height:1.28;color:${T.goText};margin-bottom:34px">${esc(s.es.q)}</p>
  <div class="opts" style="gap:16px">${s.options.map((o, k) => `
    <div class="opt" style="padding:18px 30px"><div class="let" style="width:64px;height:64px;font-size:28px">${L[k]}</div>
    <div style="margin-left:28px"><div style="font-size:36px;font-weight:600;line-height:1.2">${esc(o)}</div>
    <div style="font-size:27px;font-weight:500;line-height:1.25;color:${T.muted};margin-top:4px">${esc(s.es.options[k])}</div></div></div>`).join("")}
  </div></div>${foot(T, opts.countdown ? countdown(T, opts.countdown) : `<div class="next">Desliza para la respuesta&nbsp; →</div>`)}`);
}
function answerBi(T, s, i, n, last) {
  return page(T, `<div class="pad">
  <div class="top"><div class="pill">Respuesta ${i} de ${n}</div><div class="num">Pregunta oficial #${s.n}</div></div>
  <h1 style="font-size:36px;letter-spacing:-0.02em;margin:38px 0 6px;line-height:1.2">${esc(s.q)}</h1>
  <p style="font-size:27px;font-weight:600;line-height:1.28;color:${T.goText};margin-bottom:24px">${esc(s.es.q)}</p>
  <div class="opts" style="gap:12px">${s.options.map((o, k) => k === s.right ? `
    <div class="opt" style="padding:22px 30px;border:4px solid ${T.go};background:${T.soft}"><div class="let" style="width:64px;height:64px;border:none;background:${T.go}"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${T.tick}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <div style="margin-left:26px"><div style="font-size:38px;font-weight:700;line-height:1.15">${L[k]} · ${esc(o)}</div>
    <div style="font-size:30px;font-weight:600;color:${T.goText};margin-top:4px">${esc(s.es.options[k])}</div></div></div>` : `
    <div class="opt" style="padding:12px 30px"><div class="let" style="width:52px;height:52px;font-size:23px">${L[k]}</div>
    <div style="margin-left:28px;font-size:28px;font-weight:500;color:${T.muted};line-height:1.25">${esc(o)} <span style="opacity:.75">· ${esc(s.es.options[k])}</span></div></div>`).join("")}
  </div>
  <div class="why" style="margin-top:24px;padding:26px 36px 30px"><small>${esc(s.label === "BONUS" ? "DATO" : "POR QUÉ")}</small><p style="font-size:30px">${esc(s.es.why)}</p></div>
  </div>${foot(T, `<div class="next">${last ? "Tu puntaje" : i === n - 1 ? "Última pregunta" : "Siguiente pregunta"}&nbsp; →</div>`)}`);
}

function question(T, s, i, n, opts = {}) {
  if (s.es) return questionBi(T, s, i, n, opts);
  const long = s.q.length > 48 || s.options.some((o) => o.length > 30), big = s.q.length > 48 ? 60 : 68;
  return page(T, `<div class="pad">
  <div class="top"><div class="pill">Question ${i} of ${n}</div><div class="num">Official question #${s.n}</div></div>
  <h1 style="font-size:${big}px;margin:${long ? 52 : 62}px 0 ${long ? 44 : 64}px">${esc(s.q)}</h1>
  <div class="opts" style="gap:${long ? 20 : 24}px">${s.options.map((o, k) => `
    <div class="opt" style="padding:${long ? 24 : 30}px 36px;min-height:${long ? 112 : 132}px"><div class="let" style="width:72px;height:72px;font-size:30px">${L[k]}</div>
    <div style="margin-left:34px;font-size:42px;font-weight:500;line-height:1.24">${esc(o)}</div></div>`).join("")}
  </div></div>${opts.countdown ? `<div class="foot"><div class="brand"><i class="dot"></i><b>Scout</b><span>${W("civics")}</span></div>${countdown(T, opts.countdown)}</div>` : footer(T, "Swipe for the answer")}`);
}

function answer(T, s, i, n, last) {
  if (s.es) return answerBi(T, s, i, n, last);
  return page(T, `<div class="pad">
  <div class="top"><div class="pill">Answer ${i} of ${n}</div><div class="num">Official question #${s.n}</div></div>
  <h1 style="font-size:44px;letter-spacing:-0.02em;margin:46px 0 34px;line-height:1.22">${esc(s.q)}</h1>
  <div class="opts" style="gap:18px">${s.options.map((o, k) => k === s.right ? `
    <div class="opt" style="padding:28px 36px;border:4px solid ${T.go};background:${T.soft}"><div class="let" style="width:72px;height:72px;border:none;background:${T.go}"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${T.tick}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <div style="margin-left:30px;font-size:42px;font-weight:700;line-height:1.16">${L[k]} · ${esc(o)}</div></div>` : `
    <div class="opt" style="padding:18px 36px"><div class="let" style="width:62px;height:62px;font-size:26px">${L[k]}</div>
    <div style="margin-left:34px;font-size:35px;font-weight:500;color:${T.muted};line-height:1.24">${esc(o)}</div></div>`).join("")}
  </div>
  <div class="why" style="margin-top:28px"><small>${esc(s.label || "WHY")}</small><p>${esc(s.why)}</p></div>
  </div>${footer(T, last ? "Your score" : i === n - 1 ? "Last question" : "Next question")}`);
}

// A menu card on the blurred table photo: numbered questions, or the same questions with their answers.
function menu(T, s) {
  const a = s.answers;
  return page(T, `
    <div class="layer"><img class="fill" src="${photo(s.photo)}" style="filter:blur(14px) brightness(.62);transform:scale(1.1)"></div>
    <div style="position:absolute;left:60px;right:60px;top:60px;bottom:60px;background:#FFF8EF;border-radius:34px;box-shadow:0 30px 70px rgba(0,0,0,.35);padding:20px">
      <div style="height:100%;border:3px dashed #E0C8A6;border-radius:22px;padding:50px 46px 0;position:relative">
        <div style="text-align:center;font-size:26px;font-weight:800;letter-spacing:.16em;color:#E8772E">${esc(s.eyebrow)}</div>
        <h1 class="serif" style="text-align:center;font-size:62px;margin:16px 0 ${a ? 26 : 34}px">${esc(s.title)}</h1>
        <div style="display:flex;flex-direction:column;gap:${a ? 20 : 18}px">${s.items.map((it, k) => `
          <div style="display:flex;gap:24px;align-items:flex-start;padding:${a ? "22px 26px" : "22px 26px"};border-radius:22px;background:${a ? "#FDEBD9" : "#fff"};border:3px solid ${a ? "#F6C9A0" : "#F0E0CA"}">
            <div class="serif" style="flex:none;width:52px;height:52px;border-radius:50%;background:${a ? "#E8772E" : "#FFF8EF"};color:${a ? "#fff" : "#A34A00"};border:3px solid ${a ? "#E8772E" : "#E0C8A6"};display:flex;align-items:center;justify-content:center;font-size:28px">${k + 1}</div>
            <div><div style="font-size:${a ? 26 : 33}px;font-weight:${a ? 500 : 600};line-height:1.28;color:${a ? "#62574A" : INK}">${esc(it.q)}</div>
            ${a ? `<div style="font-size:34px;font-weight:700;line-height:1.22;margin-top:4px">${esc(it.a)}</div>` : ""}</div></div>`).join("")}
        </div>
        ${a ? "" : `<div style="position:absolute;left:0;right:0;bottom:84px;display:flex;justify-content:center">${pair(230, "wave", -26)}</div>`}
        <div style="position:absolute;left:46px;right:46px;bottom:30px;display:flex;justify-content:space-between;align-items:center;font-size:27px">
          <div class="brand"><i class="dot"></i><b>Scout</b><span style="color:#62574A">${esc(s.note)}</span></div><div style="color:#A34A00;font-weight:700">${esc(s.next)}&nbsp; →</div></div>
      </div></div>`);
}

// ---------- Chrome over the DevTools protocol ----------
async function chrome() {
  const dir = mkdtempSync(join(tmpdir(), "scout-chrome-"));
  const proc = spawn(CHROME, ["--headless=new", "--hide-scrollbars", "--remote-debugging-port=0", "--allow-file-access-from-files", `--user-data-dir=${dir}`, "about:blank"]);
  const url = await new Promise((ok, no) => {
    let buf = ""; proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/ws:\/\/\S+/); if (m) ok(m[0]); });
    setTimeout(() => no(new Error("Chrome didn't start")), 20000);
  });
  const ws = new WebSocket(url, { perMessageDeflate: false, maxPayload: 1 << 30 });
  await new Promise((ok) => ws.on("open", ok));
  let id = 0; const wait = new Map(), events = [];
  ws.on("message", (m) => { const msg = JSON.parse(m); if (msg.id && wait.has(msg.id)) { wait.get(msg.id)(msg); wait.delete(msg.id); } else events.push(msg); });
  const send = (method, params = {}, sessionId) => new Promise((ok, no) => {
    const n = ++id; wait.set(n, (msg) => msg.error ? no(new Error(method + ": " + msg.error.message)) : ok(msg.result));
    ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable");
  await s("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
  const work = mkdtempSync(join(tmpdir(), "scout-slide-"));
  let count = 0;
  return {
    async open(html) {
      const file = join(work, `slide-${++count}.html`); writeFileSync(file, html);
      events.length = 0;
      await s("Page.navigate", { url: "file://" + file });
      for (let i = 0; i < 600 && !events.some((e) => e.method === "Page.loadEventFired"); i++) await new Promise((r) => setTimeout(r, 25));
      await s("Runtime.evaluate", { expression: "document.fonts.ready.then(() => 1)", awaitPromise: true });
    },
    async shot(t) {
      const r = await s("Runtime.evaluate", { expression: `frame(${t}).then(() => 1)`, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
      return Buffer.from((await s("Page.captureScreenshot", { format: "png" })).data, "base64");
    },
    close() { ws.close(); proc.kill(); },
  };
}

async function still(c, html, out) {
  await c.open(html);
  const png = join(tmpdir(), "scout-still.png"); writeFileSync(png, await c.shot(0));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-q:v", "2", out]);
}

async function video(c, html, out, seconds = 6) {
  await c.open(html);
  const dir = mkdtempSync(join(tmpdir(), "scout-frames-"));
  for (let f = 0; f < seconds * FPS; f++) writeFileSync(join(dir, `${String(f).padStart(4, "0")}.png`), await c.shot(f / FPS));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "%04d.png"),
    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", out]);
  // The first frame doubles as a still, for checking and for the grid thumbnail.
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", join(dir, "0000.png"), "-q:v", "2", out.replace(/\.mp4$/, ".first.jpg")]);
  rmSync(dir, { recursive: true, force: true });
}

export { chrome, still, video, COVERS, endcard, question, answer, menu, THEMES };

// ---------- Build ----------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
const want = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const stillsOnly = process.argv.includes("--stills"); // quick check: covers and end cards as first frames only
const c = await chrome();
try {
  const endDir = join(ROOT, "social/endcards"); mkdirSync(endDir, { recursive: true });
  const madeEnds = new Set();
  const moving = async (html, out, sec) => stillsOnly ? still(c, html, out.replace(/\.mp4$/, ".first.jpg")) : video(c, html, out, sec);
  for (const post of POSTS.filter((p) => !want.length || want.includes(p.id))) {
    const out = join(ROOT, "social", post.id);
    rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
    MODE.lang = post.lang || "en";
    const T = THEMES[post.theme || "classic"];
    const nn = (x) => String(x).padStart(2, "0");
    let n = 1;
    if (post.cover) await moving(COVERS[post.cover.layout](post.cover), join(out, `${nn(n++)}-cover.mp4`), post.cover.seconds || 6);
    const qs = post.questions || [];
    for (const [k, q] of qs.entries()) {
      await still(c, question(T, q, k + 1, qs.length), join(out, `${nn(n++)}-question-${k + 1}.jpg`));
      await still(c, answer(T, q, k + 1, qs.length, k === qs.length - 1), join(out, `${nn(n++)}-answer-${k + 1}.jpg`));
    }
    for (const m of post.menus || []) await still(c, menu(T, m), join(out, `${nn(n++)}-${m.name}.jpg`));
    if (post.end && !madeEnds.has(post.end.id)) {
      await moving(endcard(post.end), join(endDir, `${post.end.id}.mp4`), 6);
      madeEnds.add(post.end.id);
    }
    console.log(post.id, "done");
  }
} finally { c.close(); }
}
