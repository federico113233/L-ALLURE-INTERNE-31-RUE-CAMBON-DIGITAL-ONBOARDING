"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// ─── Mademoiselle's voice engine ───────────────────────────────────────────
// speak(text) → ElevenLabs audio + character alignment → word timings that drive
// the kinetic typography; an AnalyserNode gives the live level for the ink waves.
// If the voice is unavailable (no key, offline, muted), it falls back to a
// "silent reading" with simulated timings, so the stage never goes dead.

export interface Word {
  text: string;
  start: number;
  end: number;
}

export interface Utterance {
  id: number;
  text: string;
  words: Word[];
  duration: number;
  silent: boolean;
}

type Status = "idle" | "loading" | "speaking";

interface Voice {
  status: Status;
  utterance: Utterance | null;
  muted: boolean;
  /** null = unknown yet; false = server has no voice configured. */
  available: boolean | null;
  /** Mademoiselle is composing an answer (a Claude call is in flight). */
  thinking: boolean;
  setThinking: (v: boolean) => void;
  setMuted: (m: boolean) => void;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  prime: () => void;
  getTime: () => number;
  getLevel: () => number;
}

const VoiceContext = createContext<Voice | null>(null);

interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

function alignWords(al: Alignment): Word[] {
  const words: Word[] = [];
  let cur: Word | null = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    const s = al.character_start_times_seconds[i];
    const e = al.character_end_times_seconds[i];
    if (!cur) cur = { text: ch, start: s, end: e };
    else {
      cur.text += ch;
      cur.end = e;
    }
  });
  if (cur) words.push(cur);
  return words;
}

function simulateWords(text: string): Word[] {
  const words: Word[] = [];
  let t = 0.25;
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const d = 0.13 + 0.052 * w.length;
    words.push({ text: w, start: t, end: t + d });
    t += d + 0.04;
    if (/[.!?…]$/.test(w)) t += 0.42;
    else if (/[,;:—]$/.test(w)) t += 0.2;
  }
  return words;
}

async function sha(text: string): Promise<string | null> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .slice(0, 10)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

function b64ToBlobUrl(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
}

