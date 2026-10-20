"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DeptId } from "@/lib/departments";
import { CHAPTERS, ORAL_UNLOCK } from "@/lib/journey/content";
import { chaptersDone, useJourney } from "@/lib/journey/store";

// Captions under the floating objects, positioned from their projected
// screen coordinates (the 3D scene publishes them to the store).
export function HubLabels({ dept, unlockAll }: { dept: DeptId | null; unlockAll: boolean }) {
  const phase = useJourney((s) => s.phase);
  const screen = useJourney((s) => s.screen);
  const hovered = useJourney((s) => s.hovered);
  const done = useJourney((s) => s.done);
  const show = phase === "hub";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="labels"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 1, delay: 0.6 }}
          className="pointer-events-none fixed inset-0 z-[15]"
        >
          {CHAPTERS.map((c) => {
            const p = screen[c.id];
            if (!p) return null;
            const locked = c.id === "oral" && !unlockAll && chaptersDone(done) < ORAL_UNLOCK;
            const on = hovered === c.id;
            const yours = c.dept && c.dept === dept;
            return (
              <div
                key={c.id}
                className="absolute flex w-44 -translate-x-1/2 flex-col items-center text-center"
                style={{ left: p.x, top: p.y }}
              >
                <span className="label text-or">{c.numeral}</span>
                <span
                  className={`display mt-1 text-2xl transition-all duration-500 ${locked ? "text-noir/35" : "text-noir"} ${on ? "tracking-wide" : ""}`}
                >
                  {c.name}
                </span>
                <span className="label mt-1 text-[0.55rem] leading-relaxed text-graphite">{c.subtitle}</span>
                <span className="label mt-2 text-[0.55rem]">
                  {locked ? (
                    <span className="text-graphite/70">Verrouillé · {ORAL_UNLOCK} chapitres</span>
                  ) : done[c.id] ? (
                    <span className="text-or">✓ Accompli</span>
                  ) : yours ? (
                    <span className="border-b border-or pb-0.5 text-noir">Votre Métier</span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
