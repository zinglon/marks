import { BookmarkData, bookmarkData } from "../data/bookmark";
import { FavoriteService, favoriteService } from "../services/favorite";
import { TagService, tagService } from "../services/tag";
import { Bookmark, NewBookmark } from "../types";
import { byProperty } from "../utils/compare";
import { TabService, tabService } from "./tab";

export const createBookmarkService = (
  bookmarkData: BookmarkData,
  tagService: TagService,
  favoriteService: FavoriteService,
  tabService: TabService
) => {
  const getSearchItems = (bookmark: Bookmark) =>
    [bookmark.title, bookmark.url, ...(bookmark.tags ?? [])].map((item) =>
      item.trim().toLowerCase()
    );

  const applySearch = (bookmarks: Bookmark[], search?: string) =>
    search
      ? bookmarks.filter((bookmark) =>
          getSearchItems(bookmark).some((item) =>
            item.includes(search?.toLowerCase())
          )
        )
      : bookmarks;

  const applyFilters = (bookmarks: Bookmark[], isFiltering: boolean) =>
    bookmarks.filter((bookmark) =>
      isFiltering ? favoriteService.isFavorite(bookmark.id) : true
    );

  const applySort = (bookmarks: Bookmark[], isSorting: boolean) =>
    [...bookmarks].sort(byProperty("title", isSorting));

  const getBookmarks = async (
    search?: string,
    isSorting?: boolean,
    isFiltering?: boolean
  ) => {
    const bookmarkItems = (await bookmarkData.getBookmarks()).map(
      (bookmark) => ({
        ...bookmark,
        isFavorite: favoriteService.isFavorite(bookmark.id),
        tags: tagService.getTagsForBookmark(bookmark.id) ?? [],
        title: bookmark.title ? bookmark.title : "[No Title]",
      })
    );
    const searchResults = applySearch(bookmarkItems, search);
    const filteredBookmarks = applyFilters(searchResults, !!isFiltering);
    const sortedBookmarks = applySort(filteredBookmarks, !!isSorting);
    return sortedBookmarks;
  };

  const getBookmark = async (bookmarkId: string) => {
    const bookmark = await bookmarkData.getBookmark(bookmarkId);
    return {
      ...bookmark,
      isFavorite: favoriteService.isFavorite(bookmark.id),
      tags: tagService.getTagsForBookmark(bookmark.id),
    };
  };

  const createBookmark = async (bookmark: NewBookmark) => {
    const { id, title, url } = await bookmarkData.createBookmark(bookmark);
    if (bookmark.isFavorite) favoriteService.addFavorite(id);
    if (bookmark.tags) tagService.setTags(id, bookmark.tags);
    return {
      id,
      isFavorite: bookmark.isFavorite,
      tags: bookmark.tags,
      title,
      url,
    };
  };

  const updateBookmark = async (bookmark: Bookmark) => {
    const result = await bookmarkData.updateBookmark(bookmark);
    bookmark.isFavorite
      ? favoriteService.addFavorite(bookmark.id)
      : favoriteService.removeFavorite(bookmark.id);
    tagService.setTags(bookmark.id, bookmark.tags ?? []);
    return result;
  };

  const removeBookmark = async (bookmarkId: string) => {
    await bookmarkData.removeBookmark(bookmarkId);
    favoriteService.removeFavorite(bookmarkId);
    tagService.setTags(bookmarkId);
  };

  const getSupportedProtocols = () => bookmarkData.getSupportedProtocols();

  const openBookmark = async (bookmark: Bookmark) =>
    await tabService.openTab(bookmark.url, bookmark.isReaderMode);

  return {
    createBookmark,
    getAllTags: tagService.getAllTags,
    getBookmark,
    getBookmarks,
    getSupportedProtocols,
    openBookmark,
    removeBookmark,
    toggleFavorite: favoriteService.toggleFavorite,
    updateBookmark,
  };
};

