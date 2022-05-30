<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Bookmark, FavoriteStatus } from "../types";
import * as data from "../data";
import { useRouter } from "vue-router";

const props = defineProps<{ id: string }>();
const { push } = useRouter();
const bookmark = ref<Bookmark>({
  id: "",
  title: "",
  url: "",
  isFavorite: false,
});
const supportedProtocols = ref<string[]>([]);
onMounted(async () => {
  if (props.id) bookmark.value = await data.bookmarks.getBookmark(props.id);
  supportedProtocols.value = data.bookmarks.getSupportedProtocols();
});

const hasError = () => {
  if (
    !supportedProtocols.value.some((protocol) =>
      bookmark.value.url?.startsWith(protocol)
    )
  ) {
    return `URL must start with ` + supportedProtocols.value.join(", ");
  }
};

const error = ref<string>();
watch(bookmark, () => (error.value = undefined), { deep: true });

const save = async () => {
  error.value = hasError();
  if (!error.value) {
    try {
      if (bookmark.value.id) {
        await data.bookmarks.updateBookmark(bookmark.value);
      } else {
        bookmark.value = await data.bookmarks.createBookmark(bookmark.value);
      }
    } catch (err) {
      error.value = "Something went wrong";
    }
  }
};

const remove = async () => {
  await data.bookmarks.removeBookmark(bookmark.value.id);
  push("/");
};

const toggleFavorite = () =>
  (bookmark.value.isFavorite = !bookmark.value.isFavorite);

const confirmation = ref(false);
</script>

<template>
  <div
    class="grid grid-cols-5 grid-rows-5 lg:grid-cols-9 max-h-full min-h-full flex-1 bg-blue-700 dark:bg-zinc-800"
  >
    <div
      class="col-span-full row-start-1 row-span-2 bg-blue-700 dark:bg-zinc-800 flex justify-center items-end -mb-12"
    >
      <h1 class="text-3xl mb-32 font-semibold text-white">
        {{ bookmark.id ? `Edit` : `Create` }} Bookmark
      </h1>
    </div>
    <template v-if="confirmation">
      <div
        class="col-start-2 lg:col-start-4 col-span-3 row-start-3 row-span-1 flex flex-col text-white gap-y-2 text-center"
      >
        Are you sure you want to remove this bookmark?
        <button
          class="w-full bg-blue-800 dark:bg-zinc-600 rounded-lg p-2"
          @click="remove"
        >
          Remove
        </button>
        <button
          class="w-full bg-blue-800 dark:bg-zinc-600 rounded-lg p-2"
          @click="confirmation = !confirmation"
        >
          Cancel
        </button>
      </div>
    </template>
    <template v-else>
      <div
        class="col-start-2 lg:col-start-4 col-span-3 row-start-3 row-span-1 flex flex-col text-white gap-y-2"
      >
        <input
          v-model="bookmark.title"
          class="w-full bg-blue-900 dark:bg-zinc-700 rounded-lg p-2"
          placeholder="Title"
        />
        <input
          v-model="bookmark.url"
          class="w-full bg-blue-900 dark:bg-zinc-700 rounded-lg p-2"
          placeholder="URL"
        />

        <button
          class="flex text-left bg-blue-900 dark:bg-zinc-700 rounded-lg p-2 cursor-pointer"
          @click="toggleFavorite"
        >
          <div class="flex-1">Favorite</div>
          <div>
            {{
              bookmark.isFavorite
                ? FavoriteStatus.Favorite
                : FavoriteStatus.NotFavorite
            }}
          </div>
        </button>

        <button
          class="mt-2 w-full bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 text-center"
          @click="save"
        >
          Save
        </button>
        <button
          v-if="bookmark.id"
          class="w-full bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 text-center"
          @click="confirmation = !confirmation"
        >
          Remove
        </button>
        <router-link
          class="w-full bg-blue-800 dark:bg-zinc-600 rounded-lg p-2 text-center"
          to="/"
          >Cancel</router-link
        >
        <div class="mt-2 w-full rounded-lg p-2 text-center text-red-400">
          {{ error }}
        </div>
      </div>
    </template>
  </div>
</template>
