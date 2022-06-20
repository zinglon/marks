import { Bookmark } from "../types";

const mapApiBookmarkToBookmark = (
  bookmark: browser.bookmarks.BookmarkTreeNode
) => {
  const { id, title, url } = bookmark;
  return { id, title: title, url: url ?? "" };
};

export const updateBookmark = async (bookmark: Bookmark) =>
  mapApiBookmarkToBookmark(
    await browser.bookmarks.update(bookmark.id, {
      title: bookmark.title,
      url: bookmark.url,
    })
  );

export const createBookmark = async (bookmark: Bookmark) =>
  mapApiBookmarkToBookmark(
    await browser.bookmarks.create({
      title: bookmark.title,
      url: bookmark.url,
    })
  );

export const removeBookmark = (bookmarkId: string) =>
  browser.bookmarks.remove(bookmarkId);

export const getBookmark = async (bookmarkId: string) =>
  mapApiBookmarkToBookmark((await browser.bookmarks.get(bookmarkId))[0]);

// Some bookmarks have an empty string title so we could filter them out rather than defaulting to "No title"
// const hasTitle = (bookmark: browser.bookmarks.BookmarkTreeNode) => !!bookmark.title;

// Bookmarks api returns folders so we need to filter them out
const isBookmark = (bookmark: browser.bookmarks.BookmarkTreeNode) =>
  bookmark.type === "bookmark";

const filters = [isBookmark];

export const getBookmarks = async () =>
  (await browser.bookmarks.search({}))
    .filter((bookmark) => filters.every((filter) => filter(bookmark)))
    .map((bookmark) => mapApiBookmarkToBookmark(bookmark));

export const getSupportedProtocols = () => [
  "https://",
  "http://",
  "ftp://",
  "file://",
];
