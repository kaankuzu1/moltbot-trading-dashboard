"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { useWalletTheme } from "@/lib/wallet-theme-context";
import { CARD_THEMES } from "@/lib/card-themes";
import { CardPattern } from "@/components/landing/card-pattern";
import { CardChip } from "@/components/ui/card-chip";
import { BitcoinLogo } from "@/components/ui/bitcoin-logo";
import { usePortfolio } from "@/lib/hooks/use-binance";
import { formatCurrency } from "@/lib/format";

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
  switch (themeId) {
    case "gece":
      return (
        <pattern id="mini-gece" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="6" y2="6" stroke="white" strokeWidth="0.5" opacity="0.25" />
          <line x1="6" y1="0" x2="0" y2="6" stroke="white" strokeWidth="0.5" opacity="0.25" />
        </pattern>
      );
    case "okyanus":
      return (
        <pattern id="mini-okyanus" width="20" height="10" patternUnits="userSpaceOnUse">
          <path d="M0,5 C5,2 10,8 15,5 C17,4 19,4 20,5" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3" />
        </pattern>
      );
    case "karbon":
      return (
        <pattern id="mini-karbon" width="10" height="17" patternUnits="userSpaceOnUse">
          <path d="M5,0 L10,3 L10,9 L5,12 L0,9 L0,3 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
        </pattern>
      );
    case "bakir":
      return (
        <pattern id="mini-bakir" width="4" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1.5" x2="4" y2="1.5" stroke="white" strokeWidth="0.4" opacity="0.3" />
        </pattern>
      );
    case "prizma":
      return (
        <pattern id="mini-prizma" width="10" height="10" patternUnits="userSpaceOnUse">
          <polyline points="0,8 5,2 10,8" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
        </pattern>
      );
    case "zirveler":
      return (
        <pattern id="mini-zirveler" width="20" height="16" patternUnits="userSpaceOnUse">
          <ellipse cx="10" cy="8" rx="7" ry="5" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
          <ellipse cx="10" cy="8" rx="3" ry="2" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
        </pattern>
      );
    default:
      return null;
  }
}

export function SidebarWalletCard() {
  const { selectedWallet, applyWallet } = useWallet();
  const { getTheme, setTheme } = useWalletTheme();
  const { data: portfolio } = usePortfolio();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const walletId = selectedWallet?.id ?? 0;
  const wallet = selectedWallet;
  const currentTheme = getTheme(walletId);

  const balance = portfolio?.summary?.totalValue
    ? applyWallet(portfolio.summary.totalValue)
    : null;

  // Close picker on click outside
  useEffect(() => {
    if (!isPickerOpen) return;
    function handleClickOutside(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isPickerOpen]);

  if (!wallet) return null;

  return (
    <div ref={containerRef} className="relative px-3 pb-3">
      {/* Theme picker panel */}
      <div
        className={`mb-2 overflow-hidden rounded-xl border bg-popover p-3 shadow-md transition-all duration-300 ease-out ${
          isPickerOpen
            ? "max-h-44 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 translate-y-2 pointer-events-none border-transparent p-0 mb-0 shadow-none"
        }`}
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">Kart Tasarimi</p>
        <div className="grid grid-cols-4 gap-2">
          {CARD_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(walletId, theme.id)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8"
              style={{
                background: theme.gradient,
                borderColor:
                  currentTheme.id === theme.id
                    ? "white"
                    : "transparent",
              }}
              title={theme.name}
            >
              <MiniPattern themeId={theme.id} />
              {currentTheme.id === theme.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Wallet card */}
      <button
        onClick={() => setIsPickerOpen((prev) => !prev)}
        className={`group relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-3 sm:p-4 text-left text-white transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-xl ${currentTheme.shadowClass ?? ""}`}
        style={{ background: currentTheme.gradient }}
      >
        <CardPattern themeId={currentTheme.id} />
        <div className="relative z-10 flex h-full flex-col justify-between">
          {/* Top: name + bitcoin logo */}
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold tracking-wide">{wallet.name}</span>
            <BitcoinLogo className="h-5 w-5 text-white/80" />
          </div>

          {/* Bottom: chip+balance (left) + initial (right) */}
          <div className="absolute bottom-5 left-3 right-3 z-10 flex items-end justify-between sm:static">
            <div className="space-y-1 sm:space-y-2">
              <div className="h-5 w-7 sm:h-6 sm:w-8 [&>svg]:h-full [&>svg]:w-full"><CardChip /></div>
              <p className="font-mono text-sm font-semibold tracking-wide sm:text-base">
                {balance !== null ? formatCurrency(balance) : "···"}
              </p>
            </div>
            <span className="font-mono text-2xl leading-none font-bold opacity-60 transition-transform duration-300 group-hover:scale-110 sm:text-3xl -mb-0.5 sm:mb-0">
              {wallet.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
