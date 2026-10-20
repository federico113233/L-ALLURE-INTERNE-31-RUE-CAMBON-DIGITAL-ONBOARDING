// Mademoiselle, as a cut-paper silhouette: boater hat, bob, profile facing right,
// strands of pearls, a camellia, and the tailor's scissors on a ribbon.
// Drawn in a 400×500 box; the parent clips it to the octagon.

const INK = "#000000";
const IVORY = "#F5F2EB";
const GOLD = "#C5A059";

function strand(x0: number, x1: number, y: number, sag: number, n: number) {
  // Points along a quadratic curve hanging from (x0,y) to (x1,y)
  const cx = (x0 + x1) / 2;
  const cy = y + sag * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * y;
    pts.push([Math.round(x * 100) / 100, Math.round(yy * 100) / 100]);
  }
  return pts;
}

const STRANDS = [
  { pts: strand(176, 236, 300, 16, 14), r: 3.6 },
  { pts: strand(170, 244, 304, 34, 19), r: 3.9 },
  { pts: strand(164, 252, 308, 58, 25), r: 4.1 },
  { pts: strand(158, 258, 312, 88, 31), r: 4.3 },
];

export function Silhouette({ className }: { className?: string }) {
  return (
    <g className={className}>
      {/* Head, bob, neck and jacket — one continuous ink shape */}
      <path
        fill={INK}
        d="M130 158 L250 150
           C253 160 256 166 256 172
           C255 176 253 178 254 182
           C258 190 266 198 270 205
           C271 209 266 211 261 211
           C263 214 265 217 263 219
           C261 221 259 221 260 223
           C263 225 263 229 259 231
           C256 233 255 235 257 239
           C259 245 256 252 248 256
           C242 259 236 262 233 268
           C232 280 234 292 238 302
           C260 318 300 330 335 348
           C360 362 372 400 380 470
           L20 470
           C28 400 40 362 70 348
           C110 330 150 318 168 300
           C172 285 172 272 168 262
           C150 255 132 244 124 228
           C114 210 112 186 120 170
           C122 164 126 160 130 158 Z"
      />
      {/* Hair line under the brim — a single ivory stroke, like a cut in paper */}
      <path d="M140 170 C150 190 156 214 168 236" stroke={IVORY} strokeWidth="1.2" fill="none" opacity="0.55" />
      {/* Pearl earring */}
      <circle cx="214" cy="236" r="5" fill={IVORY} />
      <circle cx="212.6" cy="234.6" r="1.4" fill="#ffffff" opacity="0.9" />

      {/* Braided trim of the tweed jacket */}
      <path d="M238 304 C246 350 252 400 262 470" stroke={IVORY} strokeWidth="1.6" strokeDasharray="2 3" fill="none" />
      <path d="M168 302 C160 350 150 400 140 470" stroke={IVORY} strokeWidth="1.6" strokeDasharray="2 3" fill="none" />

      {/* The boater */}
      <path fill={INK} d="M118 152 L122 106 C123 100 128 97 135 96 L255 90 C262 90 266 94 266 100 L268 146 Z" />
      <path d="M121 132 L267 124" stroke={IVORY} strokeWidth="2.2" />
      <path
        fill={INK}
        d="M78 154 C120 140 262 128 314 133 C322 135 321 143 311 146 C252 152 130 162 86 163 C76 163 72 157 78 154 Z"
      />

      {/* Ribbon carrying the scissors */}
      <path d="M200 300 C199 330 203 350 206 372" stroke={IVORY} strokeWidth="1.1" fill="none" opacity="0.85" />

      {/* Pearls */}
      {STRANDS.map((s, i) =>
        s.pts.map(([x, y], j) => (
          <g key={`${i}-${j}`}>
            <circle cx={x} cy={y} r={s.r} fill={IVORY} />
            <circle cx={x - s.r * 0.32} cy={y - s.r * 0.32} r={s.r * 0.28} fill="#ffffff" opacity="0.9" />
          </g>
        )),
      )}

      {/* Camellia on the lapel */}
      <g transform="translate(300 382)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} rx="9" ry="13" transform={`rotate(${a}) translate(0 -7)`} fill={IVORY} stroke={INK} strokeWidth="0.8" />
        ))}
        {[36, 108, 180, 252, 324].map((a) => (
          <ellipse key={a} rx="6" ry="8" transform={`rotate(${a}) translate(0 -4)`} fill={IVORY} stroke={INK} strokeWidth="0.8" />
        ))}
        <circle r="3.2" fill={INK} />
      </g>

      {/* Tailor's scissors, in gold */}
      <g stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(206 372) rotate(-8)">
        <ellipse cx="-7" cy="8" rx="5.5" ry="7.5" />
        <ellipse cx="7" cy="8" rx="5.5" ry="7.5" />
        <path d="M-4 15 L5 52" />
        <path d="M4 15 L-5 52" />
        <circle cx="0" cy="27" r="1.6" fill={GOLD} />
      </g>
    </g>
  );
}
