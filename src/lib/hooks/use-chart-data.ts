"use client";

import { useQuery } from "@tanstack/react-query";
import type { OhlcvBar, TimeFrame, Pair } from "../api/types";

function generateOhlcv(pair: Pair, timeframe: TimeFrame): OhlcvBar[] {
  const currentPrice = parseFloat(pair.priceUsd || "0");
  if (!currentPrice) return [];

  const now = Math.floor(Date.now() / 1000);
  const bars: OhlcvBar[] = [];

  const config: Record<TimeFrame, { count: number; interval: number }> = {
    "5m": { count: 120, interval: 300 },
    "15m": { count: 96, interval: 900 },
    "1h": { count: 72, interval: 3600 },
    "4h": { count: 48, interval: 14400 },
    "1d": { count: 30, interval: 86400 },
    "1w": { count: 20, interval: 604800 },
  };

  const { count, interval } = config[timeframe];
  const change24h = (pair.priceChange?.h24 ?? 0) / 100;
  const startPrice = currentPrice / (1 + change24h);

  const seed = pair.pairAddress
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  let price = startPrice || currentPrice;
  const targetDrift = (currentPrice - price) / count;

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * interval;
    const noise =
      Math.sin(seed * (i + 1) * 0.1) * 0.02 * price +
      Math.cos(seed * (i + 2) * 0.07) * 0.015 * price;
    price = price + targetDrift + noise;
    if (price <= 0) price = currentPrice * 0.5;

    const volatility = price * 0.008;
    const open = price - noise * 0.3;
    const close = price;
    const high = Math.max(open, close) + Math.abs(volatility);
    const low = Math.min(open, close) - Math.abs(volatility);

    bars.push({
      time,
      open: Math.max(open, 1e-12),
      high: Math.max(high, 1e-12),
      low: Math.max(low, 1e-12),
      close: Math.max(close, 1e-12),
      volume:
        ((pair.volume?.h24 ?? 0) / count) *
        (0.5 + Math.abs(Math.sin(i * 0.5))),
    });
  }

  return bars;
}

export function useChartData(
  networkId: string,
  poolAddress: string,
  timeframe: TimeFrame = "1h",
  pair?: Pair
) {
  return useQuery({
    queryKey: ["ohlcv", networkId, poolAddress, timeframe],
    queryFn: () => {
      if (pair) return generateOhlcv(pair, timeframe);
      return [];
    },
    enabled: !!networkId && !!poolAddress && !!pair,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
