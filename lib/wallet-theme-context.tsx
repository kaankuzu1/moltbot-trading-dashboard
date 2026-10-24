"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_WALLET_THEMES,
  getThemeById,
  loadWalletThemes,
  saveWalletThemes,
  type CardTheme,
} from "@/lib/card-themes";

interface WalletThemeContextType {
  themes: Record<number, string>;
  getTheme: (walletId: number) => CardTheme;
  setTheme: (walletId: number, themeId: string) => void;
}

const WalletThemeContext = createContext<WalletThemeContextType>({
  themes: DEFAULT_WALLET_THEMES,
  getTheme: () => getThemeById(DEFAULT_WALLET_THEMES[0]),
  setTheme: () => {},
});

export function WalletThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<Record<number, string>>(
    DEFAULT_WALLET_THEMES
  );

  useEffect(() => {
    setThemes(loadWalletThemes());
  }, []);

  const getTheme = useCallback(
    (walletId: number): CardTheme => {
      const themeId = themes[walletId] ?? DEFAULT_WALLET_THEMES[walletId] ?? "gece";
      return getThemeById(themeId);
    },
    [themes]
  );

  const setTheme = useCallback(
    (walletId: number, themeId: string) => {
      setThemes((prev) => {
        const next = { ...prev, [walletId]: themeId };
        saveWalletThemes(next);
        return next;
      });
    },
    []
  );

  return (
    <WalletThemeContext.Provider value={{ themes, getTheme, setTheme }}>
      {children}
    </WalletThemeContext.Provider>
  );
}

export function useWalletTheme() {
  return useContext(WalletThemeContext);
}
