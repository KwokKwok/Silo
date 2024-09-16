import { browser } from "wxt/browser";

export default defineBackground(() => {
  // browser.contextMenus.create({
  //   id: "explain",
  //   title: "问问AI",
  //   contexts: ["selection"]
  // });

  // browser.contextMenus.create({
  //   id: "summarize",
  //   title: "总结全文",
  //   contexts: ["page"]
  // });

  // browser.contextMenus.onClicked.addListener(async (info, tab) => {
  //   browser.scripting.executeScript({
  //     target: { tabId: tab.id },
  //     files: ['inject.js'],
  //     // args: [info]
  //   });
  //   if (info.menuItemId === "explain") {
  //     // 处理 AI 讲解逻辑

  //   } else if (info.menuItemId === "summarize") {
  //     // 处理 总结全文 逻辑
  //     console.log("总结全文:", tab.url);
  //   }
  // });
  browser.action.onClicked.addListener(function () {
    browser.tabs.create({ url: browser.runtime.getURL("ext.html") });
  });
});
