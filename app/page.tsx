"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import { useWalletTheme } from "@/lib/wallet-theme-context";
import { WALLETS } from "@/lib/wallets";
import { CreditCard } from "@/components/landing/credit-card";
import { BackgroundPattern } from "@/components/landing/background-pattern";
import { ClawdMascot } from "@/components/ui/clawd-mascot";

export default function Home() {
  const router = useRouter();
  const { setSelectedWallet } = useWallet();
  const { getTheme } = useWalletTheme();
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-geist-sans">
      <BackgroundPattern themeId={hoveredThemeId} />
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left section: Mascot + Text */}
        <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
          <ClawdMascot className="mb-4 w-16 md:w-24" />
          <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl md:text-6xl">
            MoltBot Trading Dashboard
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            Portfolyo analizine baslamak icin bir hesap secin.
          </p>
        </div>

        {/* Right section: Card list */}
        <div className="flex w-full max-w-[300px] flex-col gap-3 lg:shrink-0">
          {WALLETS.map((wallet) => {
            const theme = getTheme(wallet.id);
            return (
              <div
                key={wallet.id}
                onMouseEnter={() => setHoveredThemeId(theme.id)}
                onMouseLeave={() => setHoveredThemeId(null)}
              >
                <CreditCard
                  wallet={wallet}
                  theme={theme}
                  onClick={() => {
                    setSelectedWallet(wallet);
                    router.push("/statistics");
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
