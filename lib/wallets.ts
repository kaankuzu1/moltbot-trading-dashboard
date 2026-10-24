export interface Wallet {
  id: number;
  name: string;
  percentage: number;
}

export const WALLETS: Wallet[] = [
  { id: 0, name: "Toplam", percentage: 1 },
  { id: 1, name: "Cüzdan A", percentage: 0.6 },
  { id: 2, name: "Cüzdan B", percentage: 0.4 },
];
