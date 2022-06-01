<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Bookmark, SortSetting, FavoriteStatus } from "../types";
import * as data from "../data";

const searchString = ref<string>();
const bookmarks = ref<Bookmark[]>([]);
const getBookmarks = async () => {
  bookmarks.value = await data.bookmarks.getBookmarks(
    searchString.value,
    isSorting.value,
    isFiltering.value
  );
};
onMounted(async () => await getBookmarks());

const isSorting = ref(false);
const toggleSort = () => (isSorting.value = !isSorting.value);

const isFiltering = ref(false);
const toggleFilter = () => (isFiltering.value = !isFiltering.value);

watch([searchString, isSorting, isFiltering], async () => await getBookmarks());

const toggleFavorite = async (bookmarkId: string) => {
  data.bookmarks.toggleFavorite(bookmarkId);
  await getBookmarks();
};

const selectedBookmark = ref<Bookmark>();
const editBookmark = async (bookmarkId: string) => {
  if (bookmarkId === selectedBookmark.value?.id) {
    selectedBookmark.value = undefined;
  } else {
    selectedBookmark.value = await data.bookmarks.getBookmark(bookmarkId);
  }
};

const supportedProtocols = ref<string[]>([]);
onMounted(async () => {
  supportedProtocols.value = data.bookmarks.getSupportedProtocols();
});

const hasError = (bookmark: Bookmark) => {
  if (
    !supportedProtocols.value.some((protocol) =>
      bookmark.url?.startsWith(protocol)
    )
  ) {
    return `URL must start with ` + supportedProtocols.value.join(", ");
  }
};

const error = ref<string>();
watch(selectedBookmark, () => (error.value = undefined), { deep: true });

