import { ref } from "vue";

import { Bookmark } from "../types";
import { withSetup } from "../utils/testHelpers";
export const useApp = () => {
  const selectedBookmark = ref<Bookmark>();
  return { selectedBookmark };
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe("useApp", () => {
    it("initializes selectedBookmark to undefined", () => {
      const { composable } = withSetup(() => useApp());
      expect(composable.selectedBookmark.value).toBeUndefined();
    });
  });
}
