import { Bookmark, ThemeOption } from '../types/index.js'

/**
 * Bookmarks
 */

// Filters
const isBookmark = (bookmark: Bookmark) => bookmark.type === 'bookmark'
const hasTitle = (bookmark: Bookmark) => bookmark.title

// Sorts
const sortAscending = (a: Bookmark, b: Bookmark) => a.title.localeCompare(b.title)
const sortDescending = (a: Bookmark, b: Bookmark) => b.title.localeCompare(a.title)

const getBookmarks = async (search?: string, isFiltering?: boolean, isSorting?: boolean) => {
  // Get
  const bookmarkItems = (await browser.bookmarks.search(search || {})).map(bookmark => ({
    ...bookmark,
    isFavorite: isFavorite(bookmark.id)
  }))

  // Filter
  const filters = [isBookmark, hasTitle]
  if (isFiltering) filters.push((bookmark: Bookmark) => isFavorite(bookmark.id))
  const filteredBookmarks = bookmarkItems.filter(item => filters.every(filter => filter(item)))

  // Sort
  return [...filteredBookmarks].sort(isSorting ? sortDescending : sortAscending)
}

const favoritesKey = 'favorites'
const getFavorites = (): string[] => JSON.parse(localStorage.getItem(favoritesKey) ?? '[]') ?? []
const addFavorite = (bookmarkId: string) => {
  const favorites = getFavorites()
  favorites.push(bookmarkId)
  setFavorites(favorites)
}
const removeFavorite = (bookmarkId: string) => {
  const favorites = getFavorites()
  setFavorites(favorites.filter(id => id !== bookmarkId))
}
const isFavorite = (bookmarkId: string) => getFavorites().some(id => id === bookmarkId)
const setFavorites = (favorites: string[]) => localStorage.setItem(favoritesKey, JSON.stringify(favorites))

const toggleFavorite = (bookmarkId: string) => {
  isFavorite(bookmarkId) ? removeFavorite(bookmarkId) : addFavorite(bookmarkId)
}

export const bookmarks = { getBookmarks, toggleFavorite }

/**
 * Theme
 */
const themeKey = 'theme'
const getTheme = () => localStorage.getItem(themeKey) ?? ThemeOption.Light
const setTheme = (theme: string) => localStorage.setItem(themeKey, theme)

export const theme = { getTheme, setTheme }
