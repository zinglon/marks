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
  const bookmarkItems = (await browser.bookmarks.search(search || {})).map(
    (bookmark) => ({
      ...bookmark,
      isFavorite: isFavorite(bookmark.id),
    })
  );

  // Filter
  const filters = [isBookmark, hasTitle];
  if (isFiltering)
    filters.push((bookmark: Bookmark) => isFavorite(bookmark.id));
  const filteredBookmarks = bookmarkItems.filter((item) =>
    filters.every((filter) => filter(item))
  );

  // Sort
  return filteredBookmarks.sort(isSorting ? sortDescending : sortAscending);
};

const getBookmark = async (bookmarkId: string) => {
  const { id, title, url } = (await browser.bookmarks.get(bookmarkId))[0];
  return { id, title, url, isFavorite: isFavorite(id) };
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
  return result;
};

const createBookmark = async (bookmark: Bookmark) => {
  const { id, title, url } = await browser.bookmarks.create({
    title: bookmark.title,
    url: bookmark.url,
  });
  if (bookmark.isFavorite) addFavorite(id);
  return { id, title, url, isFavorite: bookmark.isFavorite };
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

export const bookmarks = {
  getBookmarks,
  toggleFavorite,
  getBookmark,
  updateBookmark,
  createBookmark,
  getSupportedProtocols,
  removeBookmark,
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