export const bookmarkService = createBookmarkService(
  bookmarkData,
  tagService,
  favoriteService,
  tabService
);
export type BookmarkService = typeof bookmarkService;

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("createBookmarkService", () => {
    describe("createBookmark", () => {
      it("creates a bookmark for the provided bookmark data and returns the result", async () => {
        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmark = {
          isFavorite: true,
          tags: ["test", "bookmark"],
          title: "Test Bookmark",
          url: "https://example.com",
        };

        const bookmarkData = {
          createBookmark: vi.fn().mockReturnValue({ ...bookmark, id: "1" }),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.createBookmark(bookmark);
        expect(bookmarkData.createBookmark).toHaveBeenCalledWith(bookmark);
        expect(favoriteService.addFavorite).toHaveBeenCalledWith(result.id);
        expect(tagService.setTags).toHaveBeenCalledWith(
          result.id,
          bookmark.tags
        );
        expect(result).toEqual({ ...bookmark, id: "1" });
      });
    });
    describe("getBookmark", () => {
      it("returns the bookmark for the provided bookmark id", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["test", "bookmark"],
          title: "Test Bookmark",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn().mockReturnValue(bookmark.tags),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn().mockReturnValue({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
          }),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmark(bookmark.id);
        expect(result).toEqual(bookmark);
      });
    });
    describe("getBookmarks", () => {
      it("returns bookmarks that match on url", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["tag"],
          title: "Title",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn().mockReturnValue(bookmark.tags),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn().mockReturnValue([bookmark]),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmarks("exa");
        expect(result).toEqual([bookmark]);
      });
      it("returns bookmarks that match on tag", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["tag"],
          title: "Title",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn().mockReturnValue(bookmark.tags),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn().mockReturnValue([bookmark]),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmarks("ta");
        expect(result).toEqual([bookmark]);
      });
      it("returns bookmarks that match on title", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["tag"],
          title: "Title",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn().mockReturnValue(bookmark.tags),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn().mockReturnValue([bookmark]),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmarks("tit");
        expect(result).toEqual([bookmark]);
      });
      it("applies sort", async () => {
        const bookmark1 = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "A",
          url: "https://example.com",
        };
        const bookmark2 = {
          id: "2",
          isFavorite: false,
          tags: [],
          title: "Z",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(false),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn().mockReturnValue([bookmark1, bookmark2]),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmarks(undefined, true);
        expect(result).toEqual([bookmark2, bookmark1]);
      });
      it("applies filter", async () => {
        const bookmark = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "A",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn().mockReturnValue([bookmark]),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = await bookmarkService.getBookmarks(
          undefined,
          undefined,
          true
        );
        expect(result).toEqual([]);
      });
    });
    describe("getSupportedProtocols", () => {
      it("returns supported protocols", () => {
        const supportProtocols = ["https", "http"];

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(supportProtocols),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        const result = bookmarkService.getSupportedProtocols();
        expect(result).toEqual(supportProtocols);
      });
    });
    describe("openBookmark", () => {
      it("calls openTab", async () => {
        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const openTab = vi.fn();
        const tabService = {
          openTab: openTab,
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        await bookmarkService.openBookmark({
          id: "1",
          isFavorite: false,
          tags: [],
          title: "A",
          url: "https://example.com",
        });
        expect(openTab).toHaveBeenCalled();
      });
    });
    describe("removeBookmark", () => {
      it("removes bookmark and corresponding favorite and tag data", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["tag"],
          title: "Title",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn(),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        await bookmarkService.removeBookmark(bookmark.id);
        expect(bookmarkData.removeBookmark).toHaveBeenCalledWith(bookmark.id);
        expect(favoriteService.removeFavorite).toHaveBeenCalledWith(
          bookmark.id
        );
        expect(tagService.setTags).toHaveBeenCalledWith(bookmark.id);
      });
    });
    describe("updateBookmark", () => {
      it("updates bookmark and corresponding favorite and tag data", async () => {
        const bookmark = {
          id: "1",
          isFavorite: true,
          tags: ["tag"],
          title: "Title",
          url: "https://example.com",
        };

        const tagService = {
          getAllTags: vi.fn(),
          getTagsForBookmark: vi.fn(),
          setTags: vi.fn().mockReturnValue(bookmark.tags),
        };
        const favoriteService = {
          addFavorite: vi.fn(),
          isFavorite: vi.fn().mockReturnValue(bookmark.isFavorite),
          removeFavorite: vi.fn(),
          toggleFavorite: vi.fn(),
        };

        const bookmarkData = {
          createBookmark: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          updateBookmark: vi.fn().mockReturnValue(bookmark),
        };

        const bookmarkService = createBookmarkService(
          bookmarkData,
          tagService,
          favoriteService,
          tabService
        );

        await bookmarkService.updateBookmark(bookmark);
        expect(bookmarkData.updateBookmark).toHaveBeenCalledWith(bookmark);
        expect(favoriteService.addFavorite).toHaveBeenCalledWith(bookmark.id);
        expect(tagService.setTags).toHaveBeenCalledWith(
          bookmark.id,
          bookmark.tags
        );
      });
    });
  });
}
