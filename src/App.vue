<script setup lang="ts">
import { onMounted, ref } from "vue";
// import { useRouter } from "vue-router";
import { ThemeOption } from "./types";
import * as data from "./data";

// const { push } = useRouter();
// onMounted(() => push({ name: "home" }));
const theme = ref<ThemeOption>(ThemeOption.Light);
onMounted(() => (theme.value = data.theme.getTheme()));
const toggleTheme = () => (theme.value = data.theme.toggleTheme());
</script>

<template>
  <div class="h-screen" :class="{ dark: theme === ThemeOption.Dark }">
    <div
      class="h-screen flex flex-col bg-[url('/public/background.avif')] dark:bg-[url('/public/background_dark.avif')] bg-cover bg-center text-stone-700 dark:text-gray-300"
    >
      <div class="text-white flex flex-row justify-end">
        <button class="m-2 leading-4" @click="toggleTheme">
          {{ theme === ThemeOption.Dark ? "☼" : "☾" }}
        </button>
      </div>
      <div class="flex flex-1 overflow-hidden">
        <router-view />
      </div>
      <div>Footer</div>
    </div>
  </div>
</template>
