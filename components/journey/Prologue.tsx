"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Monogram } from "@/components/ui";
import { sfx } from "@/lib/client/sfx";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS, DEPT_ORDER, type DeptId } from "@/lib/departments";
import { PROLOGUE } from "@/lib/journey/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Prologue({ onEnter, onDone }: { onEnter: () => void; onDone: () => void }) {
  const session = useSession();
  const voice = useVoice();
  const [stage, setStage] = useState<"sealed" | "letter" | "doors">("sealed");
  const [name, setName] = useState("");
  const [dept, setDept] = useState<DeptId | null>(null);
  const shownName = name || (session.ready ? session.name : "");
  const chosen = dept ?? (session.ready ? session.dept : null);
  const ready = shownName.trim().length > 0 && chosen !== null;

  function breakSeal() {
    sfx.unlock();
    voice.prime();
    sfx.click();
    sfx.whoosh();
    sfx.ambient(true);
    setStage("letter");
    setTimeout(() => void voice.speak(PROLOGUE.letter), 600);
  }

  function enter() {
    if (!ready || !chosen) return;
    session.enter(shownName, chosen);
    sfx.success();
    setStage("doors");
    void voice.speak(PROLOGUE.doors);
    setTimeout(() => sfx.whoosh(), 500);
    setTimeout(onEnter, 900);
    setTimeout(onDone, 2700);
  }

  return (
    <div className={`fixed inset-0 z-40 ${stage === "doors" ? "pointer-events-none" : ""}`}>
      {/* the two black doors of 31 Rue Cambon */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`absolute top-0 h-full w-1/2 bg-noir ${side === "left" ? "left-0" : "right-0"}`}
          animate={stage === "doors" ? { x: side === "left" ? "-100%" : "100%" } : { x: 0 }}
          transition={{ duration: 1.9, delay: 0.5, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className={`absolute top-0 h-full w-px bg-or/40 ${side === "left" ? "right-0" : "left-0"}`} />
          <div
            className={`absolute top-1/2 h-24 w-[3px] -translate-y-1/2 bg-or/80 ${side === "left" ? "right-6" : "left-6"}`}
          />
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {stage === "sealed" && (
          <motion.div
            key="sealed"
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-blanc"
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.32em" }}
              transition={{ duration: 2.2, ease: EASE }}
              className="label-strong text-[0.7rem] text-blanc/70"
            >
              31 Rue Cambon · Paris
            </motion.p>
            {/* envelope */}
            <motion.button
              onClick={breakSeal}
              initial={{ opacity: 0, y: 30, rotateX: 25 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.6, delay: 0.4, ease: EASE }}
              whileHover={{ y: -6 }}
              className="group relative mt-10 h-[230px] w-[min(360px,86vw)] border border-blanc/15 bg-[#0b0b0b] shadow-[0_40px_80px_-30px_rgba(197,160,89,0.25)]"
              aria-label="Break the seal"
            >
              <svg viewBox="0 0 360 230" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <path d="M0 0 L180 125 L360 0" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              </svg>
              <span className="absolute left-1/2 top-[125px] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-or shadow-[0_0_40px_rgba(197,160,89,0.45)] transition-transform duration-700 group-hover:scale-110">
                <Monogram className="h-8 w-auto" />
              </span>
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1.2 }}
              className="label mt-10 text-or"
            >
              Briser le sceau
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2.2 }} className="label mt-3 text-[0.55rem]">
              Sound on · Mademoiselle speaks
            </motion.p>
          </motion.div>
        )}

        {stage === "letter" && (
          <motion.div
            key="letter"
            className="absolute inset-0 flex items-center justify-center overflow-y-auto px-4 py-10"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.7 } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: EASE }}
              className="relative w-[min(560px,100%)] bg-beige px-8 py-10 text-noir shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)] sm:px-14 sm:py-14"
            >
              <div className="pointer-events-none absolute inset-3 border border-noir/10" />
              <div className="flex items-center justify-between">
                <Monogram className="h-6 w-auto" />
                <span className="label text-[0.58rem] text-graphite">Lettre d&apos;admission</span>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1.4 }}
                className="quote mt-10 text-[1.65rem] leading-snug sm:text-[1.9rem]"
              >
                Mademoiselle requests the pleasure of your presence at 31 Rue Cambon.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 1.2 }}
                className="mt-4 text-[0.95rem] leading-relaxed text-noir/70"
              >
                You have been chosen. Now you must learn the codes — those that are written nowhere, and that every Maison expects you to know.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}>
                <label htmlFor="name" className="label mt-10 block text-graphite">
                  Signed
                </label>
                <input
                  id="name"
                  value={shownName}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enter()}
                  placeholder="Votre prénom"
                  maxLength={60}
                  autoComplete="given-name"
                  className="quote mt-2 w-full border-b border-noir/25 bg-transparent pb-2 text-3xl outline-none transition-colors duration-700 placeholder:text-noir/25 focus:border-or"
                />

                <p className="label mt-8 text-graphite">Your Métier</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {DEPT_ORDER.map((id) => {
                    const d = DEPARTMENTS[id];
                    const on = chosen === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setDept(id);
                          sfx.click();
                        }}
                        onMouseEnter={() => sfx.hover()}
                        className={`border px-3 py-4 text-left transition-colors duration-500 ${on ? "border-noir bg-noir text-blanc" : "border-noir/15 hover:border-noir"}`}
                      >
                        <span className="display block text-lg leading-tight">{d.name}</span>
                        <span className={`label mt-2 block text-[0.52rem] ${on ? "text-or" : "text-graphite"}`}>{d.scope}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={enter}
                  disabled={!ready}
                  className="label mt-10 h-12 w-full bg-noir text-blanc transition-colors duration-500 hover:bg-or hover:text-noir disabled:opacity-30"
                >
                  Entrer à la Maison →
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
