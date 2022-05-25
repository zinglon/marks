import * as data from '../data/index.js'
import { handleSearch } from './index.js'
import { unwrapValue, getElement } from '../lib/helpers.js'

enum FavoriteStatus {
  Favorite = '★',
  NotFavorite = '☆'
}

/**
 * Bookmarks
 */
const getBookmarksList = () => getElement<HTMLUListElement>(document, '#bookmark-list')
const getSearchInput = () => getElement<HTMLInputElement>(document, '#search')
const getBookmarkTemplate = () => getElement<HTMLTemplateElement>(document, '#bookmark-template')
const getSearchInputContainer = () => getElement(document, '.input-container')
const getBookmarkDetail = () => getElement(document, '.edit-container')
const getCreateBookmark = () => getElement(document, '.new')
const getCancelCreateBookmark = () => getElement(document, '.cancel')

const addBookmarkOption = (bookmark: browser.bookmarks.BookmarkTreeNode) => {
  const bookmarkOption = getBookmarkTemplate().content.cloneNode(true) as HTMLElement

  const link = getElement<HTMLAnchorElement>(bookmarkOption, 'a')
  link.href = bookmark.url ?? ''

  const title = getElement<HTMLHeadingElement>(bookmarkOption, 'h2')
  title.textContent = bookmark.title

  const url = getElement<HTMLParagraphElement>(bookmarkOption, 'p')
  url.textContent = bookmark.url ?? ''

  const favoriteButton = getElement<HTMLButtonElement>(bookmarkOption, '.favorite')

  if (bookmark.id) {
    favoriteButton.value = bookmark.id
    const updateButtonText = (isFavorite: boolean) => {
      favoriteButton.textContent = isFavorite ? FavoriteStatus.Favorite : FavoriteStatus.NotFavorite
    }
    updateButtonText(data.bookmarks.isFavorite(bookmark.id))
    favoriteButton.addEventListener('click', (e) => {
      // TODO: pass data in as param
      if (data.bookmarks.isFavorite(unwrapValue(e))) {
        data.bookmarks.removeFavorite(unwrapValue(e))
      } else {
        data.bookmarks.addFavorite(unwrapValue(e))
      }
      updateButtonText(data.bookmarks.isFavorite(unwrapValue(e)))
    })

    const editButton = bookmarkOption.querySelector('.edit')!
    editButton.addEventListener('click', hideShowEdit)
  }

  getBookmarksList().appendChild(bookmarkOption)
}

const hideShowEdit = () => {
  getSearchInputContainer().classList.toggle('hidden')
  getBookmarksList().classList.toggle('hidden')
  getBookmarkDetail().classList.toggle('hidden')
}

getCreateBookmark().addEventListener('click', hideShowEdit)
getCancelCreateBookmark().addEventListener('click', hideShowEdit)

const showNoResults = () => addBookmarkOption({ id: '', title: 'No results' })

const clearBookmarkList = () => getBookmarksList().replaceChildren()

const createSearchHandler = (searchHandler: (s: string) => Promise<void>) =>
  getSearchInput().addEventListener('input', (e) => searchHandler(unwrapValue(e)))

const createFilterHandler = () => {
  // TODO: pass data in as param
  // TODO: make handle search a param or something
  document.querySelector('.input-container .filter')?.addEventListener('click', (e) => {
    const isFiltering = unwrapValue(e) === 'true'
    if (e.target) {
      (e.target as HTMLButtonElement).value = (!isFiltering).toString()
    }
    data.bookmarks.setFilterFavorites(!isFiltering)
    handleSearch(getSearchInput().value)
  });
  (document.querySelector('.input-container .filter') as any).value = data.bookmarks.getFilterFavorites()
}

const createSortHandler = () => {
  document.querySelector('button.sort')?.addEventListener('click', (e) => {
    // consider asc/desc enum?
    const isSorting = unwrapValue(e) === 'asc'
    if (e.target) {
      (e.target as HTMLButtonElement).value = isSorting ? 'desc' : 'asc'
    }
    data.bookmarks.setSortingAsc(!isSorting)
    handleSearch(getSearchInput().value)
  })
}

export const bookmarks = { addBookmarkOption, showNoResults, clearBookmarkList, createSearchHandler, createFilterHandler, createSortHandler }

/**
 * Theme
 */
const DEFAULT_THEME = 'light'
const getControlButtons = () => document.querySelectorAll('.controls > button')
const selectTheme = (d: typeof data.theme, theme: string) => {
  document.documentElement.setAttribute('data-theme', theme)
  d.setTheme(theme)
}

const createThemeHandler = (d: typeof data.theme) => {
  getControlButtons().forEach(button => button.addEventListener('click', (e) => selectTheme(d, unwrapValue(e))))
  const currentTheme = d.getTheme() ?? DEFAULT_THEME
  selectTheme(d, currentTheme)
}

export const theme = { createThemeHandler }
