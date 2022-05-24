import * as data from "../data/index.js";
import { handleSearch } from "../js/index.js";
/**
 * Bookmarks
 */
const getBookmarksList = () => document.querySelector("#bookmark-list");
const getSearchInput = () => document.querySelector("#search");
const getBookmarkTemplate = () => document.querySelector("#bookmark-template");
const getSearchInputContainer = () => document.querySelector(".input-container");
const getBookmarkDetail = () => document.querySelector(".edit-container");

const addBookmarkOption = (bookmark) => {
  const bookmarkOption = getBookmarkTemplate().content.cloneNode(true);

  const link = bookmarkOption.querySelector("a");
  link.href = bookmark.url;

  const title = bookmarkOption.querySelector("h2");
  title.textContent = bookmark.title;
  
  const url = bookmarkOption.querySelector("p");
  url.textContent = bookmark.url;

  const favoriteButton = bookmarkOption.querySelector(".favorite");

  if (bookmark.id) {
    favoriteButton.value = bookmark.id;
    const updateButtonText = (isFavorite) => {
      favoriteButton.textContent = isFavorite ? "★" : "☆";
    }
    updateButtonText(data.bookmarks.isFavorite(bookmark.id));
    favoriteButton.addEventListener('click', (e) => {
      // TODO: pass data in as param
      if(data.bookmarks.isFavorite(e.target.value)) {
        data.bookmarks.removeFavorite(e.target.value)
      } else {
        data.bookmarks.addFavorite(e.target.value)
      }
      updateButtonText(data.bookmarks.isFavorite(e.target.value));
    });

    const editButton = bookmarkOption.querySelector(".edit");
    editButton.addEventListener('click', hideShowEdit);
  }

  getBookmarksList().appendChild(bookmarkOption);
}

const hideShowEdit = () => {
  getSearchInputContainer().classList.toggle("hidden");
  getBookmarksList().classList.toggle("hidden");
  getBookmarkDetail().classList.toggle("hidden");
}

document.querySelector(".new").addEventListener('click', hideShowEdit);
document.querySelector(".cancel").addEventListener('click', hideShowEdit);

const showNoResults = () => addBookmarkOption({ title: "No results"})

const clearBookmarkList = () => getBookmarksList().replaceChildren();

const createSearchHandler = (searchHandler) => 
  getSearchInput().addEventListener("input", (e) => searchHandler(e.target.value));

const createFilterHandler = () => {
  // TODO: pass data in as param
  // TODO: make handle search a param or something
  document.querySelector(".input-container .filter").addEventListener('click', (e) => {
    const isFiltering = e.target.value === "true";
    e.target.value = !isFiltering;
    data.bookmarks.setFilterFavorites(!isFiltering);
    handleSearch(getSearchInput().value);
  });
  document.querySelector(".input-container .filter").value = data.bookmarks.getFilterFavorites();
}

const createSortHandler = () => {
  document.querySelector("button.sort").addEventListener('click', (e) => {
    // consider asc/desc enum?
    const isSorting = e.target.value === "asc";
    e.target.value = isSorting ? "desc" : "asc";
    data.bookmarks.setSortingAsc(!isSorting);
    handleSearch(getSearchInput().value);
  })
}

export const bookmarks = { addBookmarkOption, showNoResults, clearBookmarkList, createSearchHandler, createFilterHandler, createSortHandler };

/**
 * Theme
 */
const DEFAULT_THEME = 'light';
const getControlButtons = () => document.querySelectorAll(".controls > button");
const selectTheme = (data, theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  data.setTheme(theme);
};

const createThemeHandler = (data) => {
  getControlButtons().forEach(button => button.addEventListener('click', (e) => selectTheme(data, e.target.value)));
  const currentTheme = data.getTheme() ?? DEFAULT_THEME;
  selectTheme(data, currentTheme);
}

export const theme = { createThemeHandler };