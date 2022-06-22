export interface Bookmark {
  id: string;
  title: string;
  url: string;
  isFavorite?: boolean;
  tags?: string[];
}

export enum ThemeOption {
  Light = "light",
  Dark = "dark",
}

export interface BookmarkTag {
  bookmarkId: string;
  tags: string[];
}

export interface LocalStorage {
  theme: ThemeOption;
  tags: BookmarkTag[];
  favorites: string[];
}

export enum Icon {
  Pencil = "✎",
  MagnifyingGlass = "🔎 ",
  Star = "☼",
  Moon = "☾",
  X = "✕",
  Ascending = "AZ↓",
  Descending = "AZ↑",
  Favorite = "★",
  NotFavorite = "☆",
  Add = "+",
}
