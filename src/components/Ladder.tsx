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
  [40, 420, 0.6], [330, 410, 0.7], [16, 500, 0.6], [346, 496, 0.6],
];
const CLOUDS: [number, number, number, number, number][] = [
  // x, y, rx, ry, opacity
  [70, 78, 78, 15, 0.1], [292, 66, 84, 14, 0.1], [40, 132, 60, 11, 0.07], [322, 138, 66, 12, 0.07], [120, 44, 44, 8, 0.08], [248, 108, 40, 8, 0.06],
];

/**
 * Jacob's ladder (Genesis 28:12): a wooden ladder set upon the earth, its top lost in the light
 * of heaven, with winged lights ascending and descending. The ten rungs carry the ten sefirot.
 */
export default function Ladder() {
  const top = 34;
  const ground = 612;
  const t = (y: number) => (y - top) / (ground - top);
  const xl = (y: number) => 168 - t(y) * 96;
  const xr = (y: number) => 192 + t(y) * 96;
  const w = (y: number) => 0.5 + t(y) * 3.6; // half-thickness of a rail: thins with distance
  const ys = SEFIROT.map((_, i) => 96 + (ground - 40 - 96) * Math.pow(i / 9, 1.25));
  const rail = (x: (y: number) => number) =>
    `${x(top) - w(top)},${top} ${x(top) + w(top)},${top} ${x(ground) + w(ground)},${ground + 4} ${x(ground) - w(ground)},${ground + 4}`;
  const angels = [
    { path: 'M165 588 L177 52', up: true, begin: '1s' },
    { path: 'M183 52 L195 588', up: false, begin: '3.5s' },
    { path: 'M165 588 L177 52', up: true, begin: '6s' },
    { path: 'M183 52 L195 588', up: false, begin: '8.5s' },
  ];
  return (
    <svg className="ladder" viewBox="0 0 360 680" role="img" aria-label="סולם יעקב: מוצב ארצה וראשו מגיע השמימה, ומלאכים עולים ויורדים בו">
      <defs>
        <radialGradient id="heaven">
          <stop offset="0" stopColor="#fffbe9" stopOpacity="1" />
          <stop offset="0.12" stopColor="var(--gold-2)" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="var(--gold)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="630">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.34" />
          <stop offset="0.6" stopColor="var(--gold)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="rail" gradientUnits="userSpaceOnUse" x1="0" y1={ground} x2="0" y2={top}>
          <stop offset="0" stopColor="#8a5f26" />
          <stop offset="0.35" stopColor="#c9984a" />
          <stop offset="0.8" stopColor="#f0d28c" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fffbe9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rung" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8e3ab" />
          <stop offset="0.45" stopColor="#cf9f52" />
          <stop offset="1" stopColor="#7a5220" />
        </linearGradient>
        <radialGradient id="orb">
          <stop offset="0" stopColor="#fffbe9" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="var(--gold-2)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pool" gradientUnits="userSpaceOnUse" cx="180" cy="612" r="170" gradientTransform="translate(0 612) scale(1 0.2) translate(0 -612)">
          <stop offset="0" stopColor="var(--gold-2)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="horizon" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="390" y2="0">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--gold)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="fadeY" gradientUnits="userSpaceOnUse" cx="180" cy="600" r="215" gradientTransform="translate(0 600) scale(1 0.42) translate(0 -600)">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="ground-fade" maskUnits="userSpaceOnUse" x="-40" y="560" width="440" height="130">
          <rect x="-40" y="560" width="440" height="130" fill="url(#fadeY)" />
        </mask>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="glow" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* heaven: stars, parting clouds, the light and its beam */}
      {STARS.map(([x, y, r], i) => (
        <circle key={i} className="star" cx={x} cy={y} r={r} style={{ ['--d' as string]: (i * 0.37) % 4 }} />
      ))}
      <polygon className="beam" points="170,40 190,40 318,632 42,632" filter="url(#soft)" />
      <circle className="heaven" cx="180" cy="40" r="165" />
      <g filter="url(#soft)">
        {CLOUDS.map(([x, y, rx, ry, o], i) => (
          <ellipse key={i} className="cloud" cx={x} cy={y} rx={rx} ry={ry} opacity={o} style={{ animationDelay: `${-i * 4}s` }} />
        ))}
      </g>

      {/* earth: far and near hills, light pooling where the ladder stands */}
      <g mask="url(#ground-fade)">
        <path className="hill-far" d="M-40 630 Q40 584 120 606 T270 596 Q340 584 400 618 L400 690 L-40 690 Z" />
        <path className="hill-near" d="M-40 650 Q180 588 400 650 L400 690 L-40 690 Z" />
        <path className="horizon" d="M-40 650 Q180 588 400 650" />
      </g>
      <ellipse className="pool" cx="180" cy="616" rx="170" ry="34" />
      <path className="stone" d="M92 628 q3 -12 16 -13 q16 -1 20 9 q2 5 -3 5 h-30 q-4 0 -3 -1 z" />

      {/* the ladder */}
      <g className="wood" filter="url(#glow)">
        {ys.map((y, i) => {
          const h = 1.4 + t(y) * 4.4;
          return (
            <g key={i}>
              <rect className="rung-shadow" x={xl(y)} y={y + h * 0.7} width={xr(y) - xl(y)} height={h * 0.7} rx={h * 0.35} />
              <rect className="rung" x={xl(y)} y={y - h / 2} width={xr(y) - xl(y)} height={h} rx={h / 2} />
            </g>
          );
        })}
        <polygon className="rail" points={rail(xl)} />
        <polygon className="rail" points={rail(xr)} />
        <line className="sheen" x1={xl(ground) + 1.6} y1={ground} x2={xl(180) + 0.6} y2={180} />
        <line className="sheen" x1={xr(ground) - 2.6} y1={ground} x2={xr(180) - 0.9} y2={180} />
      </g>
      {ys.map((y, i) => (
        <text key={i} x={xl(y) - 13} y={y + 4.5} textAnchor="start" style={{ ['--k' as string]: i }}>
          {SEFIROT[i]}
        </text>
      ))}

      {/* angels ascending and descending */}
      {angels.map((a, i) => (
        <g key={i} opacity="0">
          <animateMotion path={a.path} dur="10s" begin={a.begin} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values={a.up ? '1;0.3' : '0.3;1'} dur="10s" begin={a.begin} repeatCount="indefinite" additive="sum" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur="10s" begin={a.begin} repeatCount="indefinite" />
          <circle className="orb" r="15" />
          <path className="wing" d="M-2 0 Q-12 -13 -19 -3 Q-11 -4 -3 4 Z" />
          <path className="wing" d="M2 0 Q12 -13 19 -3 Q11 -4 3 4 Z" />
          <circle className="core" r="2.8" />
        </g>
      ))}
    </svg>
  );
}
