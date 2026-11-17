// Turns a post from tools/social-posts.mjs into one continuous Reel with sound (1080x1350, 30 fps):
// cover → each question (River reads it, then a 3-second countdown) → its answer (River reads only the right one) → end card.
// Usage: node --env-file=../scout-us-citizenship-test/.env tools/make-reel.mjs [--music quiz|lofi|harvest] postId ...
// Output: social/<postId>/reel.mp4. Voice, effects and music come from ElevenLabs via tools/eleven.mjs (cached).
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { POSTS } from "./social-posts.mjs";
import { AUDIO } from "./social-audio.mjs";
import { MODE, chrome, still, video, COVERS, endcard, question, answer, THEMES } from "./make-social.mjs";
import { voice, sfx, music, seconds } from "./eleven.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pick = args.includes("--music") ? args[args.indexOf("--music") + 1] : "quiz";
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--music");
const XF = 0.35;      // swipe transition between slides
const THINK = 3;      // countdown before each answer
const L = "ABCD";
const spoken = (s) => s.replace(/\s*\([^)]*\)/g, "").replace(/[“”]/g, '"').trim();
const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

MODE.reel = true;
const bed = await music(AUDIO.music[pick], 60000);
const fx = Object.fromEntries(await Promise.all(Object.entries(AUDIO.sfx).map(async ([k, v]) => [k, { file: await sfx(v.text, v.seconds), gain: v.gain }])));
const c = await chrome();
try {
  for (const id of ids) {
    const post = POSTS.find((p) => p.id === id);
    if (!post) throw new Error("No post " + id);
    const bi = post.lang === "es";
    MODE.lang = post.lang || "en";
    const T = THEMES[post.theme || "classic"], work = mkdtempSync(join(tmpdir(), `reel-${id}-`));
    const segs = [], events = []; // events: { file, at (s from this slide's start), gain, vox }
    const slide = (file, len, ev) => segs.push({ file, len, ev });

    // Cover
    const cov = AUDIO.cover[id], cv = await voice(cov.say, bi ? "es" : "en"), cvl = seconds(cv);
    const covLen = Math.max(6, 0.4 + cvl + 0.9);
    await video(c, COVERS[post.cover.layout](post.cover), join(work, "cover.mp4"), covLen);
    slide(join(work, "cover.mp4"), covLen, [{ file: cv, at: 0.4, gain: 1, vox: true },
      ...await Promise.all((cov.sfx || []).map(async (s) => ({ file: await sfx(s.text, s.seconds), at: s.at, gain: s.gain })))]);

    // Questions and answers
    const qs = post.questions || [];
    for (const [k, q] of qs.entries()) {
      // River asks in English; in bilingual posts Fernanda then asks in Spanish.
      const qv = await voice(spoken(q.q)), qvl = seconds(qv);
      const qes = bi ? await voice(spoken(q.es.q), "es") : null, qesAt = XF + qvl + 0.3;
      const start = (bi ? qesAt + seconds(qes) : XF + qvl) + 0.35, qLen = start + THINK + 0.3;
      await video(c, question(T, q, k + 1, qs.length, { countdown: { start, think: THINK } }), join(work, `q${k}.mp4`), qLen);
      slide(join(work, `q${k}.mp4`), qLen, [{ file: qv, at: XF, gain: 1, vox: true }, { file: fx.tick.file, at: start, gain: fx.tick.gain },
        ...(bi ? [{ file: qes, at: qesAt, gain: 1, vox: true }] : [])]);

      const av = await voice(`The answer is ${L[q.right]}: ${spoken(q.options[q.right])}.`), avl = seconds(av);
      const aes = bi ? await voice(`La respuesta es la ${L[q.right]}: ${spoken(q.es.options[q.right])}.`, "es") : null, aesAt = XF + 0.35 + avl + 0.3;
      const aLen = (bi ? aesAt + seconds(aes) : XF + 0.35 + avl) + 1.1;
      await still(c, answer(T, q, k + 1, qs.length, k === qs.length - 1), join(work, `a${k}.jpg`));
      ff("-loop", "1", "-t", String(aLen), "-i", join(work, `a${k}.jpg`), "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", join(work, `a${k}.mp4`));
      slide(join(work, `a${k}.mp4`), aLen, [{ file: fx.chime.file, at: XF - 0.05, gain: fx.chime.gain }, { file: av, at: XF + 0.35, gain: 1, vox: true },
        ...(bi ? [{ file: aes, at: aesAt, gain: 1, vox: true }] : [])]);
    }

    // End card
    const end = AUDIO.end[post.end.id], ev = await voice(end.say, bi ? "es" : "en"), evl = seconds(ev);
    const endLen = Math.max(6, 0.3 + evl + 1.4);
    await video(c, endcard(post.end), join(work, "end.mp4"), endLen);
    slide(join(work, "end.mp4"), endLen, [{ file: ev, at: 0.3, gain: 1, vox: true },
      ...await Promise.all((end.sfx || []).map(async (s) => ({ file: await sfx(s.text, s.seconds), at: s.at, gain: s.gain })))]);

    // Video: the slides joined by swipe transitions. Each slide starts XF earlier than the last one ends.
    let at = 0; segs.forEach((s, k) => { s.at = k ? at - XF : 0; at = s.at + s.len; });
    const total = at;
    const vin = segs.flatMap((s) => ["-i", s.file]);
    let chain = "", last = "0:v";
    segs.slice(1).forEach((s, k) => { chain += `[${last}][${k + 1}:v]xfade=transition=slideleft:duration=${XF}:offset=${s.at.toFixed(3)}[x${k}];`; last = `x${k}`; });
    const silent = join(work, "video.mp4");
    ff(...vin, "-filter_complex", chain.replace(/;$/, ""), "-map", `[${last}]`, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30", silent);

    // Audio: voice on its own bus, which ducks the music; effects, whooshes at each swipe, then one loudness pass.
    const all = segs.flatMap((s) => s.ev.map((e) => ({ ...e, at: s.at + e.at })));
    segs.slice(1).forEach((s) => all.push({ file: fx.whoosh.file, at: s.at - 0.05, gain: fx.whoosh.gain }));
    const ain = ["-stream_loop", "-1", "-i", bed, ...all.flatMap((e) => ["-i", e.file])];
    const lab = (e, i) => `[${i + 2}:a]adelay=${Math.round(e.at * 1000)}:all=1,volume=${e.gain}[e${i}]`;
    const vox = all.map((e, i) => e.vox ? i : -1).filter((i) => i >= 0), fxs = all.map((e, i) => e.vox ? -1 : i).filter((i) => i >= 0);
    const graph = [
      ...all.map(lab),
      `${vox.map((i) => `[e${i}]`).join("")}amix=inputs=${vox.length}:normalize=0,asplit[vox][key]`,
      `${fxs.map((i) => `[e${i}]`).join("")}amix=inputs=${fxs.length}:normalize=0[fx]`,
      `[1:a]atrim=0:${total},afade=t=in:d=0.6,afade=t=out:st=${(total - 1.8).toFixed(2)}:d=1.8,volume=${AUDIO.musicGain}[bed]`,
      `[bed][key]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=420[duck]`,
      `[duck][vox][fx]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,atrim=0:${total}[out]`,
    ].join(";");
    const out = join(ROOT, "social", id, "reel.mp4");
    ff("-i", silent, ...ain, "-filter_complex", graph, "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", out);
    rmSync(work, { recursive: true, force: true });
    console.log(`${id}: reel.mp4, ${total.toFixed(1)} s, music "${pick}"`);
  }
} finally { c.close(); }
