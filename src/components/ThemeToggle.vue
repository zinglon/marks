<script setup lang="ts">
import { ThemeOption, Icon } from "../types";
defineProps<{
  theme: {
    selectedTheme?: ThemeOption;
    toggleTheme: () => ThemeOption;
    isDarkTheme: boolean;
  };
}>();
</script>
<template>
  <button class="m-2 leading-4" @click="theme.toggleTheme">
    {{ theme.isDarkTheme ? Icon.Star : Icon.Moon }}
  </button>
</template>
