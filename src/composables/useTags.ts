import { Ref, ref } from "vue";

import { bookmarks as bookmarkData } from "../services/bookmarks";
import { Bookmark } from "../types";

export const useTags = (selectedBookmark: Ref<Bookmark | undefined>) => {
  const tagInput = ref<string>("");
  const tagOptions = ref<string[]>([]);
  const getTagOptions = () => (tagOptions.value = bookmarkData.getAllTags());

  const addTag = () => {
    const value = tagInput.value?.trim();
    if (value && selectedBookmark.value) {
      if (!selectedBookmark.value.tags) selectedBookmark.value.tags = [];
      if (!selectedBookmark.value.tags.includes(value))
        selectedBookmark.value.tags.push(value);
      clearTagInput();
    }
  };
  const removeTag = (tag: string) => {
    if (selectedBookmark.value)
      selectedBookmark.value.tags = selectedBookmark.value.tags?.filter(
        (t) => t !== tag
      );
  };

  const clearTagInput = () => (tagInput.value = "");
  return {
    tagOptions,
    tagInput,
    addTag,
    removeTag,
    getTagOptions,
    clearTagInput,
  };
};
