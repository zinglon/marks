import { BookmarkData, bookmarkData } from "../data/bookmark";
import { FavoriteService, favoriteService } from "../services/favorite";
import { TagService, tagService } from "../services/tag";
import { Bookmark, NewBookmark } from "../types";
import { byProperty } from "../utils/compare";

export const createBookmarkService = (
  bookmarkData: BookmarkData,
  tagService: TagService,
  favoriteService: FavoriteService
) => {
  const getSearchItems = (bookmark: Bookmark) =>
    [bookmark.title, bookmark.url, ...(bookmark.tags ?? [])].map((item) =>
      item.trim().toLowerCase()
    );

  const applySearch = (bookmarks: Bookmark[], search?: string) =>
    search
      ? bookmarks.filter((bookmark) =>
          getSearchItems(bookmark).some((item) =>
            item.includes(search?.toLowerCase())
          )
        )
      : bookmarks;

  const applyFilters = (bookmarks: Bookmark[], isFiltering: boolean) =>
    bookmarks.filter((bookmark) =>
      isFiltering ? favoriteService.isFavorite(bookmark.id) : true
    );

  const applySort = (bookmarks: Bookmark[], isSorting: boolean) =>
    [...bookmarks].sort(byProperty<Bookmark>("title", isSorting));

  const getBookmarks = async (
    search?: string,
    isSorting?: boolean,
    isFiltering?: boolean
  ) => {
    const bookmarkItems = (await bookmarkData.getBookmarks()).map(
      (bookmark) => ({
        ...bookmark,
        isFavorite: favoriteService.isFavorite(bookmark.id),
        tags: tagService.getTagsForBookmark(bookmark.id) ?? [],
        title: bookmark.title ? bookmark.title : "[No Title]",
      })
    );
    const searchResults = applySearch(bookmarkItems, search);
    const filteredBookmarks = applyFilters(searchResults, !!isFiltering);
    const sortedBookmarks = applySort(filteredBookmarks, !!isSorting);
    return sortedBookmarks;
  };

  const getBookmark = async (bookmarkId: string) => {
    const bookmark = await bookmarkData.getBookmark(bookmarkId);
    return {
      ...bookmark,
      isFavorite: favoriteService.isFavorite(bookmark.id),
      tags: tagService.getTagsForBookmark(bookmark.id),
    };
  };

  const createBookmark = async (bookmark: NewBookmark) => {
    const { id, title, url } = await bookmarkData.createBookmark(bookmark);
    if (bookmark.isFavorite) favoriteService.addFavorite(id);
    if (bookmark.tags) tagService.setTags(id, bookmark.tags);
    return {
      id,
      isFavorite: bookmark.isFavorite,
      tags: bookmark.tags,
      title,
      url,
    };
  };

  const updateBookmark = async (bookmark: Bookmark) => {
    const result = await bookmarkData.updateBookmark(bookmark);
    bookmark.isFavorite
      ? favoriteService.addFavorite(bookmark.id)
      : favoriteService.removeFavorite(bookmark.id);
    tagService.setTags(bookmark.id, bookmark.tags ?? []);
    return result;
  };

  const removeBookmark = async (bookmarkId: string) => {
    await bookmarkData.removeBookmark(bookmarkId);
    favoriteService.removeFavorite(bookmarkId);
    tagService.setTags(bookmarkId);
  };

  const getSupportedProtocols = () => bookmarkData.getSupportedProtocols();

  return {
    createBookmark,
    getAllTags: tagService.getAllTags,
    getBookmark,
    getBookmarks,
    getSupportedProtocols,
    removeBookmark,
    toggleFavorite: favoriteService.toggleFavorite,
    updateBookmark,
  };
};

export const bookmarkService = createBookmarkService(
  bookmarkData,
  tagService,
  favoriteService
);
export type BookmarkService = typeof bookmarkService;
