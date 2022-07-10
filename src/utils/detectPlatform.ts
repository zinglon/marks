import * as browser from "webextension-polyfill";
export const isFirefox = async () =>
  browser.runtime.getBrowserInfo &&
  (await browser.runtime.getBrowserInfo()).name === "Firefox";
