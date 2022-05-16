export const getBookmarks = async (search) => {
  const bookmarkItems = await browser.bookmarks.search(search ? search : {});
  return bookmarkItems.filter(item => item.type === 'bookmark' && item.title);
}