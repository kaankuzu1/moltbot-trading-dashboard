"use client";

import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/format";
import type { CapitalFlowData } from "@/lib/types";

interface CapitalFlowProps {
  data: CapitalFlowData;
}

export function CapitalFlow({ data }: CapitalFlowProps) {
  const { applyWallet } = useWallet();

  const netPositive = data.netFlow >= 0;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
      <Card>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">Toplam Yatirilan</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-500">
            {formatCurrency(applyWallet(data.totalDeposits))}
          </p>
          <p className="text-sm text-muted-foreground">{data.depositCount} islem</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">Toplam Cekilen</p>
          <p className="text-2xl font-bold tracking-tight text-red-500">
            {formatCurrency(applyWallet(data.totalWithdrawals))}
          </p>
          <p className="text-sm text-muted-foreground">{data.withdrawalCount} islem</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">Net Akis</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground/50" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                Guncel fiyatlar ile hesaplanmistir
              </TooltipContent>
            </Tooltip>
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${
              netPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {netPositive ? "+" : ""}
            {formatCurrency(applyWallet(data.netFlow))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
