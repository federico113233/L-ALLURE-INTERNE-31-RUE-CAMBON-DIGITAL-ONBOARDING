"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monogram } from "@/components/ui";
import { CHAPTER_BY_ID, CODES, levelFor, type CodeId } from "@/lib/journey/content";
import { useJourney } from "@/lib/journey/store";

export function CodeGlyph({ id, className = "h-4 w-4" }: { id: CodeId; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.3 } as const;
  const g = (() => {
    switch (id) {
      case "couleurs":
        return [0, 1, 2, 3, 4].map((i) => <rect key={i} x={2 + i * 3.4} y="5" width="2.4" height="10" fill="currentColor" opacity={1 - i * 0.15} />);
      case "prisme":
        return <path d="M6 3h8l4 7-4 7H6l-4-7z M10 3v14 M3 7.5h14 M3 12.5h14" {...p} />;
      case "n5":
        return <path d="M7 2.5h6l4.5 4.5v6L13 17.5H7L2.5 13V7z" {...p} />;
      case "abstraction":
        return (
          <>
            <circle cx="10" cy="10" r="7" {...p} />
            <circle cx="10" cy="10" r="1.8" fill="currentColor" />
          </>
        );
      case "chaine":
        return (
          <>
            <ellipse cx="7" cy="10" rx="4.5" ry="3" {...p} />
            <ellipse cx="13" cy="10" rx="4.5" ry="3" {...p} />
          </>
        );
      case "le19m":
        return <path d="M4 16 L15 5 M15 5 a1.6 1.6 0 1 1 1 1 M4 16 l2-0.5" {...p} />;
      case "miroir":
        return <path d="M10 2 L17 10 L10 18 L3 10 Z M10 2 V18 M3 10 H17" {...p} />;
      case "relation":
        return (
          <>
            <circle cx="7.5" cy="10" r="4.5" {...p} />
            <circle cx="12.5" cy="10" r="4.5" {...p} />
          </>
        );
      case "plume":
        return <path d="M10 2 L14 9 L10 18 L6 9 Z M10 9 V13" {...p} />;
      case "perles":
        return [5, 10, 15].map((x) => <circle key={x} cx={x} cy={x === 10 ? 12 : 9} r="2.6" fill="currentColor" />);
    }
  })();
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      {g}
    </svg>
  );
}

const ALL_CODES = Object.keys(CODES) as CodeId[];

export function Hud({
  onGallery,
  soundOn,
  onToggleSound,
  demo,
  onToggleDemo,
}: {
  onGallery: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  demo: boolean;
  onToggleDemo: () => void;
}) {
  const phase = useJourney((s) => s.phase);
  const room = useJourney((s) => s.room);
  const points = useJourney((s) => s.points);
  const codes = useJourney((s) => s.codes);
  const level = levelFor(points);
  const chapter = room ? CHAPTER_BY_ID[room] : null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-5 py-4 sm:px-8 sm:py-6"
    >
      <div className="pointer-events-auto flex items-center gap-4">
        <button onClick={onGallery} className="flex items-center gap-3" aria-label="Back to the gallery">
          <Monogram className="h-5 w-8" />
          <span className="label-strong hidden text-[0.72rem] tracking-[0.38em] md:inline">Chanel</span>
        </button>
        <AnimatePresence mode="wait">
          {phase === "room" && chapter ? (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={onGallery}
              className="label hidden border-l border-noir/15 pl-4 text-graphite transition-colors hover:text-noir sm:block"
            >
              ← La Galerie
            </motion.button>
          ) : (
            <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="label hidden border-l border-noir/15 pl-4 text-graphite sm:block">
              L&apos;Allure Interne
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-2 border border-noir/10 bg-blanc/80 px-3 py-2 backdrop-blur-sm">
            <span className="label text-[0.55rem] text-graphite">Allure</span>
            <motion.span key={points} initial={{ y: -6, opacity: 0, color: "#C5A059" }} animate={{ y: 0, opacity: 1, color: "#000000" }} className="display text-xl leading-none">
              {points}
            </motion.span>
            <span className="label hidden text-[0.55rem] text-or sm:inline">{level.name}</span>
          </div>
          <button
            onClick={onToggleSound}
            className="label border border-noir/10 bg-blanc/80 px-3 py-2.5 text-[0.6rem] backdrop-blur-sm hover:border-noir"
            aria-pressed={soundOn}
          >
            {soundOn ? "Son" : "Muet"}
          </button>
          <button
            onClick={onToggleDemo}
            title="Presenter mode: every door open, presets answer instantly (Shift + D)"
            className={`label hidden border px-3 py-2.5 text-[0.6rem] backdrop-blur-sm sm:block ${demo ? "border-or bg-or text-noir" : "border-noir/10 bg-blanc/80 hover:border-noir"}`}
            aria-pressed={demo}
          >
            Démo
          </button>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`${codes.length} of ${ALL_CODES.length} codes collected`}>
          {ALL_CODES.map((id) => {
            const has = codes.includes(id);
            return (
              <motion.span
                key={id}
                title={has ? CODES[id].name : "Code à découvrir"}
                initial={false}
                animate={has ? { scale: [1.5, 1], color: "#C5A059" } : { scale: 1, color: "rgba(0,0,0,0.18)" }}
                transition={{ duration: 0.6 }}
                className="flex h-6 w-6 items-center justify-center border border-current bg-blanc/70"
              >
                <CodeGlyph id={id} className="h-3.5 w-3.5" />
              </motion.span>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
}

export function CodeToast({ code }: { code: CodeId | null }) {
  return (
    <AnimatePresence>
      {code && (
        <motion.div
          key={code}
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-1/2 top-24 z-50 flex -translate-x-1/2 items-center gap-5 border border-or/60 bg-noir px-7 py-5 text-blanc shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]"
        >
          <motion.span
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-or text-or"
          >
            <CodeGlyph id={code} className="h-6 w-6" />
          </motion.span>
          <span>
            <span className="label block text-[0.58rem] text-or">Code obtenu · +50</span>
            <span className="display mt-1 block text-2xl">{CODES[code].name}</span>
            <span className="quote block text-sm text-blanc/70">{CODES[code].line}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
