import { browser } from "wxt/browser";

export default defineBackground(() => {
  browser.contextMenus.create({
    id: "explain",
    title: "解释：%s",
    contexts: ["selection"]
  });

  browser.contextMenus.create({
    id: "summarize",
    title: "总结全文",
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
