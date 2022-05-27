import * as data from '../data/index.js'
import * as ui from './ui.js'
import { unwrapValue } from '../lib/helpers.js'
import { SortSetting } from '../types/index.js'
// import { createApp } from '../petite-vue/index.js'
// createApp({
//   // exposed to all expressions
//   count: 0,
//   // getters
//   get plusOne () {
//     return this.count + 1
//   },
//   // methods
//   increment () {
//     this.count++
//     console.log('test')
//   }
// }).mount()

const favoriteHandler = (bookmarkId: string) => {
  const isFavorite = data.bookmarks.isFavorite(bookmarkId)
  if (isFavorite) {
    data.bookmarks.removeFavorite(bookmarkId)
  } else {
    data.bookmarks.addFavorite(bookmarkId)
  }
  return isFavorite
}

const populateBookmarkList = async (search?: string) => {
  const bookmarks = await data.bookmarks.getBookmarks(search)
  if (bookmarks.length > 0) { bookmarks.forEach(bookmark => ui.bookmarks.addBookmarkOption(bookmark, favoriteHandler)) } else ui.bookmarks.showNoResults()
}

export const handleSearch = async (searchTerm: string) => {
  ui.bookmarks.clearBookmarkList()
  await populateBookmarkList(searchTerm)
}

export const handleFilter = (e: Event) => {
  const isFiltering = unwrapValue(e) === 'true'
  if (e.target) {
    (e.target as HTMLButtonElement).value = (!isFiltering).toString()
  }
  data.bookmarks.setFilterFavorites(!isFiltering)
}

export const handleSort = (e: Event) => {
  const isSorting = unwrapValue(e) === SortSetting.Ascending
  if (e.target) {
    (e.target as HTMLButtonElement).value = isSorting ? SortSetting.Descending : SortSetting.Ascending
  }
  data.bookmarks.setSortingAsc(!isSorting)
}

populateBookmarkList()
ui.bookmarks.createSearchHandler(handleSearch)
ui.bookmarks.createSortHandler()
ui.bookmarks.createFilterHandler(data.bookmarks.getFilterFavorites())
ui.theme.createThemeHandler(data.theme.getTheme, data.theme.setTheme)

// todo: add alt text to images
// todo: clean up css
// todo: research after favorite/unfavorite
// todo: Warning: cloneNode() may lead to duplicate element IDs in a document!
