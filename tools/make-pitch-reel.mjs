// Short "here's your problem, here's the fix" Reels (1080x1350, 30 fps): a hook, one teaching slide, then Scout.
// Unlike the quiz Reels these aren't in tools/social-posts.mjs: each one is written out below as its slides and lines.
// Usage: node --env-file=../scout-us-citizenship-test/.env tools/make-pitch-reel.mjs [--music quiz|lofi|harvest] [id ...]
// Output: social/<id>/reel.mp4. A slide's parts appear as their line is spoken: cue[i] is the second line i starts.
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { AUDIO } from "./social-audio.mjs";
import { MODE, chrome, video, THEMES, page, char, eyebrow, esc, NAVY, INK } from "./make-social.mjs";
import { voice, sfx, music, seconds } from "./eleven.mjs";
import { assemble, XF } from "./reel-mix.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = THEMES.classic;
const tick = (color, size = 30) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const brand = (text, color = C.muted) => `<div class="foot"><div class="brand"><i class="dot"></i><b>Scout</b><span style="color:${color}">${esc(text)}</span></div></div>`;
const glow = `<div class="layer" style="background:radial-gradient(circle at 78% 86%,#1F4A85 0%,${NAVY} 58%)"></div>`;

// ---------- Slides ----------
/** Navy opener: the problem in big type, a second line that arrives with its voice line, Scout in the corner. */
const hook = (h) => (cue) => page(THEMES.night, `${glow}
  <div style="position:absolute;left:90px;right:90px;top:120px;color:#fff">${eyebrow(h.eyebrow, "#D5E2F2")}
    ${h.count ? `<div data-count="0,${h.count},0.1,0.9" style="font-size:330px;font-weight:900;letter-spacing:-0.06em;line-height:1;margin-top:22px;color:#06B4E0">0</div>` : ""}
    <h1 style="font-size:${h.size || 84}px;margin-top:${h.count ? 6 : 40}px;color:#fff;letter-spacing:-0.04em;line-height:1.08">${esc(h.title)}</h1>
    <p data-in="${cue[1] ?? 1.2}" style="font-size:${h.subSize || 46}px;font-weight:600;line-height:1.3;margin-top:34px;color:#7FD6EF;max-width:${h.subWidth || 900}px">${esc(h.sub)}</p></div>
  <div style="position:absolute;right:40px;bottom:36px">${char("scout", { size: h.scout || 400, mood: "wave" })}</div>`);

/** White slide of big numbers, one row per voice line; the last row is the one that matters. */
const numbers = (s) => (cue) => page(C, `<div class="pad">${eyebrow(s.eyebrow, C.goText)}
  <h1 style="font-size:62px;margin:26px 0 40px">${esc(s.title)}</h1>
  ${s.rows.map((r, k) => { const hot = k === s.rows.length - 1; return `
    <div data-in="${cue[k]}" style="display:flex;align-items:center;height:210px;margin-bottom:22px;padding:0 44px;border-radius:34px;border:4px solid ${hot ? C.go : C.line};background:${hot ? C.soft : "#fff"}">
      <div style="flex:none;width:300px;font-size:150px;font-weight:900;letter-spacing:-0.05em;color:${hot ? C.goText : INK}">${r.n}</div>
      <div style="font-size:44px;font-weight:${hot ? 800 : 600};line-height:1.2">${esc(r.label)}</div></div>`; }).join("")}
  <div data-in="${cue[s.rows.length]}" style="display:flex;gap:18px;align-items:center;font-size:36px;font-weight:700;color:${C.goText};margin-top:8px">${tick(C.go, 38)}${esc(s.note)}</div>
  </div>${brand(s.foot)}`);

/** White slide of numbered steps, one per voice line. */
const steps = (s) => (cue) => page(C, `<div class="pad">${eyebrow(s.eyebrow, C.goText)}
  <h1 style="font-size:62px;margin:26px 0 44px">${esc(s.title)}</h1>
  ${s.steps.map((st, k) => `
    <div data-in="${cue[k]}" style="display:flex;align-items:center;gap:36px;min-height:232px;margin-bottom:24px;padding:30px 40px;border-radius:34px;border:4px solid ${C.line};background:#fff">
      <div style="flex:none;width:104px;height:104px;border-radius:50%;background:${C.go};color:${INK};display:flex;align-items:center;justify-content:center;font-size:54px;font-weight:900">${k + 1}</div>
      <div><div style="font-size:46px;font-weight:800;letter-spacing:-0.025em;line-height:1.16">${esc(st.title)}</div>
      <div style="font-size:33px;font-weight:500;line-height:1.32;color:${C.muted};margin-top:10px">${esc(st.sub)}</div></div></div>`).join("")}
  </div>${brand(s.foot)}`);

