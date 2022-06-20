import { BookmarkTag, LocalStorage } from "../types";
import useLocalStorage from "../lib/useLocalStorage";

const { getValue, setValue } = useLocalStorage<LocalStorage>();

const getTags = () => getValue("tags") ?? [];
const setTags = (tags: BookmarkTag[]) => setValue("tags", tags);
export const tags = { getTags, setTags };
