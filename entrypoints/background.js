import { browser } from "wxt/browser";

export default defineBackground(() => {
  browser.action.onClicked.addListener(function () {
    browser.tabs.create({ url: browser.runtime.getURL("ext.html") });
  });
});
