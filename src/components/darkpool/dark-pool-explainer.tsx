"use client";

import { Card, CardContent } from "@/components/ui/card";

export function DarkPoolExplainer() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-heading font-bold">
          Zero-MEV Dark Pool
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Trade at fair prices with commit-reveal batch auctions. No
          front-running, no sandwich attacks, no slippage advantage.
        </p>
      </div>

      {/* The Problem */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          The Problem
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="text-2xl">&#x1F440;</div>
              <h3 className="font-heading font-semibold text-sm">
                MEV Extraction
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bots monitor the mempool and reorder transactions to extract
                value from your trades. You pay more, they pocket the
                difference.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="text-2xl">&#x26A1;</div>
              <h3 className="font-heading font-semibold text-sm">
                Front-Running
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Searchers see your pending swap and place their own order first,
                moving the price against you before your trade executes.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="text-2xl">&#x1F96A;</div>
              <h3 className="font-heading font-semibold text-sm">
                Sandwich Attacks
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attackers place orders before and after yours, inflating the
                price for your buy and dumping right after. You get the worst
                execution.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How DexVision Solves It */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          How DexVision Solves It
        </h2>
        <div className="space-y-0">
          {/* Commit Phase */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-heading font-bold shrink-0">
                1
              </div>
              <div className="w-0.5 flex-1 bg-blue-500/30 my-1" />
            </div>
            <Card className="flex-1 mb-4 border-l-2 border-l-blue-500">
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold text-sm text-blue-400">
                  Commit
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Submit a hashed order. Nobody sees your trade — not the amount,
                  not the direction, not even whether you&apos;re buying or selling.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reveal Phase */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-heading font-bold shrink-0">
                2
              </div>
              <div className="w-0.5 flex-1 bg-yellow-500/30 my-1" />
            </div>
            <Card className="flex-1 mb-4 border-l-2 border-l-yellow-500">
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold text-sm text-yellow-400">
                  Reveal
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Reveal your order after the commit window closes. The contract
                  verifies it matches your original commitment hash.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Settle Phase */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-[#39be78] flex items-center justify-center text-sm font-heading font-bold shrink-0">
                3
              </div>
            </div>
            <Card className="flex-1 border-l-2 border-l-[#39be78]">
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold text-sm text-[#39be78]">
                  Settle
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  All trades execute at the same uniform clearing price. Zero
                  slippage advantage — every trader in the batch gets the same
                  rate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm">
                Uniform Clearing Price
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                All traders get the same price per batch — no advantage for
                speed, order size, or timing.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm">
                Bond Mechanism
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                <span className="font-data text-[#39be78]">0.001 ETH</span>{" "}
                bond prevents spam commits. Fully refunded when you reveal your
                order.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm">
                Min Price Protection
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Set a floor price on your order. If the clearing price is worse,
                your order reverts and your bond is returned.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm">
                LP Fees
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                <span className="font-data text-[#39be78]">0.1%</span> fee per
                trade, earned by liquidity providers who supply both sides of
                the pool.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* For Liquidity Providers */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          For Liquidity Providers
        </h2>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              LPs deposit both tokens into the pool and earn the{" "}
              <span className="font-data text-[#39be78]">0.1%</span> fee from
              every settled batch. Because all trades clear at a single uniform
              price, LPs face no adverse selection from informed traders —
              making it a safer way to provide liquidity compared to traditional
              AMMs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
