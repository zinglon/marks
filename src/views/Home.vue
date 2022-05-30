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
</script>
<template>
  <div
    class="grid grid-cols-5 grid-rows-5 lg:grid-cols-9 max-h-full min-h-full flex-1 bg-zinc-200 dark:bg-zinc-700"
  >
    <div
      class="col-span-full row-start-1 row-span-2 bg-blue-700 dark:bg-zinc-800 flex justify-center items-end -mb-12"
    >
      <h1 class="text-3xl mb-32 font-semibold text-white">'marks</h1>
    </div>
    <div
      class="col-start-2 lg:col-start-4 col-span-3 row-start-2 row-span-1 self-end flex mb-6 text-white gap-x-1"
    >
      <input
        v-model="searchString"
        autofocus
        class="w-full bg-blue-900 dark:bg-zinc-700 rounded-lg p-2"
        placeholder="Search"
      />
      <button
        class="bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 w-12 text-xs"
        @click="toggleSort"
      >
        {{ isSorting ? SortSetting.Descending : SortSetting.Ascending }}
      </button>
      <button
        class="bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 w-12"
        @click="toggleFilter"
      >
        {{ isFiltering ? FavoriteStatus.Favorite : FavoriteStatus.NotFavorite }}
      </button>
      <button
        class="bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 w-12"
        @click="$router.push({ name: 'bookmark' })"
      >
        +
      </button>
    </div>
    <div class="col-start-2 lg:col-start-4 col-span-3 row-start-3 row-span-3">
      <nav class="overflow-y-scroll max-h-full shadow-lg">
        <ul>
          <template v-if="bookmarks.length > 0">
            <li
              v-for="bookmark in bookmarks"
              :key="bookmark.id"
              class="flex bg-white p-2 gap-5 border-b dark:border-zinc-800 dark:bg-zinc-600 dark:text-zinc-100"
            >
              <a
                class="flex-1 overflow-hidden break-words"
                :href="bookmark.url"
              >
                <div class="container">
                  <h2>{{ bookmark.title }}</h2>
                  <p class="text-sm text-zinc-400 dark:text-zinc-300">
                    {{ bookmark.url }}
                  </p>
                </div>
              </a>
              <button
                class="favorite"
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
                type="button"
                @click="
                  $router.push({
                    name: 'bookmark',
                    params: { id: bookmark.id },
                  })
                "
              >
                ✎
              </button>
            </li>
          </template>
          <template v-else>
            <li>
              <h2 class="bg-white dark:bg-zinc-600 dark:text-zinc-100 p-2">
                No bookmarks found
              </h2>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </div>
</template>