const save = async () => {
  if (!selectedBookmark.value) return;
  error.value = hasError(selectedBookmark.value);
  if (!error.value) {
    try {
      if (selectedBookmark.value.id) {
        await data.bookmarks.updateBookmark(selectedBookmark.value);
      } else {
        selectedBookmark.value = await data.bookmarks.createBookmark(
          selectedBookmark.value
        );
      }
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

const addBookmark = () => {
  selectedBookmark.value = {
    id: "",
    title: "",
    url: "",
    isFavorite: false,
  };
};

const confirmation = ref(false);

const go = () => {
  if (bookmarks.value.length && bookmarks.value[0].url) {
    window.location.href = bookmarks.value[0].url;
  }
};
</script>
<template>
  <div
    class="grid grid-cols-5 grid-rows-5 2xl:grid-cols-7 max-h-full min-h-full flex-1 dark:bg-stone-700"
  >
    <div
      class="col-start-2 2xl:col-start-3 col-span-3 row-start-2 row-span-3 flex flex-col drop-shadow-[0_24px_24px_rgba(0,0,0,0.50)]"
    >
      <div
        class="flex flex-row text-stone-600 p-2 rounded-t-lg bg-white border-b"
      >
        <input
          v-model="searchString"
          autofocus
          class="text-sm text-stone-600 placeholder:text-stone-400 w-full dark:bg-stone-700 p-2 outline-none focus:outline-none border-transparent focus:border-transparent focus:ring-0"
          placeholder="🔎 Search Bookmarks"
          @keydown.enter="go"
        />
        <button
          class="text-stone-500 hover:text-stone-600 bg-white dark:bg-stone-600 p-2 w-12 text-xs"
          @click="toggleSort"
        >
          {{ isSorting ? SortSetting.Descending : SortSetting.Ascending }}
        </button>
        <button
          class="text-stone-500 hover:text-stone-600 bg-white dark:bg-stone-600 p-2 w-12"
          @click="toggleFilter"
        >
          {{
            isFiltering ? FavoriteStatus.Favorite : FavoriteStatus.NotFavorite
          }}
        </button>
        <button
          class="text-stone-500 hover:text-stone-600 bg-white dark:bg-stone-600 p-2 w-12"
          @click="addBookmark()"
        >
          +
        </button>
      </div>
      <div class="flex flex-row h-full overflow-hidden rounded-b-lg">
        <div class="flex-[2]">
          <nav class="overflow-hidden rounded-bl-lg h-full">
            <div class="overflow-y-scroll max-h-full shadow-lg bg-white h-full">
              <ul>
                <template v-if="bookmarks.length > 0">
                  <li
                    v-for="bookmark in bookmarks"
                    :key="bookmark.id"
                    class="flex bg-white p-4 gap-5 border-b dark:border-stone-800 dark:bg-stone-600 dark:text-stone-100"
                  >
                    <a
                      class="flex-1 overflow-hidden break-words hover:bg-stone-200 rounded-lg p-2"
                      :href="bookmark.url"
                    >
                      <div class="container">
                        <h2 class="text-stone-600 text-sm">
                          {{ bookmark.title }}
                        </h2>
                        <p class="text-sm text-stone-400 dark:text-stone-300">
                          {{ bookmark.url }}
                        </p>
                      </div>
                    </a>
                    <button
                      class="text-stone-500 hover:text-stone-600"
                      type="button"
                      @click="toggleFavorite(bookmark.id)"
                    >
                      {{
                        bookmark.isFavorite
                          ? FavoriteStatus.Favorite
                          : FavoriteStatus.NotFavorite
                      }}
                    </button>
                    <button
                      class="text-stone-500 hover:text-stone-600"
                      type="button"
                      @click="editBookmark(bookmark.id)"
                    >
                      <!-- $router.push({
                          name: 'bookmark',
                          params: { id: bookmark.id },
                        }) -->
                      ✎
                    </button>
                  </li>
                </template>
                <template v-else>
                  <li class="p-4 bg-white">
                    <h2
                      class="bg-white dark:bg-stone-600 dark:text-stone-100 p-2 text-sm"
                    >
                      No bookmarks found
                    </h2>
                  </li>
                </template>
              </ul>
            </div>
          </nav>
        </div>
        <div
          v-if="selectedBookmark"
          class="rounded-br-lg bg-white w-1/3 text-sm p-6"
        >
          <div
            class="col-start-2 lg:col-start-4 col-span-3 row-start-3 row-span-1 flex flex-col text-white gap-y-2 h-full"
          >
            <template v-if="confirmation">
              <div class="flex flex-col flex-1 text-stone-600">
                Are you sure you want to remove this bookmark?
              </div>
              <div class="flex flex-col space-y-2">
                <button
                  class="w-full bg-stone-600 dark:bg-stone-600 rounded-lg p-2"
                  @click="remove"
                >
                  Remove
                </button>
                <button
                  class="w-full bg-stone-600 dark:bg-stone-600 rounded-lg p-2"
                  @click="confirmation = !confirmation"
                >
                  Cancel
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col flex-1">
                <div class="flex-1 space-y-2">
                  <h2 class="text-center text-stone-600 text-sm">
                    {{ selectedBookmark.id ? `Edit` : `Add` }} Bookmark
                  </h2>
                  <input
                    v-model="selectedBookmark.title"
                    class="w-full text-stone-600 dark:bg-stone-700 rounded-lg p-2 border border-stone-300 text-sm"
                    placeholder="Title"
                  />
                  <input
                    v-model="selectedBookmark.url"
                    class="w-full text-stone-600 dark:bg-stone-700 rounded-lg p-2 border border-stone-300 text-sm"
                    placeholder="URL"
                  />

                  <button
                    class="flex text-left text-stone-600 dark:bg-stone-700 rounded-lg p-2 cursor-pointer w-full border border-stone-300 text-sm"
                    @click="selectedBookmark!.isFavorite = !selectedBookmark!.isFavorite"
                  >
                    <div class="flex-1">Favorite</div>
                    <div>
                      {{
                        selectedBookmark.isFavorite
                          ? FavoriteStatus.Favorite
                          : FavoriteStatus.NotFavorite
                      }}
                    </div>
                  </button>
                </div>
                <div class="flex flex-col space-y-2">
                  <button
                    class="mt-2 w-full bg-stone-600 dark:bg-stone-600 rounded-lg p-2 text-center text-sm"
                    @click="save"
                  >
                    Save
                  </button>
                  <button
                    v-if="selectedBookmark.id"
                    class="w-full bg-stone-600 dark:bg-stone-600 rounded-lg p-2 text-center text-sm"
                    @click="confirmation = true"
                  >
                    Remove
                  </button>
                  <button
                    class="w-full bg-stone-600 dark:bg-stone-600 rounded-lg p-2 text-center text-sm"
                    @click="selectedBookmark = undefined"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
