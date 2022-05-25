import * as data from '../data/index.js'
import * as ui from './ui.js'

const populateBookmarkList = async (search?: string) => {
  const bookmarks = await data.bookmarks.getBookmarks(search)
  if (bookmarks.length > 0) { bookmarks.forEach(bookmark => ui.bookmarks.addBookmarkOption(bookmark)) } else ui.bookmarks.showNoResults()
}

export const handleSearch = async (searchTerm: string) => {
  ui.bookmarks.clearBookmarkList()
  await populateBookmarkList(searchTerm)
}

populateBookmarkList()
ui.bookmarks.createSearchHandler(handleSearch)
ui.bookmarks.createSortHandler()
ui.bookmarks.createFilterHandler()
ui.theme.createThemeHandler(data.theme)

// todo: add alt text to images
// todo: clean up css
// todo: research after favorite/unfavorite
// todo: Warning: cloneNode() may lead to duplicate element IDs in a document!
