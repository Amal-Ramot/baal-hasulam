const SEFIROT = ['כתר', 'חכמה', 'בינה', 'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'];

export function LadderMark() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M4 25 8 1M18 25 14 1M5 19h12M6 13h10M7 7h8" />
    </svg>
  );
}

// deterministic star field: [x, y, radius]
const STARS: [number, number, number][] = [
  [28, 40, 1.1], [62, 96, 0.8], [96, 22, 1.3], [44, 168, 0.9], [118, 132, 0.7], [18, 236, 1], [86, 214, 0.7], [132, 60, 0.9],
  [246, 30, 1], [282, 84, 1.3], [318, 44, 0.8], [338, 142, 1.1], [262, 152, 0.7], [300, 216, 0.9], [234, 100, 0.7], [344, 262, 0.8],
  [58, 300, 0.8], [312, 318, 0.7], [20, 352, 0.7], [156, 12, 0.8], [206, 8, 0.9], [334, 8, 0.7], [10, 110, 0.8], [274, 264, 0.6],
];

/**
 * Jacob's ladder (Genesis 28:12): set upon the earth, its top reaching into heaven,
 * with lights ascending and descending on it. The ten rungs carry the ten sefirot.
 */
export default function Ladder() {
  const top = 34; // where the ladder dissolves into the light
  const ground = 612;
  const t = (y: number) => (y - top) / (ground - top);
  const xl = (y: number) => 168 - t(y) * 96;
  const xr = (y: number) => 192 + t(y) * 96;
  // rungs draw closer together toward the sky, as the ladder recedes upward
  const ys = SEFIROT.map((_, i) => 96 + (ground - 40 - 96) * Math.pow(i / 9, 1.25));
  const up = `${ground - 30};${top + 10}`;
  const down = `${top + 10};${ground - 30}`;
  return (
    <svg className="ladder" viewBox="0 0 360 680" role="img" aria-label="סולם יעקב: מוצב ארצה וראשו מגיע השמימה, ומלאכים עולים ויורדים בו">
      <defs>
        <radialGradient id="heaven">
          <stop offset="0" stopColor="var(--gold-2)" stopOpacity="0.95" />
          <stop offset="0.18" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rail" gradientUnits="userSpaceOnUse" x1="0" y1={ground} x2="0" y2={top}>
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.95" />
          <stop offset="0.75" stopColor="var(--gold)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--gold-2)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="earth" gradientUnits="userSpaceOnUse" cx="180" cy="596" r="215" gradientTransform="translate(0 596) scale(1 0.42) translate(0 -596)">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="horizon" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="390" y2="0">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--gold)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* heaven */}
      {STARS.map(([x, y, r], i) => (
        <circle key={i} className="star" cx={x} cy={y} r={r} style={{ ['--d' as string]: (i * 0.37) % 4 }} />
      ))}
      {[-64, -40, -18, 18, 40, 64].map((a) => (
        <line key={a} className="ray" x1="180" y1="40" x2={180 + Math.sin((a * Math.PI) / 180) * 250} y2={40 + Math.cos((a * Math.PI) / 180) * 250} />
      ))}
      <circle className="heaven" cx="180" cy="40" r="150" />

      {/* earth */}
      <path className="earth" d="M-30 680 L-30 640 Q180 584 390 640 L390 680 Z" />
      <path className="horizon" d="M-30 640 Q180 584 390 640" />
      <path className="stone" d="M94 625 q3 -11 15 -12 q15 -1 19 8 q2 5 -3 5 h-28 q-4 0 -3 -1 z" />

      {/* the ladder */}
      <line className="rail" x1={xl(ground)} y1={ground} x2={xl(top)} y2={top} />
      <line className="rail" x1={xr(ground)} y1={ground} x2={xr(top)} y2={top} />
      {ys.map((y, i) => (
        <g key={i} style={{ ['--k' as string]: i, ['--o' as string]: 0.3 + t(y) * 0.6 }}>
          <line className="rung" x1={xl(y)} y1={y} x2={xr(y)} y2={y} />
          <text x={xl(y) - 12} y={y + 5} textAnchor="start">
            {SEFIROT[i]}
          </text>
        </g>
      ))}

      {/* ascending and descending */}
      {[
        { x: 171, v: up, begin: '1.5s', dur: '9s' },
        { x: 189, v: down, begin: '3s', dur: '9s' },
        { x: 171, v: up, begin: '6s', dur: '9s' },
        { x: 189, v: down, begin: '7.5s', dur: '9s' },
      ].map((a, i) => (
        <circle key={i} className="angel" r="3.2" cx={a.x} opacity="0">
          <animate attributeName="cy" values={a.v} dur={a.dur} begin={a.begin} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur={a.dur} begin={a.begin} repeatCount="indefinite" />
          <animate attributeName="r" values={a.v === up ? '3.6;1.6' : '1.6;3.6'} dur={a.dur} begin={a.begin} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
