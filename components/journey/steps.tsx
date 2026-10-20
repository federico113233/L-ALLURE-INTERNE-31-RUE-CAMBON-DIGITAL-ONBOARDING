"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Prism } from "@/components/floors/Prism";
import { SpeakerIcon } from "@/components/ui";
import { sfx } from "@/lib/client/sfx";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS, FACETS, type DeptId, type FacetId } from "@/lib/departments";
import { COLOURS, type Step } from "@/lib/journey/content";
import { useJourney } from "@/lib/journey/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface StepProps<K extends Step["kind"]> {
  step: Extract<Step, { kind: K }>;
  chapterId: string;
  dept: DeptId;
  onComplete: () => void;
  completed: boolean;
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`mt-4 border-l-2 pl-4 text-sm leading-relaxed ${ok ? "border-or" : "border-rouge"}`}
    >
      <p className={`label mb-1 ${ok ? "text-or" : "text-rouge"}`}>{ok ? "Exact" : "Non, mon cher"}</p>
      {children}
    </motion.div>
  );
}

/* ───────────── Explore: the gold hotspots on the object ───────────── */
export function ExploreStep({ step, chapterId, onComplete, completed }: StepProps<"explore">) {
  const found = useJourney((s) => s.found);
  const spot = useJourney((s) => s.spot);
  const voice = useVoice();
  const n = step.hotspots.filter((h) => found[`${chapterId}:${h.id}`]).length;
  const active = step.hotspots.find((h) => h.id === spot);
  const all = n === step.hotspots.length;

  return (
    <div>
      <div className="flex items-center gap-3">
        {step.hotspots.map((h) => (
          <span key={h.id} className={`h-1.5 flex-1 ${found[`${chapterId}:${h.id}`] ? "bg-or" : "bg-ligne"}`} />
        ))}
      </div>
      <p className="label mt-3 text-graphite">
        {n} / {step.hotspots.length} secrets · drag the object to turn it
      </p>
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-6"
          >
            <h4 className="display text-3xl">{active.title}</h4>
            <p className="mt-4 leading-relaxed text-noir/80">{active.text}</p>
            <button onClick={() => void voice.speak(active.spoken)} className="label mt-5 inline-flex items-center gap-2 text-graphite hover:text-or">
              <SpeakerIcon /> Mademoiselle
            </button>
          </motion.div>
        ) : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quote mt-6 text-2xl text-noir/60">
            Touch the gold points on the object.
          </motion.p>
        )}
      </AnimatePresence>
      {all && !completed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onComplete}
          className="label mt-8 h-12 w-full bg-noir text-blanc transition-colors duration-500 hover:bg-or hover:text-noir"
        >
          Recevoir le code
        </motion.button>
      )}
    </div>
  );
}

