import { ThemeOption } from "../types";

import { theme } from "../data/theme";

const getThemeOrDefault = () => theme.getTheme() ?? ThemeOption.Light;

export const toggleTheme = () => {
  const newTheme =
    getThemeOrDefault() === ThemeOption.Light
      ? ThemeOption.Dark
      : ThemeOption.Light;
  theme.setTheme(newTheme);
  return newTheme;
};

export const getTheme = () => getThemeOrDefault();
