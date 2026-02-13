"use client";

import { useQuery } from "@tanstack/react-query";
import type { OhlcvBar, TimeFrame } from "../api/types";

async function fetchOhlcv(
  chainId: string,
  poolAddress: string,
  timeframe: TimeFrame
): Promise<OhlcvBar[]> {
  const res = await fetch(
    `/api/ohlcv/${encodeURIComponent(chainId)}/${encodeURIComponent(poolAddress)}?tf=${timeframe}`
  );
  if (!res.ok) {
    throw new Error(`OHLCV fetch failed: ${res.status}`);
  }
  return res.json();
}

export function useChartData(
  chainId: string,
  poolAddress: string,
  timeframe: TimeFrame = "1h"
) {
  return useQuery({
    queryKey: ["ohlcv", chainId, poolAddress, timeframe],
    queryFn: () => fetchOhlcv(chainId, poolAddress, timeframe),
    enabled: !!chainId && !!poolAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
