"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency, formatPrice, formatNumber } from "@/lib/format";
import type { RecentTrade } from "@/lib/types";

interface RecentTradesProps {
  trades: RecentTrade[];
}

function formatTradeDate(timestamp: number): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const { applyWallet } = useWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Son Islemler</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center text-muted-foreground">
            Henuz islem yok
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Tarih</TableHead>
                  <TableHead>Coin</TableHead>
                  <TableHead>Al/Sat</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Miktar</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Fiyat</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow
                    key={`${trade.symbol}-${trade.time}-${index}`}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatTradeDate(trade.time)}
                    </TableCell>
                    <TableCell className="font-bold">{trade.coin}</TableCell>
                    <TableCell>
                      <span
                        className={
                          trade.side === "BUY"
                            ? "font-semibold text-green-600 dark:text-green-400"
                            : "font-semibold text-red-600 dark:text-red-400"
                        }
                      >
                        {trade.side === "BUY" ? "Al" : "Sat"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-right font-mono sm:table-cell">
                      {formatNumber(trade.qty, trade.qty < 1 ? 6 : 2)}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono sm:table-cell">
                      {formatPrice(trade.price)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(applyWallet(trade.quoteQty))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
