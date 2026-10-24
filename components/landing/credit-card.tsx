"use client";

import { useState, useCallback } from "react";
import { Wallet } from "@/lib/wallets";
import { CardTheme } from "@/lib/card-themes";
import { CardChip } from "@/components/ui/card-chip";
import { BitcoinLogo } from "@/components/ui/bitcoin-logo";
import { CardPattern } from "./card-pattern";

interface CreditCardProps {
  wallet: Wallet;
  theme: CardTheme;
  onClick: () => void;
}

export function CreditCard({ wallet, theme, onClick }: CreditCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [shining, setShining] = useState(false);

  const formattedPercentage = (wallet.percentage * 100)
    .toFixed(2)
    .replace(".", "");
  const cardNumber = `${formattedPercentage} **** **** ****`;

  const handleClick = useCallback(() => {
    if (isPressed) return;
    setIsPressed(true);
    setShining(true);

    setTimeout(() => {
      onClick();
    }, 400);

    setTimeout(() => {
      setIsPressed(false);
      setShining(false);
    }, 500);
  }, [isPressed, onClick]);

  return (
    <div
      onClick={handleClick}
      className={`relative h-[200px] w-full cursor-pointer overflow-hidden rounded-2xl p-4 text-white shadow-lg will-change-transform hover:-translate-y-1 hover:shadow-2xl sm:p-6 ${theme.shadowClass ?? ""}`}
      style={{
        background: theme.gradient,
        transform: isPressed ? "scale(0.95)" : undefined,
        transition:
          "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, translate 300ms ease",
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && isPressed) {
          setIsPressed(false);
        }
      }}
    >
      <CardPattern themeId={theme.id} />

      {/* Shine sweep overlay — 200% wide so gradient sweeps across */}
      {shining && (
        <div
          className="pointer-events-none absolute inset-y-0 z-20"
          style={{
            width: "200%",
            left: "-100%",
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
            animation: "card-shine 400ms ease-out forwards",
          }}
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Top section: Wallet name and Bitcoin logo */}
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold tracking-wide">
            {wallet.name}
          </h2>
          <BitcoinLogo className="text-white/90" />
        </div>

        {/* Middle section: Chip and card number */}
        <div className="space-y-2 sm:space-y-4">
          <CardChip />
          <p className="font-mono text-lg tracking-widest">{cardNumber}</p>
        </div>

        {/* Bottom section: Initial */}
        <div className="flex items-end justify-end">
          <span className="font-mono text-3xl leading-none font-bold opacity-80 sm:text-4xl">
            {wallet.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
