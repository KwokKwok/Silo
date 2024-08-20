import { LOCAL_STORAGE_KEY } from './types';

export function getJsonDataFromLocalStorage<T>(
  key: LOCAL_STORAGE_KEY,
  defaultValue: T
) {
  return JSON.parse(getLocalStorage(key) || 'null') || defaultValue;
}

export function setJsonDataToLocalStorage(key: LOCAL_STORAGE_KEY, value: any) {
  setLocalStorage(key, JSON.stringify(value));
}

export function setLocalStorage(key: LOCAL_STORAGE_KEY, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalStorage(key: LOCAL_STORAGE_KEY, defaultValue = '') {
  return localStorage.getItem(key) || defaultValue;
}
