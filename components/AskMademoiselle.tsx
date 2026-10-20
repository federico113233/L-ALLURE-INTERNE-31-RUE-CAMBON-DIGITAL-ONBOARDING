"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button, SpeakerIcon, Spinner } from "@/components/ui";
import { postJson } from "@/lib/client/api";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import type { AskResult } from "@/lib/schemas";

export function AskMademoiselle({
  suggestions,
  focus,
  placeholder = "Ask Mademoiselle anything about the Maison…",
}: {
  suggestions: string[];
  focus?: string;
  placeholder?: string;
}) {
  const { dept, name } = useSession();
  const voice = useVoice();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<(AskResult & { question: string; degraded?: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!dept || !question.trim() || busy) return;
    setBusy(true);
    setError(null);
    voice.stop();
    voice.setThinking(true);
    try {
      const res = await postJson<AskResult & { degraded?: boolean }>("/api/ask", { dept, name, question, focus });
      setAnswer({ ...res, question });
      setQ("");
      voice.setThinking(false);
      void voice.speak(res.spoken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      voice.setThinking(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(q);
        }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="sr-only">Your question</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            maxLength={600}
            className="quote w-full border-b border-noir/25 bg-transparent pb-3 text-xl outline-none transition-colors duration-700 placeholder:text-noir/30 focus:border-or sm:text-2xl"
          />
        </label>
        <Button type="submit" disabled={busy || !q.trim()}>
          Demander
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => void ask(s)}
            disabled={busy}
            className="border hairline px-4 py-2 text-left text-[0.8rem] text-graphite transition-colors duration-500 hover:border-noir hover:text-noir disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 min-h-[2rem]">
        {busy && <Spinner label="Mademoiselle réfléchit" />}
        {error && <p className="text-sm text-rouge">{error}</p>}
        <AnimatePresence mode="wait">
          {answer && !busy && (
            <motion.figure
              key={answer.question}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="border-l border-or pl-6"
            >
              <p className="label text-graphite">{answer.question}</p>
              <blockquote className="quote mt-4 text-2xl leading-snug">« {answer.keyline} »</blockquote>
              <p className="mt-4 max-w-2xl leading-relaxed text-noir/80">{answer.spoken}</p>
              <figcaption className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button onClick={() => void voice.speak(answer.spoken)} className="label inline-flex items-center gap-2 hover:text-or">
                  <SpeakerIcon /> Hear again
                </button>
                {answer.frameworks.map((f) => (
                  <span key={f} className="label text-or">
                    {f}
                  </span>
                ))}
                {answer.degraded && <span className="label text-graphite/70">Offline mode</span>}
              </figcaption>
            </motion.figure>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
