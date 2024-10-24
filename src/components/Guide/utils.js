export const mockInput = (selector, value) => {
  if (!selector.startsWith('.')) {
    selector = `#${selector}`;
  }
  const element = document.querySelector(selector);
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true, data: value }));
};

export const mockClick = selector => {
  if (!selector.startsWith('.')) {
    selector = `#${selector}`;
  }
  const element = document.querySelector(selector);
  if (element) {
    // 创建一个鼠标事件
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    // 触发点击事件
    element.dispatchEvent(clickEvent);
  } else {
    console.warn(`元素 ${selector} 未找到`);
  }
};
