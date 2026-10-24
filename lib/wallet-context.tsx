"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { WALLETS, type Wallet } from "@/lib/wallets";

interface WalletContextType {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  setSelectedWallet: (wallet: Wallet | null) => void;
  applyWallet: (value: number) => number;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  wallets: [],
  selectedWallet: null,
  setSelectedWallet: () => {},
  applyWallet: (v) => v,
  isLoading: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedWalletId, setSelectedWalletId] = useState<number>(0);

  const selectedWallet = useMemo(
    () => WALLETS.find((w) => w.id === selectedWalletId) ?? WALLETS[0],
    [selectedWalletId]
  );

  function setSelectedWallet(wallet: Wallet | null) {
    setSelectedWalletId(wallet?.id ?? 0);
  }

  function applyWallet(value: number): number {
    if (!selectedWallet || selectedWallet.id === 0) return value;
    return value * selectedWallet.percentage;
  }

  return (
    <WalletContext.Provider
      value={{ wallets: WALLETS, selectedWallet, setSelectedWallet, applyWallet, isLoading: false }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
