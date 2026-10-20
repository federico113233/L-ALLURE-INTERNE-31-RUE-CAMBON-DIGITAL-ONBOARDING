"use client";

import { motion } from "framer-motion";
import { FACETS, type FacetId } from "@/lib/departments";

// Kapferer's Brand Identity Prism, drawn as the classic hexagon:
// sender above, recipient below; externalisation left, internalisation right.
const CELLS: Record<FacetId, { points: string; cx: number; cy: number }> = {
  physique: { points: "90,0 180,0 180,104 30,104", cx: 118, cy: 58 },
  personality: { points: "180,0 270,0 330,104 180,104", cx: 242, cy: 58 },
  relationship: { points: "30,104 180,104 180,208 30,208 0,156", cx: 100, cy: 160 },
  culture: { points: "180,104 330,104 360,156 330,208 180,208", cx: 260, cy: 160 },
  reflection: { points: "30,208 180,208 180,312 90,312", cx: 118, cy: 262 },
  selfImage: { points: "180,208 330,208 270,312 180,312", cx: 242, cy: 262 },
};

export function Prism({ active, onSelect }: { active: FacetId; onSelect: (f: FacetId) => void }) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <p className="label mb-4 text-center text-graphite">Picture of sender</p>
      <svg viewBox="-2 -2 364 316" className="w-full" role="group" aria-label="Kapferer's Brand Identity Prism">
        {FACETS.map((f) => {
          const c = CELLS[f.id];
          const on = active === f.id;
          return (
            <g
              key={f.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={f.label}
              onClick={() => onSelect(f.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(f.id)}
              className="cursor-pointer outline-none [&:focus-visible>polygon]:stroke-or"
            >
              <motion.polygon
                points={c.points}
                initial={false}
                animate={{ fill: on ? "#000000" : "#FFFFFF" }}
                whileHover={{ fill: on ? "#000000" : "#F5F2EB" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                stroke="#000000"
                strokeWidth="0.8"
              />
              <text
                x={c.cx}
                y={c.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="label-strong pointer-events-none"
                fontSize="9.5"
                fill={on ? "#FFFFFF" : "#000000"}
              >
                {f.label.toUpperCase()}
              </text>
              {on && (
                <motion.line
                  layoutId="prism-mark"
                  x1={c.cx - 12}
                  x2={c.cx + 12}
                  y1={c.cy + 12}
                  y2={c.cy + 12}
                  stroke="#C5A059"
                  strokeWidth="1.2"
                />
              )}
            </g>
          );
        })}
      </svg>
      <p className="label mt-4 text-center text-graphite">Picture of recipient</p>
      <div className="label mt-3 flex justify-between text-graphite/70">
        <span>← Externalisation</span>
        <span>Internalisation →</span>
      </div>
    </div>
  );
}
