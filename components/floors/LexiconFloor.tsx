"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Eyebrow, SpeakerIcon, Spinner } from "@/components/ui";
import { postJson, wait } from "@/lib/client/api";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS, type DeptId } from "@/lib/departments";
import { findPreset, LEXICON_PRESETS, type LexiconError, type LexiconResult } from "@/lib/lexicon";

const EASE = [0.22, 1, 0.36, 1] as const;

type Segment = { text: string; error?: number };

function segment(text: string, errors: LexiconError[]): Segment[] {
  const lower = text.toLowerCase();
  const spans: { start: number; end: number; error: number }[] = [];
  errors.forEach((e, i) => {
    const q = e.quote.trim();
    if (!q) return;
    let idx = text.indexOf(q);
    if (idx < 0) idx = lower.indexOf(q.toLowerCase());
    if (idx < 0) return;
    const end = idx + q.length;
    if (spans.some((s) => idx < s.end && end > s.start)) return;
    spans.push({ start: idx, end, error: i });
  });
  spans.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let pos = 0;
  for (const s of spans) {
    if (s.start > pos) out.push({ text: text.slice(pos, s.start) });
    out.push({ text: text.slice(s.start, s.end), error: s.error });
    pos = s.end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos) });
  return out;
}

const SOURCE_LABEL: Record<NonNullable<LexiconResult["source"]>, string> = {
  claude: "Analysed live by Claude",
  offline: "Offline rule engine",
  preset: "Demo script",
};

