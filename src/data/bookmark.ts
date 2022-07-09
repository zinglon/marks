import { Bookmark, NewBookmark } from "../types";

function fromBrowserBookmarkUrl(url: string): {
  url: string;
  isReaderMode?: boolean;
} {
  const isReaderMode = url.startsWith("about:reader");
  const baddassurl = isReaderMode
    ? new URLSearchParams(url.substring("about:reader".length)).get("url") ?? ""
    : url;
  return { isReaderMode, url: baddassurl };
}
function toBrowserBookmarkUrl(url: string, isReaderMode?: boolean) {
  return isReaderMode ? `about:reader?url=${encodeURIComponent(url)}` : url;
}

export const createBookmarkDataAccessor = (
  bookmarkApi: typeof browser.bookmarks
) => {
  const mapApiBookmarkToBookmark = (
    bookmark: browser.bookmarks.BookmarkTreeNode
  ) => {
    const { id, title, url } = bookmark;
    return { id, title: title, ...fromBrowserBookmarkUrl(url ?? "") };
  };

  const updateBookmark = async (bookmark: Bookmark) =>
    mapApiBookmarkToBookmark(
      await bookmarkApi.update(bookmark.id, {
        title: bookmark.title,
        url: toBrowserBookmarkUrl(bookmark.url, bookmark.isReaderMode),
      })
    );

  const createBookmark = async (bookmark: NewBookmark) =>
    mapApiBookmarkToBookmark(
      await bookmarkApi.create({
        title: bookmark.title,
        url: bookmark.url,
      })
    );

  const removeBookmark = (bookmarkId: string) => bookmarkApi.remove(bookmarkId);

  const getBookmark = async (bookmarkId: string) =>
    mapApiBookmarkToBookmark((await bookmarkApi.get(bookmarkId))[0]);

  // Bookmarks api returns folders so we need to filter them out
  const isBookmark = (bookmark: browser.bookmarks.BookmarkTreeNode) =>
    bookmark.type === "bookmark";

  const getBookmarks = async () =>
    (await bookmarkApi.search({}))
      .filter(isBookmark)
      .map(mapApiBookmarkToBookmark);

  const getSupportedProtocols = () => [
    "https://",
    "http://",
    "ftp://",
    "file://",
  ];
  return {
    createBookmark,
    getBookmark,
    getBookmarks,
    getSupportedProtocols,
    removeBookmark,
    updateBookmark,
  };
};

// TODO: figure out how to make vitest play nice with browser.bookmarks
// maybe look at https://vitest.dev/guide/mocking.html#globals
// eslint-disable-next-line
export const bookmarkData = (
  import.meta.env.MODE !== "test"
    ? createBookmarkDataAccessor(browser.bookmarks)
    : undefined
)!;

export type BookmarkData = typeof bookmarkData;
