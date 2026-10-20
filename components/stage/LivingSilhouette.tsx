"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVoice, type Word } from "@/lib/client/voice";
import { Silhouette } from "./Silhouette";

// "The Living Silhouette" — Mademoiselle inside the octagon of Place Vendôme
// (the N°5 stopper), framed by the facets of the Mirrored Staircase. While she
// speaks, ink-stroke waves ripple around the octagon and her words appear in
// gold and white kinetic typography.

const CX = 200;
const CY = 250;
const R = 180; // circumradius
const APOTHEM = R * Math.cos(Math.PI / 8);

// Rounded so server and client render identical attributes (no hydration drift).
const round = (n: number) => Math.round(n * 100) / 100;
const VERTICES = Array.from({ length: 8 }, (_, k) => {
  const a = Math.PI / 8 + (k * Math.PI) / 4;
  return [round(CX + R * Math.cos(a)), round(CY + R * Math.sin(a))] as const;
});
const RAYS = VERTICES.map(([x, y]) => {
  const a = Math.atan2(y - CY, x - CX);
  return [x, y, round(CX + 900 * Math.cos(a)), round(CY + 900 * Math.sin(a))] as const;
});
const OCTAGON = VERTICES.map(([x, y]) => `${x},${y}`).join(" ");

function octRadius(theta: number) {
  // distance from centre to the octagon edge at angle theta (flat-top octagon)
  const seg = Math.PI / 4;
  const local = ((theta % seg) + seg) % seg - seg / 2;
  return APOTHEM / Math.cos(local);
}

const WAVES = [
  { scale: 1.075, amp: 16, k: 7, k2: 13, speed: 1.1, width: 1.3, color: "#C5A059", opacity: 0.9 },
  { scale: 1.14, amp: 22, k: 5, k2: 11, speed: -0.8, width: 0.9, color: "#F5F2EB", opacity: 0.55 },
  { scale: 1.21, amp: 28, k: 9, k2: 4, speed: 0.6, width: 0.6, color: "#C5A059", opacity: 0.45 },
  { scale: 1.29, amp: 34, k: 3, k2: 8, speed: -0.45, width: 0.45, color: "#F5F2EB", opacity: 0.25 },
];
const STEPS = 180;

