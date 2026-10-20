"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Eyebrow, MicIcon, SpeakerIcon, Spinner } from "@/components/ui";
import { postJson, wait } from "@/lib/client/api";
import { useRecorder } from "@/lib/client/recorder";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS, type DeptId } from "@/lib/departments";
import { debriefLine } from "@/lib/floors";
import { offlineOral, type OralEvaluation } from "@/lib/oral";

const EASE = [0.22, 1, 0.36, 1] as const;

type Phase = { kind: "intro" } | { kind: "question"; i: number } | { kind: "feedback"; i: number } | { kind: "debrief" };
type Eval = OralEvaluation & { degraded?: boolean };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function GrandOralFloor({ dept }: { dept: DeptId }) {
  const d = DEPARTMENTS[dept];
  const { name, instantDemo } = useSession();
  const voice = useVoice();
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [evals, setEvals] = useState<(Eval | null)[]>([null, null, null]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spokenFor = useRef<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Bring each new phase into view (the floor scrolls inside its own column).
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const i = phase.kind === "question" || phase.kind === "feedback" ? phase.i : 0;
  const q = d.oral[i];

  const setAnswer = useCallback(
    (v: string | ((prev: string) => string)) =>
      setAnswers((prev) => prev.map((a, k) => (k === i ? (typeof v === "function" ? v(a) : v) : a))),
    [i],
  );

  const rec = useRecorder(
    useCallback((t: string) => setAnswer((prev) => (prev ? `${prev.trimEnd()} ${t}` : t)), [setAnswer]),
  );

  // Ask the question aloud when it appears.
  useEffect(() => {
    if (phase.kind !== "question") return;
    const key = `${dept}-${phase.i}`;
    if (spokenFor.current === key) return;
    spokenFor.current = key;
    void voice.speak(`Question ${phase.i + 1}. ${d.oral[phase.i].question}`);
  }, [phase, dept, d, voice]);

  async function submit() {
    const answer = answers[i].trim();
    if (answer.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    voice.stop();
    voice.setThinking(true);
    try {
      let ev: Eval;
      const isPreset = answer === q.chanelAnswer || answer === q.diorReflex;
      if (instantDemo && isPreset) {
        await wait(900);
        ev = offlineOral(answer, q.chanelAnswer);
      } else {
        ev = await postJson<Eval>("/api/oral", { dept, name, questionId: q.id, answer });
      }
      setEvals((prev) => prev.map((e, k) => (k === i ? ev : e)));
      setPhase({ kind: "feedback", i });
      voice.setThinking(false);
      void voice.speak(ev.spoken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      voice.setThinking(false);
    }
  }

  function next() {
    if (i < d.oral.length - 1) setPhase({ kind: "question", i: i + 1 });
    else {
      setPhase({ kind: "debrief" });
      const scores = evals.filter(Boolean).map((e) => e!.score);
      const avg = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
      void voice.speak(`${fmt(Math.round(avg * 2) / 2)} out of 20. ${debriefLine(avg)}`);
    }
  }

  function restart() {
    voice.stop();
    spokenFor.current = null;
    setAnswers(["", "", ""]);
    setEvals([null, null, null]);
    setPhase({ kind: "question", i: 0 });
  }

  const ev = evals[i];
  const scores = evals.filter(Boolean).map((e) => e!.score);
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 2) / 2 : 0;

  return (
    <div ref={topRef} className="scroll-mt-32 pb-24">
      <Eyebrow>Étage III · Le Grand Oral</Eyebrow>

      {/* Progress */}
      {phase.kind !== "intro" && (
        <div className="mt-8 flex gap-3" aria-label="Progress">
          {d.oral.map((o, k) => {
            const done = evals[k] !== null;
            const current = (phase.kind === "question" || phase.kind === "feedback") && phase.i === k;
            return (
              <div key={o.id} className="flex-1">
                <div className={`h-px ${current ? "bg-noir" : done ? "bg-or" : "bg-ligne"}`} />
                <p className={`label mt-3 ${current ? "text-noir" : "text-graphite/70"}`}>
                  {k + 1} · {o.title}
                  {done && <span className="ml-2 text-or">{fmt(evals[k]!.score)}/20</span>}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase.kind === "intro" && (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <h2 className="display mt-6 text-5xl sm:text-6xl">
              Le Grand <span className="quote">Oral</span>
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-graphite">
              Three questions before your meeting with the {d.director}. Mademoiselle asks aloud. Answer with your voice or in writing; she grades you out of twenty, cites the frameworks you missed, and tells you how the Maison would have answered.
            </p>
            <ol className="mt-10 border-t hairline">
              {d.oral.map((o, k) => (
                <li key={o.id} className="grid gap-2 border-b hairline py-5 md:grid-cols-[3rem_14rem_1fr]">
                  <span className="label text-or">{["I", "II", "III"][k]}</span>
                  <span className="label-strong text-[0.75rem]">{o.title}</span>
                  <span className="text-sm text-graphite">{o.question}</span>
                </li>
              ))}
            </ol>
            <Button className="mt-10" onClick={() => setPhase({ kind: "question", i: 0 })}>
              Commencer l&apos;oral
            </Button>
          </motion.section>
        )}

        {phase.kind === "question" && (
          <motion.section
            key={`q-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-12"
          >
            <p className="label text-graphite">
              Question {i + 1} / {d.oral.length} · {q.title}
            </p>
            <h2 className="display mt-5 text-[2.1rem] leading-tight sm:text-[2.6rem]">{q.question}</h2>
            <button
              onClick={() => void voice.speak(`Question ${i + 1}. ${q.question}`)}
              className="label mt-5 inline-flex items-center gap-2 text-graphite hover:text-or"
            >
              <SpeakerIcon /> Hear again
            </button>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="oral-answer" className="label text-graphite">
                  Your answer to the Director
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="label self-center text-graphite/70">Demo presets</span>
                  <button
                    onClick={() => setAnswer(q.diorReflex)}
                    className="label border border-rouge/40 px-3 py-2 text-rouge transition-colors duration-500 hover:bg-rouge hover:text-blanc"
                  >
                    The Dior reflex
                  </button>
                  <button
                    onClick={() => setAnswer(q.chanelAnswer)}
                    className="label border border-or px-3 py-2 text-noir transition-colors duration-500 hover:bg-or"
                  >
                    The Chanel answer
                  </button>
                </div>
              </div>
              <textarea
                id="oral-answer"
                value={answers[i]}
                onChange={(e) => setAnswer(e.target.value)}
                rows={7}
                maxLength={3000}
                placeholder="Speak, or write. Briefly, precisely, without raising your voice."
                className="mt-3 w-full resize-y border border-noir/20 bg-blanc p-5 text-[1.02rem] leading-relaxed outline-none transition-colors duration-700 placeholder:text-noir/30 focus:border-noir"
              />
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {rec.state === "recording" ? (
                  <Button variant="ghost" onClick={rec.stop} className="border-rouge text-rouge hover:bg-rouge hover:text-blanc">
                    <span className="h-2 w-2 animate-pulse bg-rouge" />
                    Stop · {String(Math.floor(rec.seconds / 60)).padStart(1, "0")}:{String(rec.seconds % 60).padStart(2, "0")}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      voice.stop();
                      void rec.start();
                    }}
                    disabled={rec.state === "transcribing" || busy}
                  >
                    <MicIcon /> Répondre à voix haute
                  </Button>
                )}
                <Button onClick={() => void submit()} disabled={busy || answers[i].trim().length < 3 || rec.state !== "idle"}>
                  Soumettre
                </Button>
                {rec.state === "transcribing" && <Spinner label="Transcription" />}
                {busy && <Spinner label="Mademoiselle délibère" />}
              </div>
              {(rec.error || error) && <p className="mt-4 text-sm text-rouge">{rec.error || error}</p>}
            </div>
          </motion.section>
        )}

        {phase.kind === "feedback" && ev && (
          <motion.section
            key={`f-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-12 space-y-12"
          >
            <div className="grid gap-8 border-t border-noir pt-10 md:grid-cols-[13rem_1fr]">
              <div>
                <p className="label text-graphite">Note</p>
                <p className="display mt-2 text-8xl">
                  {fmt(ev.score)}
                  <span className="text-3xl text-graphite">/20</span>
                </p>
              </div>
              <div>
                <p className="quote text-3xl leading-snug">« {ev.verdict} »</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <button onClick={() => void voice.speak(ev.spoken)} className="label inline-flex items-center gap-2 hover:text-or">
                    <SpeakerIcon /> Hear Mademoiselle
                  </button>
                  <span className="label text-graphite/70">
                    {ev.source === "claude" ? "Graded live by Claude" : "Offline grader"}
                    {ev.degraded ? " · fallback" : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-ligne md:grid-cols-2">
              <div className="bg-blanc p-6">
                <p className="label text-or">What the Maison heard</p>
                <ul className="mt-4 space-y-3">
                  {ev.strengths.map((s) => (
                    <li key={s} className="text-sm leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blanc p-6">
                <p className="label text-rouge">What betrayed you</p>
                <ul className="mt-4 space-y-3">
                  {ev.gaps.map((s) => (
                    <li key={s} className="text-sm leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {ev.frameworks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ev.frameworks.map((f) => (
                  <span key={f} className="label border hairline px-3 py-2 text-noir/80">
                    {f}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-beige p-8 sm:p-12">
              <p className="label text-graphite">How Mademoiselle would answer</p>
              <p className="display mt-5 text-[1.6rem] leading-snug sm:text-[1.9rem]">{ev.improvedAnswer}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={next}>{i < d.oral.length - 1 ? "Question suivante →" : "Le verdict final"}</Button>
              <Button variant="ghost" onClick={() => setPhase({ kind: "question", i })}>
                Réessayer
              </Button>
            </div>
          </motion.section>
        )}

        {phase.kind === "debrief" && (
          <motion.section
            key="debrief"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-12"
          >
            <p className="label text-graphite">Le verdict · {name || "Intern"} · {d.name}</p>
            <p className="display mt-4 text-[7rem] leading-none">
              {fmt(avg)}
              <span className="text-4xl text-graphite">/20</span>
            </p>
            <p className="quote mt-8 max-w-2xl text-3xl leading-snug">« {debriefLine(avg)} »</p>
            <ol className="mt-12 border-t hairline">
              {d.oral.map((o, k) => (
                <li key={o.id} className="grid grid-cols-[1fr_auto] gap-4 border-b hairline py-5">
                  <span>
                    <span className="label text-graphite">{o.title}</span>
                    <span className="mt-1 block text-sm text-graphite/80">{evals[k]?.verdict}</span>
                  </span>
                  <span className="display text-3xl">{evals[k] ? fmt(evals[k]!.score) : "—"}</span>
                </li>
              ))}
            </ol>
            <Button className="mt-10" onClick={restart}>
              Recommencer
            </Button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
