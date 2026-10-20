"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Microphone → MediaRecorder → /api/stt (ElevenLabs Scribe).
export function useRecorder(onTranscript: (text: string) => void) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = () => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => cleanup, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording is not supported in this browser — please type your answer.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        cleanup();
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        if (blob.size < 1200) {
          setState("idle");
          setError("I heard nothing, mon cher. Try again, a little closer.");
          return;
        }
        setState("transcribing");
        try {
          const form = new FormData();
          form.append("audio", blob, type.includes("mp4") ? "answer.mp4" : "answer.webm");
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
          if (!res.ok) throw new Error(data.error || "Transcription failed");
          if (data.text) onTranscript(data.text);
          else setError("I could not hear the words. Please try again, or type.");
        } catch (e) {
          setError(e instanceof Error ? `${e.message} — please type your answer.` : "Transcription failed.");
        } finally {
          setState("idle");
        }
      };
      rec.start(250);
      recRef.current = rec;
      setSeconds(0);
      tick.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setState("recording");
    } catch {
      cleanup();
      setError("Microphone access was refused — please type your answer.");
    }
  }, [onTranscript]);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
  }, []);

  return { state, seconds, error, start, stop };
}
