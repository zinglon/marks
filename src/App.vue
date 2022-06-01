<script setup lang="ts">
import { onMounted, ref } from "vue";
// import { useRouter } from "vue-router";
import { ThemeOption } from "./types";
import * as data from "./data";

// const { push } = useRouter();
// onMounted(() => push({ name: "home" }));
const theme = ref<ThemeOption>(ThemeOption.Light);
onMounted(() => (theme.value = data.theme.getTheme()));
// const toggleTheme = () => (theme.value = data.theme.toggleTheme());
</script>

<template>
  <div
    class="max-h-full min-h-full flex flex-col bg-[url('/public/background_image.avif')] bg-cover bg-center"
  >
    <!-- :class="{ dark: theme === ThemeOption.Dark }" -->
    <!-- <div class="dark:bg-zinc-800 text-white flex flex-row justify-end">
      <button class="m-2" @click="toggleTheme">
        {{ theme === ThemeOption.Dark ? "☼" : "☾" }}
      </button>
    </div> -->
    <router-view />
  </div>
</template>
