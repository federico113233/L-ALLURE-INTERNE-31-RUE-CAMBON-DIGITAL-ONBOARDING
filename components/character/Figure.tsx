"use client";

import { motion, type Transition } from "framer-motion";
import type { Pose } from "@/lib/journey/store";

// Mademoiselle, full figure, as a cut-paper silhouette in profile:
// boater, bob, tweed jacket and skirt with braid, long pearls, camellia,
// gold cuff, tailor's scissors on a ribbon, and two-tone slingbacks.
// Articulated: head, arm (shoulder + elbow) and legs animate by pose.

const INK = "#000000";
const IVORY = "#F5F2EB";
const GOLD = "#C5A059";
const SABLE = "#E5DCCB";

function strand(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n: number) {
  const pts: [number, number][] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    pts.push([
      Math.round(((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1) * 10) / 10,
      Math.round(((1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1) * 10) / 10,
    ]);
  }
  return pts;
}

const PEARLS = [
  { pts: strand(101, 104, 124, 108, 123, 134, 9), r: 2.1 },
  { pts: strand(100, 105, 127, 112, 125, 158, 13), r: 2.2 },
  { pts: strand(99, 106, 130, 118, 126, 184, 17), r: 2.3 },
];

const loop = (d: number): Transition => ({ duration: d, repeat: Infinity, ease: "easeInOut" });

export function Figure({ pose, talking, walking }: { pose: Pose; talking: boolean; walking: boolean }) {
  const arm =
    pose === "point"
      ? { upper: -82, fore: -8 }
      : pose === "present"
        ? { upper: -38, fore: -62 }
        : walking
          ? { upper: [8, -10, 8], fore: [-4, -10, -4] }
          : talking
            ? { upper: [-6, -18, -8, -6], fore: [-18, -40, -22, -18] }
            : { upper: 4, fore: -6 };

  const armT: Transition =
    pose === "point" || pose === "present"
      ? { type: "spring", stiffness: 60, damping: 14 }
      : walking
        ? loop(0.75)
        : talking
          ? loop(2.4)
          : { duration: 0.8 };

  return (
    <svg viewBox="40 16 130 386" className="h-full w-auto overflow-visible" aria-hidden="true">
      <defs>
        <pattern id="tweed" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={INK} />
          <path d="M0 3h2M3 0v2M4 4h2M1 5v1" stroke={IVORY} strokeWidth="0.5" opacity="0.18" />
        </pattern>
      </defs>

      {/* whole body breathes and sways from the feet */}
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={walking ? { y: [0, -2.5, 0, -2.5, 0], rotate: 0 } : { y: 0, rotate: [-0.7, 0.7, -0.7] }}
        transition={walking ? loop(0.75) : loop(6)}
      >
        {/* back leg */}
        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ rotate: walking ? [14, -14, 14] : 3 }}
          transition={walking ? loop(0.75) : { duration: 0.5 }}
        >
          <path d="M93 288 L104 288 L102 380 L96 380 Z" fill="#1a1a1a" />
          <path d="M91 380 L103 380 C106 384 112 388 118 390 L118 396 L91 396 Z" fill="#d3c8b3" />
          <path d="M110 386 C114 388 117 389 119 390 L119 396 L110 396 Z" fill="#141414" />
          <rect x="90" y="389" width="4.5" height="8" fill="#141414" />
        </motion.g>

        {/* skirt */}
        <path d="M80 203 L126 203 L132 292 L76 292 Z" fill="url(#tweed)" />
        <path d="M77 289 L131 289" stroke={IVORY} strokeWidth="1.3" strokeDasharray="2 2.5" />

        {/* front leg */}
        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ rotate: walking ? [-14, 14, -14] : -2 }}
          transition={walking ? loop(0.75) : { duration: 0.5 }}
        >
          <path d="M100 288 L112 288 L110 380 L103 380 Z" fill={INK} />
          <path d="M98 380 L110 380 C113 384 119 388 126 390 L126 396 L98 396 Z" fill={SABLE} />
          <path d="M117 386 C121 388 124 389 127 390 L127 396 L117 396 Z" fill={INK} />
          <rect x="97" y="389" width="4.5" height="8" fill={INK} />
        </motion.g>

        {/* jacket */}
        <path
          d="M94 101 L107 101 L108 108 C116 109 122 113 124 120 L127 205 L79 205 L81 120 C83 113 88 109 94 108 Z"
          fill="url(#tweed)"
        />
        <path d="M108 109 C119 112 124 124 125 204" stroke={IVORY} strokeWidth="1.3" strokeDasharray="2 2.5" fill="none" />
        <path d="M80 202 L126 202" stroke={IVORY} strokeWidth="1.3" strokeDasharray="2 2.5" />

        {/* ribbon and tailor's scissors */}
        <path d="M98 105 C97 130 100 150 103 170" stroke={IVORY} strokeWidth="0.8" fill="none" opacity="0.85" />
        <g stroke={GOLD} strokeWidth="1.3" fill="none" strokeLinecap="round" transform="translate(103 170) rotate(-6)">
          <ellipse cx="-3" cy="3" rx="2.4" ry="3.2" />
          <ellipse cx="3" cy="3" rx="2.4" ry="3.2" />
          <path d="M-1.5 6 L2.5 21 M1.5 6 L-2.5 21" />
        </g>

        {/* pearls */}
        {PEARLS.map((s, i) =>
          s.pts.map(([x, y], j) => <circle key={`${i}-${j}`} cx={x} cy={y} r={s.r} fill={IVORY} />),
        )}

        {/* camellia */}
        <g transform="translate(118 127)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} rx="3.6" ry="5" transform={`rotate(${a}) translate(0 -3)`} fill={IVORY} stroke={INK} strokeWidth="0.4" />
          ))}
          <circle r="1.4" fill={INK} />
        </g>

        {/* arm: shoulder → elbow → hand */}
        <motion.g style={{ originX: 0.5, originY: 0.02 }} animate={{ rotate: arm.upper }} transition={armT}>
          <path d="M97 110 C95 130 96 150 98 162 L110 162 C112 150 113 130 111 110 Z" fill={INK} />
          <motion.g style={{ originX: 0.5, originY: 0.04 }} animate={{ rotate: arm.fore }} transition={armT}>
            <path d="M98 158 L110 158 L110 201 L100 201 Z" fill={INK} />
            <path d="M99 193 L111 193" stroke={IVORY} strokeWidth="1.1" strokeDasharray="1.6 1.8" />
            <path d="M99 198 L111 198" stroke={GOLD} strokeWidth="2.4" />
            <ellipse cx="105" cy="208" rx="4.6" ry="8" fill={INK} />
          </motion.g>
        </motion.g>

        {/* head */}
        <motion.g
          style={{ originX: 0.45, originY: 1 }}
          animate={{ rotate: talking ? [0, -3, 1.5, -1.5, 0] : walking ? [0, 1, 0] : [0, -1, 0] }}
          transition={talking ? loop(1.3) : loop(walking ? 0.75 : 5)}
        >
          <path
            d="M76 56 L118 54 C120 58 121 61 121 64 C120 66 120 67 121 69 C123 72 126 75 128 78 C127 80 124 80 122 80 C123 82 123 83 122 84 C121 85 121 86 122 87 C122 89 121 90 119 91 C119 94 118 97 114 98 C110 99 107 100 106 103 L94 103 C92 99 88 97 82 93 C76 87 73 78 73 68 C73 62 74 58 76 56 Z"
            fill={INK}
          />
          <path d="M84 60 C88 72 90 84 96 94" stroke={IVORY} strokeWidth="0.6" fill="none" opacity="0.4" />
          <circle cx="103" cy="92" r="2.6" fill={IVORY} />
          {/* boater */}
          <path d="M78 34 C79 30 82 28 86 28 L124 26 C128 26 130 28 130 32 L131 50 L77 52 Z" fill={INK} />
          <path d="M77.5 45.5 L130.5 43.5" stroke={IVORY} strokeWidth="2" />
          <path d="M58 54 C80 47 130 43 152 46 C156 47 155 51 151 52 C128 54 84 58 64 59 C58 59 55 56 58 54 Z" fill={INK} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
