import * as bookmarksApi from "../data/bookmarks";
import * as favorites from "../services/favorites";
import * as tags from "../services/tags";
import { Bookmark } from "../types";
import { byProperty } from "../utils/compare";

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

const applySort = (bookmarks: Bookmark[], isSorting: boolean) =>
  [...bookmarks].sort(byProperty<Bookmark>("title", isSorting));

const getBookmarks = async (
  search?: string,
  isSorting?: boolean,
  isFiltering?: boolean
) => {
  const bookmarkItems = (await bookmarksApi.getBookmarks()).map((bookmark) => ({
    ...bookmark,
    isFavorite: favorites.isFavorite(bookmark.id),
    tags: tags.getTagsForBookmark(bookmark.id) ?? [],
    title: bookmark.title ? bookmark.title : "[No Title]",
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
    isFavorite: bookmark.isFavorite,
    tags: bookmark.tags,
    title,
    url,
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
  createBookmark,
  getAllTags: tags.getAllTags,
  getBookmark,
  getBookmarks,
  getSupportedProtocols,
  removeBookmark,
  toggleFavorite: favorites.toggleFavorite,
  updateBookmark,
};

export type BookmarkDataAccessor = typeof bookmarks;
