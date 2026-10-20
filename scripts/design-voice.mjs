// Designs Mademoiselle's tailored voice with ElevenLabs Voice Design.
//
//   npm run voice:design            → 3 previews in ./voice-previews (listen, pick one)
//   npm run voice:design -- --v3    → same, with the Eleven v3 voice-design model
//   npm run voice:save -- <id>      → saves the chosen preview as a voice and
//                                     writes ELEVENLABS_VOICE_ID to .env.local
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv, requireEnv, ROOT, setEnvVar } from "./env.mjs";

loadEnv();
const KEY = requireEnv("ELEVENLABS_API_KEY");
const API = "https://api.elevenlabs.io/v1";

// The description never names a real person — it describes the timbre and manner.
const DESCRIPTION =
  "An elderly French woman in her late seventies with a low, slightly husky, smoky contralto voice. " +
  "Parisian aristocratic poise. She speaks English with a refined French accent, crisp consonants, " +
  "and a measured, deliberate pace with short dramatic pauses. Dry wit; imperious yet warm and mentoring, " +
  "as if speaking privately in an elegant Paris salon. Close microphone, studio quality, intimate.";

const SAMPLE =
  "Bienvenue, mon cher. First, black. Then light. Not a dress, but a conquest of freedom. " +
  "At thirty-one rue Cambon, style does not follow time: it precedes it. Before you leave, " +
  "look in the mirror, and remove one thing. That is L'Allure.";

async function call(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`✗ ElevenLabs ${path} → ${res.status}\n${await res.text()}`);
    process.exit(1);
  }
  return res.json();
}

const args = process.argv.slice(2);

if (args[0] === "--save") {
  const generatedVoiceId = args[1];
  if (!generatedVoiceId) {
    console.error("Usage: npm run voice:save -- <generated_voice_id>");
    process.exit(1);
  }
  const voice = await call("/text-to-voice", {
    voice_name: "Mademoiselle — L'Allure Interne",
    voice_description: DESCRIPTION,
    generated_voice_id: generatedVoiceId,
    labels: { project: "allure-interne", accent: "french", age: "old" },
  });
  setEnvVar("ELEVENLABS_VOICE_ID", voice.voice_id);
  console.log(`✓ Voice saved: ${voice.voice_id}\n✓ ELEVENLABS_VOICE_ID written to .env.local — restart \`npm run dev\`.`);
} else {
  const model = args.includes("--v3") ? "eleven_ttv_v3" : "eleven_multilingual_ttv_v2";
  console.log(`Designing Mademoiselle's voice with ${model}…`);
  const out = await call("/text-to-voice/design?output_format=mp3_44100_128", {
    voice_description: DESCRIPTION,
    model_id: model,
    text: SAMPLE,
    guidance_scale: 5,
    loudness: 0.4,
  });
  const dir = join(ROOT, "voice-previews");
  mkdirSync(dir, { recursive: true });
  out.previews.forEach((p, i) => {
    const file = join(dir, `preview-${i + 1}.mp3`);
    writeFileSync(file, Buffer.from(p.audio_base_64, "base64"));
    console.log(`  preview-${i + 1}.mp3  →  ${p.generated_voice_id}`);
  });
  writeFileSync(join(dir, "previews.json"), JSON.stringify(out.previews.map((p) => p.generated_voice_id), null, 2));
  console.log(`\nListen in ./voice-previews, then: npm run voice:save -- <generated_voice_id>`);
}
