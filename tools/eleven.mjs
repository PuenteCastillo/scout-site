// ElevenLabs calls for the post audio, each cached in tools/audio/ by exactly what was asked, so reruns are free.
// Needs ELEVENLABS_API_KEY: run scripts with `node --env-file=../scout-us-citizenship-test/.env …`.
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CACHE = join(dirname(fileURLToPath(import.meta.url)), "audio");
// J.P's picks for the app (scout-us-citizenship-test/scripts/make-voice.mjs): River in English, Fernanda in Spanish.
const VOICES = { en: "SAz9YHcvj6GT2YYXdXww", es: "NyQ87MpRGbszyh7rZLXM" };
mkdirSync(CACHE, { recursive: true });

async function cached(kind, body, path) {
  const file = join(CACHE, `${kind}-${createHash("sha1").update(JSON.stringify(body)).digest("hex").slice(0, 12)}.mp3`);
  if (existsSync(file)) return file;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("Set ELEVENLABS_API_KEY (node --env-file=../scout-us-citizenship-test/.env …)");
  const res = await fetch(`https://api.elevenlabs.io${path}`, { method: "POST", headers: { "xi-api-key": key, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${kind}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log("  made", kind, file.split("/").pop());
  return file;
}

export const voice = (text, lang = "en") => { const b = { text, model_id: "eleven_v4", voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 } };
  // English keeps its original cache key, so lines already made are reused.
  return cached("voice", lang === "en" ? b : { ...b, lang }, `/v1/text-to-speech/${VOICES[lang]}?output_format=mp3_44100_128`); };
export const sfx = (text, seconds) => cached("sfx", { text, duration_seconds: seconds, prompt_influence: 0.5 }, "/v1/sound-generation?output_format=mp3_44100_128");
export const music = (prompt, ms) => cached("music", { prompt, music_length_ms: ms, force_instrumental: true }, "/v1/music?output_format=mp3_44100_128");
export const seconds = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
