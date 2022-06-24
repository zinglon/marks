import { tags as tagsData } from "../data/tags";

export const getBookmarkTags = () => tagsData.getTags();

export const getAllTags = () =>
  getBookmarkTags()
    .flatMap((tag) => tag.tags)
    .sort();

export const getTagsForBookmark = (bookmarkId: string) => {
  const tags = getBookmarkTags();
  const bookmark = tags.find((tag) => tag.bookmarkId === bookmarkId);
  return bookmark?.tags ? bookmark.tags.sort() : [];
};

export const setTags = (bookmarkId: string, tags?: string[]) => {
  const bookmarkTags = getBookmarkTags().filter(
    (tag) => tag.bookmarkId !== bookmarkId
  );
  if (tags?.length) bookmarkTags.push({ bookmarkId, tags });
  tagsData.setTags(bookmarkTags);
};
