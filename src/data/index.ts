import { Bookmark, ThemeOption } from '../types/index.js'

/**
 * Bookmarks
 */
let filterFavorites = false
const setFilterFavorites = (filter: boolean) => (filterFavorites = filter)
const getFilterFavorites = () => filterFavorites

let isSortingAsc = true
const setSortingAsc = (asc: boolean) => (isSortingAsc = asc)

const getBookmarks = async (search?: string) => {
  const isBookmark = (bookmark: Bookmark) => bookmark.type === 'bookmark'
  const hasTitle = (bookmark: Bookmark) => bookmark.title

  const filters = [isBookmark, hasTitle]
  if (filterFavorites) filters.push((bookmark) => isFavorite(bookmark.id))

  const bookmarkItems = (await browser.bookmarks.search(search || {})).map(bookmark => ({
    ...bookmark,
    isFavorite: isFavorite(bookmark.id)
  }))
  const filteredBookmarks = bookmarkItems.filter(item => filters.every(filter => filter(item)))

  const sortAscending = (a: Bookmark, b: Bookmark) => a.title.localeCompare(b.title)
  const sortDescending = (a: Bookmark, b: Bookmark) => b.title.localeCompare(a.title)

  return filteredBookmarks.sort(isSortingAsc ? sortAscending : sortDescending)
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

export const bookmarks = { getBookmarks, getFavorites, addFavorite, removeFavorite, isFavorite, setFilterFavorites, getFilterFavorites, setSortingAsc }

/**
 * Theme
 */
const themeKey = 'theme'
const getTheme = () => localStorage.getItem(themeKey) ?? ThemeOption.Light
const setTheme = (theme: string) => localStorage.setItem(themeKey, theme)

export const theme = { getTheme, setTheme }
