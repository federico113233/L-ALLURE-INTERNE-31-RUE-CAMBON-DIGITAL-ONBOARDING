// Edits the film: shots + title cards with cross-dissolves, Mademoiselle's
// narration placed on the scenes, the ambience ducked under her voice.
//   node scripts/film/assemble.mjs  →  video/L-Allure-Interne-film.mp4
import { execFileSync } from "node:child_process";

const XF = 0.6; // cross-dissolve length (s)
const SEGMENTS = [
  { file: "card-open", ss: 0, t: 6.2 },
  { file: "a-prologue", ss: 1.0, t: 16.0 },
  { file: "card-bag", ss: 0, t: 3.0 },
  { file: "b-bag", ss: 0.6, t: 8.6 },
  { file: "card-lexicon", ss: 0, t: 3.0 },
  { file: "c-lexicon", ss: 0.4, t: 9.5 },
  { file: "card-oral", ss: 0, t: 3.0 },
  { file: "d-oral", ss: 2.9, t: 6.6 },
  { file: "e-finale", ss: 0.2, t: 6.2 },
  { file: "card-end", ss: 0, t: 6.4 },
];

// start time of each segment in the final cut
const starts = [];
let acc = 0;
SEGMENTS.forEach((s, i) => {
  starts.push(i === 0 ? 0 : acc - XF);
  acc = starts[i] + s.t;
});
const total = acc;

// narration: [clip, segment index, offset into that segment]
const VOICE = [
  ["n1", 0, 0.8],
  ["n2", 1, 6.0],
  ["n3", 2, 0.3],
  ["n4", 5, 1.5],
  ["n5", 7, 1.0],
];

const args = ["-y", "-loglevel", "error"];
for (const s of SEGMENTS) args.push("-ss", String(s.ss), "-t", String(s.t), "-i", `video/shots/${s.file}.mp4`);
for (const [clip] of VOICE) args.push("-i", `video/narration/${clip}.mp3`);
args.push("-i", "video/music.wav");

const f = [];
// video: normalise, then chain xfades
SEGMENTS.forEach((_, i) => f.push(`[${i}:v]fps=30,scale=1920:1080,setsar=1,format=yuv420p,settb=AVTB[v${i}]`));
let last = "v0";
for (let i = 1; i < SEGMENTS.length; i++) {
  const out = i === SEGMENTS.length - 1 ? "vx" : `x${i}`;
  f.push(`[${last}][v${i}]xfade=transition=fade:duration=${XF}:offset=${starts[i].toFixed(3)}[${out}]`);
  last = out;
}
f.push(`[vx]fade=t=in:st=0:d=0.8,fade=t=out:st=${(total - 1.2).toFixed(2)}:d=1.2[vout]`);

// narration
const vBase = SEGMENTS.length;
const vLabels = VOICE.map(([, seg, off], k) => {
  const ms = Math.round((starts[seg] + off) * 1000);
  f.push(`[${vBase + k}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${ms}|${ms},volume=1.15[n${k}]`);
  return `[n${k}]`;
});
f.push(`${vLabels.join("")}amix=inputs=${VOICE.length}:normalize=0,apad[voice]`);
f.push(`[voice]asplit[voice1][voicekey]`);
// music, ducked under the voice
const mIdx = vBase + VOICE.length;
f.push(`[${mIdx}:a]atrim=0:${total.toFixed(2)},afade=t=out:st=${(total - 3.5).toFixed(2)}:d=3.5,volume=0.55[mus]`);
f.push(`[mus][voicekey]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600[duck]`);
f.push(`[voice1][duck]amix=inputs=2:normalize=0,atrim=0:${total.toFixed(2)},alimiter=limit=0.95[aout]`);

args.push(
  "-filter_complex", f.join(";"),
  "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  "-c:a", "aac", "-b:a", "192k",
  "-t", total.toFixed(2),
  "video/L-Allure-Interne-film.mp4",
);
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log(`film: ${total.toFixed(1)}s`);
console.log(starts.map((s, i) => `${SEGMENTS[i].file} @ ${s.toFixed(1)}s`).join("\n"));
