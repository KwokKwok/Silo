import { atom, useAtom } from 'jotai'
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';
import { useEffect } from 'react';
import { useState } from 'react';
import { message } from 'tdesign-react';
import i18next from 'i18next';

export const EXPERIENCE_SK = import.meta.env.VITE_DEFAULT_SK;

let _cacheKey = ''
export function getSecretKey (forceUpdate = false) {
  if (!_cacheKey || forceUpdate) {
    _cacheKey = getLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY, EXPERIENCE_SK)
  }
  return _cacheKey || EXPERIENCE_SK
}

export function isExperienceSK () {
  return getSecretKey() === EXPERIENCE_SK
}

const secretKeyAtom = atom(getSecretKey(true))

const isZenModeAtom = atom(getLocalStorage(LOCAL_STORAGE_KEY.ZEN_MODE, 'false') === 'true')

const activeSystemPromptIdAtom = atom(
  getLocalStorage(
    LOCAL_STORAGE_KEY.ACTIVE_SYSTEM_PROMPT,
    ''
  )
);

const activeImageModels = atom(getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS, ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-medium']))

const allCustomSystemPromptsAtom = atom(
  getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.SYSTEM_PROMPTS, [])
);

const atomMap = {
  [LOCAL_STORAGE_KEY.SYSTEM_PROMPTS]: allCustomSystemPromptsAtom,
  [LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS]: activeImageModels,
  [LOCAL_STORAGE_KEY.ACTIVE_SYSTEM_PROMPT]: activeSystemPromptIdAtom,
  [LOCAL_STORAGE_KEY.ZEN_MODE]: isZenModeAtom,
  [LOCAL_STORAGE_KEY.SECRET_KEY]: secretKeyAtom,
}

/**
 * 获取localStorage 存储的 JSON 数据
 * @param {LOCAL_STORAGE_KEY} key 
 * @returns 
 */
export function useLocalStorageJSONAtom (key) {
  return useLocalStorageAtom(key, true)
}

export function useLocalStorageAtom (key, isJson = false) {
  const [value, setValue] = useAtom(atomMap[key]);
  const setValueToLocalStorage = (newValue) => {
    setValue(newValue);
    (isJson ? setJsonDataToLocalStorage : setLocalStorage)(key, newValue)
  }
  return [value, setValueToLocalStorage]
}

export const useSecretKey = () => {
  const [value, setValue] = useLocalStorageAtom(LOCAL_STORAGE_KEY.SECRET_KEY)
  const setSecretKey = (key) => {
    let _key = key || '';
    setValue(_key);
    _cacheKey = _key;
  }
  return [value, setSecretKey]
}

export function useActiveSystemPromptId () {
  return useLocalStorageAtom(LOCAL_STORAGE_KEY.ACTIVE_SYSTEM_PROMPT)
}

export function useLocalStorageFlag (key, defaultValue = false) {
  const [value, setValue] = useState(getLocalStorage(key, defaultValue));
  const setFlag = (flag) => {
    setValue(flag);
    setLocalStorage(key, flag);
  };
  return [value, setFlag];
}

export const useZenMode = () => {
  const [value, setValue] = useLocalStorageAtom(LOCAL_STORAGE_KEY.ZEN_MODE);
  const [hideNotify, setHideNotify] = useLocalStorageFlag(LOCAL_STORAGE_KEY.FLAG_NO_ZEN_MODE_HELP, false);
  const _setValue = (value) => {
    setValue(value);
    if (value && !hideNotify) {
      message.info({
        content: i18next.t('zenModeTip'),
        duration: 0,
        closeBtn: i18next.t('不再提示'),
        onClose: () => {
          setHideNotify(true)
        }
      })
    }
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      _setValue(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return [value, _setValue];
}
