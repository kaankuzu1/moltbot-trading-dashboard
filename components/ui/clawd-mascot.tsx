/**
 * Clawd — Claude Code pixel art mascot with idle animations.
 * Uses merged SVG paths per color to eliminate all sub-pixel gaps.
 */

interface ClawdMascotProps {
  className?: string;
}

// Body: single merged path covering all body pixels
// Eyes: two 1×1 squares
// Mouth: horizontal bar
const BODY_PATH =
  // row 0 — ears
  "M2,0h2v1H2z M6,0h2v1H6z" +
  // row 1 — top head
  " M1,1h8v1H1z" +
  // row 2 — head
  " M0,2h10v1H0z" +
  // row 3 — face (full row, eyes overlaid)
  " M0,3h10v1H0z" +
  // row 4 — face
  " M0,4h10v1H0z" +
  // row 5 — face (full row, mouth overlaid)
  " M0,5h10v1H0z" +
  // row 6 — body
  " M0,6h10v1H0z" +
  // row 7 — bottom body
  " M0,7h10v1H0z" +
  // row 8 — legs
  " M2,8h2v1H2z M6,8h2v1H6z";

const EYE_LEFT = "M3,3h1v1H3z";
const EYE_RIGHT = "M6,3h1v1H6z";
const MOUTH_PATH = "M2,5h6v1H2z";

export function ClawdMascot({ className }: ClawdMascotProps) {
  return (
    <div className={`animate-clawd-float ${className ?? ""}`}>
      <svg
        viewBox="0 0 10 9"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="w-full h-full"
      >
        <path d={BODY_PATH} fill="#C47A5A" />
        <path d={MOUTH_PATH} fill="#8B5A3E" />
        <path
          d={EYE_LEFT}
          fill="#3D2317"
          className="animate-clawd-blink"
          style={{ transformOrigin: "3.5px 3.5px" }}
        />
        <path
          d={EYE_RIGHT}
          fill="#3D2317"
          className="animate-clawd-blink"
          style={{ transformOrigin: "6.5px 3.5px" }}
        />
      </svg>
    </div>
  );
}
