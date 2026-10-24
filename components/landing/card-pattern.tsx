interface CardPatternProps {
  themeId: string;
}

export function CardPattern({ themeId }: CardPatternProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>{renderPatternDef(themeId)}</defs>
      {themeId === "safir" ? (
        renderSafirOverlay()
      ) : themeId === "elmas" ? (
        renderElmasOverlay()
      ) : (
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#pattern-${themeId})`}
        />
      )}
    </svg>
  );
}

function renderPatternDef(themeId: string) {
  switch (themeId) {
    case "gece":
      return (
        <pattern
          id="pattern-gece"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.20"
          />
          <line
            x1="12"
            y1="0"
            x2="0"
            y2="12"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.20"
          />
        </pattern>
      );

    case "okyanus":
      return (
        <pattern
          id="pattern-okyanus"
          width="120"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0,20 C30,8 60,32 90,20 C105,14 115,14 120,20"
            stroke="currentColor"
            strokeWidth="0.7"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M0,40 C30,28 60,52 90,40 C105,34 115,34 120,40"
            stroke="currentColor"
            strokeWidth="0.7"
            fill="none"
            opacity="0.20"
          />
        </pattern>
      );

    case "karbon":
      return (
        <pattern
          id="pattern-karbon"
          width="28"
          height="48.5"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M14,0 L28,8 L28,24 L14,32 L0,24 L0,8 Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M14,32 L28,40 L28,56 L14,64 L0,56 L0,40 Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity="0.20"
          />
        </pattern>
      );

    case "bakir":
      return (
        <pattern
          id="pattern-bakir"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="2"
            x2="4"
            y2="2"
            stroke="currentColor"
            strokeWidth="0.3"
            opacity="0.20"
          />
        </pattern>
      );

    case "prizma":
      return (
        <pattern
          id="pattern-prizma"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <polyline
            points="0,18 12,6 24,18"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="none"
            opacity="0.20"
          />
          <polyline
            points="0,24 12,12 24,24"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="none"
            opacity="0.20"
          />
        </pattern>
      );

    case "zirveler":
      return (
        <pattern
          id="pattern-zirveler"
          width="100"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M50,15 C65,12 80,20 82,35 C84,50 70,60 55,62 C40,64 22,55 20,40 C18,25 35,18 50,15Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M50,25 C60,22 72,28 73,38 C74,48 64,54 54,55 C44,56 32,50 31,40 C30,30 40,28 50,25Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M50,33 C56,31 64,35 64,40 C64,45 58,49 52,49 C46,49 38,46 38,40 C38,34 44,35 50,33Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity="0.20"
          />
        </pattern>
      );

    // safir & elmas use non-tiling overlays, no pattern def needed
    default:
      return null;
  }
}

function renderSafirOverlay() {
  return (
    <g>
      <circle
        cx="0"
        cy="220"
        r="60"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.20"
      />
      <circle
        cx="0"
        cy="220"
        r="120"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.20"
      />
      <circle
        cx="0"
        cy="220"
        r="180"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.20"
      />
      <circle
        cx="0"
        cy="220"
        r="240"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.20"
      />
      <circle
        cx="0"
        cy="220"
        r="300"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.20"
      />
    </g>
  );
}

function renderElmasOverlay() {
  // Amex-style: radial sunburst lines from center + horizontal stripe
  return (
    <g>
      {/* Sunburst lines from center */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = i * 10;
        const rad = (angle * Math.PI) / 180;
        const cx = 192;
        const cy = 110;
        const len = 300;
        const x2 = cx + Math.cos(rad) * len;
        const y2 = cy + Math.sin(rad) * len;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.20"
          />
        );
      })}
    </g>
  );
}
