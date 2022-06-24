<script setup lang="ts">
import CommandPalette from "./components/CommandPalette.vue";
import SiteLayout from "./components/SiteLayout.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import TextInput from "./components/TextInput.vue";
import Chip from "./components/Chip.vue";
import ChipContainer from "./components/ChipContainer.vue";
import FormButton from "./components/FormButton.vue";
import IconButton from "./components/IconButton.vue";
import ListItem from "./components/ListItem.vue";
import Combobox from "./components/Combobox.vue";
import ToggleInput from "./components/ToggleInput.vue";
import Error from "./components/Error.vue";
import List from "./components/List.vue";
import CommandPaletteControls from "./components/CommandPaletteControls.vue";
import SearchInput from "./components/SearchInput.vue";
import IconButtonContainer from "./components/IconButtonContainer.vue";
import FormGroup from "./components/FormGroup.vue";
import { ref } from "vue";
import { Bookmark, Icon } from "./types";
import { bookmarks as bookmarkData } from "./services/bookmarks";
import { useBookmarkList } from "./composables/useBookmarkList";
import { useBookmarkEditor } from "./composables/useBookmarkEditor";
import { useTags } from "./composables/useTags";

const selectedBookmark = ref<Bookmark>();

const {
  searchString,
  bookmarks,
  isSorting,
  isFiltering,
  getBookmarks,
  toggleSort,
  toggleFilter,
  toggleFavorite,
  go,
} = useBookmarkList(bookmarkData);

const {
  tagOptions,
  tagInput,
  addTag,
  removeTag,
  getTagOptions,
  clearTagInput,
} = useTags(selectedBookmark);

const { confirmation, error, editBookmark, addBookmark, remove, save } =
  useBookmarkEditor(
    bookmarkData,
    selectedBookmark,
    getBookmarks,
    getTagOptions,
    clearTagInput
  );
</script>

<template>
  <SiteLayout>
    <template #header="{ theme }">
      <ThemeToggle :theme="theme" />
    </template>
    <template #content>
      <CommandPalette :is-open="!!selectedBookmark">
        <template #content>
          <CommandPaletteControls>
            <SearchInput
              v-model="searchString"
              :placeholder="`${Icon.MagnifyingGlass} Search Bookmarks`"
              @go="go"
            />
            <IconButtonContainer>
              <IconButton @click="toggleSort">
                {{ isSorting ? Icon.Descending : Icon.Ascending }}
              </IconButton>
              <IconButton @click="toggleFilter">
                {{ isFiltering ? Icon.Favorite : Icon.NotFavorite }}
              </IconButton>
              <IconButton @click="addBookmark()">{{ Icon.Add }}</IconButton>
            </IconButtonContainer>
          </CommandPaletteControls>
          <List :items="bookmarks">
            <template #list>
              <ListItem
                v-for="bookmark in bookmarks"
                :key="bookmark.id"
                :bookmark="bookmark"
                :is-editing="bookmark.id === selectedBookmark?.id"
                @favorite-clicked="toggleFavorite"
                @edit-clicked="editBookmark"
              />
            </template>
            <template #fallback>No bookmarks found</template>
          </List>
        </template>
        <template #drawer>
          <template v-if="confirmation">
            <FormGroup>
              <template #header>Remove Bookmark</template>
              <template #content>
                Are you sure you want to remove this bookmark?
              </template>
              <template #footer>
                <FormButton @click="remove">Remove</FormButton>
                <FormButton @click="confirmation = !confirmation">
                  Cancel
                </FormButton>
              </template>
            </FormGroup>
          </template>
          <template v-else-if="selectedBookmark">
            <FormGroup>
              <template #header>
                {{ selectedBookmark.id ? `Edit` : `Add` }} Bookmark
              </template>
              <template #content>
                <TextInput
                  v-model="selectedBookmark.title"
                  placeholder="Title"
                />
                <TextInput v-model="selectedBookmark.url" placeholder="URL" />
                <ToggleInput
                  :label="'Favorite'"
                  @toggle-clicked="
                      selectedBookmark!.isFavorite =
                        !selectedBookmark!.isFavorite
                    "
                >
                  {{
                    selectedBookmark.isFavorite
                      ? Icon.Favorite
                      : Icon.NotFavorite
                  }}
                </ToggleInput>
                <Combobox
                  v-model="tagInput"
                  :placeholder="'Add Tag'"
                  :options="tagOptions"
                  @add-tag="addTag"
                />
                <ChipContainer>
                  <Chip
                    v-for="tag in selectedBookmark.tags"
                    :key="tag"
                    :tag="tag"
                    @remove-tag="removeTag"
                  />
                </ChipContainer>
                <Error>{{ error }}</Error>
              </template>
              <template #footer>
                <FormButton @click="save">Save</FormButton>
                <FormButton
                  v-if="selectedBookmark.id"
                  @click="confirmation = true"
                >
                  Remove
                </FormButton>
                <FormButton @click="selectedBookmark = undefined">
                  Cancel
                </FormButton>
              </template>
            </FormGroup>
          </template>
        </template>
      </CommandPalette>
    </template>
    <template #footer>Footer</template>
  </SiteLayout>
</template>
