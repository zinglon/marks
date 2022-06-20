import { favorites } from "../data/favorites";

export const addFavorite = (bookmarkId: string) => {
  const f = favorites.getFavorites();
  f.push(bookmarkId);
  favorites.setFavorites(f);
};
export const removeFavorite = (bookmarkId: string) => {
  const f = favorites.getFavorites();
  favorites.setFavorites(f.filter((id) => id !== bookmarkId));
};
export const isFavorite = (bookmarkId: string) =>
  favorites.getFavorites().some((id) => id === bookmarkId);

export const toggleFavorite = (bookmarkId: string) => {
  isFavorite(bookmarkId) ? removeFavorite(bookmarkId) : addFavorite(bookmarkId);
};
