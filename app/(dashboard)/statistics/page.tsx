"use client";

import { StatsOverview } from "@/components/statistics/stats-overview";
import { BalanceChart } from "@/components/statistics/balance-chart";
import { AllocationChart } from "@/components/statistics/allocation-chart";
import {
  usePortfolio,
  useMarket,
  useHistory,
} from "@/lib/hooks/use-binance";
import { useRevalidationFade } from "@/lib/hooks/use-revalidation-fade";
import { useManualRefresh } from "@/lib/contexts/manual-refresh-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsPage() {
  const { data: portfolio, isLoading: portfolioLoading, isValidating: portfolioValidating } = usePortfolio();
  const { data: market, isLoading: marketLoading, isValidating: marketValidating } = useMarket();
  const { data: history, isLoading: historyLoading, isValidating: historyValidating } = useHistory();
  const { isManualRefresh } = useManualRefresh();

  const isLoading = portfolioLoading || marketLoading;
  const kpiRevalidation = useRevalidationFade((portfolioValidating || marketValidating) && !isLoading, isManualRefresh);
  const chartRevalidation = useRevalidationFade(historyValidating && !historyLoading, isManualRefresh);
  const allocationRevalidation = useRevalidationFade(portfolioValidating && !portfolioLoading, isManualRefresh);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Istatistikler</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-lg" />
          ))}
        </div>
      ) : portfolio && market ? (
        <div className={`animate-fade-slide-up ${kpiRevalidation}`}>
          <StatsOverview summary={portfolio.summary} market={market} />
        </div>
      ) : null}

      {historyLoading ? (
        <Skeleton className="h-[340px] rounded-lg" />
      ) : history ? (
        <div className={`animate-fade-slide-up ${chartRevalidation}`} style={{ animationDelay: "100ms" }}>
          <BalanceChart
            snapshots={history.snapshots}
            currentValue={portfolio?.summary.totalValue}
          />
        </div>
      ) : null}

      {portfolioLoading ? (
        <Skeleton className="h-[340px] rounded-lg" />
      ) : portfolio ? (
        <div className={`animate-fade-slide-up ${allocationRevalidation}`} style={{ animationDelay: "200ms" }}>
          <AllocationChart
            assets={portfolio.assets}
            totalValue={portfolio.summary.totalValue}
          />
        </div>
      ) : null}
    </div>
  );
}
