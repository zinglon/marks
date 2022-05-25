/**
 * Bookmarks
 */
let filterFavorites = false
const setFilterFavorites = (filter: any) => (filterFavorites = filter)
const getFilterFavorites = () => filterFavorites

let isSortingAsc = true
const setSortingAsc = (asc: any) => (isSortingAsc = asc)

const getBookmarks = async (search: any) => {
  const isBookmark = (bookmark: any) => bookmark.type === 'bookmark'
  const hasTitle = (bookmark: any) => bookmark.title

  const filters = [isBookmark, hasTitle]
  if (filterFavorites) filters.push((bookmark) => isFavorite(bookmark.id))

  const bookmarkItems = await browser.bookmarks.search(search || {})
  const filteredBookmarks = bookmarkItems.filter((item: any) => filters.every(filter => filter(item)))

  const sortAscending = (a: any, b: any) => a.title.localeCompare(b.title)
  const sortDescending = (a: any, b: any) => b.title.localeCompare(a.title)

  return filteredBookmarks.sort(isSortingAsc ? sortAscending : sortDescending)
}

const favoritesKey = 'favorites'
const getFavorites = () => JSON.parse(localStorage.getItem(favoritesKey) ?? '[]') ?? []
const addFavorite = (bookmarkId: any) => {
  const favorites = getFavorites()
  favorites.push(bookmarkId)
  setFavorites(favorites)
}
const removeFavorite = (bookmarkId: any) => {
  const favorites = getFavorites()
  setFavorites(favorites.filter((id: any) => id !== bookmarkId))
}
const isFavorite = (bookmarkId: any) => getFavorites().some((id: any) => id === bookmarkId)
const setFavorites = (favorites: any) => localStorage.setItem(favoritesKey, JSON.stringify(favorites))

export const bookmarks = { getBookmarks, getFavorites, addFavorite, removeFavorite, isFavorite, setFilterFavorites, getFilterFavorites, setSortingAsc }

/**
 * Theme
 */
const themeKey = 'theme'
const getTheme = () => localStorage.getItem(themeKey)
const setTheme = (theme: any) => localStorage.setItem(themeKey, theme)

export const theme = { getTheme, setTheme }
