"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSearch } from "@/lib/hooks/use-search";
import { useChainStore } from "@/lib/stores/chain-store";
import { SUPPORTED_CHAINS } from "@/lib/api/types";
import { formatUsd } from "@/lib/utils/format";
import { Search, Menu } from "lucide-react";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: results } = useSearch(searchQuery);
  const { selectedChain, setSelectedChain } = useChainStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="flex h-14 items-center gap-4 px-4 max-w-[1800px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-primary">Dex</span>
            <span className="text-foreground">Vision</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 ml-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Trending
          </Link>
          <Link
            href="/tokens"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tokens
          </Link>
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tokens, pairs, or addresses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="h-8 pl-8 bg-background border-border text-sm"
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
                    <span className="text-sm font-data">
                      {formatUsd(result.priceUsd)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chain filter pills - desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <button
            className={`text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full transition-colors ${
              selectedChain === null
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            onClick={() => setSelectedChain(null)}
          >
            All
          </button>
          {SUPPORTED_CHAINS.slice(0, 8).map((chain) => (
            <button
              key={chain.id}
              className={`text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full transition-colors ${
                selectedChain === chain.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setSelectedChain(chain.id)}
            >
              {chain.name}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-heading">
                <span className="text-primary">Dex</span>Vision
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4">
              <Link
                href="/"
                className="text-sm py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Trending
              </Link>
              <Link
                href="/tokens"
                className="text-sm py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Tokens
              </Link>
            </nav>
            <div className="px-4 pt-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Chains
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  className={`text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full transition-colors ${
                    selectedChain === null
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedChain(null);
                    setMobileOpen(false);
                  }}
                >
                  All
                </button>
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    className={`text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full transition-colors ${
                      selectedChain === chain.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedChain(chain.id);
                      setMobileOpen(false);
                    }}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
