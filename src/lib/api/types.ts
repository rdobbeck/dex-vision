// Shared types for DEX data across all API sources

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
}

export interface Pair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  volume: {
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  txns: {
    h1: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface OhlcvBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PoolInfo {
  id: string;
  dex_name: string;
  chain: string;
  base_token: { address: string; name: string; symbol: string };
  quote_token: { address: string; name: string; symbol: string };
  price_usd: number;
  volume_usd_24h: number;
  liquidity_usd: number;
  price_change_24h: number;
  transactions_24h: number;
  created_at: string;
}

export interface ChainInfo {
  id: string;
  name: string;
  icon: string;
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: "ethereum", name: "Ethereum", icon: "/chains/ethereum.svg" },
  { id: "solana", name: "Solana", icon: "/chains/solana.svg" },
  { id: "base", name: "Base", icon: "/chains/base.svg" },
  { id: "pulsechain", name: "PulseChain", icon: "/chains/pulsechain.svg" },
  { id: "quai", name: "Quai", icon: "/chains/quai.svg" },
  { id: "arbitrum", name: "Arbitrum", icon: "/chains/arbitrum.svg" },
  { id: "polygon", name: "Polygon", icon: "/chains/polygon.svg" },
  { id: "bsc", name: "BSC", icon: "/chains/bsc.svg" },
  { id: "avalanche", name: "Avalanche", icon: "/chains/avalanche.svg" },
  { id: "optimism", name: "Optimism", icon: "/chains/optimism.svg" },
];

export type TimeFrame = "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export interface SearchResult {
  type: "pair" | "token";
  chainId: string;
  address: string;
  name: string;
  symbol: string;
  priceUsd?: string;
  volume24h?: number;
}

// Dark Pool types
export enum BatchPhase {
  COMMIT = "COMMIT",
  REVEAL = "REVEAL",
  SETTLEMENT = "SETTLEMENT",
  CLOSED = "CLOSED",
}

export interface DarkPoolOrder {
  id: string;
  commitment: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minPrice: string;
  phase: BatchPhase;
  revealed: boolean;
  settled: boolean;
}

export interface DarkPoolBatch {
  id: number;
  tokenA: string;
  tokenB: string;
  phase: BatchPhase;
  commitDeadline: number;
  revealDeadline: number;
  totalCommitments: number;
  totalRevealed: number;
  clearingPrice?: string;
}
