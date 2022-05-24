/**
 * Bookmarks
 */
let filterFavorites = false
const setFilterFavorites = (filter) => (filterFavorites = filter)
const getFilterFavorites = () => filterFavorites

let isSortingAsc = true
const setSortingAsc = (asc) => (isSortingAsc = asc)

const getBookmarks = async (search) => {
  const isBookmark = (bookmark) => bookmark.type === 'bookmark'
  const hasTitle = (bookmark) => bookmark.title

  const filters = [isBookmark, hasTitle]
  if (filterFavorites) filters.push((bookmark) => isFavorite(bookmark.id))

  const bookmarkItems = await browser.bookmarks.search(search || {})
  const filteredBookmarks = bookmarkItems.filter(item => filters.every(filter => filter(item)))

  const sortAscending = (a, b) => a.title.localeCompare(b.title)
  const sortDescending = (a, b) => b.title.localeCompare(a.title)

  return filteredBookmarks.sort(isSortingAsc ? sortAscending : sortDescending)
}

const favoritesKey = 'favorites'
const getFavorites = () => JSON.parse(localStorage.getItem(favoritesKey)) ?? []
const addFavorite = (bookmarkId) => {
  const favorites = getFavorites()
  favorites.push(bookmarkId)
  setFavorites(favorites)
}
const removeFavorite = (bookmarkId) => {
  const favorites = getFavorites()
  setFavorites(favorites.filter(id => id !== bookmarkId))
}
const isFavorite = (bookmarkId) => getFavorites().some(id => id === bookmarkId)
const setFavorites = (favorites) => localStorage.setItem(favoritesKey, JSON.stringify(favorites))

export const bookmarks = { getBookmarks, getFavorites, addFavorite, removeFavorite, isFavorite, setFilterFavorites, getFilterFavorites, setSortingAsc }

/**
 * Theme
 */
const themeKey = 'theme'
const getTheme = () => localStorage.getItem(themeKey)
const setTheme = (theme) => localStorage.setItem(themeKey, theme)

export const theme = { getTheme, setTheme }
