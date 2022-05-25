/**
 * Bookmarks
 */
let filterFavorites = false
const setFilterFavorites = (filter: boolean) => (filterFavorites = filter)
const getFilterFavorites = () => filterFavorites

let isSortingAsc = true
const setSortingAsc = (asc: boolean) => (isSortingAsc = asc)

const getBookmarks = async (search?: string) => {
  const isBookmark = (bookmark: browser.bookmarks.BookmarkTreeNode) => bookmark.type === 'bookmark'
  const hasTitle = (bookmark: browser.bookmarks.BookmarkTreeNode) => bookmark.title

  const filters = [isBookmark, hasTitle]
  if (filterFavorites) filters.push((bookmark) => isFavorite(bookmark.id))

  const bookmarkItems = await browser.bookmarks.search(search || {})
  const filteredBookmarks = bookmarkItems.filter(item => filters.every(filter => filter(item)))

  const sortAscending = (a: browser.bookmarks.BookmarkTreeNode, b: browser.bookmarks.BookmarkTreeNode) => a.title.localeCompare(b.title)
  const sortDescending = (a: browser.bookmarks.BookmarkTreeNode, b: browser.bookmarks.BookmarkTreeNode) => b.title.localeCompare(a.title)

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
const getTheme = () => localStorage.getItem(themeKey)
const setTheme = (theme: string) => localStorage.setItem(themeKey, theme)

export const theme = { getTheme, setTheme }
