"use client";

import { useQuery } from "@tanstack/react-query";
import { searchPairs, getTrendingPairs } from "../api/dexscreener";
import { useChainStore } from "../stores/chain-store";

export function useTrendingPairs() {
  const query = useQuery({
    queryKey: ["trending-pairs"],
    queryFn: getTrendingPairs,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
  return { ...query, dataUpdatedAt: query.dataUpdatedAt };
}

export function useSearchPairs(query: string) {
  const q = useQuery({
    queryKey: ["search-pairs", query],
    queryFn: () => searchPairs(query),
    enabled: query.length >= 2,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
  return { ...q, dataUpdatedAt: q.dataUpdatedAt };
}

export function usePairsByChain() {
  const { selectedChain } = useChainStore();
  return useQuery({
    queryKey: ["pairs-by-chain", selectedChain],
    queryFn: () => searchPairs(selectedChain || ""),
    enabled: !!selectedChain,
    staleTime: 30_000,
  });
}
