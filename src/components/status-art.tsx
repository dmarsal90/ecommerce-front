/* Decorative SVGs for the status pages. Colours come from the theme tokens; motion lives in globals.css. */

const frame = 'art overflow-visible mx-auto h-44 w-60 md:h-52 md:w-72';
const common = { viewBox: '0 0 240 180', fill: 'none', 'aria-hidden': true, className: frame } as const;

/** 404: a magnifying glass sweeping an empty sheet and never finding anything. */
export function SearchArt() {
  return (
    <svg {...common}>
      <rect
        x="55"
        y="18"
        width="130"
        height="144"
        rx="14"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <g stroke="var(--border)" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12">
        <line className="art-line" x1="78" y1="52" x2="162" y2="52" />
        <line className="art-line" x1="78" y1="82" x2="162" y2="82" />
        <line className="art-line" x1="78" y1="112" x2="140" y2="112" />
      </g>
      <g className="art-search">
        <line
          x1="124"
          y1="106"
          x2="150"
          y2="132"
          stroke="var(--foreground)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle
          cx="105"
          cy="87"
          r="30"
          fill="var(--surface)"
          fillOpacity="0.75"
          stroke="var(--accent)"
          strokeWidth="7"
        />
        <text
          className="art-qmark"
          x="105"
          y="99"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fill="var(--accent)"
          fontFamily="var(--font-heading), system-ui, sans-serif"
        >
          ?
        </text>
      </g>
    </svg>
  );
}

/** 500: a snapped cable with frayed ends and sparks jumping across the gap. */
export function BrokenCableArt() {
  const wire = { stroke: 'var(--foreground)', strokeWidth: 9, strokeLinecap: 'round' } as const;
  const strand = { stroke: 'var(--muted)', strokeWidth: 3, strokeLinecap: 'round' } as const;
  const bolt = 'M0 -14 L-7 1 L-1 1 L-5 14 L8 -3 L1 -3 Z';

  return (
    <svg {...common}>
      <g className="art-cable-left">
        <path d="M-4 128 C 30 128, 40 86, 84 90 L 98 90" {...wire} />
        <path
          d="M-4 128 C 30 128, 40 86, 84 90 L 98 90"
          stroke="var(--surface)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path d="M98 90 l10 -9 M98 90 l12 1 M98 90 l9 10" {...strand} />
      </g>
      <g className="art-cable-right">
        <path d="M244 128 C 210 128, 200 94, 156 90 L 142 90" {...wire} />
        <path
          d="M244 128 C 210 128, 200 94, 156 90 L 142 90"
          stroke="var(--surface)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path d="M142 90 l-10 -9 M142 90 l-12 1 M142 90 l-9 10" {...strand} />
      </g>
      <path className="art-spark" d={bolt} transform="translate(120 84)" fill="var(--sale)" />
      <path className="art-spark-alt" d={bolt} transform="translate(120 58) scale(0.6)" fill="var(--sale)" />
      <g className="art-spark-alt" stroke="var(--sale)" strokeWidth="3" strokeLinecap="round">
        <line x1="112" y1="112" x2="107" y2="122" />
        <line x1="128" y1="112" x2="134" y2="121" />
      </g>
    </svg>
  );
}

/** 403: a shield with a padlock; a scanner sweeps it and the whole shield shakes "no". */
export function ShieldArt() {
  const outline = 'M120 14 L192 40 V92 C192 130 162 154 120 170 C78 154 48 130 48 92 V40 Z';

  return (
    <svg {...common}>
      <defs>
        <clipPath id="shield-clip">
          <path d={outline} />
        </clipPath>
      </defs>
      <path className="art-ring" d={outline} stroke="var(--accent)" strokeWidth="3" />
      <g className="art-shield">
        <path
          d={outline}
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <g clipPath="url(#shield-clip)">
          <rect
            className="art-scan"
            x="40"
            y="92"
            width="160"
            height="14"
            fill="var(--accent)"
            opacity="0.18"
          />
        </g>
        <path
          className="art-shackle"
          d="M104 84 V72 a16 16 0 0 1 32 0 V84"
          stroke="var(--foreground)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="96" y="82" width="48" height="40" rx="9" fill="var(--accent)" />
        <circle cx="120" cy="99" r="5" fill="var(--accent-foreground)" />
        <rect x="117.5" y="101" width="5" height="11" rx="2.5" fill="var(--accent-foreground)" />
      </g>
    </svg>
  );
}
