export interface Bookmark extends browser.bookmarks.BookmarkTreeNode {
  isFavorite?: boolean
}

export enum SortSetting {
  Ascending = 'asc',
  Descending = 'desc'
}

export enum FavoriteStatus {
  Favorite = '★',
  NotFavorite = '☆'
}

export enum ThemeOption {
  Light = 'light',
  Dark = 'dark'
}
