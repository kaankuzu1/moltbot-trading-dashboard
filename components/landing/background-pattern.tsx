"use client";

interface BackgroundPatternProps {
  themeId: string | null;
}

export function BackgroundPattern({ themeId }: BackgroundPatternProps) {
  const isActive = !!themeId;

  return (
    <>
      {/* Dot grid background — fades out when pattern is active */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #c8c0b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: isActive ? 0 : 1,
          transition: "opacity 600ms ease",
        }}
      />

      {/* Pattern overlay — fades in when hovering a card */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          opacity: isActive ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      >
        {themeId && (
          <div
            key={themeId}
            className="absolute"
            style={{
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              animation: "bg-pattern-drift 20s linear infinite",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>{renderBgPattern(themeId)}</defs>
              <rect width="100%" height="100%" fill={`url(#bg-${themeId})`} />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}

const COLOR = "#c8c0b8";
const OP = "0.45";

function renderBgPattern(themeId: string) {
  switch (themeId) {
    case "gece":
      return (
        <pattern id="bg-gece" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="12" y2="12" stroke={COLOR} strokeWidth="0.5" opacity={OP} />
          <line x1="12" y1="0" x2="0" y2="12" stroke={COLOR} strokeWidth="0.5" opacity={OP} />
        </pattern>
      );
    case "okyanus":
      return (
        <pattern id="bg-okyanus" width="120" height="40" patternUnits="userSpaceOnUse">
          <path d="M0,20 C30,8 60,32 90,20 C105,14 115,14 120,20" stroke={COLOR} strokeWidth="0.7" fill="none" opacity={OP} />
          <path d="M0,40 C30,28 60,52 90,40 C105,34 115,34 120,40" stroke={COLOR} strokeWidth="0.7" fill="none" opacity={OP} />
        </pattern>
      );
    case "karbon":
      return (
        <pattern id="bg-karbon" width="28" height="48.5" patternUnits="userSpaceOnUse">
          <path d="M14,0 L28,8 L28,24 L14,32 L0,24 L0,8 Z" stroke={COLOR} strokeWidth="0.5" fill="none" opacity={OP} />
          <path d="M14,32 L28,40 L28,56 L14,64 L0,56 L0,40 Z" stroke={COLOR} strokeWidth="0.5" fill="none" opacity={OP} />
        </pattern>
      );
    case "safir":
      return (
        <pattern id="bg-safir" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="60" cy="60" r="15" stroke={COLOR} strokeWidth="0.6" fill="none" opacity="0.35" />
          <circle cx="60" cy="60" r="30" stroke={COLOR} strokeWidth="0.6" fill="none" opacity="0.35" />
          <circle cx="60" cy="60" r="45" stroke={COLOR} strokeWidth="0.6" fill="none" opacity="0.35" />
          <circle cx="60" cy="60" r="58" stroke={COLOR} strokeWidth="0.6" fill="none" opacity="0.3" />
        </pattern>
      );
    case "bakir":
      return (
        <pattern id="bg-bakir" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke={COLOR} strokeWidth="0.4" opacity="0.5" />
        </pattern>
      );
    case "prizma":
      return (
        <pattern id="bg-prizma" width="24" height="24" patternUnits="userSpaceOnUse">
          <polyline points="0,18 12,6 24,18" stroke={COLOR} strokeWidth="0.6" fill="none" opacity={OP} />
          <polyline points="0,24 12,12 24,24" stroke={COLOR} strokeWidth="0.6" fill="none" opacity={OP} />
        </pattern>
      );
    case "zirveler":
      return (
        <pattern id="bg-zirveler" width="100" height="80" patternUnits="userSpaceOnUse">
          <path d="M50,15 C65,12 80,20 82,35 C84,50 70,60 55,62 C40,64 22,55 20,40 C18,25 35,18 50,15Z" stroke={COLOR} strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M50,25 C60,22 72,28 73,38 C74,48 64,54 54,55 C44,56 32,50 31,40 C30,30 40,28 50,25Z" stroke={COLOR} strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M50,33 C56,31 64,35 64,40 C64,45 58,49 52,49 C46,49 38,46 38,40 C38,34 44,35 50,33Z" stroke={COLOR} strokeWidth="0.5" fill="none" opacity="0.4" />
        </pattern>
      );
    case "elmas":
      return (
        <pattern id="bg-elmas" width="60" height="60" patternUnits="userSpaceOnUse">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const rad = (angle * Math.PI) / 180;
            const cx = 30;
            const cy = 30;
            const len = 30;
            const x2 = cx + Math.cos(rad) * len;
            const y2 = cy + Math.sin(rad) * len;
            return (
              <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={COLOR} strokeWidth="0.4" opacity="0.4" />
            );
          })}
        </pattern>
      );
    default:
      return null;
  }
}
