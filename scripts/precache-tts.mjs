// Pre-generates Mademoiselle's audio for every authored line (welcomes, floor
// intros, prism quotes, lexicon presets, Grand Oral questions) into
// public/tts-cache/<hash>.json. The client checks this cache before calling
// /api/tts, so the live demo starts instantly and works even if ElevenLabs is slow.
//
//   npm run demo:precache            (skips lines already cached)
//   npm run demo:precache -- --force (regenerates everything, e.g. after a voice change)
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv, requireEnv, ROOT } from "./env.mjs";

loadEnv();
const KEY = requireEnv("ELEVENLABS_API_KEY");
const VOICE = requireEnv("ELEVENLABS_VOICE_ID");
const MODEL = process.env.ELEVENLABS_TTS_MODEL || "eleven_multilingual_v2";
const force = process.argv.includes("--force");

// Node ≥ 22.18 strips TypeScript types natively.
const { DEPARTMENTS, FACETS } = await import("../lib/departments.ts");
const { FLOORS } = await import("../lib/floors.ts");
const { LEXICON_PRESETS } = await import("../lib/lexicon.ts");
const { CHAPTERS, COLOURS, HUB_LINES, PROLOGUE } = await import("../lib/journey/content.ts");

const lines = new Set();
for (const d of Object.values(DEPARTMENTS)) {
  lines.add(d.welcome);
  d.oral.forEach((q, i) => lines.add(`Question ${i + 1}. ${q.question}`));
}
FLOORS.forEach((f) => lines.add(f.intro));
FACETS.forEach((f) => lines.add(f.mademoiselle));
LEXICON_PRESETS.forEach((p) => lines.add(p.result.spoken));
// Le Parcours — the journey through the Galerie
lines.add(PROLOGUE.letter);
lines.add(PROLOGUE.doors);
lines.add(HUB_LINES.return);
lines.add(HUB_LINES.locked);
for (const d of Object.values(DEPARTMENTS)) lines.add(HUB_LINES.arrival(d.name));
for (const c of CHAPTERS) {
  lines.add(c.intro);
  lines.add(c.outro);
  for (const st of c.steps) if (st.kind === "explore") st.hotspots.forEach((h) => lines.add(h.spoken));
}
COLOURS.forEach((c) => lines.add(`${c.name}. ${c.text}`));

// Must match lib/client/voice.tsx → sha(): first 10 bytes of SHA-256, hex.
const hash = (t) => createHash("sha256").update(t, "utf8").digest().subarray(0, 10).toString("hex");

// Same delivery as lib/server/elevenlabs.ts
const VOICE_SETTINGS = { stability: 0.55, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 0.94 };

const dir = join(ROOT, "public", "tts-cache");
mkdirSync(dir, { recursive: true });

let made = 0;
let chars = 0;
for (const text of lines) {
  const file = join(dir, `${hash(text.trim())}.json`);
  if (!force && existsSync(file)) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), model_id: MODEL, voice_settings: VOICE_SETTINGS }),
    },
  );
  if (!res.ok) {
    console.error(`✗ ${res.status} for “${text.slice(0, 50)}…”\n${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  writeFileSync(file, JSON.stringify({ audioBase64: data.audio_base64, alignment: data.alignment ?? null }));
  made++;
  chars += text.length;
  console.log(`✓ ${hash(text.trim())}  ${text.slice(0, 64)}…`);
}
console.log(`\n${made} new clips (${chars} characters), ${lines.size} lines in total → public/tts-cache`);
