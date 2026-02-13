import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChainState {
  selectedChain: string | null;
  setSelectedChain: (chain: string | null) => void;
}

export const useChainStore = create<ChainState>()(
  persist(
    (set) => ({
      selectedChain: null,
      setSelectedChain: (chain) => set({ selectedChain: chain }),
    }),
    { name: "dex-vision-chain" }
  )
);
