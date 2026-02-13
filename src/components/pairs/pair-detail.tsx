"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/charts/price-chart";
import type { Pair, TimeFrame } from "@/lib/api/types";
import { formatUsd, formatPercent, formatAddress } from "@/lib/utils/format";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { useChartData } from "@/lib/hooks/use-chart-data";

interface PairDetailProps {
  pair: Pair;
}

export function PairDetail({ pair }: PairDetailProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1h");
  const { data: chartData, isLoading: chartLoading } = useChartData(
    pair.chainId,
    pair.pairAddress,
    timeframe
  );
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const fav = isFavorite(pair.pairAddress);
  const change24h = pair.priceChange?.h24 ?? 0;
  const isPositive = change24h >= 0;

  return (
    <div className="space-y-3">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-bold">
            {pair.baseToken?.symbol}/{pair.quoteToken?.symbol}
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {pair.chainId}
          </Badge>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {pair.dexId}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              if (fav) {
                removeFavorite(pair.pairAddress);
              } else {
                addFavorite({
                  chainId: pair.chainId,
                  pairAddress: pair.pairAddress,
                  symbol: `${pair.baseToken?.symbol}/${pair.quoteToken?.symbol}`,
                });
              }
            }}
          >
            {fav ? "\u2605" : "\u2606"}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-2xl font-bold">
            {formatUsd(pair.priceUsd || "0")}
          </span>
          <span
            className={`font-data text-sm font-semibold ${
              isPositive ? "text-[#39be78]" : "text-[#f45b5b]"
            }`}
          >
            {formatPercent(change24h)}
          </span>
        </div>
      </div>

      {/* Chart + Stats: flex row on desktop, stack on mobile */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Chart — flex-1 */}
        <Card className="flex-1 min-w-0">
          <CardContent className="p-3">
            <PriceChart
              data={chartData || []}
              isLoading={chartLoading}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <div className="w-full lg:w-[320px] space-y-3 shrink-0">
          {/* 2x2 mini stat grid */}
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Volume 24h" value={formatUsd(pair.volume?.h24 ?? 0)} />
            <MiniStat label="Liquidity" value={formatUsd(pair.liquidity?.usd ?? 0)} />
            <MiniStat label="FDV" value={formatUsd(pair.fdv ?? 0)} />
            <MiniStat label="Market Cap" value={formatUsd(pair.marketCap ?? 0)} />
          </div>

          {/* Price Changes */}
          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Price Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="grid grid-cols-4 gap-2 text-center">
                {(
                  [
                    { label: "5m", value: pair.priceChange?.m5 },
                    { label: "1h", value: pair.priceChange?.h1 },
                    { label: "6h", value: pair.priceChange?.h6 },
                    { label: "24h", value: pair.priceChange?.h24 },
                  ] as const
                ).map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
                    <div
                      className={`font-data text-sm ${
                        (value ?? 0) >= 0 ? "text-[#39be78]" : "text-[#f45b5b]"
                      }`}
                    >
                      {formatPercent(value ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase mb-1">1h</div>
                  <div className="flex gap-2">
                    <span className="text-[#39be78] text-xs font-data">
                      {pair.txns?.h1?.buys ?? 0} buys
                    </span>
                    <span className="text-[#f45b5b] text-xs font-data">
                      {pair.txns?.h1?.sells ?? 0} sells
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase mb-1">24h</div>
                  <div className="flex gap-2">
                    <span className="text-[#39be78] text-xs font-data">
                      {pair.txns?.h24?.buys ?? 0} buys
                    </span>
                    <span className="text-[#f45b5b] text-xs font-data">
                      {pair.txns?.h24?.sells ?? 0} sells
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Token Info
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
              <InfoRow label="Pair Address" value={formatAddress(pair.pairAddress)} />
              <Separator />
              <InfoRow label="Base Token" value={`${pair.baseToken?.name} (${pair.baseToken?.symbol})`} />
              <InfoRow label="Base Address" value={formatAddress(pair.baseToken?.address || "")} />
              <Separator />
              <InfoRow label="Quote Token" value={`${pair.quoteToken?.name} (${pair.quoteToken?.symbol})`} />
              <InfoRow label="Quote Address" value={formatAddress(pair.quoteToken?.address || "")} />
              {pair.info?.websites && pair.info.websites.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Links:</span>
                    {pair.info.websites.map((w) => (
                      <a
                        key={w.url}
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {new URL(w.url).hostname}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-data text-sm font-bold mt-0.5">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <span className="text-xs font-data">{value}</span>
    </div>
  );
}
