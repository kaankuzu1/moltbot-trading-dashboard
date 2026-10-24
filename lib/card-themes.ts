export interface CardTheme {
  id: string;
  name: string;
  gradient: string;
  shadowClass?: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: "gece",
    name: "Gece",
    gradient: "linear-gradient(160deg, #1a1a2e, #16213e)",
    shadowClass: "shadow-[0_8px_32px_rgba(22,33,62,0.4)]",
  },
  {
    id: "okyanus",
    name: "Okyanus",
    gradient: "linear-gradient(180deg, #0c4a6e, #155e75)",
  },
  {
    id: "karbon",
    name: "Karbon",
    gradient: "linear-gradient(135deg, #1c1917, #292524)",
    shadowClass: "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
  },
  {
    id: "safir",
    name: "Safir",
    gradient: "radial-gradient(ellipse at bottom left, #2563eb, #1e3a5f)",
    shadowClass: "shadow-[0_8px_32px_rgba(37,99,235,0.25)]",
  },
  {
    id: "bakir",
    name: "Bakır",
    gradient: "linear-gradient(135deg, #9a3412, #7c2d12)",
    shadowClass: "shadow-[0_8px_32px_rgba(154,52,18,0.3)]",
  },
  {
    id: "prizma",
    name: "Prizma",
    gradient: "linear-gradient(150deg, #7c3aed, #581c87)",
    shadowClass: "shadow-[0_8px_32px_rgba(124,58,237,0.3)]",
  },
  {
    id: "zirveler",
    name: "Zirveler",
    gradient: "linear-gradient(170deg, #065f46, #064e3b)",
  },
  {
    id: "elmas",
    name: "Elmas",
    gradient: "linear-gradient(145deg, #71717a, #3f3f46)",
    shadowClass: "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
  },
];

export const DEFAULT_WALLET_THEMES: Record<number, string> = {
  0: "gece",
  1: "safir",
  2: "zirveler",
};

const STORAGE_KEY = "wallet-themes";

export function loadWalletThemes(): Record<number, string> {
  if (typeof window === "undefined") return { ...DEFAULT_WALLET_THEMES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<number, string>;
      // Fill missing wallets with defaults
      for (const [id, themeId] of Object.entries(DEFAULT_WALLET_THEMES)) {
        if (!(id in parsed)) {
          parsed[Number(id)] = themeId;
        }
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_WALLET_THEMES };
}

export function saveWalletThemes(themes: Record<number, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // ignore
  }
}

export function getThemeById(id: string): CardTheme {
  return CARD_THEMES.find((t) => t.id === id) ?? CARD_THEMES[0];
}
