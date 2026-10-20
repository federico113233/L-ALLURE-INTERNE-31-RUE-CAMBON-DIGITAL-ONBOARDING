"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AskMademoiselle } from "@/components/AskMademoiselle";
import { Eyebrow, SpeakerIcon } from "@/components/ui";
import { DEPARTMENTS, DIOR_VS_CHANEL, FACETS, ICONICITY_LEVELS, type DeptId, type FacetId } from "@/lib/departments";
import { ASK_SUGGESTIONS } from "@/lib/floors";
import { useVoice } from "@/lib/client/voice";
import { Prism } from "./Prism";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CodesFloor({ dept }: { dept: DeptId }) {
  const d = DEPARTMENTS[dept];
  const voice = useVoice();
  const [facet, setFacet] = useState<FacetId>("physique");
  const [lens, setLens] = useState<"chanel" | "dior">("chanel");
  const f = FACETS.find((x) => x.id === facet)!;

  function selectFacet(id: FacetId) {
    setFacet(id);
    const next = FACETS.find((x) => x.id === id)!;
    void voice.speak(next.mademoiselle);
  }

  return (
    <div className="space-y-24 pb-24">
      {/* Identity vs equity */}
      <section>
        <Eyebrow>Étage I · Les Codes & le Prisme</Eyebrow>
        <h2 className="display mt-6 text-5xl sm:text-6xl">
          The codes of <span className="quote">{d.floorLabel}</span>
        </h2>
        <div className="mt-10 grid gap-px bg-ligne sm:grid-cols-2">
          <div className="bg-blanc p-6 sm:pr-10">
            <p className="label text-or">Brand Identity · Kapferer</p>
            <p className="quote mt-3 text-2xl">“What I think I am.”</p>
            <p className="mt-3 text-sm leading-relaxed text-graphite">
              Decided by the Maison, flowing top-down: vision, values, personality codes, physical signature, then products and actions. If the Maison does not steer its identity from within — starting with its interns — the market decides who it is.
            </p>
          </div>
          <div className="bg-blanc p-6 sm:pl-10">
            <p className="label text-or">Brand Equity · Kapferer</p>
            <p className="quote mt-3 text-2xl">“How I am perceived.”</p>
            <p className="mt-3 text-sm leading-relaxed text-graphite">
              Decided by clients, built bottom-up from what they see and live: every product, every gesture, every email you write.
            </p>
          </div>
        </div>
        <p className="quote mt-8 text-xl text-noir/80">« Strong houses repeat the same codes in every category. »</p>
      </section>

      {/* The prism */}
      <section>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label text-graphite">Kapferer&apos;s Identity Prism</p>
            <h3 className="display mt-3 text-4xl">Six faces, one Maison</h3>
          </div>
          <p className="label hidden text-graphite/70 md:block">Select a facet — Mademoiselle answers</p>
        </div>
        <div className="mt-10 grid items-start gap-12 2xl:grid-cols-[minmax(0,420px)_1fr]">
          <Prism active={facet} onSelect={selectFacet} />
          <AnimatePresence mode="wait">
            <motion.div
              key={facet}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="label text-or">{f.french}</p>
              <h4 className="display mt-2 text-4xl">{f.label}</h4>
              <p className="mt-5 leading-relaxed text-noir/80">{f.definition}</p>
              <div className="mt-6 border-t hairline pt-6">
                <p className="label text-graphite">In {d.name}</p>
                <p className="mt-3 leading-relaxed">{d.prism[facet]}</p>
              </div>
              <blockquote className="mt-8 border-l border-or pl-6">
                <p className="quote text-2xl leading-snug">« {f.mademoiselle} »</p>
                <button
                  onClick={() => void voice.speak(f.mademoiselle)}
                  className="label mt-4 inline-flex items-center gap-2 text-graphite hover:text-or"
                >
                  <SpeakerIcon /> Mademoiselle
                </button>
              </blockquote>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Department codes */}
      <section>
        <p className="label text-graphite">Les Codes de la Maison · {d.name}</p>
        <h3 className="display mt-3 text-4xl">What you must recognise with your eyes closed</h3>
        <div className="mt-10 grid gap-px border hairline bg-ligne sm:grid-cols-2 2xl:grid-cols-3">
          {d.codes.map((c, i) => (
            <motion.article
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
              className="group flex flex-col bg-blanc p-7 transition-colors duration-700 hover:bg-beige"
            >
              <span className="label text-or">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="display mt-4 text-2xl">{c.name}</h4>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">{c.detail}</p>
              <p className="label mt-6 text-noir/60">{c.origin}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Iconicity */}
      <section>
        <p className="label text-graphite">The four levels of brand iconicity</p>
        <h3 className="display mt-3 text-4xl">From recognised to meaningful</h3>
        <ol className="mt-10 grid gap-px bg-ligne md:grid-cols-4">
          {ICONICITY_LEVELS.map((l, i) => (
            <li key={l.id} className="bg-blanc p-6">
              <div className="flex items-center gap-3">
                <span className="display text-3xl text-or">{i + 1}</span>
                <span className="h-px flex-1 bg-ligne" />
              </div>
              <p className="label-strong mt-5 text-[0.75rem]">{l.label}</p>
              <p className="quote mt-1 text-lg text-noir/70">{l.verb}</p>
              <p className="mt-4 text-sm leading-relaxed text-graphite">{l.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Chanel vs Dior */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-graphite">Critical guardrails</p>
            <h3 className="display mt-3 text-4xl">
              Chanel <span className="quote">is not</span> Avenue Montaigne
            </h3>
          </div>
          <div className="flex border border-noir" role="tablist" aria-label="Choose a lens">
            {(["chanel", "dior"] as const).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={lens === k}
                onClick={() => setLens(k)}
                className={`label px-5 py-3 transition-colors duration-500 ${lens === k ? "bg-noir text-blanc" : "text-noir hover:bg-beige"}`}
              >
                {k === "chanel" ? "Say this · Chanel" : "Never this · Dior"}
              </button>
            ))}
          </div>
        </div>
        <dl className="mt-10 border-t border-noir">
          {DIOR_VS_CHANEL.map((row) => (
            <div key={row.dimension} className="grid gap-3 border-b hairline py-6 md:grid-cols-[14rem_1fr]">
              <dt className="label pt-1 text-graphite">{row.dimension}</dt>
              <dd className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={lens}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={lens === "chanel" ? "leading-relaxed" : "leading-relaxed text-rouge/90 line-through decoration-rouge/40"}
                  >
                    {lens === "chanel" ? row.chanel : row.dior}
                  </motion.p>
                </AnimatePresence>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ask */}
      <section className="bg-beige px-6 py-12 sm:px-10">
        <p className="label text-graphite">Une question ?</p>
        <h3 className="display mt-3 text-4xl">Ask Mademoiselle</h3>
        <div className="mt-8">
          <AskMademoiselle suggestions={ASK_SUGGESTIONS[dept]} focus={`Floor I — Kapferer prism, facet: ${f.label}`} />
        </div>
      </section>
    </div>
  );
}
