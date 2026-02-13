"use client";

import { useTrendingPairs, useSearchPairs } from "@/lib/hooks/use-pairs";
import { useChainStore } from "@/lib/stores/chain-store";
import { PairTable } from "@/components/pairs/pair-table";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { selectedChain } = useChainStore();
  const { data: trendingPairs, isLoading: trendingLoading } =
    useTrendingPairs();
  const { data: chainPairs, isLoading: chainLoading } =
    useSearchPairs(selectedChain || "");

  const pairs = selectedChain ? chainPairs : trendingPairs;
  const isLoading = selectedChain ? chainLoading : trendingLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {selectedChain ? (
            <span className="flex items-center gap-2">
              Top Pairs
              <Badge variant="outline" className="text-sm">
                {selectedChain}
              </Badge>
            </span>
          ) : (
            "Trending Pairs"
          )}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedChain
            ? `Showing top pairs on ${selectedChain}`
            : "Most active pairs across all chains"}
        </p>
      </div>

      <PairTable pairs={pairs || []} isLoading={isLoading} />
    </div>
  );
}
