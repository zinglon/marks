<script setup lang="ts">
import TextInput from "../components/TextInput.vue";
import FormButton from "../components/FormButton.vue";
import CommandPalette from "../components/CommandPalette.vue";
import IconButton from "../components/IconButton.vue";
import ListItem from "../components/ListItem.vue";
import { onMounted, ref, watch } from "vue";
import { Bookmark, FavoriteStatus, SortSetting } from "../types";
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
  <div class="flex-1 flex justify-center items-center text-sm">
    <CommandPalette>
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
                placeholder="🔎 Search Bookmarks"
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

            <ul class="h-full overflow-y-scroll">
              <ListItem
                v-for="bookmark in bookmarks"
                :key="bookmark.id"
                :bookmark="bookmark"
                :is-editing="bookmark.id === selectedBookmark?.id"
                @favorite-clicked="toggleFavorite"
                @edit-clicked="editBookmark"
              />
            </ul>
          </div>
          <div
            v-if="selectedBookmark"
            class="min-w-full sm:min-w-[40%] overflow-hidden break-words flex flex-col p-4 sm:border-l dark:border-gray-700"
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
            <template v-else>
              <h2 class="text-center pb-4">
                {{ selectedBookmark.id ? `Edit` : `Add` }} Bookmark
              </h2>
              <div class="flex-1 flex flex-col">
                <div class="flex flex-col space-y-2">
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
                  <p class="text-red-500 text-center">{{ error }}</p>
                </div>
                <div
                  class="flex-1 flex flex-col justify-end items-end text-white space-y-2"
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
    </CommandPalette>
  </div>
</template>
