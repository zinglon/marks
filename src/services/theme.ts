import { ThemeData, themeData } from "../data/theme";
import { ThemeOption } from "../types";

export const createThemeService = (themeData: ThemeData) => {
  const getThemeOrDefault = () => themeData.getTheme() ?? ThemeOption.Light;
  const toggleTheme = () => {
    const newTheme =
      getThemeOrDefault() === ThemeOption.Light
        ? ThemeOption.Dark
        : ThemeOption.Light;
    themeData.setTheme(newTheme);
    return newTheme;
  };

  const getTheme = () => getThemeOrDefault();
  return {
    getTheme,
    toggleTheme,
  };
};

export const themeService = createThemeService(themeData);
export type ThemeService = typeof themeService;

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("createThemeService", () => {
    describe("getTheme", () => {
      it("gets saved theme", () => {
        const themeData: ThemeData = {
          getTheme: vi.fn().mockReturnValue(ThemeOption.Dark),
          setTheme: vi.fn(),
        };
        const themeService = createThemeService(themeData);
        const result = themeService.getTheme();
        expect(result).toBe(ThemeOption.Dark);
      });
      it("gets light theme by default", () => {
        const themeData: ThemeData = {
          getTheme: vi.fn().mockReturnValue(null),
          setTheme: vi.fn(),
        };
        const themeService = createThemeService(themeData);
        const result = themeService.getTheme();
        expect(result).toBe(ThemeOption.Light);
      });
    });
    describe("toggleTheme", () => {
      it("toggles theme from dark to light and returns new theme", () => {
        const themeData: ThemeData = {
          getTheme: vi.fn().mockReturnValue(ThemeOption.Dark),
          setTheme: vi.fn(),
        };
        const themeService = createThemeService(themeData);
        const result = themeService.toggleTheme();
        expect(themeData.setTheme).toHaveBeenCalledWith(ThemeOption.Light);
        expect(result).toBe(ThemeOption.Light);
      });
      it("toggles theme from light to dark and returns new theme", () => {
        const themeData: ThemeData = {
          getTheme: vi.fn().mockReturnValue(ThemeOption.Light),
          setTheme: vi.fn(),
        };
        const themeService = createThemeService(themeData);
        const result = themeService.toggleTheme();
        expect(themeData.setTheme).toHaveBeenCalledWith(ThemeOption.Dark);
        expect(result).toBe(ThemeOption.Dark);
      });
    });
  });
}
