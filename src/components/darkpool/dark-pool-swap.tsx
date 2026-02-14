"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BatchPhase } from "@/lib/api/types";

interface DarkPoolSwapProps {
  onCommit?: (tokenIn: string, tokenOut: string, amount: string, minPrice: string) => void;
}

export function DarkPoolSwap({ onCommit }: DarkPoolSwapProps) {
  const [tokenIn, setTokenIn] = useState("ETH");
  const [tokenOut, setTokenOut] = useState("USDC");
  const [amountIn, setAmountIn] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [phase] = useState<BatchPhase>(BatchPhase.COMMIT);

  const phaseColors: Record<BatchPhase, string> = {
    [BatchPhase.COMMIT]: "bg-blue-500/20 text-blue-400",
    [BatchPhase.REVEAL]: "bg-yellow-500/20 text-yellow-400",
    [BatchPhase.SETTLEMENT]: "bg-green-500/20 text-green-400",
    [BatchPhase.CLOSED]: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">Dark Pool Swap</CardTitle>
          <Badge className={phaseColors[phase]}>{phase} Phase</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Orders are hidden until the reveal phase. No front-running, no MEV.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token In */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">You sell</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 font-mono"
            />
            <Button
              variant="secondary"
              className="min-w-[80px]"
              onClick={() => {
                const temp = tokenIn;
                setTokenIn(tokenOut);
                setTokenOut(temp);
              }}
            >
              {tokenIn}
            </Button>
          </div>
        </div>

        {/* Swap direction */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              const temp = tokenIn;
              setTokenIn(tokenOut);
              setTokenOut(temp);
            }}
          >
            ↕
          </Button>
        </div>

        {/* Token Out */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">You buy</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              disabled
              className="flex-1 font-mono bg-muted/50"
            />
            <Button variant="secondary" className="min-w-[80px]">
              {tokenOut}
            </Button>
          </div>
        </div>

        {/* Min Price */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Min price (optional)
          </label>
          <Input
            type="number"
            placeholder="Set minimum execution price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="font-mono"
          />
        </div>

        <Separator />

        {/* Info */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Execution</span>
            <span>Batch auction (uniform price)</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>MEV Protection</span>
            <span className="text-[#39be78]">Commit-reveal</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Fee</span>
            <span className="font-data">0.1% LP fee</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Bond required</span>
            <span className="font-data">0.001 ETH (refunded on reveal)</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!amountIn || parseFloat(amountIn) <= 0}
          onClick={() => onCommit?.(tokenIn, tokenOut, amountIn, minPrice)}
        >
          {!amountIn
            ? "Enter amount"
            : `Commit ${tokenIn} → ${tokenOut} Order`}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Your order is hashed and hidden. You must reveal it during the reveal
          phase or your bond will be slashed.
        </p>
      </CardContent>
    </Card>
  );
}
