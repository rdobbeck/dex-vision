"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BatchPhase } from "@/lib/api/types";

interface BatchInfo {
  id: number;
  tokenA: string;
  tokenB: string;
  phase: BatchPhase;
  commitDeadline: string;
  revealDeadline: string;
  totalCommitments: number;
  totalRevealed: number;
  clearingPrice?: string;
}

// Demo data for initial UI
const DEMO_BATCHES: BatchInfo[] = [
  {
    id: 1,
    tokenA: "ETH",
    tokenB: "USDC",
    phase: BatchPhase.COMMIT,
    commitDeadline: "~3 min",
    revealDeadline: "~8 min",
    totalCommitments: 14,
    totalRevealed: 0,
  },
  {
    id: 2,
    tokenA: "WBTC",
    tokenB: "USDC",
    phase: BatchPhase.REVEAL,
    commitDeadline: "Closed",
    revealDeadline: "~2 min",
    totalCommitments: 8,
    totalRevealed: 5,
  },
  {
    id: 3,
    tokenA: "ETH",
    tokenB: "DAI",
    phase: BatchPhase.SETTLEMENT,
    commitDeadline: "Closed",
    revealDeadline: "Closed",
    totalCommitments: 22,
    totalRevealed: 20,
    clearingPrice: "$3,245.67",
  },
];

export function PoolStats() {
  const phaseColors: Record<BatchPhase, string> = {
    [BatchPhase.COMMIT]: "bg-blue-500/20 text-blue-400",
    [BatchPhase.REVEAL]: "bg-yellow-500/20 text-yellow-400",
    [BatchPhase.SETTLEMENT]: "bg-green-500/20 text-green-400",
    [BatchPhase.CLOSED]: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Active Batches</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_BATCHES.map((batch) => (
          <Card key={batch.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {batch.tokenA}/{batch.tokenB}
                </CardTitle>
                <Badge className={phaseColors[batch.phase]}>
                  {batch.phase}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Batch #{batch.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commit deadline</span>
                <span>{batch.commitDeadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reveal deadline</span>
                <span>{batch.revealDeadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commitments</span>
                <span>{batch.totalCommitments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revealed</span>
                <span>
                  {batch.totalRevealed}/{batch.totalCommitments}
                </span>
              </div>
              {batch.clearingPrice && (
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Clearing Price</span>
                  <span className="text-green-400">{batch.clearingPrice}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
