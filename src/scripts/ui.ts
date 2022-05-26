import { handleSearch, handleFilter, handleSort } from './index.js'
import { unwrapValue, getElement } from '../lib/helpers.js'
import { Bookmark, FavoriteStatus } from '../types/index.js'

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
const getFilterButton = () => getElement<HTMLInputElement>(document, '.input-container .filter')
const getSortButton = () => getElement<HTMLInputElement>(document, 'button.sort')

const addBookmarkOption = (bookmark: Bookmark, favoriteHandler?: (bookmarkId: string) => boolean) => {
  const bookmarkOption = getBookmarkTemplate().content.cloneNode(true) as HTMLElement

  const link = getElement<HTMLAnchorElement>(bookmarkOption, 'a')
  link.href = bookmark.url ?? ''

  const title = getElement<HTMLHeadingElement>(bookmarkOption, 'h2')
  title.textContent = bookmark.title

  const url = getElement<HTMLParagraphElement>(bookmarkOption, 'p')
  url.textContent = bookmark.url ?? ''

  const favoriteButton = getElement<HTMLButtonElement>(bookmarkOption, '.favorite')

  if (bookmark.id && favoriteHandler) {
    favoriteButton.value = bookmark.id
    favoriteButton.textContent = bookmark.isFavorite ? FavoriteStatus.Favorite : FavoriteStatus.NotFavorite
    favoriteButton.addEventListener('click', (e) => {
      const isFavorite = favoriteHandler(unwrapValue(e))
      favoriteButton.textContent = isFavorite ? FavoriteStatus.Favorite : FavoriteStatus.NotFavorite
    })

    const editButton = getElement<HTMLButtonElement>(bookmarkOption, '.edit')
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

const createFilterHandler = (isFilteringFavorites: boolean) => {
  getFilterButton().addEventListener('click', (e) => {
    handleFilter(e)
    handleSearch(getSearchInput().value)
  })
  getFilterButton().value = isFilteringFavorites.toString()
}

const createSortHandler = () => {
  getSortButton().addEventListener('click', (e) => {
    handleSort(e)
    handleSearch(getSearchInput().value)
  })
}

export const bookmarks = { addBookmarkOption, showNoResults, clearBookmarkList, createSearchHandler, createFilterHandler, createSortHandler }

/**
 * Theme
 */
const getControlButtons = () => document.querySelectorAll('.controls > button')
const selectTheme = (setTheme: (theme: string) => void, theme: string) => {
  document.documentElement.setAttribute('data-theme', theme)
  setTheme(theme)
}

const createThemeHandler = (getTheme: () => string, setTheme: (theme: string) => void) => {
  getControlButtons().forEach(button => button.addEventListener('click', (e) => selectTheme(setTheme, unwrapValue(e))))
  const currentTheme = getTheme()
  selectTheme(setTheme, currentTheme)
}

export const theme = { createThemeHandler }
