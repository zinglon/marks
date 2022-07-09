import { nextTick, onMounted, Ref, ref, watch } from "vue";

import { BookmarkService } from "../services/bookmark";
import { Bookmark } from "../types";
import { assertIsDefined } from "../utils/assertIsDefined";
import { withSetup } from "../utils/testHelpers";

export const useBookmarkEditor = (
  bookmarkService: BookmarkService,
  selectedBookmark: Ref<Bookmark | undefined>,
  getBookmarks: () => Promise<Bookmark[]>,
  getTagOptions: () => string[],
  clearTagInput: () => void
) => {
  const editBookmark = async (bookmarkId: string) => {
    selectedBookmark.value =
      bookmarkId === selectedBookmark.value?.id
        ? undefined
        : await bookmarkService.getBookmark(bookmarkId);
    clearTagInput();
    getTagOptions();
  };

  const supportedProtocols = ref<string[]>([]);
  onMounted(
    () => (supportedProtocols.value = bookmarkService.getSupportedProtocols())
  );

  const hasError = (bookmark: Bookmark) =>
    supportedProtocols.value.some((protocol) =>
      bookmark.url?.startsWith(protocol)
    )
      ? undefined
      : `URL must start with ` + supportedProtocols.value.join(", ");

  const error = ref<string>();
  watch(selectedBookmark, () => (error.value = undefined), { deep: true });

  const save = async () => {
    assertIsDefined(selectedBookmark.value);
    error.value = hasError(selectedBookmark.value);
    if (!error.value) {
      try {
        if (selectedBookmark.value.id)
          await bookmarkService.updateBookmark(selectedBookmark.value);
        else
          selectedBookmark.value = await bookmarkService.createBookmark(
            selectedBookmark.value
          );
      } catch (err) {
        error.value = "Something went wrong";
      }
    }
    await getBookmarks();
  };

  const confirmation = ref(false);
  const remove = async () => {
    assertIsDefined(selectedBookmark.value);
    await bookmarkService.removeBookmark(selectedBookmark.value.id);
    selectedBookmark.value = undefined;
    confirmation.value = false;
    await getBookmarks();
  };

  const addBookmark = () =>
    (selectedBookmark.value = {
      id: "",
      isFavorite: false,
      isReaderMode: false,
      tags: [],
      title: "",
      url: "",
    });

  const setConfirmation = (value: boolean) => (confirmation.value = value);

  const setSelectedBookmark = (bookmark?: Bookmark) =>
    (selectedBookmark.value = bookmark);

  const isEditing = (bookmarkId: string) =>
    bookmarkId === selectedBookmark.value?.id;

  return {
    addBookmark,
    confirmation,
    editBookmark,
    error,
    isEditing,
    remove,
    save,
    selectedBookmark,
    setConfirmation,
    setSelectedBookmark,
  };
};

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("useBookmarkEditor", () => {
    it("clears error if selectedBookmark changes", async () => {
      const bookmarkService: BookmarkService = {
        createBookmark: vi.fn(),
        getAllTags: vi.fn(),
        getBookmark: vi.fn(),
        getBookmarks: vi.fn(),
        getSupportedProtocols: vi.fn(),
        openBookmark: vi.fn(),
        removeBookmark: vi.fn(),
        toggleFavorite: vi.fn(),
        updateBookmark: vi.fn(),
      };

      const selectedBookmark = ref<Bookmark>({
        id: "1",
        isFavorite: false,
        tags: [],
        title: "Title",
        url: "https://www.example.com",
      });
      const { composable } = withSetup(() =>
        useBookmarkEditor(
          bookmarkService,
          selectedBookmark,
          vi.fn(),
          vi.fn(),
          vi.fn()
        )
      );
      composable.error.value = "error";
      assertIsDefined(composable.selectedBookmark.value);
      composable.selectedBookmark.value.title = "Title2";
      await nextTick();
      expect(composable.error.value).toEqual(undefined);
    });
    describe("addBookmark", () => {
      it("populates selectedBookmark", () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const selectedBookmark = ref<Bookmark>();
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        composable.addBookmark();
        expect(selectedBookmark.value).toEqual({
          id: "",
          isFavorite: false,
          isReaderMode: false,
          tags: [],
          title: "",
          url: "",
        });
      });
    });
    describe("editBookmark", () => {
      it("unsets selectedBookmark if it is set", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const selectedBookmark = ref<Bookmark>({
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        });
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );

        await composable.editBookmark("1");
        expect(selectedBookmark.value).toBeUndefined();
      });
      it("sets the selectedBookmark if it is not currently set", async () => {
        const bookmark = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        };

        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn().mockReturnValue(bookmark),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const selectedBookmark = ref<Bookmark>();
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );

        await composable.editBookmark("1");
        expect(selectedBookmark.value).toEqual(bookmark);
      });
      it("calls clearTagInput", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const selectedBookmark = ref<Bookmark>();
        const clearTagInput = vi.fn();
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            clearTagInput
          )
        );

        await composable.editBookmark("1");
        expect(clearTagInput).toHaveBeenCalled();
      });
      it("calls getTagOptions", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };

        const selectedBookmark = ref<Bookmark>();
        const getTagOptions = vi.fn();
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            getTagOptions,
            vi.fn()
          )
        );

        await composable.editBookmark("1");
        expect(getTagOptions).toHaveBeenCalled();
      });
    });
    describe("remove", () => {
      it("calls remove bookmark, resets selectedBookmark, resets confirmation, and gets latest bookmarks", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn(),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const getBookmarks = vi.fn();
        const bookmark = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        };
        const selectedBookmark = ref<Bookmark>();
        selectedBookmark.value = bookmark;
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            getBookmarks,
            vi.fn(),
            vi.fn()
          )
        );
        await composable.remove();
        expect(bookmarkService.removeBookmark).toHaveBeenCalledWith(
          bookmark.id
        );
        expect(selectedBookmark.value).toBeUndefined();
        expect(composable.confirmation.value).toBe(false);
        expect(getBookmarks).toHaveBeenCalled();
      });
    });
    describe("save", () => {
      it("sets error if the bookmark fails validation", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(["https"]),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const bookmark = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "bad://www.example.com",
        };
        const selectedBookmark = ref<Bookmark>();
        selectedBookmark.value = bookmark;
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        await composable.save();
        expect(composable.error.value).toBeDefined();
      });
      it("calls update bookmark if the bookmark already exists", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(["https"]),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const bookmark = {
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        };
        const selectedBookmark = ref<Bookmark>();
        selectedBookmark.value = bookmark;
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        await composable.save();
        expect(bookmarkService.updateBookmark).toHaveBeenCalled();
      });
      it("calls create bookmark if it is a new bookmark", async () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(["https"]),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const bookmark = {
          id: "",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        };
        const selectedBookmark = ref<Bookmark>();
        selectedBookmark.value = bookmark;
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        await composable.save();
        expect(bookmarkService.createBookmark).toHaveBeenCalled();
      });
    });
    describe("setConfirmation", () => {
      it("sets confirmation", () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(["https"]),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const selectedBookmark = ref<Bookmark>();
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        composable.setConfirmation(true);
        expect(composable.confirmation.value).toBe(true);
      });
    });
    describe("setSelectedBookmark", () => {
      it("sets selectedBookmark", () => {
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: vi.fn(),
          getBookmark: vi.fn(),
          getBookmarks: vi.fn(),
          getSupportedProtocols: vi.fn().mockReturnValue(["https"]),
          openBookmark: vi.fn(),
          removeBookmark: vi.fn(),
          toggleFavorite: vi.fn(),
          updateBookmark: vi.fn(),
        };
        const selectedBookmark = ref<Bookmark>({
          id: "1",
          isFavorite: false,
          tags: [],
          title: "Title",
          url: "https://www.example.com",
        });
        const { composable } = withSetup(() =>
          useBookmarkEditor(
            bookmarkService,
            selectedBookmark,
            vi.fn(),
            vi.fn(),
            vi.fn()
          )
        );
        composable.setSelectedBookmark(undefined);
        expect(composable.selectedBookmark.value).toBeUndefined();
      });
    });
  });
}
