import { useEffect } from 'react';
import { useState } from 'react';

/**
 * 判断颜色偏向于暗色还是亮色
 * @param {string} color 颜色，格式化为 rgb(r, g, b)
 * @returns {boolean} 是否是暗色
 */
function isDarkColor(color) {
  const [r, g, b] = color.match(/\d+/g);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

function isPageDarkTheme() {
  const isNotTransparent = c => c !== 'rgba(0, 0, 0, 0)';

  // 获取 html 的背景色、body 的背景色等
  const htmlBgColor = getComputedStyle(
    document.documentElement
  ).backgroundColor;
  const bodyBgColor = getComputedStyle(document.body).backgroundColor;
  const color = [bodyBgColor, htmlBgColor].filter(isNotTransparent);

  if (!color[0]) {
    // 如果 body 的背景色是透明，则判断所有 body 的子元素的背景色
    const children = document.body.children;
    const childrenBgColor = Array.from(children)
      .map(child => getComputedStyle(child).backgroundColor)
      .filter(isNotTransparent);
    // 如果 dark 的占比大于 50%，则认为页面是暗色
    const darkCount = childrenBgColor.filter(isDarkColor).length;
    const lightCount = childrenBgColor.filter(c => !isDarkColor(c)).length;
    return darkCount > lightCount;
  }
  return isDarkColor(color[0]);
}

export default function ({ close, payload, visible }) {
  const url = browser.runtime.getURL('ext.html') + '#web-copilot';
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const listener = event => {
      console.log(event.data);
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);
        if (message.type === 'silo:web-copilot-close') {
          close();
        }
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  function sendThemeMessage() {
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        type: 'silo:web-copilot-init',
        isDarkTheme: isPageDarkTheme(),
      }),
      '*'
    );
  }

  useEffect(() => {
    if (payload.type) {
      sendThemeMessage();
      requestAnimationFrame(() => {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            ...payload,
          }),
          '*'
        );
      });
    }
  }, [payload]);
  return (
    <div
      className={
        'fixed inset-0 z-[99999] bg-transparent bg-opacity-10 transform flex justify-center items-center h-full ' +
        (visible ? '' : 'translate-x-full translate-y-full')
      }
      onClick={close}
    >
      <iframe
        ref={iframeRef}
        style={{
          colorScheme: isPageDarkTheme() ? 'dark' : 'light',
        }}
        onLoad={() => {
          setLoaded(true);
          sendThemeMessage();
        }}
        className={
          'border-none transition-opacity duration-300 outline-none rounded-[16px] shadow-2xl bg-transparent filter backdrop-blur-lg overflow-hidden w-[512px] h-[80dvh] ' +
          (loaded ? 'opacity-100' : 'opacity-0')
        }
        src={url}
      ></iframe>
    </div>
  );
}
