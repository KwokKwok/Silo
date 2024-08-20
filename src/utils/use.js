import { useResponsive } from "ahooks";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

/**
 * 响应式判断是否为移动端，>=992为PC
 * @see https://ahooks.js.org/zh-CN/hooks/use-responsive
 */
export function useIsMobile () {
  const responsive = useResponsive()
  return !responsive.lg;
}

export function useDarkMode () {
  // 另外有一部分逻辑在 index.html，因为需要提前给 body 加 dark class
  const initialValue = localStorage.getItem('theme-mode') ? localStorage.getItem('theme-mode') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setDarkMode] = useState(initialValue);
  const functionRef = useRef(() => { });
  functionRef.current = function toggleDarkMode (isDark) {
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute(
      'theme-mode',
      isDark ? 'dark' : 'light'
    );
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setDarkMode(isDark);
  }
  useEffect(() => {
    functionRef.current(isDark)
    const listener = function (e) {
      functionRef.current?.(e.matches);
    }
    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      listener
    );
    return () => {
      matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener)
    }
  }, [functionRef])
  return [isDark, functionRef.current];
}

/**
 * 手动控制组件更新
 * @param {number} minGap 触发更新的最小间隔
 */
export function useRefresh (minGap = 16) {
  const [_, setValue] = useState(0);
  const timer = useRef(0);
  const refresh = () => setValue(Date.now());
  const start = () => {
    timer.current = setTimeout(() => {
      refresh();
      start();
    }, minGap);
  }
  const stop = () => clearTimeout(timer.current);
  minGap = Math.max(minGap, 0)
  return { start, stop, refresh };
}

/**
 * 自动滚动至底部
 */
export function useAutoScrollToBottomRef () {
  const scrollRef = useRef();
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight)
    });
  }
  return { scrollRef, scrollToBottom };
}