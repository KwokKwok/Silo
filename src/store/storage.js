import { atom, useAtom } from 'jotai'
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';

let _cacheKey = ''
export function getSecretKey (forceUpdate = false) {
  if (!_cacheKey || forceUpdate) {
    _cacheKey = getLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY, import.meta.env.VITE_DEFAULT_SK)
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


const activeImageModels = atom(getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS, ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-medium']))

export const useActiveImageModels = () => {
  const [models, setModels] = useAtom(activeImageModels);
  const updateActiveImageModels = (newModels) => {
    setModels(newModels);
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS, newModels)
  };

  return [models, updateActiveImageModels];
}
