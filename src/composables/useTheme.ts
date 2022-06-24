import { computed, onMounted, ref } from "vue";

import * as themeService from "../services/theme";
import { ThemeOption } from "../types";

export const useTheme = () => {
  const selectedTheme = ref<ThemeOption>();
  onMounted(() => (selectedTheme.value = themeService.getTheme()));
  const toggleTheme = () => (selectedTheme.value = themeService.toggleTheme());
  const isDarkTheme = computed(() => selectedTheme.value === ThemeOption.Dark);
  return { isDarkTheme, selectedTheme, toggleTheme };
};
