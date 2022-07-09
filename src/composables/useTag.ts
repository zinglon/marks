import { Ref, ref } from "vue";

import { BookmarkService } from "../services/bookmark";
import { Bookmark } from "../types";
import { assertIsDefined } from "../utils/assertIsDefined";
import { withSetup } from "../utils/testHelpers";

export const useTag = (
  bookmarkService: BookmarkService,
  selectedBookmark: Ref<Bookmark | undefined>
) => {
  const tagInput = ref<string>("");
  const tagOptions = ref<string[]>([]);
  const getTagOptions = () => (tagOptions.value = bookmarkService.getAllTags());

  const clearTagInput = () => (tagInput.value = "");

  const addTag = () => {
    assertIsDefined(selectedBookmark.value);
    const value = tagInput.value?.trim();
    if (value) {
      if (!selectedBookmark.value.tags) selectedBookmark.value.tags = [];
      if (!selectedBookmark.value.tags.includes(value))
        selectedBookmark.value.tags.push(value);
      clearTagInput();
    }
  };
  const removeTag = (tag: string) => {
    assertIsDefined(selectedBookmark.value);
    selectedBookmark.value.tags = selectedBookmark.value.tags?.filter(
      (t) => t !== tag
    );
  };

  return {
    addTag,
    clearTagInput,
    getTagOptions,
    removeTag,
    tagInput,
    tagOptions,
  };
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;
  describe("useTag", () => {
    describe("addTag", () => {
      it("adds the trimmed tag value to the selectedBookmark's tag list and clears the tag input", () => {
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
          id: "",
          isFavorite: false,
          tags: [],
          title: "",
          url: "",
        });
        const { composable } = withSetup(() =>
          useTag(bookmarkService, selectedBookmark)
        );
        composable.tagInput.value = " tag ";
        composable.addTag();
        expect(selectedBookmark.value?.tags).toEqual(["tag"]);
      });
    });
    describe("clearTagInput", () => {
      it("clears the tag input", () => {
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
          useTag(bookmarkService, selectedBookmark)
        );
        composable.tagInput.value = "tag";
        composable.clearTagInput();
        expect(composable.tagInput.value).toEqual("");
      });
    });
    describe("getTagOptions", () => {
      it("calls getAllTags and sets tagOptions to the result", () => {
        const getAllTags = vi.fn().mockReturnValue(["tag"]);
        const bookmarkService: BookmarkService = {
          createBookmark: vi.fn(),
          getAllTags: getAllTags,
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
          useTag(bookmarkService, selectedBookmark)
        );
        composable.getTagOptions();
        expect(getAllTags).toHaveBeenCalled();
        expect(composable.tagOptions.value).toEqual(["tag"]);
      });
    });
    describe("removeTag", () => {
      it("removes the tag from the selectedBookmark's tag list", () => {
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
          id: "",
          isFavorite: false,
          tags: ["tag"],
          title: "",
          url: "",
        });
        const { composable } = withSetup(() =>
          useTag(bookmarkService, selectedBookmark)
        );
        composable.removeTag("tag");
        expect(selectedBookmark.value.tags).toEqual([]);
      });
    });
  });
}
