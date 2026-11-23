// Joins a Reel's slides with swipe transitions and mixes its sound. Shared by make-reel.mjs and make-pitch-reel.mjs.
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const XF = 0.35; // swipe transition between slides
const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
const videoSeconds = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", f]).toString());

/**
 * segs: [{ file, ev: [{ file, at (seconds from that slide's start), gain, vox }] }], in order.
 * bed is the music file, fx.whoosh plays at each swipe. Writes `out` and returns its length in seconds.
 */
export function assemble({ segs, out, bed, fx, musicGain, work }) {
  // Each slide starts XF before the last one ends. Lengths are read from the files, so sound stays on its slide.
  let at = 0;
  segs.forEach((s, k) => { s.at = k ? at - XF : 0; at = s.at + videoSeconds(s.file); });
  const vin = segs.flatMap((s) => ["-i", s.file]);
  let chain = "", last = "0:v";
  segs.slice(1).forEach((s, k) => { chain += `[${last}][${k + 1}:v]xfade=transition=slideleft:duration=${XF}:offset=${s.at.toFixed(3)}[x${k}];`; last = `x${k}`; });
  const silent = join(work, "video.mp4");
  ff(...vin, "-filter_complex", chain.replace(/;$/, ""), "-map", `[${last}]`, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30", silent);
  const total = videoSeconds(silent); // the music fades out against the real end

  // Audio: voice on its own bus, which ducks the music; effects, whooshes at each swipe, then one loudness pass.
  const all = segs.flatMap((s) => s.ev.map((e) => ({ ...e, at: s.at + e.at })));
  segs.slice(1).forEach((s) => all.push({ file: fx.whoosh.file, at: s.at - 0.05, gain: fx.whoosh.gain }));
  const ain = ["-stream_loop", "-1", "-i", bed, ...all.flatMap((e) => ["-i", e.file])];
  const lab = (e, i) => `[${i + 2}:a]adelay=${Math.round(e.at * 1000)}:all=1,volume=${e.gain}[e${i}]`;
  const vox = all.map((e, i) => e.vox ? i : -1).filter((i) => i >= 0), fxs = all.map((e, i) => e.vox ? -1 : i).filter((i) => i >= 0);
  const graph = [
    ...all.map(lab),
    `${vox.map((i) => `[e${i}]`).join("")}amix=inputs=${vox.length}:normalize=0,apad=whole_dur=${total},asplit[vox][key]`, // padded: the ducker stops when its key does
    `${fxs.map((i) => `[e${i}]`).join("")}amix=inputs=${fxs.length}:normalize=0[fx]`,
    `[1:a]atrim=0:${total},afade=t=in:d=0.6,afade=t=out:st=${(total - 1.8).toFixed(2)}:d=1.8,volume=${musicGain}[bed]`,
    `[bed][key]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=420[duck]`,
    `[duck][vox][fx]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,atrim=0:${total}[out]`,
  ].join(";");
  ff("-i", silent, ...ain, "-filter_complex", graph, "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", out);
  return total;
}
