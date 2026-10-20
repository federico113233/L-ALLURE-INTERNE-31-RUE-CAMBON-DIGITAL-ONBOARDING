"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CodesFloor } from "@/components/floors/CodesFloor";
import { GrandOralFloor } from "@/components/floors/GrandOralFloor";
import { LexiconFloor } from "@/components/floors/LexiconFloor";
import { LivingSilhouette } from "@/components/stage/LivingSilhouette";
import { Monogram } from "@/components/ui";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS, DEPT_ORDER } from "@/lib/departments";
import { FLOORS, type FloorId } from "@/lib/floors";

export default function Maison() {
  const router = useRouter();
  const session = useSession();
  const voice = useVoice();
  const [floor, setFloor] = useState<FloorId>("codes");
  const greeted = useRef<string | null>(null);
  const visited = useRef<Set<FloorId>>(new Set(["codes"]));
  const scroller = useRef<HTMLDivElement | null>(null);
  const { dept, ready } = session;

  useEffect(() => {
    if (ready && !dept) router.replace("/");
  }, [ready, dept, router]);

  // Mademoiselle welcomes the intern once per department.
  const speak = voice.speak;
  useEffect(() => {
    if (!dept || greeted.current === dept) return;
    const t = setTimeout(() => {
      greeted.current = dept;
      void speak(DEPARTMENTS[dept].welcome);
    }, 700);
    return () => clearTimeout(t);
  }, [dept, speak]);

  function goTo(id: FloorId) {
    if (id === floor) return;
    setFloor(id);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!visited.current.has(id)) {
      visited.current.add(id);
      void voice.speak(FLOORS.find((f) => f.id === id)!.intro);
    } else voice.stop();
  }

  if (!dept) return <main className="min-h-screen bg-noir" />;

  return (
    <main className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <section className="h-[44vh] shrink-0 lg:h-screen lg:w-[40%] xl:w-[38%]">
        <LivingSilhouette compact={false} />
      </section>

      <div ref={scroller} className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:overflow-y-auto">
        <header className="sticky top-0 z-20 border-b hairline bg-blanc/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10 xl:px-14">
            <Link href="/" className="flex items-center gap-3" aria-label="Back to the entrance">
              <Monogram className="h-5 w-8" />
              <span className="label-strong hidden text-[0.75rem] tracking-[0.42em] xl:inline">Chanel</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {session.name && <span className="label mr-2 hidden text-graphite 2xl:inline">{session.name}</span>}
              <select
                aria-label="Change department"
                value={dept}
                onChange={(e) => {
                  greeted.current = null;
                  visited.current = new Set([floor]);
                  session.setDept(e.target.value as typeof dept);
                }}
                className="label w-[8.5rem] cursor-pointer border hairline bg-blanc px-2 py-2 outline-none sm:w-auto"
              >
                {DEPT_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {DEPARTMENTS[id].name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => voice.setMuted(!voice.muted)}
                className="label whitespace-nowrap border hairline px-3 py-2 transition-colors duration-500 hover:border-noir"
                aria-pressed={!voice.muted}
                title={voice.available === false ? "Voice not configured — silent reading" : undefined}
              >
                <span className="sm:hidden">{voice.muted ? "Off" : "Son"}</span>
                <span className="hidden sm:inline">
                  {voice.muted ? "Son · off" : voice.available === false ? "Son · lecture" : "Son · on"}
                </span>
              </button>
              <button
                onClick={() => session.setInstantDemo(!session.instantDemo)}
                className={`label hidden whitespace-nowrap border px-3 py-2 transition-colors duration-500 sm:inline ${session.instantDemo ? "border-or bg-or text-noir" : "hairline hover:border-noir"}`}
                aria-pressed={session.instantDemo}
                title="Presets answer instantly from the authored demo script"
              >
                Démo instantanée
              </button>
            </div>
          </div>

          {/* Les Étages de Cambon */}
          <nav className="flex px-6 sm:px-10 xl:px-14" aria-label="Floors">
            {FLOORS.map((f) => {
              const on = floor === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => goTo(f.id)}
                  aria-current={on ? "page" : undefined}
                  className="group relative mr-6 flex items-baseline gap-2 py-4 sm:mr-10"
                >
                  <span className={`label ${on ? "text-or" : "text-graphite/60"}`}>Étage {f.numeral}</span>
                  <span className={`label hidden transition-colors duration-500 sm:inline ${on ? "text-noir" : "text-graphite group-hover:text-noir"}`}>
                    {f.french}
                  </span>
                  {on && <motion.span layoutId="floor-mark" className="absolute inset-x-0 -bottom-px h-px bg-noir" />}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 px-6 pt-14 sm:px-10 xl:px-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${floor}-${dept}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {floor === "codes" && <CodesFloor dept={dept} />}
              {floor === "lexicon" && <LexiconFloor dept={dept} />}
              {floor === "oral" && <GrandOralFloor dept={dept} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="label flex flex-wrap justify-between gap-4 border-t hairline px-6 py-6 text-graphite/70 sm:px-10 xl:px-14">
          <span>L&apos;Allure Interne · 31 Rue Cambon</span>
          <span>HEC Paris prototype · Not an official CHANEL product</span>
        </footer>
      </div>
    </main>
  );
}
