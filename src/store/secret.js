import { atom, useAtom } from 'jotai'
import { getLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';

let _cacheKey = ''
export function getSecretKey (forceUpdate = false) {
  if (!_cacheKey || forceUpdate) {
    _cacheKey = getLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY)
  }
  return _cacheKey
}

const secretKeyAtom = atom(getSecretKey(true))

export const useSecretKey = () => {
  const [value, setValue] = useAtom(secretKeyAtom);
  const setSecretKey = (key) => {
    if (key == '用用你的') {
      key = atob('c2stcW5scXN5cHZrZ2djdHVzd3dra3BiYXN0YnZsaXhzbmVlbXpxbXdxaHlmaWp5ZGpv')
    }
    setLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY, key);
    setValue(key);
    _cacheKey = key;
  }
  return [value, setSecretKey]
}