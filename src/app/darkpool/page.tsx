"use client";

import { DarkPoolExplainer } from "@/components/darkpool/dark-pool-explainer";
import { DarkPoolSwap } from "@/components/darkpool/dark-pool-swap";
import { PoolStats } from "@/components/darkpool/pool-stats";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DarkPoolPage() {
  return (
    <div className="space-y-10">
      {/* Beta badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs uppercase tracking-wider">
          Beta
        </Badge>
      </div>

      {/* Explainer section */}
      <DarkPoolExplainer />

      <Separator />

      {/* Interactive section */}
      <div className="space-y-8">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground text-center">
          Trade
        </h2>

        {/* Swap Interface */}
        <DarkPoolSwap />

        <Separator />

        {/* Active Batches */}
        <PoolStats />
      </div>
    </div>
  );
}
