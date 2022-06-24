import { onMounted, Ref, ref, watch } from "vue";

import { BookmarkDataAccessor } from "../services/bookmarks";
import { Bookmark } from "../types";

export const useBookmarkEditor = (
  bookmarkData: BookmarkDataAccessor,
  selectedBookmark: Ref<Bookmark | undefined>,
  getBookmarks: () => Promise<Bookmark[]>,
  getTagOptions: () => string[],
  clearTagInput: () => void
) => {
  const editBookmark = async (bookmarkId: string) => {
    selectedBookmark.value =
      bookmarkId === selectedBookmark.value?.id
        ? undefined
        : await bookmarkData.getBookmark(bookmarkId);
    clearTagInput();
    getTagOptions();
  };

  const supportedProtocols = ref<string[]>([]);
  onMounted(
    async () =>
      (supportedProtocols.value = bookmarkData.getSupportedProtocols())
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
    if (!selectedBookmark.value) return;
    error.value = hasError(selectedBookmark.value);
    if (!error.value) {
      try {
        if (selectedBookmark.value.id)
          await bookmarkData.updateBookmark(selectedBookmark.value);
        else
          selectedBookmark.value = await bookmarkData.createBookmark(
            selectedBookmark.value
          );
      } catch (err) {
        error.value = "Something went wrong";
      }
    }
    await getBookmarks();
  };

  const remove = async () => {
    if (!selectedBookmark.value) return;
    await bookmarkData.removeBookmark(selectedBookmark.value.id);
    selectedBookmark.value = undefined;
    confirmation.value = false;
    await getBookmarks();
  };

  const addBookmark = () =>
    (selectedBookmark.value = {
      id: "",
      isFavorite: false,
      tags: [],
      title: "",
      url: "",
    });

  const confirmation = ref(false);
  return {
    addBookmark,
    confirmation,
    editBookmark,
    error,
    remove,
    save,
    selectedBookmark,
  };
};
