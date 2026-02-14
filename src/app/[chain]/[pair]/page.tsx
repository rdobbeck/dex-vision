"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPairsByChain } from "@/lib/api/dexscreener";
import { PairDetail } from "@/components/pairs/pair-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function PairPage({
  params,
}: {
  params: Promise<{ chain: string; pair: string }>;
}) {
  const { chain, pair: pairAddress } = use(params);

  const { data: pairs, isLoading } = useQuery({
    queryKey: ["pair-detail", chain, pairAddress],
    queryFn: () => getPairsByChain(chain, pairAddress),
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const pairData = pairs?.[0];

  if (!pairData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Pair not found. Try searching for a different pair.
      </div>
    );
  }

  return <PairDetail pair={pairData} />;
}
