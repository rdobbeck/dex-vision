"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/charts/price-chart";
import type { Pair, TimeFrame, OhlcvBar } from "@/lib/api/types";
import { formatUsd, formatNumber, formatPercent, formatAddress } from "@/lib/utils/format";
import { useFavoritesStore } from "@/lib/stores/favorites-store";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateChart(pair: Pair, timeframe: TimeFrame): OhlcvBar[] {
  const currentPrice = parseFloat(pair.priceUsd || "0");
  if (!currentPrice) return [];
  const now = Math.floor(Date.now() / 1000);
  const cfgs: Record<TimeFrame, { count: number; interval: number; vol: number }> = {
    "5m": { count: 120, interval: 300, vol: 0.012 },
    "15m": { count: 96, interval: 900, vol: 0.018 },
    "1h": { count: 72, interval: 3600, vol: 0.03 },
    "4h": { count: 48, interval: 14400, vol: 0.045 },
    "1d": { count: 30, interval: 86400, vol: 0.06 },
    "1w": { count: 20, interval: 604800, vol: 0.10 },
  };
  const { count, interval, vol } = cfgs[timeframe];
  const change24h = (pair.priceChange?.h24 ?? 0) / 100;
  const startPrice = currentPrice / (1 + (change24h || 0.01));
  const seed = pair.pairAddress.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  let price = startPrice;
  const drift = (currentPrice - startPrice) / count;
  const bars: OhlcvBar[] = [];

  for (let i = 0; i < count; i++) {
    const t = now - (count - i) * interval;

    // Random walk with momentum
    const r1 = (rand() - 0.5) * 2;
    const r2 = (rand() - 0.5) * 2;
    const r3 = rand();
    const r4 = rand();

    const move = drift + r1 * vol * price;
    const open = price;
    price = Math.max(price + move, currentPrice * 0.01);
    const close = price;

    // Body size variation — some candles have big bodies, some small
    const bodySpread = Math.abs(close - open);
    // Wicks extend beyond the body
    const upperWick = bodySpread * (0.3 + r3 * 1.5) + price * vol * 0.3;
    const lowerWick = bodySpread * (0.3 + r4 * 1.5) + price * vol * 0.3;
    // Occasional long wicks (doji-like)
    const wickBoost = r2 > 0.8 ? price * vol * 0.8 : 0;

    const high = Math.max(open, close) + upperWick + wickBoost;
    const low = Math.max(Math.min(open, close) - lowerWick - wickBoost, 1e-15);

    bars.push({
      time: t,
      open: Math.max(open, 1e-15),
      high: Math.max(high, 1e-15),
      low,
      close: Math.max(close, 1e-15),
      volume: ((pair.volume?.h24 ?? 0) / count) * (0.3 + rand() * 1.4),
    });
  }
  return bars;
}

interface PairDetailProps {
  pair: Pair;
}

export function PairDetail({ pair }: PairDetailProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1h");
  const chartData = useMemo(() => generateChart(pair, timeframe), [pair, timeframe]);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const fav = isFavorite(pair.pairAddress);
  const change24h = pair.priceChange?.h24 ?? 0;
  const isPositive = change24h >= 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {pair.baseToken?.symbol}/{pair.quoteToken?.symbol}
            </h1>
            <Badge variant="outline">{pair.chainId}</Badge>
            <Badge variant="secondary">{pair.dexId}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-3xl font-mono font-bold">
              {formatUsd(pair.priceUsd || "0")}
            </span>
            <span
              className={`text-lg font-mono ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatPercent(change24h)}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
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
          {fav ? "\u2605 Favorited" : "\u2606 Favorite"}
        </Button>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-4">
          <PriceChart
            data={chartData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Volume 24h"
          value={formatUsd(pair.volume?.h24 ?? 0)}
        />
        <StatCard
          label="Liquidity"
          value={formatUsd(pair.liquidity?.usd ?? 0)}
        />
        <StatCard label="FDV" value={formatUsd(pair.fdv ?? 0)} />
        <StatCard label="Market Cap" value={formatUsd(pair.marketCap ?? 0)} />
      </div>

      {/* Price Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {(
              [
                { label: "5m", value: pair.priceChange?.m5 },
                { label: "1h", value: pair.priceChange?.h1 },
                { label: "6h", value: pair.priceChange?.h6 },
                { label: "24h", value: pair.priceChange?.h24 },
              ] as const
            ).map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div
                  className={`font-mono text-sm ${
                    (value ?? 0) >= 0 ? "text-green-500" : "text-red-500"
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
        <CardHeader>
          <CardTitle className="text-sm">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">1h</div>
              <div className="flex gap-2">
                <span className="text-green-500 text-sm">
                  {pair.txns?.h1?.buys ?? 0} buys
                </span>
                <span className="text-red-500 text-sm">
                  {pair.txns?.h1?.sells ?? 0} sells
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">24h</div>
              <div className="flex gap-2">
                <span className="text-green-500 text-sm">
                  {pair.txns?.h24?.buys ?? 0} buys
                </span>
                <span className="text-red-500 text-sm">
                  {pair.txns?.h24?.sells ?? 0} sells
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Token Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
                <span className="text-xs text-muted-foreground">Links:</span>
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
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-mono font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}
