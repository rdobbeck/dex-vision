import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteItem {
  chainId: string;
  pairAddress: string;
  symbol: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (pairAddress: string) => void;
  isFavorite: (pairAddress: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) =>
        set((state) => ({
          favorites: [...state.favorites, item],
        })),
      removeFavorite: (pairAddress) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (f) => f.pairAddress !== pairAddress
          ),
        })),
      isFavorite: (pairAddress) =>
        get().favorites.some((f) => f.pairAddress === pairAddress),
    }),
    { name: "dex-vision-favorites" }
  )
);
