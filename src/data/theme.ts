import useLocalStorage from "../lib/useLocalStorage";
import { LocalStorage, ThemeOption } from "../types";

const { getValue, setValue } = useLocalStorage<LocalStorage>();

const getTheme = () => getValue("theme");
const setTheme = (theme: ThemeOption) => setValue("theme", theme);

export const themeData = { getTheme, setTheme };
export type ThemeData = typeof themeData;
