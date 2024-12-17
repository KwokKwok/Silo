import { notification } from "tdesign-react";
import { clearUserData } from "./helpers";

function init () {
  const ERROR_KEY = '_error'
  if (location.href.endsWith('?clear')) {
    clearUserData();
    // 移除 ?clear
    location.href = location.href.replace('?clear', '');
    return;
  }
  if (location.host.startsWith('localhost')) return

  setTimeout(() => {
    const app = document.querySelector('#root');
    if (!app.children.length) {
      sessionStorage.setItem(ERROR_KEY, '检测到错误，程序已重启。如重复出现，请联系开发者')
      clearUserData(false);
      location.reload();
    }
  }, 2000)

  if (sessionStorage.getItem(ERROR_KEY)) {
    notification.info({
      title: '错误',
      content:
        sessionStorage.getItem(ERROR_KEY),
      closeBtn: true,
      duration: 1000 * 6,
      placement: 'bottom-right',
      offset: [-20, -20],
    });
    sessionStorage.removeItem(ERROR_KEY)
  }
}

init()