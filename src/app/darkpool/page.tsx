"use client";

import { DarkPoolSwap } from "@/components/darkpool/dark-pool-swap";
import { PoolStats } from "@/components/darkpool/pool-stats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DarkPoolPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Dark Pool AMM{" "}
          <Badge variant="secondary" className="text-sm align-middle">
            BETA
          </Badge>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Trade with zero MEV exposure. Orders are committed as hidden hashes,
          revealed in batches, and settled at a uniform clearing price. No
          front-running, no sandwich attacks.
        </p>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">1</div>
            <h3 className="font-semibold text-sm">Commit</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Submit a hashed order. Nobody can see your trade details, amount,
              or direction.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">2</div>
            <h3 className="font-semibold text-sm">Reveal</h3>
            <p className="text-xs text-muted-foreground mt-1">
              After the commit window closes, reveal your order. The contract
              verifies it matches your commitment.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">3</div>
            <h3 className="font-semibold text-sm">Settle</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All orders execute at the same uniform clearing price. No
              slippage advantage for any trader.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Swap Interface */}
      <DarkPoolSwap />

      <Separator />

      {/* Active Batches */}
      <PoolStats />
    </div>
  );
}
