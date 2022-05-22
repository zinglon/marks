import * as data from '../data/index.js';
import * as ui from "./ui.js";

const populateBookmarkList = async (search) => {
  const bookmarks = await data.bookmarks.getBookmarks(search);
  if (bookmarks.length > 0)
    bookmarks.forEach(bookmark => ui.bookmarks.addBookmarkOption(bookmark));
  else ui.bookmarks.showNoResults();
}

export const handleSearch = async (searchTerm) => {
  ui.bookmarks.clearBookmarkList();
  await populateBookmarkList(searchTerm);
}

populateBookmarkList();
ui.bookmarks.createSearchHandler(handleSearch);
ui.bookmarks.createSortHandler();
ui.bookmarks.createFilterHandler();
ui.theme.createThemeHandler(data.theme);
