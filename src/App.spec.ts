import { cleanup, fireEvent, render } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";

import App from "./App.vue";
import * as appState from "./composables/useApp";
import * as bookmarkEditor from "./composables/useBookmarkEditor";
import * as bookmarkList from "./composables/useBookmarkList";
import * as tag from "./composables/useTag";
import * as theme from "./composables/useTheme";
import { Bookmark, Icon } from "./types";
import { assertIsDefined } from "./utils/assertIsDefined";

vi.mock("./composables/useApp", () => ({
  useApp: vi.fn().mockReturnValue({
    selectedBookmark: ref<Bookmark>(),
  }),
}));
vi.mock("./composables/useBookmarkList", () => ({
  useBookmarkList: vi.fn().mockReturnValue({
    bookmarks: ref([]),
    getBookmarks: vi.fn().mockReturnValue([]),
    go: vi.fn(),
    isFiltering: ref(false),
    isSorting: ref(false),
    searchString: ref(""),
    toggleFavorite: vi.fn(),
    toggleFilter: vi.fn(),
    toggleSort: vi.fn(),
  }),
}));
vi.mock("./composables/useTag", () => ({
  useTag: vi.fn().mockReturnValue({
    addTag: vi.fn(),
    clearTagInput: vi.fn(),
    getTagOptions: vi.fn().mockReturnValue([]),
    removeTag: vi.fn(),
    tagInput: ref(""),
    tagOptions: ref([]),
  }),
}));
vi.mock("./composables/useBookmarkEditor", () => ({
  useBookmarkEditor: vi.fn().mockReturnValue({
    addBookmark: vi.fn(),
    confirmation: ref(false),
    editBookmark: vi.fn(),
    error: ref(""),
    remove: vi.fn(),
    save: vi.fn(),
    selectedBookmark: ref(),
  }),
}));
vi.mock("./composables/useTheme", () => ({
  useTheme: vi.fn().mockReturnValue({
    isDarkTheme: computed(() => false),
    toggleTheme: vi.fn(),
  }),
}));

