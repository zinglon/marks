import { TagData, tagData } from "../data/tag";

export const createTagService = (tagData: TagData) => {
  const getBookmarkTags = () => tagData.getTags();

  const getAllTags = () =>
    getBookmarkTags()
      .flatMap((tag) => tag.tags)
      .sort();

  const getTagsForBookmark = (bookmarkId: string) => {
    const tags = getBookmarkTags();
    const bookmark = tags.find((tag) => tag.bookmarkId === bookmarkId);
    return bookmark?.tags ? bookmark.tags.sort() : [];
  };

  const setTags = (bookmarkId: string, tags?: string[]) => {
    const bookmarkTags = getBookmarkTags().filter(
      (tag) => tag.bookmarkId !== bookmarkId
    );
    if (tags?.length) bookmarkTags.push({ bookmarkId, tags });
    tagData.setTags(bookmarkTags);
  };
  return {
    getAllTags,
    getTagsForBookmark,
    setTags,
  };
};

export const tagService = createTagService(tagData);
export type TagService = typeof tagService;

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("createTagService", () => {
    describe("getAllTags", () => {
      it("gets sorted array of all tags for all bookmarks", () => {
        const bookmarkTags = [
          {
            bookmarkId: "1",
            tags: ["a", "b"],
          },
          {
            bookmarkId: "2",
            tags: ["d", "c"],
          },
        ];
        const tagData: TagData = {
          getTags: vi.fn().mockReturnValue(bookmarkTags),
          setTags: vi.fn(),
        };
        const tagService = createTagService(tagData);
        expect(tagService.getAllTags()).toEqual(["a", "b", "c", "d"]);
      });
    });
  });
}
