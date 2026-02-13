import type { OhlcvBar, TimeFrame } from "./types";

const BASE_URL = "https://api.geckoterminal.com/api/v2";

// Map DexScreener chain IDs to GeckoTerminal network slugs
const CHAIN_MAP: Record<string, string> = {
  ethereum: "eth",
  solana: "solana",
  base: "base",
  pulsechain: "pulsechain",
  quai: "quai",
  arbitrum: "arbitrum",
  polygon: "polygon_pos",
  bsc: "bsc",
  avalanche: "avax",
  optimism: "optimism",
};

// Map our TimeFrame to GeckoTerminal endpoint + aggregate param
const TIMEFRAME_MAP: Record<
  TimeFrame,
  { endpoint: string; aggregate: number; limit: number }
> = {
  "5m": { endpoint: "minute", aggregate: 5, limit: 200 },
  "15m": { endpoint: "minute", aggregate: 15, limit: 200 },
  "1h": { endpoint: "hour", aggregate: 1, limit: 168 },
  "4h": { endpoint: "hour", aggregate: 4, limit: 120 },
  "1d": { endpoint: "day", aggregate: 1, limit: 90 },
  "1w": { endpoint: "day", aggregate: 1, limit: 140 }, // aggregate to weekly client-side
};

interface GeckoOhlcvResponse {
  data: {
    attributes: {
      ohlcv_list: [number, number, number, number, number, number][];
    };
  };
}

function aggregateToWeekly(bars: OhlcvBar[]): OhlcvBar[] {
  if (bars.length === 0) return [];
  const weeks: OhlcvBar[] = [];
  let chunk: OhlcvBar[] = [];

  for (const bar of bars) {
    chunk.push(bar);
    if (chunk.length === 7) {
      weeks.push({
        time: chunk[0].time,
        open: chunk[0].open,
        high: Math.max(...chunk.map((b) => b.high)),
        low: Math.min(...chunk.map((b) => b.low)),
        close: chunk[chunk.length - 1].close,
        volume: chunk.reduce((sum, b) => sum + b.volume, 0),
      });
      chunk = [];
    }
  }
  // Remaining partial week
  if (chunk.length > 0) {
    weeks.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((b) => b.high)),
      low: Math.min(...chunk.map((b) => b.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((sum, b) => sum + b.volume, 0),
    });
  }
  return weeks;
}

export async function getOhlcv(
  chainId: string,
  poolAddress: string,
  timeframe: TimeFrame
): Promise<OhlcvBar[]> {
  const network = CHAIN_MAP[chainId] || chainId;
  const config = TIMEFRAME_MAP[timeframe];

  const url = `${BASE_URL}/networks/${network}/pools/${poolAddress}/ohlcv/${config.endpoint}?aggregate=${config.aggregate}&limit=${config.limit}&currency=usd`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`GeckoTerminal OHLCV error: ${res.status}`);
  }

  const json: GeckoOhlcvResponse = await res.json();
  const rawList = json.data?.attributes?.ohlcv_list;

  if (!rawList || rawList.length === 0) {
    throw new Error("No OHLCV data returned");
  }

  // ohlcv_list is [timestamp, open, high, low, close, volume]
  // It comes in reverse chronological order, so sort ascending
  const bars: OhlcvBar[] = rawList
    .map(([time, open, high, low, close, volume]) => ({
      time,
      open,
      high,
      low,
      close,
      volume,
    }))
    .sort((a, b) => a.time - b.time);

  if (timeframe === "1w") {
    return aggregateToWeekly(bars);
  }

  return bars;
}
