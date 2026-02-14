"use client";

import { useState, useEffect } from "react";
import { useTrendingPairs, useSearchPairs } from "@/lib/hooks/use-pairs";
import { useChainStore } from "@/lib/stores/chain-store";
import { PairTable } from "@/components/pairs/pair-table";
import { Badge } from "@/components/ui/badge";

function LiveIndicator({ dataUpdatedAt }: { dataUpdatedAt: number }) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const update = () =>
      setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dataUpdatedAt]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-3">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39be78] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39be78]" />
      </span>
      <span className="font-data text-[11px] uppercase tracking-wider">
        LIVE
      </span>
      <span className="text-[11px]">
        · updated {secondsAgo}s ago
      </span>
    </span>
  );
}

export default function HomePage() {
  const { selectedChain } = useChainStore();
  const {
    data: trendingPairs,
    isLoading: trendingLoading,
    dataUpdatedAt: trendingUpdatedAt,
  } = useTrendingPairs();
  const {
    data: chainPairs,
    isLoading: chainLoading,
    dataUpdatedAt: chainUpdatedAt,
  } = useSearchPairs(selectedChain || "");

  const pairs = selectedChain ? chainPairs : trendingPairs;
  const isLoading = selectedChain ? chainLoading : trendingLoading;
  const dataUpdatedAt = selectedChain ? chainUpdatedAt : trendingUpdatedAt;

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
            <span className="flex items-center">
              Trending Pairs
              {dataUpdatedAt > 0 && (
                <LiveIndicator dataUpdatedAt={dataUpdatedAt} />
              )}
            </span>
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
