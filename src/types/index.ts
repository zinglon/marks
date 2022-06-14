export interface Bookmark extends browser.bookmarks.BookmarkTreeNode {
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
