import { browser } from "wxt/browser";

export default defineBackground(() => {
  browser.contextMenus.create({
    id: "explain",
    title: `${browser.i18n.getMessage("explain")}`,
    contexts: ["selection"]
  });

  browser.contextMenus.create({
    id: "copilot",
    title: `${browser.i18n.getMessage("copilot")}`,
    contexts: ["page"]
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    let injected = false;
    setTimeout(() => {
      if (!injected) {
        console.log('首次安装，调用失败')
      }
    }, 500);
    const res = await browser.tabs.sendMessage(tab.id, { type: 'ai', payload: info })
    if (res) {
      injected = true;
    }
  });
  browser.action.onClicked.addListener(function () {
    browser.tabs.create({ url: browser.runtime.getURL("ext.html") });
  });
});