export function LexiconFloor({ dept }: { dept: DeptId }) {
  const { name, instantDemo } = useSession();
  const voice = useVoice();
  const d = DEPARTMENTS[dept];
  const [text, setText] = useState("");
  const [analysed, setAnalysed] = useState("");
  const [result, setResult] = useState<(LexiconResult & { degraded?: boolean }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const presets = useMemo(
    () => [...LEXICON_PRESETS].sort((a, b) => Number(b.dept === dept) - Number(a.dept === dept)),
    [dept],
  );
  const segments = useMemo(() => (result ? segment(analysed, result.errors) : []), [analysed, result]);

  async function translate(input = text) {
    const t = input.trim();
    if (t.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setFocus(null);
    voice.stop();
    voice.setThinking(true);
    try {
      const preset = findPreset(t);
      let res: LexiconResult & { degraded?: boolean };
      if (instantDemo && preset) {
        await wait(900);
        res = preset.result;
      } else {
        res = await postJson<LexiconResult & { degraded?: boolean }>("/api/lexicon", { dept, name, text: t });
        if (res.degraded && preset) res = { ...preset.result, degraded: true };
      }
      setAnalysed(t);
      setResult(res);
      voice.setThinking(false);
      void voice.speak(res.spoken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      voice.setThinking(false);
    }
  }

  async function copyRewrite() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.rewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-16 pb-24">
      <section>
        <Eyebrow>Étage II · Le Lexique</Eyebrow>
        <h2 className="display mt-6 text-5xl sm:text-6xl">
          The Chanel <span className="quote">Lexicon</span> Translator
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-graphite">
          Paste an email, a slide or a piece of copy written in standard corporate jargon — or in the style of another house. Mademoiselle marks every cultural error in red, cites the framework it violates, and rewrites it in the internal voice of the Maison.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <p className="label text-graphite">Demo presets · one click</p>
          {instantDemo && <p className="label text-or">Instant demo on</p>}
        </div>
        <div className="mt-4 grid gap-px border hairline bg-ligne sm:grid-cols-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setText(p.text);
                void translate(p.text);
              }}
              disabled={busy}
              className="group bg-blanc p-5 text-left transition-colors duration-500 hover:bg-beige disabled:opacity-40"
            >
              <span className="flex items-center justify-between">
                <span className="label text-or">{p.kind}</span>
                <span className="label text-graphite/70">{DEPARTMENTS[p.dept].name}</span>
              </span>
              <span className="display mt-2 block text-xl">{p.label}</span>
              <span className="mt-2 line-clamp-2 block text-sm text-graphite">{p.text}</span>
            </button>
          ))}
        </div>

        <label htmlFor="lexicon-input" className="label mt-10 block text-graphite">
          Your draft
        </label>
        <textarea
          id="lexicon-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          maxLength={2500}
          placeholder={`e.g. “Let's go viral with a flash sale…” — any draft for ${d.name}.`}
          className="mt-3 w-full resize-y border border-noir/20 bg-blanc p-5 text-[1.02rem] leading-relaxed outline-none transition-colors duration-700 placeholder:text-noir/30 focus:border-noir"
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button onClick={() => void translate()} disabled={busy || text.trim().length < 3}>
            Traduire en Chanel
          </Button>
          {text && (
            <Button
              variant="link"
              onClick={() => {
                setText("");
                setResult(null);
              }}
            >
              Effacer
            </Button>
          )}
          {busy && <Spinner label="Mademoiselle lit votre texte" />}
        </div>
        {error && <p className="mt-4 text-sm text-rouge">{error}</p>}
      </section>

      <div ref={resultRef} className="scroll-mt-32" />
      <AnimatePresence>
        {result && (
          <motion.section
            key={analysed}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="space-y-12"
          >
            {/* Score + verdict */}
            <div className="grid gap-8 border-t border-noir pt-10 md:grid-cols-[14rem_1fr]">
              <div>
                <p className="label text-graphite">Allure index</p>
                <p className="display mt-2 text-7xl">
                  {result.allureScore}
                  <span className="text-2xl text-graphite">/100</span>
                </p>
                <div className="mt-4 h-px w-full bg-ligne">
                  <motion.div
                    className="h-px bg-or"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.allureScore}%` }}
                    transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
                  />
                </div>
              </div>
              <div>
                <p className="quote text-3xl leading-snug">« {result.verdict} »</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <button onClick={() => void voice.speak(result.spoken)} className="label inline-flex items-center gap-2 hover:text-or">
                    <SpeakerIcon /> Hear Mademoiselle
                  </button>
                  <span className="label text-graphite/70">
                    {result.source ? SOURCE_LABEL[result.source] : ""}
                    {result.degraded ? " · fallback" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Original, marked */}
            <div>
              <p className="label text-graphite">
                Your draft · {result.errors.length} cultural {result.errors.length === 1 ? "error" : "errors"}
              </p>
              <p className="mt-4 text-xl leading-[1.9]">
                {segments.map((s, i) =>
                  s.error === undefined ? (
                    <span key={i}>{s.text}</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setFocus(s.error!)}
                      onMouseEnter={() => setFocus(s.error!)}
                      className={`relative mx-px px-1 text-rouge underline decoration-rouge decoration-1 underline-offset-[6px] transition-colors duration-300 ${focus === s.error ? "bg-rouge text-blanc" : "bg-rouge/[0.07]"}`}
                    >
                      {s.text}
                      <sup className="label ml-1 text-[0.55rem]">{s.error! + 1}</sup>
                    </button>
                  ),
                )}
              </p>
            </div>

            {/* Corrections */}
            {result.errors.length > 0 && (
              <ol className="border-t hairline">
                {result.errors.map((e, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: EASE }}
                    onMouseEnter={() => setFocus(i)}
                    className={`grid gap-4 border-b hairline py-6 transition-colors duration-500 md:grid-cols-[3rem_1fr_1fr] ${focus === i ? "bg-beige/70" : ""}`}
                  >
                    <span className="label pl-2 pt-1 text-rouge">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-lg">
                        <span className="text-rouge line-through decoration-rouge/60">{e.quote}</span>
                        <span className="mx-3 text-graphite">→</span>
                        <span className="quote text-xl">{e.correction}</span>
                      </p>
                      <p className="label mt-3 text-graphite">{e.category}</p>
                    </div>
                    <div>
                      <p className="label text-or">{e.framework}</p>
                      <p className="mt-2 text-sm leading-relaxed text-graphite">{e.explanation}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            )}

            {/* Rewrite */}
            <div className="bg-beige p-8 sm:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="label text-graphite">Version Maison</p>
                <button onClick={() => void copyRewrite()} className="label hover:text-or">
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <p className="display mt-6 whitespace-pre-line text-[1.7rem] leading-snug sm:text-3xl">{result.rewrite}</p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
