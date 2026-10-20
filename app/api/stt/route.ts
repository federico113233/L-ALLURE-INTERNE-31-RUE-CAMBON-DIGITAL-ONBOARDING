import { hasElevenLabs, transcribe } from "@/lib/server/elevenlabs";

export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  if (!hasElevenLabs()) return Response.json({ error: "Transcription not configured" }, { status: 503 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const file = form.get("audio");
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "Missing audio" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return Response.json({ error: "Recording is too long" }, { status: 413 });
  try {
    const name = file instanceof File && file.name ? file.name : "answer.webm";
    const text = await transcribe(file, name);
    return Response.json({ text });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Transcription failed" }, { status: 502 });
  }
}
