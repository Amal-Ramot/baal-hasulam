const SEFIROT = ['כתר', 'חכמה', 'בינה', 'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'];

export function LadderMark() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M4 25 8 1M18 25 14 1M5 19h12M6 13h10M7 7h8" />
    </svg>
  );
}

/** The ladder of ten sefirot: light descends (direct light) and returns (reflected light). */
export default function Ladder() {
  const top = 40;
  const bottom = 610;
  const xl = (y: number) => 150 - ((y - top) / (bottom - top)) * 95;
  const xr = (y: number) => 210 + ((y - top) / (bottom - top)) * 95;
  const ys = SEFIROT.map((_, i) => top + 30 + (i * (bottom - top - 50)) / 9);
  return (
    <svg className="ladder" viewBox="0 0 360 640" role="img" aria-label="סולם עשר הספירות — מכתר ועד מלכות">
      <defs>
        <radialGradient id="halo">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="halo" cx="180" cy="34" r="120" />
      <line className="rail" x1={xl(top)} y1={top} x2={xl(bottom)} y2={bottom} />
      <line className="rail" x1={xr(top)} y1={top} x2={xr(bottom)} y2={bottom} />
      {ys.map((y, i) => (
        <g key={i} style={{ ['--k' as string]: i }}>
          <line className="rung" x1={xl(y)} y1={y} x2={xr(y)} y2={y} />
          <circle className="node" cx="180" cy={y} r="2.5" />
          <text x={xl(y) - 14} y={y + 5} textAnchor="start">
            {SEFIROT[i]}
          </text>
        </g>
      ))}
      <circle className="spark" r="3.5" cx="180">
        <animate attributeName="cy" values={`${ys[0]};${ys[9]};${ys[0]}`} keyTimes="0;0.46;1" dur="7s" begin="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
        <animate attributeName="opacity" values="0;1;1;0.5;0" keyTimes="0;0.05;0.46;0.9;1" dur="7s" begin="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
