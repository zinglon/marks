import useLocalStorage from "../lib/useLocalStorage";
import { LocalStorage, ThemeOption } from "../types";

const { getValue, setValue } = useLocalStorage<LocalStorage>();

const getTheme = () => getValue("theme");
const setTheme = (theme: ThemeOption) => setValue("theme", theme);
export const theme = { getTheme, setTheme };
