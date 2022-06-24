import { ThemeOption } from "../types";
import * as themeService from "../services/theme";
import { ref, onMounted, computed } from "vue";

export const useTheme = () => {
  const selectedTheme = ref<ThemeOption>();
  onMounted(() => (selectedTheme.value = themeService.getTheme()));
  const toggleTheme = () => (selectedTheme.value = themeService.toggleTheme());
  const isDarkTheme = computed(() => selectedTheme.value === ThemeOption.Dark);
  return { selectedTheme, toggleTheme, isDarkTheme };
};
