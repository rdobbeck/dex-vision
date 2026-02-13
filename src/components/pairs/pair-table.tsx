"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Pair } from "@/lib/api/types";
import { formatUsd, formatNumber, formatPercent, formatTimeAgo } from "@/lib/utils/format";
import { useFavoritesStore } from "@/lib/stores/favorites-store";

type SortField = "price" | "priceChange" | "volume" | "liquidity" | "txns" | "age";
type SortDir = "asc" | "desc";

interface PairTableProps {
  pairs: Pair[];
  isLoading?: boolean;
}

export function PairTable({ pairs, isLoading }: PairTableProps) {
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...pairs].sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortField) {
      case "price":
        aVal = parseFloat(a.priceUsd || "0");
        bVal = parseFloat(b.priceUsd || "0");
        break;
      case "priceChange":
        aVal = a.priceChange?.h24 ?? 0;
        bVal = b.priceChange?.h24 ?? 0;
        break;
      case "volume":
        aVal = a.volume?.h24 ?? 0;
        bVal = b.volume?.h24 ?? 0;
        break;
      case "liquidity":
        aVal = a.liquidity?.usd ?? 0;
        bVal = b.liquidity?.usd ?? 0;
        break;
      case "txns":
        aVal = (a.txns?.h24?.buys ?? 0) + (a.txns?.h24?.sells ?? 0);
        bVal = (b.txns?.h24?.buys ?? 0) + (b.txns?.h24?.sells ?? 0);
        break;
      case "age":
        aVal = a.pairCreatedAt ?? 0;
        bVal = b.pairCreatedAt ?? 0;
        break;
      default:
        return 0;
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:text-foreground transition-colors select-none text-[11px] uppercase tracking-wider font-medium text-muted-foreground bg-card sticky top-0"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-[10px]">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>
        )}
      </span>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-card hover:bg-card">
              <TableHead className="w-8 text-[11px] uppercase tracking-wider font-medium text-muted-foreground bg-card sticky top-0">
                #
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground bg-card sticky top-0">
                Pair
              </TableHead>
              <SortHeader field="price">Price</SortHeader>
              <SortHeader field="priceChange">24h %</SortHeader>
              <SortHeader field="volume">Volume 24h</SortHeader>
              <SortHeader field="liquidity">Liquidity</SortHeader>
              <SortHeader field="txns">Txns 24h</SortHeader>
              <SortHeader field="age">Age</SortHeader>
              <TableHead className="w-8 bg-card sticky top-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((pair, index) => {
              const change = pair.priceChange?.h24 ?? 0;
              const isPositive = change >= 0;
              const totalTxns =
                (pair.txns?.h24?.buys ?? 0) + (pair.txns?.h24?.sells ?? 0);
              const fav = isFavorite(pair.pairAddress);

              return (
                <TableRow
                  key={`${pair.chainId}-${pair.pairAddress}`}
                  className="hover:bg-muted/20 transition-colors h-[47px]"
                >
                  <TableCell className="text-muted-foreground text-xs font-data">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/${pair.chainId}/${pair.pairAddress}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {pair.baseToken?.symbol}/{pair.quoteToken?.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 uppercase"
                          >
                            {pair.chainId}
                          </Badge>
                          {pair.dexId}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-data text-sm">
                    {formatUsd(pair.priceUsd || "0")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-data text-sm ${
                        isPositive ? "text-[#39be78]" : "text-[#f45b5b]"
                      }`}
                    >
                      {formatPercent(change)}
                    </span>
                  </TableCell>
                  <TableCell className="font-data text-sm">
                    {formatUsd(pair.volume?.h24 ?? 0)}
                  </TableCell>
                  <TableCell className="font-data text-sm">
                    {formatUsd(pair.liquidity?.usd ?? 0)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-[#39be78] text-xs font-data">
                        {pair.txns?.h24?.buys ?? 0}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-[#f45b5b] text-xs font-data">
                        {pair.txns?.h24?.sells ?? 0}
                      </span>
                      <span className="text-muted-foreground text-xs font-data ml-1">
                        ({formatNumber(totalTxns)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-data">
                    {pair.pairCreatedAt
                      ? formatTimeAgo(pair.pairCreatedAt)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.preventDefault();
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
                      {fav ? "\u2605" : "\u2606"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                >
                  No pairs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
