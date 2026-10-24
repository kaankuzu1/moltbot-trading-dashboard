"use client";

import { useWallet } from "@/lib/wallet-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WalletSelector() {
  const { wallets, selectedWallet, setSelectedWallet } = useWallet();

  function formatLabel(name: string, percentage: number): string {
    const pct = (percentage * 100).toFixed(2).replace(".", ",");
    return `${name} (%${pct})`;
  }

  return (
    <Select
      value={selectedWallet?.id.toString() ?? ""}
      onValueChange={(value) => {
        const wallet = wallets.find((w) => w.id.toString() === value);
        if (wallet) setSelectedWallet(wallet);
      }}
    >
      <SelectTrigger size="sm" className="w-[140px] sm:w-[200px]">
        <SelectValue placeholder="Cuzdan sec" />
      </SelectTrigger>
      <SelectContent>
        {wallets.map((wallet) => (
          <SelectItem key={wallet.id} value={wallet.id.toString()}>
            {formatLabel(wallet.name, wallet.percentage)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
