<script lang="ts">
import { ThemeOption } from "./types";
import * as themeService from "./services/theme";

import TextInput from "./components/TextInput.vue";
import Chip from "./components/Chip.vue";
import ChipContainer from "./components/ChipContainer.vue";
import FormButton from "./components/FormButton.vue";
import IconButton from "./components/IconButton.vue";
import ListItem from "./components/ListItem.vue";
import Combobox from "./components/Combobox.vue";
import ToggleInput from "./components/ToggleInput.vue";
import Error from "./components/Error.vue";
import FormGroup from "./layout/FormGroup.vue";
import { onMounted, Ref, ref, watch } from "vue";
import { Bookmark, Icon } from "./types";
import {
  bookmarks as bookmarkData,
  BookmarkDataAccessor,
} from "./services/bookmarks";
const useBookmarkList = (bookmarkData: BookmarkDataAccessor) => {
  const searchString = ref<string>();
  const bookmarks = ref<Bookmark[]>([]);
  const getBookmarks = async () =>
    (bookmarks.value = await bookmarkData.getBookmarks(
      searchString.value,
      isSorting.value,
      isFiltering.value
    ));

  onMounted(async () => await getBookmarks());

  const isSorting = ref(false);
  const toggleSort = () => (isSorting.value = !isSorting.value);

  const isFiltering = ref(false);
  const toggleFilter = () => (isFiltering.value = !isFiltering.value);

  watch(
    [searchString, isSorting, isFiltering],
    async () => await getBookmarks()
  );
  const toggleFavorite = async (bookmarkId: string) => {
    bookmarkData.toggleFavorite(bookmarkId);
    await getBookmarks();
  };
  const go = () => {
    if (bookmarks.value.length && bookmarks.value[0].url)
      window.location.href = bookmarks.value[0].url;
  };
  return {
    searchString,
    bookmarks,
    isSorting,
    isFiltering,
    getBookmarks,
    toggleSort,
    toggleFilter,
    toggleFavorite,
    go,
  };
};

const useBookmarkEditor = (
  bookmarkData: BookmarkDataAccessor,
  selectedBookmark: Ref<Bookmark | undefined>,
  getBookmarks: () => Promise<Bookmark[]>,
  getTagOptions: () => string[],
  clearTagInput: () => void
) => {
  const editBookmark = async (bookmarkId: string) => {
    selectedBookmark.value =
      bookmarkId === selectedBookmark.value?.id
        ? undefined
        : await bookmarkData.getBookmark(bookmarkId);
    clearTagInput();
    getTagOptions();
  };

  const supportedProtocols = ref<string[]>([]);
  onMounted(
    async () =>
      (supportedProtocols.value = bookmarkData.getSupportedProtocols())
  );

  const hasError = (bookmark: Bookmark) =>
    supportedProtocols.value.some((protocol) =>
      bookmark.url?.startsWith(protocol)
    )
      ? undefined
      : `URL must start with ` + supportedProtocols.value.join(", ");

  const error = ref<string>();
  watch(selectedBookmark, () => (error.value = undefined), { deep: true });

  const save = async () => {
    if (!selectedBookmark.value) return;
    error.value = hasError(selectedBookmark.value);
    if (!error.value) {
      try {
        if (selectedBookmark.value.id)
          await bookmarkData.updateBookmark(selectedBookmark.value);
        else
          selectedBookmark.value = await bookmarkData.createBookmark(
            selectedBookmark.value
          );
      } catch (err) {
        error.value = "Something went wrong";
      }
    }
    await getBookmarks();
  };

  const remove = async () => {
    if (!selectedBookmark.value) return;
    await bookmarkData.removeBookmark(selectedBookmark.value.id);
    selectedBookmark.value = undefined;
    confirmation.value = false;
    await getBookmarks();
  };

  const addBookmark = () =>
    (selectedBookmark.value = {
      id: "",
      title: "",
      url: "",
      isFavorite: false,
      tags: [],
    });

  const confirmation = ref(false);
  return {
    selectedBookmark,
    editBookmark,
    addBookmark,
    confirmation,
    remove,
    error,
    save,
  };
};

