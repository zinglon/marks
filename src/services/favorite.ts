import { FavoriteData, favoriteData } from "../data/favorite";

export const createFavoriteService = (favoriteData: FavoriteData) => {
  const addFavorite = (bookmarkId: string) => {
    const f = favoriteData.getFavorites();
    f.push(bookmarkId);
    favoriteData.setFavorites(f);
  };
  const removeFavorite = (bookmarkId: string) => {
    const f = favoriteData.getFavorites();
    favoriteData.setFavorites(f.filter((id) => id !== bookmarkId));
  };
  const isFavorite = (bookmarkId: string) =>
    favoriteData.getFavorites().some((id) => id === bookmarkId);

  const toggleFavorite = (bookmarkId: string) => {
    isFavorite(bookmarkId)
      ? removeFavorite(bookmarkId)
      : addFavorite(bookmarkId);
  };
  return {
    addFavorite,
    isFavorite,
    removeFavorite,
    toggleFavorite,
  };
};

export const favoriteService = createFavoriteService(favoriteData);
export type FavoriteService = typeof favoriteService;

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("createFavoriteService", () => {
    describe("addFavorite", () => {
      it("adds the provided bookmarkId to the favorites list", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue([]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        favoriteService.addFavorite(bookmarkId);
        expect(favoriteData.setFavorites).toHaveBeenCalledWith([bookmarkId]);
      });
    });
    describe("removeFavorite", () => {
      it("removes the provided bookmarkId from the favorites list", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue(["1", "2"]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        favoriteService.removeFavorite(bookmarkId);
        expect(favoriteData.setFavorites).toHaveBeenCalledWith(["2"]);
      });
    });
    describe("isFavorite", () => {
      it("returns true if the provided bookmarkId is in the favorites list", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue(["1", "2"]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        expect(favoriteService.isFavorite(bookmarkId)).toBe(true);
      });
      it("returns false if the provided bookmarkId is not in the favorites list", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue(["2"]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        expect(favoriteService.isFavorite(bookmarkId)).toBe(false);
      });
    });
    describe("toggleFavorite", () => {
      it("adds the provided bookmark to the favorites list if it is not a favorite", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue(["2"]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        favoriteService.toggleFavorite(bookmarkId);
        expect(favoriteData.setFavorites).toHaveBeenCalledWith(["2", "1"]);
      });
      it("removes the provided bookmark from the favorites list if it is a favorite", () => {
        const bookmarkId = "1";
        const favoriteData: FavoriteData = {
          getFavorites: vi.fn().mockReturnValue(["1", "2"]),
          setFavorites: vi.fn(),
        };
        const favoriteService = createFavoriteService(favoriteData);
        favoriteService.toggleFavorite(bookmarkId);
        expect(favoriteData.setFavorites).toHaveBeenCalledWith(["2"]);
      });
    });
  });
}
