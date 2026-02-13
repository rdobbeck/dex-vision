import type { PoolInfo, OhlcvBar } from "./types";

const BASE_URL = "https://api.dexpaprika.com";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`DexPaprika API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getNetworks(): Promise<
  { id: string; display_name: string; symbol: string }[]
> {
  return fetchApi("/networks");
}

export async function getNetworkDexes(
  networkId: string
): Promise<{ id: string; name: string }[]> {
  return fetchApi(`/networks/${networkId}/dexes`);
}

export async function getTopPools(
  networkId?: string,
  page = 0,
  limit = 50
): Promise<{ pools: PoolInfo[] }> {
  const path = networkId
    ? `/networks/${networkId}/pools?page=${page}&limit=${limit}`
    : `/pools?page=${page}&limit=${limit}`;
  return fetchApi(path);
}

export async function getPoolDetails(
  networkId: string,
  poolAddress: string
): Promise<PoolInfo> {
  return fetchApi(`/networks/${networkId}/pools/${poolAddress}`);
}

export async function getPoolOhlcv(
  networkId: string,
  poolAddress: string,
  period: "5m" | "15m" | "1h" | "4h" | "1d" | "1w" = "1h",
  limit = 200
): Promise<OhlcvBar[]> {
  const res = await fetchApi<
    {
      time_open: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[]
  >(`/networks/${networkId}/pools/${poolAddress}/ohlcv?period=${period}&limit=${limit}`);

  return res.map((bar) => ({
    time: Math.floor(new Date(bar.time_open).getTime() / 1000),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  }));
}

export async function searchPools(
  query: string
): Promise<{ pools: PoolInfo[] }> {
  return fetchApi(`/search?query=${encodeURIComponent(query)}`);
}

export async function getTokenPrices(
  networkId: string,
  addresses: string[]
): Promise<Record<string, { price_usd: number }>> {
  const joined = addresses.join(",");
  return fetchApi(`/networks/${networkId}/multi/prices?addresses=${joined}`);
}

// SSE real-time streaming
export function createPoolStream(
  networkId: string,
  poolAddress: string,
  onData: (data: { price_usd: number; volume_usd: number }) => void
): EventSource | null {
  if (typeof window === "undefined") return null;
  const url = `${BASE_URL}/networks/${networkId}/pools/${poolAddress}/stream`;
  const source = new EventSource(url);
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch {
      // ignore malformed
    }
  };
  source.onerror = () => {
    source.close();
  };
  return source;
}
