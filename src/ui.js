const getBookmarksList = () => document.querySelector("#bookmark-list")
const getSearchInput = () => document.querySelector("#search")

export const addBookmarkOption = (bookmark) => {
  const template = document.querySelector("#bookmark-template");
  const bookmarkOption = template.content.cloneNode(true);

  const link = bookmarkOption.querySelector("a");
  link.href = bookmark.url;

  const title = bookmarkOption.querySelector("h2");
  title.textContent = bookmark.title;
  
  const url = bookmarkOption.querySelector("p");
  url.textContent = bookmark.url;

  getBookmarksList().appendChild(bookmarkOption);
}

export const showNoResults = () => {
  const listItem = document.createElement("li");
  listItem.textContent = "No results";
  listItem.classList.add("container");
  getBookmarksList().appendChild(listItem);
}

export const clearBookmarkList = () => getBookmarksList().replaceChildren();

export const createSearchHandler = (searchHandler) => 
  getSearchInput().addEventListener("input", (e) => searchHandler(e.target.value));