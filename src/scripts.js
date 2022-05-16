import * as ui from './ui.js';
import * as data from './data.js';

const populateBookmarkList = async (search) => {
  const bookmarks = await data.getBookmarks(search);
  if (bookmarks.length > 0)
    bookmarks.forEach(bookmark => ui.addBookmarkOption(bookmark));
  else ui.showNoResults();
}

const handleSearch = async (searchTerm) => {
  ui.clearBookmarkList();
  await populateBookmarkList(searchTerm);
}

populateBookmarkList();
ui.createSearchHandler(handleSearch);

