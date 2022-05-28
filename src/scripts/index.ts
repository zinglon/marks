import * as data from '../data/index.js'
import { Bookmark, reactive } from '../types/index.js'
import { createApp } from '../petite-vue/index.js'

const store = reactive({
  bookmarks: [] as Bookmark[],
  searchString: '',
  isSearching: false,
  isSorting: false,
  isFiltering: false,
  selectedBookmark: null as Bookmark | null,
  async getBookmarks (searchString?: string) {
    this.isSearching = true
    this.searchString = searchString ?? ''
    this.bookmarks = await data.bookmarks.getBookmarks(this.searchString, this.isFiltering, this.isSorting)
    this.isSearching = false
  },
  async toggleSort () {
    this.isSorting = !this.isSorting
    await this.getBookmarks(this.searchString)
  },
  async toggleFilter () {
    this.isFiltering = !this.isFiltering
    await this.getBookmarks(this.searchString)
  },
  async toggleFavorite (bookmarkId: string) {
    data.bookmarks.toggleFavorite(bookmarkId)
    // Patch for better UX
    const bookmark = this.bookmarks.find(bookmark => bookmark.id === bookmarkId)! // (O_o)
    bookmark.isFavorite = !bookmark.isFavorite
  },
  createBookmark () {
    this.selectedBookmark = { id: '', title: '', url: '' }
  },
  toggleEditing (bookmarkId?: string) {
    this.selectedBookmark = bookmarkId ? this.bookmarks.find(bookmark => bookmark.id === bookmarkId)! : null
  }
})

interface ThemeOption { id: string, label: string }

const themeController = reactive({
  themeOptions: [
    { id: 'light', label: '☼' },
    { id: 'dark', label: '☾' }
  ],
  selectTheme (theme: string) {
    themeController.theme = theme
  },
  get theme () {
    return data.theme.getTheme()
  },
  set theme (theme: string) {
    data.theme.setTheme(theme)
  },
  get themeButtons (): ThemeOption[] {
    return themeController.themeOptions.filter(button => button.id !== themeController.theme)
  }
})

store.getBookmarks()

createApp({ store, themeController }).mount()

// todo: add alt text to images
// todo: clean up css
// todo: research after favorite/unfavorite
// todo: Warning: cloneNode() may lead to duplicate element IDs in a document!
