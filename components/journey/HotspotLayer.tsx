"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CHAPTER_BY_ID, type Hotspot } from "@/lib/journey/content";
import { useJourney } from "@/lib/journey/store";

// The gold points on the object in a chapter. The 3D scene projects each
// hotspot to screen coordinates every other frame; this layer draws them as
// plain HTML (no WebGL-hosted React roots) and hides the ones turned away.
export function HotspotLayer({ onHotspot }: { onHotspot: (h: Hotspot) => void }) {
  const phase = useJourney((s) => s.phase);
  const room = useJourney((s) => s.room);
  const step = useJourney((s) => s.step);
  const spots = useJourney((s) => s.spots);
  const found = useJourney((s) => s.found);
  const active = useJourney((s) => s.spot);

  const current = phase === "room" && room ? CHAPTER_BY_ID[room].steps[step] : null;
  const hotspots = current?.kind === "explore" ? current.hotspots : [];

  return (
    <div className="pointer-events-none fixed inset-0 z-[18]">
      <AnimatePresence>
        {hotspots.map((h, i) => {
          const p = spots[h.id];
          if (!p) return null;
          const isFound = Boolean(found[`${room}:${h.id}`]);
          const isActive = active === h.id;
          return (
            <motion.button
              key={`${room}-${h.id}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: p.front ? 1 : 0, scale: p.front ? 1 : 0.6 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onHotspot(h)}
              aria-label={h.title}
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: p.x, top: p.y, pointerEvents: p.front ? "auto" : "none" }}
            >
              {!isFound && <span className="absolute h-10 w-10 animate-ping rounded-full border border-or opacity-60" />}
              <span
                className={`relative h-4 w-4 rounded-full border-2 transition-all duration-500 ${
                  isActive
                    ? "scale-125 border-blanc bg-noir shadow-[0_0_0_3px_rgba(197,160,89,0.9)]"
                    : isFound
                      ? "border-or bg-blanc"
                      : "border-blanc bg-or shadow-[0_0_18px_4px_rgba(197,160,89,0.75)]"
                }`}
              />
              <span className="label pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blanc/95 px-3 py-1.5 text-[0.6rem] text-noir opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
                {h.title.split(" · ")[0]}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
