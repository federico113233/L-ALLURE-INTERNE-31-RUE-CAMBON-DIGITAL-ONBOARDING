import "server-only";

const BASE = "https://api.elevenlabs.io/v1";

export const TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL || "eleven_multilingual_v2";
export const STT_MODEL = process.env.ELEVENLABS_STT_MODEL || "scribe_v2";

export function hasElevenLabs(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}
export function hasVoice(): boolean {
  return hasElevenLabs() && Boolean(process.env.ELEVENLABS_VOICE_ID);
}

export interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface TtsResult {
  audioBase64: string;
  alignment: Alignment | null;
}

// Mademoiselle's delivery: measured, low variance, a touch of style.
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.8,
  style: 0.25,
  use_speaker_boost: true,
  speed: 0.94,
};

export async function synthesize(text: string): Promise<TtsResult> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID is not set");
  const res = await fetch(
    `${BASE}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, model_id: TTS_MODEL, voice_settings: VOICE_SETTINGS }),
    },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { audio_base64: string; alignment?: Alignment | null };
  return { audioBase64: data.audio_base64, alignment: data.alignment ?? null };
}

export async function transcribe(file: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("model_id", STT_MODEL);
  form.append("file", file, filename);
  form.append("language_code", "en");
  form.append("tag_audio_events", "false");
  const res = await fetch(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs STT ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