const MUTE_KEY = "allure-interne:muted";

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [utterance, setUtterance] = useState<Utterance | null>(null);
  const [muted, setMutedState] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [thinking, setThinking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const tokenRef = useRef(0);
  const silentStartRef = useRef(0);
  const silentRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef<string | null>(null);
  const mutedRef = useRef(false);
  const availableRef = useRef<boolean | null>(null);
  const checkedAtRef = useRef(0);
  /** A line the browser refused to autoplay; replayed on the next click. */
  const pendingRef = useRef<string | null>(null);

  const checkHealth = useCallback(async () => {
    checkedAtRef.current = Date.now();
    try {
      const h = (await (await fetch("/api/health", { cache: "no-store" })).json()) as { voice?: boolean };
      availableRef.current = Boolean(h.voice);
    } catch {
      availableRef.current = false;
    }
    setAvailable(availableRef.current);
    return availableRef.current;
  }, []);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate preference once
      if (localStorage.getItem(MUTE_KEY) === "1") setMutedState(true);
    } catch {
      /* ignore */
    }
    void checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    if (!ctxRef.current && typeof window !== "undefined" && "AudioContext" in window) {
      try {
        const ctx = new AudioContext();
        const src = ctx.createMediaElementSource(audioRef.current);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.82;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
        bufRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      } catch {
        /* analyser is decorative — playback still works without it */
      }
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    return audioRef.current;
  }, []);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const stop = useCallback(() => {
    tokenRef.current++;
    clearTimer();
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.onended = null;
    }
    setStatus("idle");
  }, []);

  const playSilent = useCallback((id: number, text: string) => {
    const words = simulateWords(text);
    const duration = words.length ? words[words.length - 1].end + 0.4 : 1;
    silentRef.current = true;
    silentStartRef.current = performance.now();
    setUtterance({ id, text, words, duration, silent: true });
    setStatus("speaking");
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (tokenRef.current === id) setStatus("idle");
    }, duration * 1000);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      stop();
      const id = ++tokenRef.current;

      pendingRef.current = null;
      if (mutedRef.current) {
        playSilent(id, clean);
        return;
      }

      const audio = ensureAudio();
      setStatus("loading");

      let data: { audio_base64?: string; audioBase64?: string; alignment?: Alignment | null } | null = null;
      // 1) pre-generated demo audio (public/tts-cache), 2) live ElevenLabs
      const hash = await sha(clean);
      if (hash) {
        try {
          const r = await fetch(`/tts-cache/${hash}.json`);
          if (r.ok) data = await r.json();
        } catch {
          /* not cached */
        }
      }
      // Live voice: if it looked unavailable (e.g. keys added after this page
      // loaded), re-check the server at most every 20 s instead of giving up.
      if (!data && availableRef.current === false && Date.now() - checkedAtRef.current > 20_000) {
        await checkHealth();
      }
      if (!data && availableRef.current !== false) {
        try {
          const r = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean }),
          });
          if (r.ok) data = await r.json();
          else if (r.status === 503) {
            availableRef.current = false;
            setAvailable(false);
          }
        } catch {
          /* network down */
        }
      }
      if (tokenRef.current !== id) return;

      const b64 = data?.audioBase64 ?? data?.audio_base64;
      if (!b64) {
        playSilent(id, clean);
        return;
      }

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = b64ToBlobUrl(b64);
      audio.src = urlRef.current;
      const words = data?.alignment ? alignWords(data.alignment) : simulateWords(clean);
      const last = words.length ? words[words.length - 1].end : 0;

      silentRef.current = false;
      audio.onended = () => {
        if (tokenRef.current === id) setStatus("idle");
      };
      try {
        await audio.play();
      } catch (err) {
        // Autoplay blocked (no click yet on this page) or decode error: read
        // silently now, and replay the line with sound on the next click.
        if (err instanceof DOMException && err.name === "NotAllowedError") pendingRef.current = clean;
        if (tokenRef.current === id) playSilent(id, clean);
        return;
      }
      if (tokenRef.current !== id) return;
      setUtterance({
        id,
        text: clean,
        words,
        duration: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : last + 0.3,
        silent: false,
      });
      setStatus("speaking");
    },
    [ensureAudio, playSilent, stop, checkHealth],
  );

  // The first click or key press anywhere unlocks audio for the whole page
  // (browsers block sound until the visitor interacts). If a line was refused
  // before that, she says it again — unless the click itself started a new line.
  useEffect(() => {
    const unlock = () => {
      ensureAudio();
      const pending = pendingRef.current;
      if (!pending) return;
      const before = tokenRef.current;
      setTimeout(() => {
        if (pendingRef.current === pending && tokenRef.current === before) void speak(pending);
      }, 300);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [ensureAudio, speak]);

  const prime = useCallback(() => {
    ensureAudio();
  }, [ensureAudio]);

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedState(m);
      mutedRef.current = m;
      try {
        localStorage.setItem(MUTE_KEY, m ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (m && !silentRef.current && audioRef.current && !audioRef.current.paused) stop();
    },
    [stop],
  );

  const getTime = useCallback(() => {
    if (silentRef.current) return (performance.now() - silentStartRef.current) / 1000;
    return audioRef.current?.currentTime ?? 0;
  }, []);

  const getLevel = useCallback(() => {
    if (silentRef.current) {
      const t = performance.now() / 1000;
      return 0.18 + 0.12 * Math.abs(Math.sin(t * 5.3)) * Math.abs(Math.sin(t * 1.7));
    }
    const a = analyserRef.current;
    const buf = bufRef.current;
    if (!a || !buf || !audioRef.current || audioRef.current.paused) return 0;
    a.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / buf.length) * 3.2);
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void ctxRef.current?.close();
    },
    [],
  );

  const value = useMemo<Voice>(
    () => ({
      status,
      utterance,
      muted,
      available,
      thinking,
      setThinking,
      setMuted,
      speak,
      stop,
      prime,
      getTime,
      getLevel,
    }),
    [status, utterance, muted, available, thinking, setMuted, speak, stop, prime, getTime, getLevel],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): Voice {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used inside VoiceProvider");
  return ctx;
}
