"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchPairs } from "@/lib/hooks/use-pairs";
import { formatUsd, formatPercent } from "@/lib/utils/format";

export function TokenSearch() {
  const [query, setQuery] = useState("");
  const { data: pairs, isLoading } = useSearchPairs(query);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by token name, symbol, or contract address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 text-lg bg-muted/50"
      />

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {pairs && pairs.length > 0 && (
        <div className="grid gap-3">
          {pairs.map((pair) => {
            const change = pair.priceChange?.h24 ?? 0;
            return (
              <Link
                key={`${pair.chainId}-${pair.pairAddress}`}
                href={`/${pair.chainId}/${pair.pairAddress}`}
              >
                <Card className="hover:bg-muted/20 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {pair.baseToken?.symbol}/{pair.quoteToken?.symbol}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0"
                            >
                              {pair.chainId}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {pair.dexId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">
                          {formatUsd(pair.priceUsd || "0")}
                        </div>
                        <div
                          className={`text-sm font-mono ${
                            change >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {formatPercent(change)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {query.length >= 2 && !isLoading && pairs && pairs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No tokens found for &quot;{query}&quot;
          </CardContent>
        </Card>
      )}
    </div>
  );
}
