import { useResponsive } from "ahooks";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { getJsonDataFromLocalStorage } from "./helpers";
import { LOCAL_STORAGE_KEY } from "./types";
import { useActiveModels, useIsRowMode } from "../store/app";

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


let _sortedRows = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.USER_SORT_SETTINGS, [])
const setRows = (rows) => {
  _sortedRows = rows;
  localStorage.setItem(LOCAL_STORAGE_KEY.USER_SORT_SETTINGS, JSON.stringify(rows));
}
export function useMultiRows () {
  const { activeModels } = useActiveModels();
  const [isRowMode] = useIsRowMode();
  const refreshController = useRefresh();

  useEffect(() => {
    let newRows = JSON.parse(JSON.stringify(_sortedRows))
    const oldModels = newRows.reduce((acc, row) => [...acc, ...row], []); // 打平
    const newModels = [...activeModels]
    if (!oldModels.length) {
      // 没有用户排序数据
      newRows = [newModels];
    } else {
      if (oldModels.length !== newModels.length) {
        // 数量不相等，先处理
        if (oldModels.length < newModels.length) {
          // 新增模型，先找出要新增的，然后在比较少的行里添加一个
          let newModel = newModels.filter(model => !oldModels.includes(model))
          const smallerRow = newRows[0].length > newRows[1].length ? newRows[1] : newRows[0];
          smallerRow.push(newModel[0]);
        } else {
          // 删除模型
          const needDelete = oldModels.filter(model => !newModels.includes(model))
          newRows = newRows.map(row => row.filter(model => !needDelete.includes(model)))
        }
      } else {
        // 检查是不是有改变
        const removedItemIndex = oldModels.findIndex(model => !newModels.includes(model))
        if (removedItemIndex >= 0) {
          const addedItem = newModels.find(item => !oldModels.includes(item))
          const row = newRows[0].includes(oldModels[removedItemIndex]) ? newRows[0] : newRows[1];
          const rowIndex = row.indexOf(oldModels[removedItemIndex]);
          row.splice(rowIndex, 1, addedItem);
        }
      }
    }

    newRows = newRows.filter(row => row.length);

    if (isRowMode && newRows.length === 1) {
      // 多行模式，但现在只有一行，将一行分成两行
      const row = newRows[0];
      const result = [[], []];
      for (let i = 0; i < row.length; i += 2) {
        result[0].push(row[i]);
        i < row.length && result[1].push(row[i + 1]);
      }
      newRows = result;
    } else if (!isRowMode && _sortedRows.length === 2) {
      // 单行模式，但现在有两行，将两行合并为一行
      const [smallerRow, largerRow] = [...newRows].sort((a, b) => a.length - b.length);
      const ratio = Math.ceil(largerRow.length / smallerRow.length);
      const result = []
      for (let i = 0; i < smallerRow.length; i++) {
        result.push(smallerRow[i]);
        for (let j = 0; j < ratio; j++) {
          const jIndex = i * ratio + j;
          jIndex < largerRow.length && result.push(largerRow[jIndex]);
        }
      }
      newRows = [result];
    }

    setRows(newRows);
    refreshController.refresh();
  }, [activeModels, isRowMode])

  return [_sortedRows, setRows];
}