/* ───────────── Sort: Maison or elsewhere ───────────── */
export function SortStep({ step, onComplete, completed }: StepProps<"sort">) {
  const cards = useMemo(() => shuffle(step.cards, step.cards.length * 7), [step.cards]);
  const addPoints = useJourney((s) => s.addPoints);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<null | { ok: boolean }>(null);
  const [score, setScore] = useState(0);
  const card = cards[i];
  const finished = i >= cards.length;

  function pick(side: "maison" | "ailleurs") {
    if (answer || !card) return;
    const ok = card.side === side;
    setAnswer({ ok });
    if (ok) {
      setScore((s) => s + 1);
      addPoints(10);
      sfx.discover();
    } else sfx.error();
  }

  function next() {
    setAnswer(null);
    const n = i + 1;
    setI(n);
    if (n >= cards.length && !completed) onComplete();
  }

  if (finished)
    return (
      <div className="py-6 text-center">
        <p className="display text-6xl">
          {score}
          <span className="text-2xl text-graphite">/{cards.length}</span>
        </p>
        <p className="quote mt-3 text-xl text-noir/70">{score === cards.length ? "Sans faute." : "Remove, then remove again."}</p>
      </div>
    );

  return (
    <div>
      <p className="label text-graphite">
        {i + 1} / {cards.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, x: 24, rotate: 1 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: answer?.ok ? -40 : 40 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-4 border border-noir/10 bg-beige/60 px-6 py-8"
        >
          <p className="quote text-[1.6rem] leading-snug">« {card.text} »</p>
        </motion.blockquote>
      </AnimatePresence>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {(["maison", "ailleurs"] as const).map((side) => (
          <button
            key={side}
            onClick={() => pick(side)}
            disabled={Boolean(answer)}
            className={`label h-12 border transition-colors duration-500 ${
              side === "maison" ? "border-noir hover:bg-noir hover:text-blanc" : "border-noir/30 text-graphite hover:border-rouge hover:text-rouge"
            } disabled:opacity-40`}
          >
            {side === "maison" ? step.left : step.right}
          </button>
        ))}
      </div>
      {answer && (
        <>
          <Feedback ok={answer.ok}>{card.why}</Feedback>
          <button onClick={next} className="label mt-5 h-11 w-full bg-noir text-blanc hover:bg-or hover:text-noir">
            Suivant →
          </button>
        </>
      )}
    </div>
  );
}

/* ───────────── Choice: situations ───────────── */
export function ChoiceStep({ step, onComplete, completed }: StepProps<"choice">) {
  const addPoints = useJourney((s) => s.addPoints);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const sc = step.scenarios[i];
  const done = i >= step.scenarios.length;

  function pick(k: number) {
    const opt = sc.options[k];
    setPicked(k);
    if (opt.correct) {
      sfx.success();
      if (firstTry) addPoints(15);
    } else {
      sfx.error();
      setFirstTry(false);
    }
  }
  function next() {
    setPicked(null);
    setFirstTry(true);
    const n = i + 1;
    setI(n);
    if (n >= step.scenarios.length && !completed) onComplete();
  }

  if (done)
    return <p className="quote py-6 text-center text-2xl text-noir/70">« Time is the only true luxury we offer. »</p>;

  const chosen = picked !== null ? sc.options[picked] : null;
  return (
    <div>
      {step.context && (
        <div className="mb-6 grid grid-cols-3 gap-px bg-ligne">
          {step.context.map((c) => {
            const [label, value] = c.split(/\s{2,}/);
            const neg = value?.startsWith("−");
            return (
              <div key={c} className="bg-blanc p-3">
                <p className={`display text-3xl ${neg ? "text-rouge" : "text-noir"}`}>{value}</p>
                <p className="label mt-1 text-[0.55rem] text-graphite">{label}</p>
              </div>
            );
          })}
        </div>
      )}
      {step.scenarios.length > 1 && (
        <p className="label text-graphite">
          Situation {i + 1} / {step.scenarios.length}
        </p>
      )}
      <p className="display mt-3 text-[1.55rem] leading-snug">{sc.situation}</p>
      <div className="mt-5 space-y-2">
        {sc.options.map((o, k) => {
          const state = picked === k ? (o.correct ? "ok" : "ko") : null;
          return (
            <button
              key={k}
              onClick={() => pick(k)}
              disabled={chosen?.correct}
              className={`block w-full border px-4 py-3 text-left text-[0.92rem] leading-relaxed transition-colors duration-500 ${
                state === "ok"
                  ? "border-or bg-or/10"
                  : state === "ko"
                    ? "border-rouge/60 text-rouge"
                    : "border-noir/15 hover:border-noir"
              }`}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      {chosen && <Feedback ok={chosen.correct}>{chosen.feedback}</Feedback>}
      {chosen?.correct && (
        <button onClick={next} className="label mt-5 h-11 w-full bg-noir text-blanc hover:bg-or hover:text-noir">
          {i + 1 < step.scenarios.length ? "Situation suivante →" : "Continuer →"}
        </button>
      )}
    </div>
  );
}

/* ───────────── Match: le19M ───────────── */
export function MatchStep({ step, onComplete, completed }: StepProps<"match">) {
  const addPoints = useJourney((s) => s.addPoints);
  const right = useMemo(() => shuffle(step.pairs.map((p) => p.b), 11), [step.pairs]);
  const [selA, setSelA] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  function pickB(b: string) {
    if (!selA) return;
    const pair = step.pairs.find((p) => p.a === selA)!;
    if (pair.b === b) {
      const next = { ...matched, [selA]: b };
      setMatched(next);
      setSelA(null);
      addPoints(10);
      sfx.discover();
      if (Object.keys(next).length === step.pairs.length && !completed) setTimeout(onComplete, 500);
    } else {
      setWrong(b);
      sfx.error();
      setTimeout(() => setWrong(null), 600);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {step.pairs.map((p) => (
          <button
            key={p.a}
            onClick={() => !matched[p.a] && setSelA(p.a)}
            className={`display block w-full border px-4 py-3 text-left text-xl transition-colors duration-500 ${
              matched[p.a] ? "border-or bg-or/10 text-noir" : selA === p.a ? "border-noir bg-noir text-blanc" : "border-noir/15 hover:border-noir"
            }`}
          >
            {p.a}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {right.map((b) => {
          const used = Object.values(matched).includes(b);
          return (
            <motion.button
              key={b}
              onClick={() => !used && pickB(b)}
              animate={wrong === b ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={`label block h-[3.25rem] w-full border px-4 text-left transition-colors duration-500 ${
                used ? "border-or bg-or/10" : wrong === b ? "border-rouge text-rouge" : selA ? "border-noir/40 hover:border-noir" : "border-noir/15 text-graphite"
              }`}
            >
              {b}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── The five colours ───────────── */
export function ColoursStep({ onComplete, completed }: StepProps<"colours">) {
  const voice = useVoice();
  const find = useJourney((s) => s.find);
  const [seen, setSeen] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const c = COLOURS.find((x) => x.id === active);

  function open(id: string) {
    const col = COLOURS.find((x) => x.id === id)!;
    setActive(id);
    sfx.click();
    if (find(`colour:${id}`, 10)) sfx.discover();
    void voice.speak(`${col.name}. ${col.text}`);
    const next = seen.includes(id) ? seen : [...seen, id];
    setSeen(next);
    if (next.length === COLOURS.length && !completed) setTimeout(onComplete, 1200);
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {COLOURS.map((col) => (
          <button key={col.id} onClick={() => open(col.id)} className="group text-left" aria-label={col.name}>
            <motion.span
              className={`block aspect-[3/4] w-full border ${active === col.id ? "border-or" : "border-noir/15"}`}
              style={{ background: col.hex }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4 }}
            />
            <span className={`label mt-2 block text-[0.55rem] ${seen.includes(col.id) ? "text-noir" : "text-graphite/60"}`}>
              {col.name}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {c && (
          <motion.p
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="quote mt-6 text-2xl leading-snug"
          >
            {c.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── Kapferer prism placement ───────────── */
export function PrismStep({ dept, onComplete, completed }: StepProps<"prism">) {
  const d = DEPARTMENTS[dept];
  const addPoints = useJourney((s) => s.addPoints);
  const order = useMemo(() => shuffle(FACETS.map((f) => f.id), 5), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<FacetId | null>(null);
  const [placed, setPlaced] = useState<FacetId[]>([]);
  const facet = order[i];
  const finished = i >= order.length;

  function choose(f: FacetId) {
    if (pick) return;
    setPick(f);
    if (f === facet) {
      sfx.discover();
      addPoints(10);
      setPlaced((p) => [...p, f]);
    } else sfx.error();
  }
  function next() {
    const n = i + 1;
    setPick(null);
    setI(n);
    if (n >= order.length && !completed) onComplete();
  }

  if (finished)
    return <p className="quote py-6 text-center text-2xl text-noir/70">« Six faces. One Maison. You see it now. »</p>;

  const right = FACETS.find((f) => f.id === facet)!;
  return (
    <div>
      <p className="label text-graphite">
        Statement {i + 1} / {order.length} · {d.name}
      </p>
      <blockquote className="mt-3 border border-noir/10 bg-beige/60 px-5 py-5">
        <p className="quote text-[1.3rem] leading-snug">« {d.prism[facet]} »</p>
      </blockquote>
      <div className="mx-auto mt-5 max-w-[300px]">
        <Prism active={pick ?? (placed.length ? placed[placed.length - 1] : ("" as FacetId))} onSelect={choose} />
      </div>
      {pick && (
        <>
          <Feedback ok={pick === facet}>
            <span className="font-medium">{right.label}</span> — {right.definition}
          </Feedback>
          <button onClick={next} className="label mt-5 h-11 w-full bg-noir text-blanc hover:bg-or hover:text-noir">
            Suivant →
          </button>
        </>
      )}
    </div>
  );
}

/* ───────────── KPI: what we measure ───────────── */
export function KpiStep({ step, onComplete, completed }: StepProps<"kpi">) {
  const addPoints = useJourney((s) => s.addPoints);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const allRight = step.items.every((it) => Boolean(sel[it.text]) === it.keep);

  function validate() {
    setChecked(true);
    if (allRight) {
      sfx.success();
      addPoints(30);
      if (!completed) onComplete();
    } else sfx.error();
  }

  return (
    <div>
      <div className="space-y-2">
        {step.items.map((it) => {
          const on = Boolean(sel[it.text]);
          const wrong = checked && on !== it.keep;
          return (
            <button
              key={it.text}
              onClick={() => {
                setChecked(false);
                setSel((s) => ({ ...s, [it.text]: !s[it.text] }));
                sfx.hover();
              }}
              className={`flex w-full items-start gap-3 border px-4 py-3 text-left transition-colors duration-500 ${
                wrong ? "border-rouge/60" : on ? "border-noir bg-noir text-blanc" : "border-noir/15 hover:border-noir"
              }`}
            >
              <span className={`mt-1 h-3 w-3 shrink-0 border ${on ? "border-or bg-or" : "border-noir/40"}`} />
              <span className="text-[0.92rem]">
                {it.text}
                {checked && (
                  <span className={`mt-1 block text-xs ${wrong ? "text-rouge" : on ? "text-blanc/70" : "text-graphite"}`}>{it.why}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={validate} className="label mt-5 h-11 w-full bg-noir text-blanc hover:bg-or hover:text-noir">
        Présenter au Directeur
      </button>
      {checked && !allRight && <p className="mt-3 text-sm text-rouge">Some of your indicators measure noise. Look at the red ones.</p>}
    </div>
  );
}
