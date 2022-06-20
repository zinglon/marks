export interface Bookmark {
  id: string;
  title: string;
  url: string;
  isFavorite?: boolean;
  tags?: string[];
}

export enum SortSetting {
  Ascending = "AZ↓",
  Descending = "AZ↑",
}

export enum FavoriteStatus {
  Favorite = "★",
  NotFavorite = "☆",
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
