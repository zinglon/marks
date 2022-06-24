<script setup lang="ts">
import { Bookmark, Icon } from "../types";
import IconButton from "./IconButton.vue";
import IconButtonContainer from "./IconButtonContainer.vue";

const props = defineProps<{ bookmark: Bookmark; isEditing: boolean }>();

defineEmits<{
  (e: "favorite-clicked", value: string): void;
  (e: "edit-clicked", value: string): void;
}>();
</script>

<template>
  <li
    class="flex flex-row space-x-2 p-2"
    :class="{ 'bg-stone-200 dark:bg-gray-800': isEditing }"
  >
    <a
      class="flex-1 overflow-hidden break-words hover:bg-stone-300 dark:hover:bg-gray-700 rounded-lg p-2"
      :href="props.bookmark.url"
    >
      <h2>{{ props.bookmark.title }}</h2>
      <p>{{ props.bookmark.url }}</p>
    </a>
    <IconButtonContainer>
      <template v-if="isEditing">
        <div
          class="py-2 px-3 select-none"
          :class="{ 'text-stone-400': isEditing }"
        >
          ›
        </div>
      </template>
      <template v-else>
        <IconButton @click="$emit('favorite-clicked', bookmark.id)">
          {{ bookmark.isFavorite ? Icon.Favorite : Icon.NotFavorite }}
        </IconButton>
        <IconButton
          v-if="!isEditing"
          @click="$emit('edit-clicked', bookmark.id)"
        >
          {{ Icon.Pencil }}
        </IconButton>
      </template>
    </IconButtonContainer>
  </li>
</template>
