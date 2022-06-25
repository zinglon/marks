import useLocalStorage from "../lib/useLocalStorage";
import { BookmarkTag, LocalStorage } from "../types";

const { getValue, setValue } = useLocalStorage<LocalStorage>();

const getTags = () => getValue("tags") ?? [];
const setTags = (tags: BookmarkTag[]) => setValue("tags", tags);

export const tagData = { getTags, setTags };
export type TagData = typeof tagData;