function sentenceAt(words: Word[], index: number): [number, number] {
  let start = 0;
  for (let i = 0; i < words.length; i++) {
    const end = /[.!?…]["”»]?$/.test(words[i].text) || i === words.length - 1;
    if (end) {
      if (index <= i) return [start, i];
      start = i + 1;
    }
  }
  return [start, words.length - 1];
}

interface Spark {
  id: number;
  text: string;
  angle: number;
}

const IDLE_LINE = "Before you leave, look in the mirror and remove one thing.";

export function LivingSilhouette({ compact = false }: { compact?: boolean }) {
  const { status, utterance, thinking, getTime, getLevel } = useVoice();
  const waveRefs = useRef<(SVGPathElement | null)[]>([]);
  const facetRef = useRef<SVGGElement | null>(null);
  const [wordIndex, setWordIndex] = useState(-1);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);
  const speaking = status === "speaking";

  // Ink waves + word clock — one rAF loop, DOM-direct for the paths.
  useEffect(() => {
    let raf = 0;
    let smoothed = 0;
    let lastIdx = -1;
    const words = utterance?.words ?? [];
    const loop = () => {
      const t = performance.now() / 1000;
      const live = status === "speaking" ? getLevel() : 0;
      smoothed += (live - smoothed) * 0.18;
      const idle = thinking ? 0.18 + 0.08 * Math.sin(t * 3) : 0.04;
      const level = Math.max(smoothed, idle);

      WAVES.forEach((w, i) => {
        const el = waveRefs.current[i];
        if (!el) return;
        let d = "";
        for (let s = 0; s <= STEPS; s++) {
          const th = (s / STEPS) * Math.PI * 2;
          const base = octRadius(th) * w.scale;
          const pert =
            w.amp * level * (0.65 * Math.sin(w.k * th + t * w.speed * 3) + 0.35 * Math.sin(w.k2 * th - t * w.speed * 4.1)) +
            1.2 * Math.sin(t * 0.8 + i);
          const r = base + pert;
          const x = CX + r * Math.cos(th);
          const y = CY + r * Math.sin(th);
          d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        el.setAttribute("d", d + "Z");
      });
      if (facetRef.current) facetRef.current.style.opacity = String(0.05 + level * 0.25);

      if (status === "speaking" && words.length) {
        const now = getTime();
        let idx = -1;
        for (let i = 0; i < words.length; i++) {
          if (words[i].start <= now) idx = i;
          else break;
        }
        if (idx !== lastIdx) {
          lastIdx = idx;
          setWordIndex(idx);
          const w = idx >= 0 ? words[idx].text.replace(/[^\p{L}\p{N}°'’-]/gu, "") : "";
          if (w.length >= 7 || /^(N°5|Allure|Maison|Mademoiselle|Chanel|Cambon)$/i.test(w)) {
            const id = ++sparkId.current;
            setSparks((prev) => [...prev.slice(-5), { id, text: w, angle: Math.random() * Math.PI * 2 }]);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, utterance, thinking, getLevel, getTime]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the word clock on a new utterance
    setWordIndex(-1);
  }, [utterance?.id]);

  const words = useMemo(() => utterance?.words ?? [], [utterance]);
  const [s0, s1] = useMemo(
    () => (words.length ? sentenceAt(words, Math.max(0, wordIndex)) : [0, -1]),
    [words, wordIndex],
  );
  const currentWord = wordIndex >= 0 ? words[wordIndex]?.text.replace(/[.,;:!?…"“”«»]/g, "") : "";

  const stateLabel = thinking ? "Elle réfléchit" : status === "loading" ? "Elle prend la parole" : speaking ? "Elle parle" : "Elle écoute";

  return (
    <div className={`relative h-full w-full overflow-hidden bg-noir text-blanc ${compact ? "min-h-[46vh]" : ""}`}>
      {/* Ghost word: the current word, huge and nearly invisible, behind everything */}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] flex justify-center">
        <AnimatePresence mode="popLayout">
          {speaking && currentWord && currentWord.length > 3 && (
            <motion.span
              key={`${utterance?.id}-${wordIndex}`}
              initial={{ opacity: 0, y: 12, letterSpacing: "0.1em" }}
              animate={{ opacity: 0.07, y: 0, letterSpacing: "0.22em" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="label-strong whitespace-nowrap text-[12vw] leading-none lg:text-[4.6vw]"
            >
              {currentWord}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute left-5 top-5 z-10 flex items-center gap-3 lg:left-8 lg:top-8">
        <span className="relative flex h-1.5 w-1.5">
          {(speaking || thinking) && <span className="absolute inline-flex h-full w-full animate-ping bg-or opacity-70" />}
          <span className={`relative inline-flex h-1.5 w-1.5 ${speaking || thinking ? "bg-or" : "bg-blanc/40"}`} />
        </span>
        <span className="label text-blanc/80">Mademoiselle</span>
        <span className="label text-blanc/35">·</span>
        <span className="label text-or/90">{stateLabel}</span>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center ${compact ? "pb-20 pt-10" : "pb-20 pt-8 lg:pb-36 lg:pt-16"}`}>
        <svg viewBox="-60 -40 520 580" className="h-full max-h-[78vh] w-auto max-w-[92%] overflow-visible" aria-label="Mademoiselle, a silhouette in an octagon">
          <defs>
            <clipPath id="octagon-clip">
              <polygon points={OCTAGON} />
            </clipPath>
            <radialGradient id="cameo" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F5F2EB" />
              <stop offset="100%" stopColor="#E5DCCB" />
            </radialGradient>
          </defs>

          {/* Mirrored Staircase facets */}
          <g ref={facetRef} stroke="#F5F2EB" strokeWidth="0.6" style={{ opacity: 0.06 }}>
            {RAYS.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
            {VERTICES.map(([x, y], i) => {
              const [nx, ny] = VERTICES[(i + 2) % 8];
              return <line key={`c${i}`} x1={x} y1={y} x2={nx} y2={ny} strokeWidth="0.35" />;
            })}
          </g>

          {/* Ink waves */}
          {WAVES.map((w, i) => (
            <path
              key={i}
              ref={(el) => {
                waveRefs.current[i] = el;
              }}
              fill="none"
              stroke={w.color}
              strokeWidth={w.width}
              strokeOpacity={w.opacity}
              strokeLinejoin="round"
            />
          ))}

          {/* The cameo */}
          <g clipPath="url(#octagon-clip)">
            <polygon points={OCTAGON} fill="url(#cameo)" />
            <Silhouette />
          </g>
          <polygon points={OCTAGON} fill="none" stroke="#C5A059" strokeWidth="1.4" />
          <polygon
            points={OCTAGON}
            fill="none"
            stroke="#C5A059"
            strokeWidth="0.5"
            transform={`translate(${CX} ${CY}) scale(1.035) translate(${-CX} ${-CY})`}
            opacity="0.6"
          />

          {/* Gold word sparks drifting outwards */}
          <AnimatePresence>
            {sparks.map((s) => {
              const r0 = R * 1.12;
              const r1 = R * 1.5;
              return (
                <motion.text
                  key={s.id}
                  initial={{ opacity: 0, x: CX + r0 * Math.cos(s.angle), y: CY + r0 * Math.sin(s.angle) }}
                  animate={{ opacity: [0, 1, 0], x: CX + r1 * Math.cos(s.angle), y: CY + r1 * Math.sin(s.angle) }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.6, ease: "easeOut" }}
                  onAnimationComplete={() => setSparks((prev) => prev.filter((p) => p.id !== s.id))}
                  textAnchor="middle"
                  className="label-strong"
                  fontSize="11"
                  fill="#C5A059"
                >
                  {s.text.toUpperCase()}
                </motion.text>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Kinetic caption: the sentence being spoken */}
      <div className={`absolute inset-x-0 bottom-0 z-10 px-6 lg:px-12 ${compact ? "pb-5" : "pb-5 lg:pb-10"}`}>
        <div className="mx-auto max-w-xl text-center">
          <p className={`quote ${compact ? "text-lg" : "text-xl lg:text-[1.7rem]"} leading-snug`}>
            {utterance && words.length && (speaking || status === "idle") ? (
              words.slice(s0, s1 + 1).map((w, i) => {
                const idx = s0 + i;
                const done = !speaking || idx < wordIndex;
                const current = speaking && idx === wordIndex;
                return (
                  <motion.span
                    key={`${utterance.id}-${idx}`}
                    initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                    animate={{
                      opacity: current ? 1 : done ? (speaking ? 0.92 : 0.45) : 0.16,
                      y: 0,
                      filter: "blur(0px)",
                      color: current ? "#C5A059" : "#FFFFFF",
                    }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block whitespace-pre"
                  >
                    {w.text + " "}
                  </motion.span>
                );
              })
            ) : (
              <span className="text-blanc/45">« {IDLE_LINE} »</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
