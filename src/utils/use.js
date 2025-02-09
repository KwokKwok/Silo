import { useResponsive } from "ahooks";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from "./helpers";
import { LOCAL_STORAGE_KEY } from "./types";
import { useActiveModels, useIsRowMode } from "../store/app";
import i18next from "i18next";
import { useLocalStorageAtom } from "@src/store/storage";

/**
 * 响应式判断是否为移动端，>=768为PC
 * @see https://ahooks.js.org/zh-CN/hooks/use-responsive
 */
export function useIsMobile () {
  const responsive = useResponsive()
  return !responsive.md;
}

export function useDarkMode (persist = true) {
  // 另外有一部分逻辑在 index.html，因为需要提前给 body 加 dark class

  const [theme, setTheme] = useLocalStorageAtom(LOCAL_STORAGE_KEY.THEME_MODE)
  const isDark = theme == 'dark';
  const setDarkMode = (isDark) => {
    setTheme(isDark ? 'dark' : 'light', !persist);
  }
  const functionRef = useRef(() => { });
  functionRef.current = function toggleDarkMode (isDark) {
    // 更新 theme-color meta 标签
    function updateThemeColor (isDark) {
      const themeColorMeta = document.querySelectorAll('meta[name="theme-color"]');
      if (themeColorMeta.length) {
        themeColorMeta.forEach(meta => {
          meta.content = isDark ? '#242424' : '#f7f7f7';
        })
      }
    }
    document.documentElement.setAttribute(
      'theme-mode',
      isDark ? 'dark' : 'light'
    );
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeColor(isDark);
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
  const stop = () => clearTimeout(timer.current);
  const start = () => {
    stop();
    timer.current = setTimeout(() => {
      refresh();
      start();
    }, minGap);
  }
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
let _isDisablePersistModels = false;
const setRows = (rows) => {
  _sortedRows = rows;
  console.log(rows);

  if (!_isDisablePersistModels) {
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.USER_SORT_SETTINGS, rows);
  }
}
export function useMultiRows () {
  const { activeModels, isDisablePersistModels } = useActiveModels();
  const [isRowMode, setIsRowMode] = useIsRowMode();
  const refreshController = useRefresh();

  useEffect(() => {
    if (isDisablePersistModels) {
      _isDisablePersistModels = isDisablePersistModels;
      setRows([]);
    }
  }, [isDisablePersistModels])

  useEffect(() => {
    if (isRowMode) {
      console.log(isRowMode, _sortedRows);

      if (activeModels.length === 1) {
        setIsRowMode(false);
        _sortedRows = [activeModels]
        return;
      }
      if (_sortedRows.filter(row => !row.length).length > 0) {
        _sortedRows = _sortedRows.filter(row => row.length);
        setIsRowMode(_sortedRows.length > 1)
      }
    }
  }, [isRowMode, _sortedRows])

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
          const smallerRow = newRows.length == 1 ? newRows[0] : (newRows[0].length > newRows[1].length ? newRows[1] : newRows[0]);
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
        const index2 = i + 1;
        index2 < row.length && result[1].push(row[index2]);
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

    setRows(newRows, isDisablePersistModels);
    refreshController.refresh();
  }, [activeModels, isRowMode, isDisablePersistModels])

  return [_sortedRows, setRows];
}


export function useI18nSideEffect () {
  useEffect(() => {
    const handleLanguageChange = () => {
      document.title = i18next.t('common.title');
      document.querySelector('html').lang = i18next.language;
    };
    handleLanguageChange();

    // Listen for language changes
    i18next.on('languageChanged', handleLanguageChange);

    // Cleanup function to remove the event listener
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);
}