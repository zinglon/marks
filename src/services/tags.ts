import { tags } from "../data/tags";
export const getAllTags = () =>
  getBookmarkTags()
    .flatMap((tag) => tag.tags)
    .sort();

export const getBookmarkTags = () => tags.getTags() ?? [];
export const getTagsForBookmark = (bookmarkId: string) => {
  const tags = getBookmarkTags();
  const bookmarkTags = tags.find((tag) => tag.bookmarkId === bookmarkId);
  return (bookmarkTags?.tags ?? []).sort();
};
export const addTag = (bookmarkId: string, tag: string) => {
  let t = getBookmarkTags();
  const tagsForBookmark = getTagsForBookmark(bookmarkId);
  t = t.filter((tag) => tag.bookmarkId !== bookmarkId);
  tagsForBookmark.push(tag);
  t.push({ bookmarkId: bookmarkId, tags: tagsForBookmark });
  tags.setTags(t);
};

export const setTags = (bookmarkId: string, t?: string[]) => {
  let bookmarkTags = getBookmarkTags();
  bookmarkTags = bookmarkTags.filter((tag) => tag.bookmarkId !== bookmarkId);
  if (t?.length) bookmarkTags.push({ bookmarkId: bookmarkId, tags: t });
  tags.setTags(bookmarkTags);
};
