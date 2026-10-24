"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { WalletSelector } from "@/components/layout/wallet-selector";
import { RefreshButton } from "@/components/layout/refresh-button";
export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <RefreshButton />
        <WalletSelector />
      </div>
    </header>
  );
}
