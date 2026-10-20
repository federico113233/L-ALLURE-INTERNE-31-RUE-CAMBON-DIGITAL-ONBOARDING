"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useJourney } from "@/lib/journey/store";
import { useVoice, type Word } from "@/lib/client/voice";
import { Figure } from "./Figure";

// Mademoiselle walks the gallery: she goes where the scene directs her
// (store.target = where her feet should stand), turns to face where she's
// heading, gestures while she speaks, and her words appear in a bubble.

function sentenceBounds(words: Word[], index: number): [number, number] {
  let start = 0;
  for (let i = 0; i < words.length; i++) {
    const end = /[.!?…]["”»]?$/.test(words[i].text) || i === words.length - 1;
    if (end) {
      if (index <= i) return [start, i];
      start = i + 1;
    }
  }
  return [start, Math.max(0, words.length - 1)];
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

export function Mademoiselle({ onClick }: { onClick?: () => void }) {
  const target = useJourney((s) => s.target);
  const pose = useJourney((s) => s.pose);
  const hidden = useJourney((s) => s.hidden);
  const look = useJourney((s) => s.look);
  const inRoom = useJourney((s) => s.phase === "room");
  const voice = useVoice();
  const vp = useViewport();
  const controls = useAnimationControls();
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const pos = useRef<{ x: number; y: number } | null>(null);

  const height = Math.round(Math.min(300, Math.max(170, vp.h * 0.34)));
  const width = Math.round(height * (130 / 386));
  const talking = voice.status === "speaking";

  const dest = useMemo(
    () => target ?? { x: Math.max(width + 24, vp.w * 0.1), y: vp.h - 28 },
    [target, vp.w, vp.h, width],
  );

  // Walk to the destination.
  useEffect(() => {
    const from = pos.current;
    const to = { x: dest.x - width / 2, y: dest.y - height };
    if (!from) {
      pos.current = to;
      controls.set(to);
      return;
    }
    const dx = to.x - from.x;
    const dist = Math.hypot(dx, to.y - from.y);
    const faceLook = () => {
      if (look !== null) setFacing(look >= to.x + width / 2 ? 1 : -1);
    };
    if (dist < 4) {
      faceLook();
      return;
    }
    if (Math.abs(dx) > 6) setFacing(dx > 0 ? 1 : -1);
    setWalking(true);
    pos.current = to;
    void controls
      .start(to, { duration: Math.min(2.6, Math.max(0.6, dist / 260)), ease: [0.45, 0, 0.3, 1] })
      .then(() => {
        setWalking(false);
        faceLook();
      });
  }, [dest, width, height, controls, look]);

  // Word clock for the bubble.
  const [wordIndex, setWordIndex] = useState(-1);
  const utter = voice.utterance;
  useEffect(() => {
    if (!utter || voice.status !== "speaking") return;
    let raf = 0;
    let last = -2;
    const tick = () => {
      const t = voice.getTime();
      let idx = -1;
      for (let i = 0; i < utter.words.length; i++) {
        if (utter.words[i].start <= t) idx = i;
        else break;
      }
      if (idx !== last) {
        last = idx;
        setWordIndex(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [utter, voice.status, voice]);

  // Keep the bubble a moment after she finishes.
  const [lingering, setLingering] = useState(false);
  useEffect(() => {
    if (voice.status === "speaking") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the bubble follows the voice clock
      setLingering(true);
      return;
    }
    const t = setTimeout(() => setLingering(false), 2200);
    return () => clearTimeout(t);
  }, [voice.status]);

  const words = utter?.words ?? [];
  const [s0, s1] = words.length ? sentenceBounds(words, Math.max(0, wordIndex)) : [0, -1];
  const showBubble = !hidden && (voice.thinking || voice.status === "loading" || (lingering && words.length > 0));
  const bubbleLeft = dest.x + width / 2 + 300 < vp.w;

  return (
    <motion.div
      animate={controls}
      initial={false}
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{ width, height }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Mademoiselle — hear her again"
        className="pointer-events-auto relative block h-full w-full"
        animate={hidden ? { opacity: 0, scale: 0.15, y: -40 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: hidden ? 0.9 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0.5, originY: 0.6 }}
      >
        {/* soft shadow on the floor */}
        <span className="absolute -bottom-1 left-1/2 h-2 w-[70%] -translate-x-1/2 rounded-full bg-noir/15 blur-[3px]" />
        <motion.div className="h-full w-full" animate={{ scaleX: facing }} transition={{ duration: 0.35 }}>
          <Figure pose={pose} talking={talking} walking={walking} />
        </motion.div>
        {/* voice — three gold arcs near her lips */}
        <AnimatePresence>
          {talking && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              viewBox="0 0 20 20"
              className="absolute h-5 w-5"
              style={{ top: "13%", [facing === 1 ? "left" : "right"]: "88%", transform: facing === 1 ? undefined : "scaleX(-1)" }}
            >
              {[4, 8, 12].map((r, i) => (
                <motion.path
                  key={r}
                  d={`M2 ${10 - r * 0.6} Q${2 + r} 10 2 ${10 + r * 0.6}`}
                  stroke="#C5A059"
                  strokeWidth="1.2"
                  fill="none"
                  animate={{ opacity: [0.15, 1, 0.15] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[min(320px,78vw)] border border-noir/10 bg-blanc/95 px-5 py-4 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
            style={
              inRoom && vp.w >= 1024
                ? { bottom: 0, left: width + 14 }
                : { bottom: height * 0.72, [bubbleLeft ? "left" : "right"]: width * 0.75 }
            }
          >
            {!(inRoom && vp.w >= 1024) && (
              <span
                className="absolute -bottom-[7px] h-3 w-3 rotate-45 border-b border-r border-noir/10 bg-blanc"
                style={{ [bubbleLeft ? "left" : "right"]: 18 }}
              />
            )}
            <p className="label text-[0.58rem] text-or">Mademoiselle</p>
            {voice.thinking || voice.status === "loading" ? (
              <p className="quote mt-2 text-lg text-noir/60">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  …
                </motion.span>
              </p>
            ) : (
              <p className="quote mt-2 text-[1.15rem] leading-snug">
                {words.slice(s0, s1 + 1).map((w, i) => {
                  const idx = s0 + i;
                  const speaking = voice.status === "speaking";
                  const current = speaking && idx === wordIndex;
                  const done = !speaking || idx < wordIndex;
                  return (
                    <motion.span
                      key={`${utter?.id}-${idx}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: current ? 1 : done ? 0.9 : 0.18, y: 0, color: current ? "#C5A059" : "#000000" }}
                      transition={{ duration: 0.35 }}
                      className="inline-block whitespace-pre"
                    >
                      {w.text + " "}
                    </motion.span>
                  );
                })}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
