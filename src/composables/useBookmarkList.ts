import { onMounted, ref, watch } from "vue";

import { BookmarkService } from "../services/bookmark";
import { Bookmark } from "../types";

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
