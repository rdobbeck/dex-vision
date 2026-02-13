import { NextRequest, NextResponse } from "next/server";
import { getOhlcv } from "@/lib/api/geckoterminal";
import type { TimeFrame } from "@/lib/api/types";

const VALID_TIMEFRAMES = new Set(["5m", "15m", "1h", "4h", "1d", "1w"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; pool: string }> }
) {
  const { chain, pool } = await params;
  const tf = request.nextUrl.searchParams.get("tf") || "1h";

  if (!VALID_TIMEFRAMES.has(tf)) {
    return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 });
  }

  try {
    const bars = await getOhlcv(chain, pool, tf as TimeFrame);
    return NextResponse.json(bars, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch OHLCV";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
