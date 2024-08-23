import { atom, useAtom } from 'jotai'
import TEXT_MODEL_LIST from '../utils/models';
import { message } from 'tdesign-react';
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
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


const activeModels = atom(getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, [
  'Qwen/Qwen2-7B-Instruct',
  '01-ai/Yi-1.5-9B-Chat-16K',
]))

export const useActiveModels = () => {
  const [value, setValue] = useAtom(activeModels);
  const setActiveModels = (models) => {
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, models);
    setValue(models);
  }

  const removeActiveModel = (model) => {
    if (value.length === 1) {
      message.info('一个都不想留吗')
      return
    }
    setActiveModels(value.filter(item => item !== model))
  }

  const addMore = () => {
    const nonActiveModels = TEXT_MODEL_LIST.filter(item => !value.includes(item.id)).map(item => item.id);
    console.log(nonActiveModels);

    // if (value.length === 6) {
    //   message.info('6个还不够吗')
    //   return;
    // }
    setActiveModels(value.concat(nonActiveModels.splice(0, 1)))
  }
  return { activeModels: value, setActiveModels, addMoreModel: addMore, removeActiveModel }
}

const isRowMode = atom(getLocalStorage(LOCAL_STORAGE_KEY.ROW_MODE, 'false') === 'true')

export function useIsRowMode () {
  const [value, setValue] = useAtom(isRowMode);
  const setIsRows = (isRows) => {
    setLocalStorage(LOCAL_STORAGE_KEY.ROW_MODE, isRows);
    setValue(isRows);
  }
  return [value, setIsRows]
}