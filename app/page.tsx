"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LivingSilhouette } from "@/components/stage/LivingSilhouette";
import { Button, Eyebrow, Reveal, Wordmark } from "@/components/ui";
import { DEPARTMENTS, DEPT_ORDER, type DeptId } from "@/lib/departments";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";

export default function Ingresso() {
  const router = useRouter();
  const session = useSession();
  const voice = useVoice();
  const [name, setName] = useState("");
  const [dept, setDept] = useState<DeptId | null>(null);

  const shownName = name || (session.ready ? session.name : "");
  const canEnter = shownName.trim().length > 0 && dept !== null;

  function enter() {
    if (!dept || !shownName.trim()) return;
    voice.prime();
    session.enter(shownName, dept);
    router.push("/maison");
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="order-2 h-[52vh] lg:order-1 lg:sticky lg:top-0 lg:h-screen lg:w-[46%]">
        <LivingSilhouette />
      </section>

      <section className="order-1 flex flex-1 flex-col px-6 py-8 sm:px-10 lg:order-2 lg:px-16 lg:py-10 xl:px-24">
        <header className="flex items-center justify-between">
          <Wordmark />
          <span className="label hidden text-graphite sm:inline">HEC Paris · Business Project</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-12 lg:py-0">
          <Reveal>
            <Eyebrow>31 Rue Cambon · Digital Onboarding</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display mt-8 text-[3.4rem] sm:text-7xl xl:text-[5.6rem]">
              L&apos;Allure
              <br />
              <span className="quote">Interne</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-graphite">
              The unwritten codes of the Maison, taught by the one who wrote them. Three floors, one mentor: Mademoiselle.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12 max-w-xl">
            <label htmlFor="intern-name" className="label text-graphite">
              I · Your name
            </label>
            <input
              id="intern-name"
              value={shownName}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canEnter && enter()}
              placeholder="Prénom"
              autoComplete="given-name"
              maxLength={60}
              className="display mt-3 w-full border-b border-noir/20 bg-transparent pb-3 text-3xl outline-none transition-colors duration-700 placeholder:text-noir/20 focus:border-or"
            />
          </Reveal>

          <Reveal delay={0.4} className="mt-12 max-w-xl">
            <span className="label text-graphite">II · Your Métier</span>
            <ul className="mt-4 border-t hairline">
              {DEPT_ORDER.map((id, i) => {
                const d = DEPARTMENTS[id];
                const active = dept === id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => setDept(id)}
                      aria-pressed={active}
                      className="group relative flex w-full items-baseline justify-between gap-6 border-b hairline py-5 text-left"
                    >
                      <motion.span
                        className="absolute left-0 top-0 h-full w-[2px] bg-or"
                        initial={false}
                        animate={{ scaleY: active ? 1 : 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ originY: 0 }}
                      />
                      <span className="flex items-baseline gap-5 pl-5">
                        <span className="label text-or">{["I", "II", "III"][i]}</span>
                        <span
                          className={`display whitespace-nowrap text-[1.6rem] transition-colors duration-500 sm:text-3xl ${active ? "text-noir" : "text-noir/55 group-hover:text-noir"}`}
                        >
                          {d.name}
                        </span>
                      </span>
                      <span className="label hidden max-w-[11rem] text-right leading-relaxed text-graphite xl:block">{d.scope}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.5} className="mt-12">
            <Button onClick={enter} disabled={!canEnter} className="w-full sm:w-auto">
              Entrer à la Maison
              <span aria-hidden>→</span>
            </Button>
            <p className="label mt-4 text-graphite/70">Sound on — Mademoiselle speaks.</p>
          </Reveal>
        </div>

        <footer className="label flex flex-wrap gap-x-6 gap-y-2 border-t hairline pt-6 text-graphite/70">
          <span>Strategic Brand Management — Prof. G. Kretz</span>
          <span>Prototype · Not an official CHANEL product</span>
        </footer>
      </section>
    </main>
  );
}
