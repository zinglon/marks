import { Bookmark, ThemeOption } from "../types";

/**
 * Bookmarks
 */

// Filters
const isBookmark = (bookmark: Bookmark) => bookmark.type === "bookmark";
const hasTitle = (bookmark: Bookmark) => bookmark.title;

// Sorts
const sortAscending = (a: Bookmark, b: Bookmark) =>
  a.title.localeCompare(b.title);
const sortDescending = (a: Bookmark, b: Bookmark) =>
  b.title.localeCompare(a.title);

const getBookmarks = async (
  search?: string,
  isSorting?: boolean,
  isFiltering?: boolean
) => {
  // Get
  const bookmarkItems = (await browser.bookmarks.search({})).map(
    (bookmark) => ({
      ...bookmark,
      isFavorite: isFavorite(bookmark.id),
      tags: getTagsForBookmark(bookmark.id) ?? [],
    })
  );

  // Search
  const searchResults: Bookmark[] = search
    ? bookmarkItems.filter((bookmark) => {
        const itemsToMatch = [
          bookmark.title.toLowerCase(),
          bookmark.url?.toLowerCase() ?? "",
          ...bookmark.tags.map((tag) => tag.toLowerCase()),
        ];

        const searchTerm = search?.toLowerCase();
        const isMatch = itemsToMatch.some((item) => item.includes(searchTerm));
        return isMatch;
      })
    : bookmarkItems;

  // Filter
  const filters = [isBookmark, hasTitle];
  if (isFiltering)
    filters.push((bookmark: Bookmark) => isFavorite(bookmark.id));
  const filteredBookmarks = searchResults.filter((item) =>
    filters.every((filter) => filter(item))
  );

  // Sort
  return filteredBookmarks.sort(isSorting ? sortDescending : sortAscending);
};

const getBookmark = async (bookmarkId: string) => {
  const { id, title, url } = (await browser.bookmarks.get(bookmarkId))[0];
  return {
    id,
    title,
    url,
    isFavorite: isFavorite(id),
    tags: getTagsForBookmark(id),
  };
};

const getSupportedProtocols = () => [
  "https://",
  "http://",
  "ftp://",
  "file://",
];

const updateBookmark = async (bookmark: Bookmark) => {
  const result = await browser.bookmarks.update(bookmark.id, {
    title: bookmark.title,
    url: bookmark.url ?? "",
  });
  bookmark.isFavorite ? addFavorite(bookmark.id) : removeFavorite(bookmark.id);
  bookmark.tags?.forEach((tag) => addTag(bookmark.id, tag));
  return result;
};

const createBookmark = async (bookmark: Bookmark) => {
  const { id, title, url } = await browser.bookmarks.create({
    title: bookmark.title,
    url: bookmark.url,
  });
  if (bookmark.isFavorite) addFavorite(id);
  return {
    id,
    title,
    url,
    isFavorite: bookmark.isFavorite,
    tags: bookmark.tags,
  };
};

const removeBookmark = async (bookmarkId: string) =>
  await browser.bookmarks.remove(bookmarkId);

const favoritesKey = "favorites";
const getFavorites = (): string[] =>
  JSON.parse(localStorage.getItem(favoritesKey) ?? "[]") ?? [];
const addFavorite = (bookmarkId: string) => {
  const favorites = getFavorites();
  favorites.push(bookmarkId);
  setFavorites(favorites);
};
const removeFavorite = (bookmarkId: string) => {
  const favorites = getFavorites();
  setFavorites(favorites.filter((id) => id !== bookmarkId));
};
const isFavorite = (bookmarkId: string) =>
  getFavorites().some((id) => id === bookmarkId);
const setFavorites = (favorites: string[]) =>
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));

const toggleFavorite = (bookmarkId: string) => {
  isFavorite(bookmarkId) ? removeFavorite(bookmarkId) : addFavorite(bookmarkId);
};

interface BookmarkTag {
  bookmarkId: string;
  tags: string[];
}

const tagsKey = "tags";
const getAllTags = () =>
  getBookmarkTags()
    .flatMap((tag) => tag.tags)
    .sort();

const getBookmarkTags = (): BookmarkTag[] =>
  JSON.parse(localStorage.getItem(tagsKey) ?? "[]") ?? [];
const getTagsForBookmark = (bookmarkId: string) => {
  const tags = getBookmarkTags();
  const bookmarkTags = tags.find((tag) => tag.bookmarkId === bookmarkId);
  return (bookmarkTags?.tags ?? []).sort();
};
const addTag = (bookmarkId: string, tag: string) => {
  let tags = getBookmarkTags();
  const tagsForBookmark = getTagsForBookmark(bookmarkId);
  tags = tags.filter((tag) => tag.bookmarkId !== bookmarkId);
  tagsForBookmark.push(tag);
  tags.push({ bookmarkId: bookmarkId, tags: tagsForBookmark });
  localStorage.setItem(tagsKey, JSON.stringify(tags));
};

const removeTag = (bookmarkId: string, tag: string) => {
  let tags = getBookmarkTags();
  let tagsForBookmark = getTagsForBookmark(bookmarkId);
  tags = tags.filter((t) => t.bookmarkId !== bookmarkId);
  tagsForBookmark = tagsForBookmark.filter((t) => t !== tag);
  tags.push({ bookmarkId: bookmarkId, tags: tagsForBookmark });
  localStorage.setItem(tagsKey, JSON.stringify(tags));
};

export const bookmarks = {
  getBookmarks,
  toggleFavorite,
  getBookmark,
  updateBookmark,
  createBookmark,
  getSupportedProtocols,
  removeBookmark,
  addTag,
  removeTag,
  getAllTags,
};

/**
 * Theme
 */
const themeKey = "theme";
const getTheme = (): ThemeOption =>
  (localStorage.getItem(themeKey) as ThemeOption | null) ?? ThemeOption.Light;
const setTheme = (theme: string) => localStorage.setItem(themeKey, theme);
const toggleTheme = () => {
  let theme = getTheme();
  theme = theme === ThemeOption.Light ? ThemeOption.Dark : ThemeOption.Light;
  setTheme(theme);
  return theme;
};

export const theme = { toggleTheme, getTheme };
