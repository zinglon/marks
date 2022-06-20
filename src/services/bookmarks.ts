import { Bookmark } from "../types";
import * as favorites from "../services/favorites";
import * as tags from "../services/tags";
import * as bookmarksApi from "../data/bookmarks";

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
    isFiltering ? favorites.isFavorite(bookmark.id) : true
  );

type SortableProperty<T> = keyof {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

const sortAscending = (
  a: Bookmark,
  b: Bookmark,
  by: SortableProperty<Bookmark>
) => a[by].localeCompare(b[by]);

const sortDescending = (
  a: Bookmark,
  b: Bookmark,
  by: SortableProperty<Bookmark>
) => b[by].localeCompare(a[by]);

const applySort = (bookmarks: Bookmark[], isSorting: boolean) =>
  [...bookmarks].sort((a, b) =>
    isSorting ? sortDescending(a, b, "title") : sortAscending(a, b, "title")
  );

const getBookmarks = async (
  search?: string,
  isSorting?: boolean,
  isFiltering?: boolean
) => {
  const bookmarkItems = (await bookmarksApi.getBookmarks()).map((bookmark) => ({
    ...bookmark,
    title: bookmark.title ? bookmark.title : "[No Title]",
    isFavorite: favorites.isFavorite(bookmark.id),
    tags: tags.getTagsForBookmark(bookmark.id) ?? [],
  }));
  const searchResults = applySearch(bookmarkItems, search);
  const filteredBookmarks = applyFilters(searchResults, !!isFiltering);
  const sortedBookmarks = applySort(filteredBookmarks, !!isSorting);
  return sortedBookmarks;
};

const getBookmark = async (bookmarkId: string) => {
  const bookmark = await bookmarksApi.getBookmark(bookmarkId);
  return {
    ...bookmark,
    isFavorite: favorites.isFavorite(bookmark.id),
    tags: tags.getTagsForBookmark(bookmark.id),
  };
};

const createBookmark = async (bookmark: Bookmark) => {
  const { id, title, url } = await bookmarksApi.createBookmark(bookmark);
  if (bookmark.isFavorite) favorites.addFavorite(id);
  if (bookmark.tags) tags.setTags(id, bookmark.tags);
  return {
    id,
    title,
    url,
    isFavorite: bookmark.isFavorite,
    tags: bookmark.tags,
  };
};

const updateBookmark = async (bookmark: Bookmark) => {
  const result = await bookmarksApi.updateBookmark(bookmark);
  bookmark.isFavorite
    ? favorites.addFavorite(bookmark.id)
    : favorites.removeFavorite(bookmark.id);
  tags.setTags(bookmark.id, bookmark.tags ?? []);
  return result;
};

const removeBookmark = async (bookmarkId: string) => {
  await bookmarksApi.removeBookmark(bookmarkId);
  favorites.removeFavorite(bookmarkId);
  tags.setTags(bookmarkId);
};

const getSupportedProtocols = () => bookmarksApi.getSupportedProtocols();

export const bookmarks = {
  getBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  removeBookmark,
  getSupportedProtocols,
  getAllTags: tags.getAllTags,
  toggleFavorite: favorites.toggleFavorite,
};

export type BookmarkDataAccessor = typeof bookmarks;
