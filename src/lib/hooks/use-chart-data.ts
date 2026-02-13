"use client";

import { useQuery } from "@tanstack/react-query";
import type { OhlcvBar, TimeFrame } from "../api/types";
import { getOhlcv } from "../api/geckoterminal";

export function useChartData(
  chainId: string,
  poolAddress: string,
  timeframe: TimeFrame = "1h"
) {
  return useQuery({
    queryKey: ["ohlcv", chainId, poolAddress, timeframe],
    queryFn: () => getOhlcv(chainId, poolAddress, timeframe),
    enabled: !!chainId && !!poolAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