describe("App", () => {
  afterEach(() => cleanup());
  it("creates", () => {
    expect(render(App)).toBeDefined();
  });
  describe("ThemeToggle", () => {
    it("shows sun when dark", () => {
      vi.spyOn(theme, "useTheme").mockReturnValue({
        isDarkTheme: computed(() => true),
        toggleTheme: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText(Icon.Sun)).toBeDefined();
    });
    it("shows moon when light", () => {
      vi.spyOn(theme, "useTheme").mockReturnValue({
        isDarkTheme: computed(() => false),
        toggleTheme: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText(Icon.Moon)).toBeDefined();
    });
    it("calls toggleTheme when clicked", () => {
      const toggleTheme = vi.fn();
      vi.spyOn(theme, "useTheme").mockReturnValue({
        isDarkTheme: computed(() => false),
        toggleTheme: toggleTheme,
      });
      const app = render(App);
      app.getByText(Icon.Moon).click();
      expect(toggleTheme).toHaveBeenCalled();
    });
  });
  describe("SearchInput", () => {
    it("is bound to searchString", async () => {
      const searchString = ref("test");
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(false),
        isSorting: ref(false),
        searchString: searchString,
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      const input = app.container.querySelector("input");
      assertIsDefined(input);

      expect(input.value).toBe("test");
      await fireEvent.update(input, "test2");
      expect(input.value).toBe("test2");
    });
    it("calls go when enter is pressed", async () => {
      const go = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: go,
        isFiltering: ref(false),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      const input = app.container.querySelector("input");
      assertIsDefined(input);
      await fireEvent(input, new KeyboardEvent("keydown", { key: "Enter" }));
      expect(go).toHaveBeenCalled();
    });
  });
  describe("SortButton", () => {
    it("displays an icon for ascending when not sorting", () => {
      const toggleSort = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(false),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: toggleSort,
      });
      const app = render(App);
      expect(app.getByText(Icon.Ascending)).toBeDefined();
    });
    it("displays an icon for descending when sorting", () => {
      const toggleSort = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(false),
        isSorting: ref(true),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: toggleSort,
      });
      const app = render(App);
      expect(app.getByText(Icon.Descending)).toBeDefined();
    });
    it("calls toggleSort when clicked", () => {
      const toggleSort = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(false),
        isSorting: ref(true),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: toggleSort,
      });
      const app = render(App);
      app.getByText(Icon.Descending).click();
      expect(toggleSort).toHaveBeenCalled();
    });
  });
  describe("FilterButton", () => {
    it("displays an icon for not favorite when not filtering", () => {
      const toggleFilter = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(false),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: toggleFilter,
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText(Icon.NotFavorite)).toBeDefined();
    });
    it("displays an icon for favorite when filtering", () => {
      const toggleFilter = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: toggleFilter,
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText(Icon.Favorite)).toBeDefined();
    });
    it("calls toggleFilter when clicked", () => {
      const toggleFilter = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: toggleFilter,
        toggleSort: vi.fn(),
      });
      const app = render(App);
      app.getByText(Icon.Favorite).click();
      expect(toggleFilter).toHaveBeenCalled();
    });
  });
  describe("AddButton", () => {
    it("calls addBookmark when clicked", () => {
      const addBookmark = vi.fn();
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: addBookmark,
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText(Icon.Add).click();
      expect(addBookmark).toHaveBeenCalled();
    });
  });
  describe("BookmarksList", () => {
    it("displays 'No bookmarks found' when the bookmarks list is empty", () => {
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.queryByText("No bookmarks found")).not.toBeNull();
    });
    it("does not display 'No bookmarks found' when the bookmarks list has bookmarks", () => {
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([
          {
            id: "1",
            isFavorite: false,
            tags: [],
            title: "title",
            url: "url",
          },
        ]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.queryByText("No bookmarks found")).toBeNull();
    });
    it("displays a bookmark when the bookmarks list has bookmarks", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "https://www.google.com/",
      };
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([bookmark]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText(bookmark.title)).toBeDefined();
      expect(app.getByText(bookmark.url)).toBeDefined();
    });
    it("displays a bookmark with a favorite icon when the bookmark is favorite", () => {
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([
          {
            id: "1",
            isFavorite: true,
            tags: [],
            title: "title",
            url: "url",
          },
        ]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.queryByDisplayValue(Icon.Favorite)).toBeDefined();
    });
    it("displays a bookmark with a notfavorite icon when the bookmark is not favorite", () => {
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([
          {
            id: "1",
            isFavorite: false,
            tags: [],
            title: "title",
            url: "url",
          },
        ]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.queryByDisplayValue(Icon.NotFavorite)).toBeDefined();
    });
    it("calls toggleFavorite when the favorite icon is clicked", () => {
      const toggleFavorite = vi.fn();
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([
          {
            id: "1",
            isFavorite: false,
            tags: [],
            title: "title",
            url: "url",
          },
        ]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: toggleFavorite,
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      app.getByText(Icon.NotFavorite).click();
      expect(toggleFavorite).toHaveBeenCalled();
    });
    it("calls editBookmark when the edit icon is clicked", () => {
      const editBookmark = vi.fn();
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: editBookmark,
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText(Icon.Pencil).click();
      expect(editBookmark).toHaveBeenCalled();
    });
    it("displays an arrow icon when the bookmark is being edited", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      vi.spyOn(bookmarkList, "useBookmarkList").mockReturnValue({
        bookmarks: ref([bookmark]),
        getBookmarks: vi.fn().mockReturnValue([]),
        go: vi.fn(),
        isFiltering: ref(true),
        isSorting: ref(false),
        searchString: ref(""),
        toggleFavorite: vi.fn(),
        toggleFilter: vi.fn(),
        toggleSort: vi.fn(),
      });
      const app = render(App);
      expect(app.queryByText(Icon.RightArrow)).toBeDefined();
    });
  });
  describe("BookmarkEditor", () => {
    it("titled 'Add Bookmark' if it is a new bookmark", () => {
      const bookmark = {
        id: "",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText("Add Bookmark")).toBeDefined();
    });
    it("titled 'Edit Bookmark' if a bookmark is selected for editing", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      expect(app.getByText("Edit Bookmark")).toBeDefined();
    });
    it("title input binds to selectedBookmark title", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const input = app.queryByText(bookmark.title, {
        selector: "input",
      });
      expect(input).toBeDefined();
    });
    it("url input binds to selectedBookmark url", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "https://www.google.com",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const input = app.queryByText(bookmark.url, {
        selector: "input",
      });
      expect(input).toBeDefined();
    });
    it("favorite toggle binds to selectedBookmark favorite status", () => {
      const bookmark = {
        id: "1",
        isFavorite: true,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const input = app.queryByText(Icon.Favorite, {
        selector: "button > div",
      });
      expect(input).toBeDefined();
    });
    it("tag input value binds", () => {
      const tagInput = ref("tag1");
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      vi.spyOn(tag, "useTag").mockReturnValue({
        addTag: vi.fn(),
        clearTagInput: vi.fn(),
        getTagOptions: vi.fn(),
        removeTag: vi.fn(),
        tagInput: tagInput,
        tagOptions: ref([]),
      });
      const app = render(App);
      const input = app.queryByText(tagInput.value, {
        selector: "input",
      });
      expect(input).toBeDefined();
    });
    it("tag options bind", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag1", "tag2"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const input = app.queryByText(bookmark.tags[0], {
        selector: "option",
      });
      expect(input).toBeDefined();
    });
    it("add tag calls add tag", async () => {
      const addTag = vi.fn();
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: [],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      vi.spyOn(tag, "useTag").mockReturnValue({
        addTag: addTag,
        clearTagInput: vi.fn(),
        getTagOptions: vi.fn(),
        removeTag: vi.fn(),
        tagInput: ref("tag1"),
        tagOptions: ref([]),
      });
      const app = render(App);
      const input = app.getByPlaceholderText("Add Tag");
      await fireEvent(input, new KeyboardEvent("keydown", { key: "Enter" }));
      expect(addTag).toHaveBeenCalled();
    });
    it("chips display for selectedBookmark tags", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag1", "tag2"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const input = app.queryByText(bookmark.tags[0], {
        selector: "div",
      });
      expect(input).toBeDefined();
    });
    it("remove tag calls remove tag", () => {
      const removeTag = vi.fn();
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      vi.spyOn(tag, "useTag").mockReturnValue({
        addTag: vi.fn(),
        clearTagInput: vi.fn(),
        getTagOptions: vi.fn(),
        removeTag: removeTag,
        tagInput: ref(""),
        tagOptions: ref([]),
      });
      const app = render(App);
      app.getByText(Icon.X).click();
      expect(removeTag).toHaveBeenCalled();
    });
    it("error displays error", () => {
      const error = "error";
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(error),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const result = app.getByText(error);
      expect(result).toBeDefined();
    });
    it("save button calls save", () => {
      const save = vi.fn();
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: save,
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText("Save").click();
      expect(save).toHaveBeenCalled();
    });
    it("remove button exists for existing bookmarks", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const result = app.getByText("Remove");
      expect(result).toBeDefined();
    });
    it("remove button sets confirmation modal", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      const setConfirmation = vi.fn();
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: setConfirmation,
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText("Remove").click();
      expect(setConfirmation).toHaveBeenCalledWith(true);
    });
    it("cancel button unsets selectedBookmark", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      const setSelectedBookmark = vi.fn();
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(false),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: setSelectedBookmark,
      });
      const app = render(App);
      app.getByText("Cancel").click();
      expect(setSelectedBookmark).toHaveBeenCalledWith(undefined);
    });
  });
  describe("Confirmation", () => {
    it("displays when confirmation is true", () => {
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(true),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      const result = app.getByText("Remove Bookmark");
      expect(result).toBeDefined();
    });
    it("remove button calls remove", () => {
      const remove = vi.fn();
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(true),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: remove,
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: vi.fn(),
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText("Remove").click();
      expect(remove).toHaveBeenCalled();
    });
    it("cancel button unsets confirmation", () => {
      const setConfirmation = vi.fn();
      const bookmark = {
        id: "1",
        isFavorite: false,
        tags: ["tag"],
        title: "title",
        url: "url",
      };
      vi.spyOn(appState, "useApp").mockReturnValue({
        selectedBookmark: ref(bookmark),
      });
      vi.spyOn(bookmarkEditor, "useBookmarkEditor").mockReturnValue({
        addBookmark: vi.fn(),
        confirmation: ref(true),
        editBookmark: vi.fn(),
        error: ref(""),
        remove: vi.fn(),
        save: vi.fn(),
        selectedBookmark: ref(bookmark),
        setConfirmation: setConfirmation,
        setSelectedBookmark: vi.fn(),
      });
      const app = render(App);
      app.getByText("Cancel").click();
      expect(setConfirmation).toHaveBeenCalledWith(false);
    });
  });
});
