import { z } from "zod";
import { hasVoice, synthesize, type TtsResult } from "@/lib/server/elevenlabs";
import { errorResponse, readJson } from "@/lib/server/http";

export const maxDuration = 60;

const Body = z.object({ text: z.string().trim().min(1).max(1500) });

// Small in-memory cache: repeated lines (welcome, presets) are free after the first call.
const cache = new Map<string, TtsResult>();
const MAX_ENTRIES = 80;

export async function POST(req: Request) {
  try {
    const { text } = await readJson(req, Body);
    if (!hasVoice()) return Response.json({ error: "Voice not configured" }, { status: 503 });

    const hit = cache.get(text);
    if (hit) return Response.json(hit);

    const result = await synthesize(text);
    cache.set(text, result);
    if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("ElevenLabs")) {
      console.error(err.message);
      return Response.json({ error: "Voice unavailable" }, { status: 502 });
    }
    return errorResponse(err);
  }
}
