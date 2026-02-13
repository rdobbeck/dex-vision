"use client";

import { useQuery } from "@tanstack/react-query";
import { searchPairs } from "../api/dexscreener";
import { mapDexScreenerToSearchResult } from "../api/dexscreener";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const pairs = await searchPairs(query);
      return pairs.slice(0, 20).map(mapDexScreenerToSearchResult);
    },
    enabled: query.length >= 2,
    staleTime: 10_000,
  });
}
