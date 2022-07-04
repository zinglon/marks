import { computed, onMounted, ref } from "vue";

import { ThemeService } from "../services/theme";
import { ThemeOption } from "../types";
import { withSetup } from "../utils/testHelpers";

export const useTheme = (themeService: ThemeService) => {
  const selectedTheme = ref<ThemeOption>();
  onMounted(() => (selectedTheme.value = themeService.getTheme()));
  const toggleTheme = () => (selectedTheme.value = themeService.toggleTheme());
  const isDarkTheme = computed(() => selectedTheme.value === ThemeOption.Dark);
  return { isDarkTheme, toggleTheme };
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;
  describe("useTheme", () => {
    it("gets the current theme on mounted", () => {
      const getTheme = vi.fn();
      const themeService: ThemeService = {
        getTheme: getTheme,
        toggleTheme: vi.fn(),
      };
      withSetup(() => useTheme(themeService));
      expect(getTheme).toHaveBeenCalled();
    });
    describe("isDarkTheme", () => {
      it("returns a boolean representing whether the current theme is dark or light", () => {
        const themeService: ThemeService = {
          getTheme: vi.fn().mockReturnValue(ThemeOption.Dark),
          toggleTheme: vi.fn(),
        };
        const { composable } = withSetup(() => useTheme(themeService));
        expect(composable.isDarkTheme.value).toBe(true);
      });
    });
    describe("toggleTheme", () => {
      it("toggles theme", () => {
        const themeService: ThemeService = {
          getTheme: vi.fn(),
          toggleTheme: vi.fn().mockReturnValue(ThemeOption.Dark),
        };
        const { composable } = withSetup(() => useTheme(themeService));
        expect(composable.isDarkTheme.value).toBe(false);
        composable.toggleTheme();
        expect(themeService.toggleTheme).toHaveBeenCalled();
        expect(composable.isDarkTheme.value).toBe(true);
      });
    });
  });
}
