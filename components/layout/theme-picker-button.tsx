"use client";

import { useWallet } from "@/lib/wallet-context";
import { useWalletTheme } from "@/lib/wallet-theme-context";
import { CARD_THEMES } from "@/lib/card-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette } from "lucide-react";

export function ThemePickerButton() {
  const { selectedWallet } = useWallet();
  const { getTheme, setTheme } = useWalletTheme();

  const walletId = selectedWallet?.id ?? 0;
  const currentTheme = getTheme(walletId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-accent"
          title="Kart Tasarimi"
        >
          <Palette className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">Kart Tasarimi</p>
          <div className="grid grid-cols-4 gap-2">
            {CARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(walletId, theme.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: theme.gradient,
                  borderColor:
                    currentTheme.id === theme.id
                      ? "var(--foreground)"
                      : "transparent",
                }}
                title={theme.name}
              >
                <MiniPattern themeId={theme.id} />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MiniPattern({ themeId }: { themeId: string }) {
  return (
    <svg
      className="h-full w-full rounded-full"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>{renderMiniPatternDef(themeId)}</defs>
      {themeId === "safir" ? (
        <circle
          cx="0"
          cy="32"
          r="20"
          stroke="white"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
      ) : themeId === "elmas" ? (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const rad = (angle * Math.PI) / 180;
            const cx = 16;
            const cy = 16;
            const len = 20;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(rad) * len}
                y2={cy + Math.sin(rad) * len}
                stroke="white"
                strokeWidth="0.4"
                opacity="0.25"
              />
            );
          })}
        </g>
      ) : (
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#mini-${themeId})`}
        />
      )}
    </svg>
  );
}

function renderMiniPatternDef(themeId: string) {
  // Simplified versions of patterns for the small preview circles
  switch (themeId) {
    case "gece":
      return (
        <pattern
          id="mini-gece"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="6" y2="6" stroke="white" strokeWidth="0.5" opacity="0.25" />
          <line x1="6" y1="0" x2="0" y2="6" stroke="white" strokeWidth="0.5" opacity="0.25" />
        </pattern>
      );
    case "okyanus":
      return (
        <pattern
          id="mini-okyanus"
          width="20"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0,5 C5,2 10,8 15,5 C17,4 19,4 20,5" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3" />
        </pattern>
      );
    case "karbon":
      return (
        <pattern
          id="mini-karbon"
          width="10"
          height="17"
          patternUnits="userSpaceOnUse"
        >
          <path d="M5,0 L10,3 L10,9 L5,12 L0,9 L0,3 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
        </pattern>
      );
    case "bakir":
      return (
        <pattern
          id="mini-bakir"
          width="4"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="1.5" x2="4" y2="1.5" stroke="white" strokeWidth="0.4" opacity="0.3" />
        </pattern>
      );
    case "prizma":
      return (
        <pattern
          id="mini-prizma"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <polyline points="0,8 5,2 10,8" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
        </pattern>
      );
    case "zirveler":
      return (
        <pattern
          id="mini-zirveler"
          width="20"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <ellipse cx="10" cy="8" rx="7" ry="5" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
          <ellipse cx="10" cy="8" rx="3" ry="2" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
        </pattern>
      );
    default:
      return null;
  }
}
