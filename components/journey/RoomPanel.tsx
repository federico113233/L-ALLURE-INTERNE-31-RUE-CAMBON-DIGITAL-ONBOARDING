"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GrandOralFloor } from "@/components/floors/GrandOralFloor";
import { LexiconFloor } from "@/components/floors/LexiconFloor";
import type { DeptId } from "@/lib/departments";
import type { Chapter } from "@/lib/journey/content";
import { useJourney } from "@/lib/journey/store";
import { ChoiceStep, ColoursStep, ExploreStep, KpiStep, MatchStep, PrismStep, SortStep } from "./steps";

const EASE = [0.22, 1, 0.36, 1] as const;

export function RoomPanel({
  chapter,
  dept,
  onStepComplete,
  onFinishChapter,
  onOralFinish,
}: {
  chapter: Chapter;
  dept: DeptId;
  onStepComplete: (i: number) => void;
  onFinishChapter: () => void;
  onOralFinish: (avg: number) => void;
}) {
  const step = useJourney((s) => s.step);
  const setStep = useJourney((s) => s.setStep);
  const found = useJourney((s) => s.found);
  const done = useJourney((s) => s.done);

  const isDone = (i: number) => Boolean(found[`${chapter.id}:step:${i}`]);
  const current = chapter.steps[step];
  const completed = isDone(step);
  const last = step === chapter.steps.length - 1;
  const wide = current.kind === "lexicon" || current.kind === "oral";

  const props = { chapterId: chapter.id, dept, completed, onComplete: () => onStepComplete(step) };

  const body = (() => {
    switch (current.kind) {
      case "explore":
        return <ExploreStep step={current} {...props} />;
      case "sort":
        return <SortStep step={current} {...props} />;
      case "choice":
        return <ChoiceStep step={current} {...props} />;
      case "match":
        return <MatchStep step={current} {...props} />;
      case "colours":
        return <ColoursStep step={current} {...props} />;
      case "prism":
        return <PrismStep step={current} {...props} />;
      case "kpi":
        return <KpiStep step={current} {...props} />;
      case "lexicon":
        return <LexiconFloor dept={dept} compact onResult={() => !completed && onStepComplete(step)} />;
      case "oral":
        return (
          <GrandOralFloor
            dept={dept}
            compact
            onFinish={(avg) => {
              onOralFinish(avg);
              if (!completed) onStepComplete(step);
            }}
          />
        );
    }
  })();

  return (
    <motion.aside
      key={chapter.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.5 } }}
      transition={{ duration: 1, delay: 0.9, ease: EASE }}
      className={`fixed inset-x-0 bottom-0 z-20 flex max-h-[58vh] flex-col border-t border-noir/10 bg-blanc/92 backdrop-blur-md lg:inset-x-auto lg:right-0 lg:top-0 lg:max-h-none lg:border-l lg:border-t-0 lg:pt-28 ${
        wide ? "lg:w-[min(640px,50vw)]" : "lg:w-[min(460px,40vw)]"
      }`}
    >
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-10 lg:pt-4">
        <p className="label text-or">
          Chapitre {chapter.numeral} · <span className="text-graphite">{chapter.subtitle}</span>
        </p>
        <h2 className="display mt-2 text-5xl">{chapter.name}</h2>

        {/* step rail */}
        {chapter.steps.length > 1 && (
          <div className="mt-6 flex gap-2">
            {chapter.steps.map((s, i) => {
              const reachable = i === 0 || isDone(i - 1) || isDone(i);
              return (
                <button
                  key={i}
                  disabled={!reachable}
                  onClick={() => setStep(i)}
                  className={`flex-1 border-t-2 pt-2 text-left transition-colors duration-500 disabled:cursor-not-allowed ${
                    i === step ? "border-noir" : isDone(i) ? "border-or" : "border-ligne"
                  }`}
                >
                  <span className={`label block text-[0.55rem] ${i === step ? "text-noir" : "text-graphite/70"}`}>
                    {String(i + 1).padStart(2, "0")} · {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${chapter.id}-${step}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-8"
          >
            {chapter.steps.length > 1 && <h3 className="display text-3xl">{current.title}</h3>}
            <p className="mt-2 text-sm leading-relaxed text-graphite">{current.prompt}</p>
            <div className="mt-6">{body}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-t border-noir/10 px-6 py-4 sm:px-10"
          >
            {last ? (
              <button
                onClick={onFinishChapter}
                className="label h-12 w-full bg-or text-noir transition-colors duration-500 hover:bg-noir hover:text-blanc"
              >
                {done[chapter.id] ? "Retour à la Galerie →" : "Accomplir le chapitre →"}
              </button>
            ) : (
              <button onClick={() => setStep(step + 1)} className="label h-12 w-full bg-noir text-blanc transition-colors duration-500 hover:bg-or hover:text-noir">
                Étape suivante →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