/** One official question in English, then in Spanish, then its answer. */
const bilingual = (s) => (cue) => page(C, `<div class="pad">
  <div class="top"><div class="pill">Pregunta oficial #${s.n}</div><div class="num">Official question #${s.n}</div></div>
  <div style="font-size:27px;font-weight:800;letter-spacing:.14em;color:${C.muted};margin-top:60px">ENGLISH</div>
  <h1 style="font-size:66px;margin-top:14px">${esc(s.en)}</h1>
  <div data-in="${cue[1]}"><div style="font-size:27px;font-weight:800;letter-spacing:.14em;color:${C.goText};margin-top:52px">ESPAÑOL</div>
    <h1 style="font-size:58px;margin-top:14px;color:${C.goText}">${esc(s.es)}</h1></div>
  <div data-in="${cue[2]}" style="margin-top:64px;display:flex;align-items:center;gap:34px;padding:38px 44px;border-radius:34px;border:4px solid ${C.go};background:${C.soft}">
    <div style="flex:none;width:96px;height:96px;border-radius:50%;background:${C.go};display:flex;align-items:center;justify-content:center">${tick(INK, 46)}</div>
    <div><div style="font-size:64px;font-weight:800;letter-spacing:-0.03em">${esc(s.answer)}</div>
    <div style="font-size:32px;font-weight:600;color:${C.goText};margin-top:6px">${esc(s.note)}</div></div></div>
  </div>${brand("Examen de civismo")}`);

/** Navy closer: what Scout does about it, the App Store button, Scout cheering. No holiday art, so it works all year. */
const cta = (e) => () => { const es = e.lang === "es";
  const checks = es ? ["Todas las preguntas del examen oficial", "Responde en voz alta, como en la entrevista", "En inglés y en español"]
    : ["Every question on the official test", "Answer out loud, like the real interview", "In English and Español"];
  return page(THEMES.night, `${glow}
  <div style="position:absolute;left:90px;right:90px;top:110px;color:#fff">${eyebrow(es ? "CONOCE A SCOUT" : "MEET SCOUT", "#D5E2F2")}
    <h1 style="font-size:${e.size || 74}px;margin-top:26px;color:#fff;letter-spacing:-0.04em;line-height:1.08">${esc(e.title)}</h1>
    <div style="margin-top:40px;background:#fff;color:${INK};border-radius:34px;padding:34px 44px 38px">
      ${checks.map((c) => `<div style="display:flex;gap:18px;align-items:center;margin-top:14px;font-size:33px;font-weight:600">${tick("#06B4E0")}${esc(c)}</div>`).join("")}</div>
    <div style="display:flex;align-items:center;gap:30px;margin-top:36px">
      <div class="btn" data-pulse style="background:#06B4E0;color:${INK};height:92px;font-size:33px;transform-origin:left center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>${es ? "Descarga Scout en el App Store" : "Get Scout on the App Store"}</div>
      <div style="font-size:32px;font-weight:700">${es ? "Link en la bio" : "Link in bio"}</div></div>
    <p style="font-size:22px;margin-top:22px;color:#9FB0CB">${es ? "Scout es una app de estudio independiente. No está afiliada a USCIS ni al gobierno de EE. UU." : "Scout is an independent study app. Not affiliated with USCIS or the U.S. government."}</p></div>
  <div style="position:absolute;left:0;right:0;bottom:-30px;display:flex;justify-content:center"><div data-hop="0">${char("scout", { size: 380, mood: "cheer" })}</div></div>`); };

