import * as data from "../data/index.js";
import { handleSearch } from "../js/index.js";
/**
 * Bookmarks
 */
const getBookmarksList = () => document.querySelector("#bookmark-list");
const getSearchInput = () => document.querySelector("#search");
const getBookmarkTemplate = () => document.querySelector("#bookmark-template");

const addBookmarkOption = (bookmark) => {
  const bookmarkOption = getBookmarkTemplate().content.cloneNode(true);

  const link = bookmarkOption.querySelector("a");
  link.href = bookmark.url;

  const title = bookmarkOption.querySelector("h2");
  title.textContent = bookmark.title;
  
  const url = bookmarkOption.querySelector("p");
  url.textContent = bookmark.url;

  const button = bookmarkOption.querySelector("button");

  if (bookmark.id) {
    button.value = bookmark.id;
    const updateButtonText = (isFavorite) => {
      button.textContent = isFavorite ? "★" : "☆";
    }
    updateButtonText(data.bookmarks.isFavorite(bookmark.id));
    button.addEventListener('click', (e) => {
      // TODO: pass data in as param
      if(data.bookmarks.isFavorite(e.target.value)) {
        data.bookmarks.removeFavorite(e.target.value)
      } else {
        data.bookmarks.addFavorite(e.target.value)
      }
      updateButtonText(data.bookmarks.isFavorite(e.target.value));
    });
  }

  getBookmarksList().appendChild(bookmarkOption);
}

const showNoResults = () => addBookmarkOption({ title: "No results"})

const clearBookmarkList = () => getBookmarksList().replaceChildren();

const createSearchHandler = (searchHandler) => 
  getSearchInput().addEventListener("input", (e) => searchHandler(e.target.value));

// TODO: pass data in as param
// TODO: make handle search a param or something
document.querySelector(".input-container button").addEventListener('click', (e) => {
  const isFiltering = e.target.value === "true";
  e.target.value = !isFiltering;
  data.bookmarks.setFilterFavorites(!isFiltering);
  handleSearch(getSearchInput().value);
});
document.querySelector(".input-container button").value = data.bookmarks.getFilterFavorites()

export const bookmarks = { addBookmarkOption, showNoResults, clearBookmarkList, createSearchHandler };

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