import { nextTick, onMounted, ref, watch } from "vue";

import { BookmarkService } from "../services/bookmark";
import { Bookmark } from "../types";
import { withSetup } from "../utils/testHelpers";

export const useBookmarkList = (bookmarkService: BookmarkService) => {
  const isSorting = ref(false);
  const toggleSort = () => (isSorting.value = !isSorting.value);

  const isFiltering = ref(false);
  const toggleFilter = () => (isFiltering.value = !isFiltering.value);

  const searchString = ref<string>();
  const bookmarks = ref<Bookmark[]>([]);
  const getBookmarks = async () =>
    (bookmarks.value = await bookmarkService.getBookmarks(
      searchString.value,
      isSorting.value,
      isFiltering.value
    ));

  onMounted(async () => await getBookmarks());

  watch(
    [searchString, isSorting, isFiltering],
    async () => await getBookmarks()
  );
  const toggleFavorite = async (bookmarkId: string) => {
    bookmarkService.toggleFavorite(bookmarkId);
    await getBookmarks();
  };
  const go = () => {
    if (bookmarks.value.length && bookmarks.value[0].url)
      window.location.href = bookmarks.value[0].url;
  };
  return {
    bookmarks,
    getBookmarks,
    go,
    isFiltering,
    isSorting,
    searchString,
    toggleFavorite,
    toggleFilter,
    toggleSort,
  };
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;
  describe("useBookmarkList", () => {
    it("calls getBookmarks onMounted", () => {
      const getBookmarks = vi.fn();
      const bookmarkService: BookmarkService = {
        createBookmark: vi.fn(),
        getAllTags: vi.fn(),
        getBookmark: vi.fn(),
        getBookmarks: getBookmarks,
        getSupportedProtocols: vi.fn(),
        removeBookmark: vi.fn(),
        toggleFavorite: vi.fn(),
        updateBookmark: vi.fn(),
      };
      withSetup(() => useBookmarkList(bookmarkService));
      expect(getBookmarks).toHaveBeenCalled();
    });
    it("calls getBookmarks if searchString, isSorting, or isFiltering changes", async () => {
      const getBookmarks = vi.fn();
      const bookmarkService: BookmarkService = {
        createBookmark: vi.fn(),
        getAllTags: vi.fn(),
        getBookmark: vi.fn(),
        getBookmarks: getBookmarks,
        getSupportedProtocols: vi.fn(),
        removeBookmark: vi.fn(),
        toggleFavorite: vi.fn(),
        updateBookmark: vi.fn(),
      };
      const { composable } = withSetup(() => useBookmarkList(bookmarkService));
      getBookmarks.mockReset();

      composable.searchString.value = "test";
      await nextTick();

      expect(getBookmarks).toHaveBeenCalledTimes(1);
    });
    describe("getBookmarks", () => {
      it("calls getBookmarks for the current search parameters and set bookmarks to the value of the result", async () => {
        const bookmarks = [
          {
            id: "1",
            isFavorite: false,
            tags: ["test"],
            title: "test",
            url: "https://example.com",
          },
        ];
        const getBookmarks = vi.fn().mockReturnValue(bookmarks);
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: getBookmarks,
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const { composable } = withSetup(() =>
          useBookmarkList(bookmarkService)
        );

        composable.searchString.value = "test";
        composable.isSorting.value = true;
        composable.isFiltering.value = true;

        composable.getBookmarks();
        await nextTick();

        expect(getBookmarks).toHaveBeenCalledWith("test", true, true);
        expect(composable.bookmarks.value).toEqual(bookmarks);
      });
    });
    describe("go", () => {
      it("navigates to the url of the first bookmark in the list", async () => {
        const bookmarks = [
          {
            id: "1",
            isFavorite: false,
            tags: ["test"],
            title: "test",
            url: "https://example.com",
          },
        ];
        const getBookmarks = vi.fn().mockReturnValue(bookmarks);
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: getBookmarks,
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const { composable } = withSetup(() =>
          useBookmarkList(bookmarkService)
        );

        composable.searchString.value = "test";
        composable.isSorting.value = true;
        composable.isFiltering.value = true;

        // yeehaw 🤠
        // eslint-disable-next-line
        // @ts-ignore
        delete window.location;
        window.location = { href: "" } as Location;
        await nextTick();

        composable.go();

        expect(window.location.href).toEqual(bookmarks[0].url);
      });
    });
    describe("toggleFavorite", () => {
      it("calls toggleFavorite for the given bookmarkId and refreshes the bookmarks list", () => {
        const bookmarks = [
          {
            id: "1",
            isFavorite: false,
            tags: ["test"],
            title: "test",
            url: "https://example.com",
          },
        ];
        const toggleFavorite = vi.fn();
        const getBookmarks = vi.fn().mockReturnValue(bookmarks);
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: getBookmarks,
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: toggleFavorite,
          updateBookmark: vi.fn(),
        };
        const { composable } = withSetup(() =>
          useBookmarkList(bookmarkService)
        );
        getBookmarks.mockReset();

        composable.toggleFavorite(bookmarks[0].id);
        expect(toggleFavorite).toHaveBeenCalledWith(bookmarks[0].id);
        expect(getBookmarks).toHaveBeenCalled();
      });
    });
    describe("toggleFilter", () => {
      it("toggles isFiltering", () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const { composable } = withSetup(() =>
          useBookmarkList(bookmarkService)
        );
        expect(composable.isFiltering.value).toBe(false);
        composable.toggleFilter();
        expect(composable.isFiltering.value).toBe(true);
      });
    });
    describe("toggleSort", () => {
      it("toggles isSorting", () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const { composable } = withSetup(() =>
          useBookmarkList(bookmarkService)
        );
        expect(composable.isSorting.value).toBe(false);
        composable.toggleSort();
        expect(composable.isSorting.value).toBe(true);
      });
    });
  });
}
