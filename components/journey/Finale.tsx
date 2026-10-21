"use client";

import { motion } from "framer-motion";
import { Silhouette } from "@/components/stage/Silhouette";
import { Monogram } from "@/components/ui";
import { DEPARTMENTS, type DeptId } from "@/lib/departments";
import { CODES, levelFor, type CodeId } from "@/lib/journey/content";
import { useJourney } from "@/lib/journey/store";
import { CodeGlyph } from "./Hud";

const EASE = [0.22, 1, 0.36, 1] as const;
const R = 180;
const OCT = Array.from({ length: 8 }, (_, k) => {
  const a = Math.PI / 8 + (k * Math.PI) / 4;
  return `${Math.round((200 + R * Math.cos(a)) * 100) / 100},${Math.round((250 + R * Math.sin(a)) * 100) / 100}`;
}).join(" ");

export function Finale({ name, dept, onGallery, onRestart }: { name: string; dept: DeptId; onGallery: () => void; onRestart: () => void }) {
  const points = useJourney((s) => s.points);
  const codes = useJourney((s) => s.codes);
  const oralAvg = useJourney((s) => s.oralAvg);
  const level = levelFor(points);
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-blanc/80 px-4 py-24 backdrop-blur-md"
    >
      <motion.article
        initial={{ opacity: 0, y: 60, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
        className="relative grid w-[min(860px,100%)] overflow-hidden bg-noir text-blanc shadow-[0_60px_120px_-50px_rgba(0,0,0,0.7)] md:grid-cols-[300px_1fr]"
      >
        <div className="relative flex items-center justify-center bg-noir p-8">
          <svg viewBox="0 0 400 500" className="w-full max-w-[260px]">
            <defs>
              <clipPath id="finale-oct">
                <polygon points={OCT} />
              </clipPath>
            </defs>
            <g clipPath="url(#finale-oct)">
              <polygon points={OCT} fill="#F5F2EB" />
              <Silhouette />
            </g>
            <polygon points={OCT} fill="none" stroke="#C5A059" strokeWidth="2" />
          </svg>
        </div>
        <div className="relative border-t border-or/30 p-8 sm:p-12 md:border-l md:border-t-0">
          <div className="flex items-center justify-between">
            <span className="label text-[0.6rem] text-or">Carte d&apos;Insider</span>
            <Monogram className="h-6 w-auto" tone="white" />
          </div>
          <h2 className="display mt-8 text-5xl sm:text-6xl">{name || "Insider"}</h2>
          <p className="label mt-3 text-blanc/60">
            {DEPARTMENTS[dept].name} · 31 Rue Cambon · {date}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-px bg-blanc/10">
            {[
              { k: "Allure", v: String(points) },
              { k: "Rang", v: level.name },
              { k: "Grand Oral", v: oralAvg !== null ? `${oralAvg}/20` : "—" },
            ].map((x) => (
              <div key={x.k} className="bg-noir p-4">
                <p className="label text-[0.55rem] text-blanc/50">{x.k}</p>
                <p className="display mt-2 text-2xl leading-tight">{x.v}</p>
              </div>
            ))}
          </div>

          <p className="label mt-10 text-[0.58rem] text-blanc/50">Les codes · {codes.length} / {Object.keys(CODES).length}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(CODES) as CodeId[]).map((id) => (
              <span
                key={id}
                title={CODES[id].name}
                className={`flex h-9 w-9 items-center justify-center border ${codes.includes(id) ? "border-or text-or" : "border-blanc/15 text-blanc/15"}`}
              >
                <CodeGlyph id={id} className="h-4 w-4" />
              </span>
            ))}
          </div>

          <p className="quote mt-10 text-xl text-blanc/80">« Say less than you know. »</p>
          <p className="label mt-1 text-[0.55rem] text-or">— Mademoiselle</p>

          <div className="mt-10 flex flex-wrap gap-3 print:hidden">
            <button onClick={() => window.print()} className="label h-11 border border-blanc/40 px-6 hover:border-or hover:text-or">
              Imprimer
            </button>
            <button onClick={onGallery} className="label h-11 bg-blanc px-6 text-noir hover:bg-or">
              La Galerie
            </button>
            <button onClick={onRestart} className="label h-11 px-4 text-blanc/50 hover:text-blanc">
              Recommencer
            </button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