// ---------- The Reels ----------
// Each slide: html (above), lines River or Fernanda ("es") says in order, `pop` to tick each line's reveal,
// `chime` for the line that reveals an answer, `gap` seconds of quiet before a line.
const REELS = [
  { id: "post23", // 128 questions feels like a lot. You need 12.
    slides: [
      { html: hook({ eyebrow: "U.S. CITIZENSHIP TEST", count: 128, title: "questions on the citizenship test.", size: 70, sub: "Sounds like a lot. Here's the math.", subWidth: 560, scout: 360 }),
        lines: [{ say: "One hundred twenty-eight questions on the citizenship test?" }, { say: "Here's the math." }] },
      { html: numbers({ eyebrow: "THE MATH", title: "How the test really works", foot: "2025 civics test", note: "Get 12 and the officer stops asking.",
          rows: [{ n: 128, label: "questions on the official list" }, { n: 20, label: "is the most the officer will ask" }, { n: 12, label: "right answers and you pass" }] }),
        pop: true, lines: [{ say: "There are one hundred twenty-eight questions on the official list." }, { say: "The officer asks up to twenty." },
          { say: "You need twelve right to pass." }, { say: "And once you get twelve, the officer stops." }] },
      { html: cta({ title: "Scout teaches all 128, one topic at a time." }), end: true,
        lines: [{ say: "Scout teaches all one hundred twenty-eight, one topic at a time. Link in bio." }] },
    ] },
  { id: "post24", lang: "es", // Studying in your second language
    slides: [
      { html: hook({ eyebrow: "EN INGLÉS Y ESPAÑOL", title: "¿Estudias para la ciudadanía en tu segundo idioma?", size: 80, sub: "Studying for the citizenship test in your second language?", subSize: 40, subWidth: 620, scout: 360 }),
        lines: [{ say: "¿Estudias para el examen de ciudadanía en tu segundo idioma?", lang: "es" }, { say: "Studying in your second language?" }] },
      { html: bilingual({ n: 119, en: "What is the capital of the United States?", es: "¿Cuál es la capital de los Estados Unidos?", answer: "Washington, D.C.", note: "Misma respuesta en los dos idiomas." }),
        lines: [{ say: "What is the capital of the United States?" }, { say: "¿Cuál es la capital de los Estados Unidos?", lang: "es" }, { say: "Washington, D.C.", gap: 1.1, chime: true }] },
      { html: cta({ lang: "es", title: "Practica las 128 preguntas en inglés y en español.", size: 70 }), end: true,
        lines: [{ say: "Practica las ciento veintiocho preguntas con Scout, en inglés y en español. El link está en la bio.", lang: "es" }] },
    ] },
  { id: "post25", // Your interview is in 2 weeks
    slides: [
      { html: hook({ eyebrow: "INTERVIEW COMING UP?", title: "Your citizenship\ninterview is in\n2 weeks.", size: 100, sub: "Here's what to do tonight.", subWidth: 560 }),
        lines: [{ say: "Citizenship interview coming up?" }, { say: "Here's what to do tonight." }] },
      { html: steps({ eyebrow: "TONIGHT'S PLAN", title: "3 things to do before your interview", foot: "U.S. Civics Test",
          steps: [{ title: "Learn how the test works", sub: "Up to 20 questions, asked out loud. 12 right to pass." },
            { title: "Practice out loud, every day", sub: "The officer asks. You answer by speaking." },
            { title: "Check who's in office now", sub: "Some answers change after elections." }] }),
        pop: true, lines: [{ say: "One. Learn how the test works: up to twenty questions, asked out loud. Twelve right to pass." },
          { say: "Two. Practice answering out loud, every day." }, { say: "Three. Check who's in office now. Those answers can change." }] },
      { html: cta({ title: "Practice all 128 questions out loud with Scout." }), end: true,
        lines: [{ say: "Scout helps you practice all one hundred twenty-eight questions, out loud. Link in bio." }] },
    ] },
];

// ---------- Build ----------
const args = process.argv.slice(2);
const pick = args.includes("--music") ? args[args.indexOf("--music") + 1] : "lofi";
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--music");
MODE.reel = true;
const bed = await music(AUDIO.music[pick], 60000);
const fx = Object.fromEntries(await Promise.all(Object.entries(AUDIO.sfx).map(async ([k, v]) => [k, { file: await sfx(v.text, v.seconds), gain: v.gain }])));
const pop = { file: await sfx("Soft short bubble pop, a friendly app notification, clean", 0.5), gain: 0.4 };
const c = await chrome();
try {
  for (const reel of REELS.filter((r) => !ids.length || ids.includes(r.id))) {
    MODE.lang = reel.lang || "en";
    const work = mkdtempSync(join(tmpdir(), `pitch-${reel.id}-`)), segs = [];
    for (const [k, s] of reel.slides.entries()) {
      const cue = [], ev = [];
      let at = (k ? XF : 0) + 0.25;
      for (const l of s.lines) {
        at += l.gap || 0;
        const file = await voice(l.say, l.lang || "en");
        cue.push(+at.toFixed(2));
        ev.push({ file, at, gain: 1, vox: true });
        if (l.chime) ev.push({ file: fx.chime.file, at: at - 0.15, gain: fx.chime.gain });
        else if (s.pop) ev.push({ file: pop.file, at: at - 0.05, gain: pop.gain });
        at += seconds(file) + 0.3;
      }
      const len = Math.ceil((at + (s.end ? 1.6 : 0.5)) * 30) / 30, file = join(work, `s${k}.mp4`);
      await video(c, s.html(cue), file, len);
      segs.push({ file, ev });
    }
    mkdirSync(join(ROOT, "social", reel.id), { recursive: true });
    const total = assemble({ segs, out: join(ROOT, "social", reel.id, "reel.mp4"), bed, fx, musicGain: AUDIO.musicGain, work });
    rmSync(work, { recursive: true, force: true });
    console.log(`${reel.id}: reel.mp4, ${total.toFixed(1)} s, music "${pick}"`);
  }
} finally { c.close(); }
