"use client";

import { useMemo } from "react";
import { AssetsGrid } from "@/components/assets/assets-grid";
import { usePortfolio, useKlines } from "@/lib/hooks/use-binance";
import { useRevalidationFade } from "@/lib/hooks/use-revalidation-fade";
import { useManualRefresh } from "@/lib/contexts/manual-refresh-context";
import { Skeleton } from "@/components/ui/skeleton";

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-l-4 border-l-muted-foreground/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:px-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-5" style={{ width: `${48 + (i % 3) * 16}px` }} />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Sparkline area */}
          <div className="px-1">
            <Skeleton className="h-[120px] w-full sm:h-[140px]" />
          </div>
          {/* Data section */}
          <div className="space-y-2 px-4 pb-4 pt-2 sm:px-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VarliklarPage() {
  const { data, isLoading, isValidating } = usePortfolio();
  const { isManualRefresh } = useManualRefresh();
  const revalidationClass = useRevalidationFade(isValidating && !isLoading, isManualRefresh);

  const symbols = useMemo(() => {
    if (!data?.assets) return null;
    return data.assets.map((a) => a.coin);
  }, [data?.assets]);

  const { data: klinesData } = useKlines(symbols);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Varliklar</h1>
        <p className="text-muted-foreground">
          Portfoydeki tum coinler ve dagilimlari
        </p>
      </div>
      {isLoading ? (
        <CardGridSkeleton />
      ) : data ? (
        <AssetsGrid assets={data.assets} klines={klinesData?.klines} revalidationClass={revalidationClass} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground">Veri alinamadi</p>
        </div>
      )}
    </div>
  );
}
