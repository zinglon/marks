<script setup lang="ts">
import TextInput from "../components/TextInput.vue";
import FormButton from "../components/FormButton.vue";
import IconButton from "../components/IconButton.vue";
import ListItem from "../components/ListItem.vue";
import { onMounted, ref, watch } from "vue";
import { Bookmark, FavoriteStatus, SortSetting } from "../types";
import * as data from "../data";

const useBookmarkList = () => {
  const searchString = ref<string>();
  const bookmarks = ref<Bookmark[]>([]);
  const getBookmarks = async () =>
    (bookmarks.value = await data.bookmarks.getBookmarks(
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
    data.bookmarks.toggleFavorite(bookmarkId);
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

const useBookmarkEditor = (getBookmarks: () => Promise<Bookmark[]>) => {
  const selectedBookmark = ref<Bookmark>();
  const editBookmark = async (bookmarkId: string) => {
    selectedBookmark.value =
      bookmarkId === selectedBookmark.value?.id
        ? undefined
        : await data.bookmarks.getBookmark(bookmarkId);
    if (tagInput.value) tagInput.value.value = "";
    getTagOptions();
  };

  const supportedProtocols = ref<string[]>([]);
  onMounted(
    async () =>
      (supportedProtocols.value = data.bookmarks.getSupportedProtocols())
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
          await data.bookmarks.updateBookmark(selectedBookmark.value);
        else
          selectedBookmark.value = await data.bookmarks.createBookmark(
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
    await data.bookmarks.removeBookmark(selectedBookmark.value.id);
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
} = useBookmarkList();

const {
  confirmation,
  selectedBookmark,
  error,
  editBookmark,
  addBookmark,
  remove,
  save,
} = useBookmarkEditor(getBookmarks);

const tagOptions = ref<string[]>([]);
const getTagOptions = () => (tagOptions.value = data.bookmarks.getAllTags());

const tagInput = ref<HTMLInputElement>();
const addTag = async () => {
  const value = tagInput.value?.value.trim();
  if (tagInput.value) {
    if (value && selectedBookmark.value) {
      data.bookmarks.addTag(selectedBookmark.value.id, value);
      selectedBookmark.value = await data.bookmarks.getBookmark(
        selectedBookmark.value.id
      );
      await getBookmarks();
      getTagOptions();
    }
    tagInput.value.value = "";
  }
};
const removeTag = async (tag: string) => {
  if (selectedBookmark.value) {
    data.bookmarks.removeTag(selectedBookmark.value.id, tag);
    selectedBookmark.value = await data.bookmarks.getBookmark(
      selectedBookmark.value.id
    );
    await getBookmarks();
    getTagOptions();
  }
};
</script>

<template>
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
                placeholder="🔎  Search Bookmarks"
                @keydown.enter="go"
              />
              <div class="flex justify-center items-center space-x-2">
                <IconButton @click="toggleSort">
                  {{
                    isSorting ? SortSetting.Descending : SortSetting.Ascending
                  }}
                </IconButton>
                <IconButton @click="toggleFilter">
                  {{
                    isFiltering
                      ? FavoriteStatus.Favorite
                      : FavoriteStatus.NotFavorite
                  }}
                </IconButton>
                <IconButton @click="addBookmark()">+</IconButton>
              </div>
            </div>

            <ul v-if="bookmarks.length > 0" class="h-full overflow-y-scroll">
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
              'min-w-full opacity-100 sm:min-w-0 sm:w-80 p-4': selectedBookmark,
            }"
          >
            <template v-if="confirmation">
              <div class="flex flex-col flex-1 text-center">
                Are you sure you want to remove this bookmark?
              </div>
              <div class="flex flex-col space-y-2 text-white">
                <FormButton @click="remove">Remove</FormButton>
                <FormButton @click="confirmation = !confirmation">
                  Cancel
                </FormButton>
              </div>
            </template>
            <template v-else-if="selectedBookmark">
              <h2 class="text-center pb-4">
                {{ selectedBookmark.id ? `Edit` : `Add` }} Bookmark
              </h2>
              <div class="flex-1 flex flex-col overflow-hidden">
                <div class="flex flex-col space-y-2 overflow-hidden p-1">
                  <TextInput
                    v-model="selectedBookmark.title"
                    placeholder="Title"
                  />
                  <TextInput v-model="selectedBookmark.url" placeholder="URL" />
                  <button
                    class="rounded-lg border border-stone-300 dark:border-gray-700 p-2 flex"
                    @click="selectedBookmark!.isFavorite = !selectedBookmark?.isFavorite"
                  >
                    <div class="text-left flex-1">Favorite</div>
                    {{
                      selectedBookmark.isFavorite
                        ? FavoriteStatus.Favorite
                        : FavoriteStatus.NotFavorite
                    }}
                  </button>
                  <template v-if="selectedBookmark.id">
                    <input
                      ref="tagInput"
                      list="tagSuggestions"
                      class="rounded-lg border border-stone-300 dark:border-gray-700 p-2 dark:bg-gray-900"
                      placeholder="Add Tag"
                      @keydown.enter="addTag"
                    />
                    <datalist id="tagSuggestions">
                      <option v-for="tag in tagOptions" :key="tag">
                        {{ tag }}
                      </option>
                    </datalist>
                    <div class="flex flex-row flex-wrap gap-2 overflow-y-auto">
                      <div
                        v-for="tag in selectedBookmark.tags"
                        :key="tag"
                        class="bg-stone-700 dark:bg-gray-800 rounded-2xl p-2 text-white dark:text-gray-300 text-xs overflow-hidden"
                      >
                        {{ tag }}
                        <button
                          class="bg-stone-600 hover:bg-stone-500 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-2xl p-1.5"
                          @click="removeTag(tag)"
                        >
                          <svg
                            class="h-2 w-2"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 8 8"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-width="1.5"
                              d="M1 1l6 6m0-6L1 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </template>
                  <p class="text-red-500 text-center">{{ error }}</p>
                </div>
                <div
                  class="flex-1 flex flex-col justify-end items-end text-white space-y-2 p-1"
                >
                  <FormButton @click="save">Save</FormButton>
                  <FormButton
                    v-if="selectedBookmark.id"
                    @click="confirmation = true"
                  >
                    Delete
                  </FormButton>
                  <FormButton @click="selectedBookmark = undefined">
                    Cancel
                  </FormButton>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
