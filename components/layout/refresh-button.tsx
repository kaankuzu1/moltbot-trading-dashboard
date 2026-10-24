"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { useManualRefresh } from "@/lib/contexts/manual-refresh-context";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const COOLDOWN_SECONDS = 30;

export function RefreshButton() {
  const { mutate } = useSWRConfig();
  const { triggerManualRefresh } = useManualRefresh();
  const [cooldown, setCooldown] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRefresh = useCallback(() => {
    if (cooldown > 0) return;
    setSpinning(true);
    triggerManualRefresh();
    // Revalidate all SWR keys matching our API routes
    mutate((key) => typeof key === "string" && key.startsWith("/api/binance/"));
    setCooldown(COOLDOWN_SECONDS);
    setTimeout(() => setSpinning(false), 1000);
  }, [cooldown, mutate, triggerManualRefresh]);

  const disabled = cooldown > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleRefresh}
          disabled={disabled}
        >
          <RefreshCw
            className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {disabled ? `${cooldown}sn bekleyin` : "Verileri guncelle"}
      </TooltipContent>
    </Tooltip>
  );
}
