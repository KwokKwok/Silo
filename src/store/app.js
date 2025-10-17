import { atom, useAtom } from 'jotai'
import { getAllTextModels } from '../utils/models';
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';
import { SILO_ENV } from '@src/utils/env';

const userInfoAtom = atom({});
export const useUserInfo = () => {
  return useAtom(userInfoAtom);
}

const activeModels = atom(
  getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, SILO_ENV.DEFAULT_ACTIVE_CHAT_MODELS)
)

const allTextModelIds = getAllTextModels().map(item => item.id);

let isDisablePersistModels = false;
export const useActiveModels = () => {
  const [value, setValue] = useAtom(activeModels);
  const setActiveModels = (models) => {
    const newModels = models.filter(item => allTextModelIds.includes(item));
    // 如果一个都没有，则添加一个默认的
    if (newModels.length === 0) {
      newModels.push(allTextModelIds[0]);
    }
    if (!isDisablePersistModels) {
      setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, newModels);
    }
    setValue(newModels);
  }
  const removeActiveModel = (model) => {
    const newValue = value.filter(item => item !== model);
    setActiveModels(newValue);
  }

  const addMore = () => {
    const nonActiveModels = getAllTextModels().filter(item => !value.includes(item.id)).map(item => item.id);
    setActiveModels(value.concat(nonActiveModels.splice(0, 1)))
  }
  const disablePersist = (disable) => {
    isDisablePersistModels = disable;
  }

  return { activeModels: value, setActiveModels, addMoreModel: addMore, removeActiveModel, disablePersist, isDisablePersistModels }
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