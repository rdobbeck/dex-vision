import type { Pair, SearchResult } from "./types";

const BASE_URL = "https://api.dexscreener.com";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    throw new Error(`DexScreener API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function searchPairs(query: string): Promise<Pair[]> {
  const data = await fetchApi<{ pairs: Pair[] }>(
    `/latest/dex/search?q=${encodeURIComponent(query)}`
  );
  return data.pairs || [];
}

export async function getPairsByChain(
  chainId: string,
  pairAddress: string
): Promise<Pair[]> {
  const data = await fetchApi<{ pairs: Pair[] }>(
    `/latest/dex/pairs/${chainId}/${pairAddress}`
  );
  return data.pairs || [];
}

export async function getTokenPairs(
  chainId: string,
  tokenAddress: string
): Promise<Pair[]> {
  const data = await fetchApi<{ pairs: Pair[] }>(
    `/tokens/v1/${chainId}/${tokenAddress}`
  );
  return data.pairs || [];
}

interface BoostToken {
  chainId: string;
  tokenAddress: string;
  totalAmount: number;
}

export async function getTrendingPairs(): Promise<Pair[]> {
  // Step 1: Get boosted token addresses
  const boosts = await fetchApi<BoostToken[]>("/token-boosts/top/v1");
  if (!boosts || boosts.length === 0) return [];

  // Step 2: Group by chain and batch-resolve into full pair data
  // DexScreener /tokens/v1/{chain}/{address} supports comma-separated addresses
  const chainGroups = new Map<string, string[]>();
  for (const boost of boosts.slice(0, 30)) {
    const addrs = chainGroups.get(boost.chainId) || [];
    addrs.push(boost.tokenAddress);
    chainGroups.set(boost.chainId, addrs);
  }

  const allPairs: Pair[] = [];
  const fetches = Array.from(chainGroups.entries()).map(
    async ([chainId, addresses]) => {
      try {
        // Batch up to 30 addresses per request
        const joined = addresses.join(",");
        const data = await fetchApi<Pair[]>(
          `/tokens/v1/${chainId}/${joined}`
        );
        if (Array.isArray(data)) {
          // API returns flat array of pairs; pick the highest-volume pair per token
          const seen = new Set<string>();
          for (const pair of data) {
            const key = pair.baseToken?.address?.toLowerCase();
            if (key && !seen.has(key)) {
              seen.add(key);
              allPairs.push(pair);
            }
          }
        }
      } catch {
        // skip chain on error
      }
    }
  );

  await Promise.all(fetches);

  // Sort by 24h volume descending
  allPairs.sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
  return allPairs;
}

export function mapDexScreenerToSearchResult(pair: Pair): SearchResult {
  return {
    type: "pair",
    chainId: pair.chainId,
    address: pair.pairAddress,
    name: `${pair.baseToken?.symbol}/${pair.quoteToken?.symbol}`,
    symbol: pair.baseToken?.symbol,
    priceUsd: pair.priceUsd,
    volume24h: pair.volume?.h24,
  };
}