const useTags = (selectedBookmark: Ref<Bookmark | undefined>) => {
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
</script>
<script setup lang="ts">
const theme = ref<ThemeOption>();
onMounted(() => (theme.value = themeService.getTheme()));
const toggleTheme = () => (theme.value = themeService.toggleTheme());

const selectedBookmark = ref<Bookmark>();

const {
  searchString,
  bookmarks,
  isSorting,
  isFiltering,
  getBookmarks,
  toggleSort,
  toggleFilter,
  toggleFavorite,
  go,
} = useBookmarkList(bookmarkData);

const {
  tagOptions,
  tagInput,
  addTag,
  removeTag,
  getTagOptions,
  clearTagInput,
} = useTags(selectedBookmark);

const { confirmation, error, editBookmark, addBookmark, remove, save } =
  useBookmarkEditor(
    bookmarkData,
    selectedBookmark,
    getBookmarks,
    getTagOptions,
    clearTagInput
  );
</script>

<template>
  <div class="h-screen" :class="{ dark: theme === ThemeOption.Dark }">
    <div
      class="h-screen flex flex-col bg-[url('/public/background.avif')] dark:bg-[url('/public/background_dark.avif')] bg-cover bg-center text-stone-700 dark:text-gray-300"
    >
      <div class="text-white flex flex-row justify-end">
        <button class="m-2 leading-4" @click="toggleTheme">
          {{ theme === ThemeOption.Dark ? Icon.Star : Icon.Moon }}
        </button>
      </div>
      <div class="flex flex-1 overflow-hidden">
        <div class="flex-1 flex justify-center items-center text-sm">
          <div
            class="flex-1 flex h-full mx-8 md:mx-0 md:max-w-2xl md:max-h-[30rem] md:mb-6 2xl:max-w-4xl 2xl:max-h-[32rem] bg-white dark:bg-gray-900 rounded-lg drop-shadow-[0_24px_24px_rgba(0,0,0,0.50)]"
          >
            <div class="flex-1 flex flex-col max-w-full">
              <div class="flex-1 flex flex-row overflow-hidden">
                <div
                  class="flex-1 min-w-[60%] sm:flex flex-col overflow-hidden rounded-lg"
                  :class="{ hidden: selectedBookmark }"
                >
                  <div class="flex border-b dark:border-gray-700 p-2">
                    <input
                      v-model="searchString"
                      autofocus
                      class="flex-1 rounded-lg mr-2 pl-2 dark:bg-gray-900"
                      :placeholder="`${Icon.MagnifyingGlass} Search Bookmarks`"
                      @keydown.enter="go"
                    />
                    <div class="flex justify-center items-center space-x-2">
                      <IconButton @click="toggleSort">
                        {{ isSorting ? Icon.Descending : Icon.Ascending }}
                      </IconButton>
                      <IconButton @click="toggleFilter">
                        {{ isFiltering ? Icon.Favorite : Icon.NotFavorite }}
                      </IconButton>
                      <IconButton @click="addBookmark()">+</IconButton>
                    </div>
                  </div>

                  <ul
                    v-if="bookmarks.length > 0"
                    class="h-full overflow-y-scroll"
                  >
                    <ListItem
                      v-for="bookmark in bookmarks"
                      :key="bookmark.id"
                      :bookmark="bookmark"
                      :is-editing="bookmark.id === selectedBookmark?.id"
                      @favorite-clicked="toggleFavorite"
                      @edit-clicked="editBookmark"
                    />
                  </ul>
                  <div v-else class="h-full flex justify-center items-center">
                    No bookmarks found
                  </div>
                </div>
                <div
                  class="w-0 opacity-0 overflow-hidden break-words flex flex-col sm:border-l dark:border-gray-700 transition-[width,opacity] duration-[300ms] delay-[0ms]"
                  :class="{
                    'min-w-full opacity-100 sm:min-w-0 sm:w-80 p-4':
                      selectedBookmark,
                  }"
                >
                  <template v-if="confirmation">
                    <FormGroup>
                      <template #header>Remove Bookmark</template>
                      <template #content>
                        Are you sure you want to remove this bookmark?
                      </template>
                      <template #footer>
                        <FormButton @click="remove">Remove</FormButton>
                        <FormButton @click="confirmation = !confirmation">
                          Cancel
                        </FormButton>
                      </template>
                    </FormGroup>
                  </template>
                  <template v-else-if="selectedBookmark">
                    <FormGroup>
                      <template #header>
                        {{ selectedBookmark.id ? `Edit` : `Add` }} Bookmark
                      </template>
                      <template #content>
                        <TextInput
                          v-model="selectedBookmark.title"
                          placeholder="Title"
                        />
                        <TextInput
                          v-model="selectedBookmark.url"
                          placeholder="URL"
                        />
                        <ToggleInput
                          :label="'Favorite'"
                          @toggle-clicked="
                          selectedBookmark!.isFavorite =
                            !selectedBookmark!.isFavorite
                        "
                        >
                          {{
                            selectedBookmark.isFavorite
                              ? Icon.Favorite
                              : Icon.NotFavorite
                          }}
                        </ToggleInput>
                        <Combobox
                          v-model="tagInput"
                          :placeholder="'Add Tag'"
                          :options="tagOptions"
                          @add-tag="addTag"
                        />
                        <ChipContainer>
                          <Chip
                            v-for="tag in selectedBookmark.tags"
                            :key="tag"
                            :tag="tag"
                            @remove-tag="removeTag"
                          />
                        </ChipContainer>
                        <Error>{{ error }}</Error>
                      </template>
                      <template #footer>
                        <FormButton @click="save">Save</FormButton>
                        <FormButton
                          v-if="selectedBookmark.id"
                          @click="confirmation = true"
                        >
                          Remove
                        </FormButton>
                        <FormButton @click="selectedBookmark = undefined">
                          Cancel
                        </FormButton>
                      </template>
                    </FormGroup>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>Footer</div>
    </div>
  </div>
</template>
