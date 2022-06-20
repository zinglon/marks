import { ThemeOption, LocalStorage } from "../types";
import useLocalStorage from "../lib/useLocalStorage";

const { getValue, setValue } = useLocalStorage<LocalStorage>();

const getTheme = () => getValue("theme");
const setTheme = (theme: ThemeOption) => setValue("theme", theme);
export const theme = { getTheme, setTheme };
