"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/lib/hooks/use-search";
import { useChainStore } from "@/lib/stores/chain-store";
import { SUPPORTED_CHAINS } from "@/lib/api/types";
import { formatUsd } from "@/lib/utils/format";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { data: results } = useSearch(searchQuery);
  const { selectedChain, setSelectedChain } = useChainStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">DexVision</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Trending
            </Button>
          </Link>
          <Link href="/tokens">
            <Button variant="ghost" size="sm">
              Tokens
            </Button>
          </Link>
          <Link href="/darkpool">
            <Button variant="ghost" size="sm">
              <span className="flex items-center gap-1">
                Dark Pool
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  NEW
                </Badge>
              </span>
            </Button>
          </Link>
        </nav>

        <div className="flex-1 max-w-md relative">
          <Input
            placeholder="Search tokens, pairs, or addresses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="h-9 bg-muted/50"
          />
          {showResults && results && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
              {results.map((result) => (
                <Link
                  key={`${result.chainId}-${result.address}`}
                  href={`/${result.chainId}/${result.address}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setShowResults(false);
                    setSearchQuery("");
                  }}
                >
                  <div>
                    <span className="font-medium text-sm">{result.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {result.chainId}
                    </span>
                  </div>
                  {result.priceUsd && (
                    <span className="text-sm font-mono">
                      {formatUsd(result.priceUsd)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant={selectedChain === null ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setSelectedChain(null)}
          >
            All
          </Button>
          {SUPPORTED_CHAINS.slice(0, 6).map((chain) => (
            <Button
              key={chain.id}
              variant={selectedChain === chain.id ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setSelectedChain(chain.id)}
            >
              {chain.name}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
