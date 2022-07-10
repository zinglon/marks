import * as browser from "webextension-polyfill";

import { assertIsDefined } from "../utils/assertIsDefined";
import { isFirefox } from "../utils/detectPlatform";

export const createTabDataAccessor = (tabApi: typeof browser.tabs) => {
  const createTab = async (url: string, openInReaderMode?: boolean) => {
    let options: browser.Tabs.CreateCreatePropertiesType = { url };
    if (await isFirefox()) options = { ...options, openInReaderMode };
    await browser.tabs.create(options);
  };
  const closeCurrentTab = async () => {
    const currentTabId = (await tabApi.getCurrent()).id;
    assertIsDefined(currentTabId);
    await tabApi.remove(currentTabId);
  };
  return { closeCurrentTab, createTab };
};

// TODO: figure out how to make vitest play nice with browser.tabs
// maybe look at https://vitest.dev/guide/mocking.html#globals
// eslint-disable-next-line
export const tabData = (
  import.meta.env.MODE !== "test"
    ? createTabDataAccessor(browser.tabs)
    : undefined
)!;

export type TabData = typeof tabData;
