import { onMounted, ref, watch } from "vue";
import { BookmarkDataAccessor } from "../services/bookmarks";
import { Bookmark } from "../types";

export const useBookmarkList = (bookmarkData: BookmarkDataAccessor) => {
  const searchString = ref<string>();
  const bookmarks = ref<Bookmark[]>([]);
  const getBookmarks = async () =>
    (bookmarks.value = await bookmarkData.getBookmarks(
      searchString.value,
      isSorting.value,
      isFiltering.value
    ));

  onMounted(async () => await getBookmarks());

  const isSorting = ref(false);
  const toggleSort = () => (isSorting.value = !isSorting.value);

  const isFiltering = ref(false);
  const toggleFilter = () => (isFiltering.value = !isFiltering.value);

  watch(
    [searchString, isSorting, isFiltering],
    async () => await getBookmarks()
  );
  const toggleFavorite = async (bookmarkId: string) => {
    bookmarkData.toggleFavorite(bookmarkId);
    await getBookmarks();
  };
  const go = () => {
    if (bookmarks.value.length && bookmarks.value[0].url)
      window.location.href = bookmarks.value[0].url;
  };
  return {
    searchString,
    bookmarks,
    isSorting,
    isFiltering,
    getBookmarks,
    toggleSort,
    toggleFilter,
    toggleFavorite,
    go,
  };
};
