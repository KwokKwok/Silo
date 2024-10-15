import { atom, useAtom } from 'jotai'
import { getAllTextModels } from '../utils/models';
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';
import { SILO_ENV } from '@src/utils/env';

const activeModels = atom(
  getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, SILO_ENV.DEFAULT_ACTIVE_CHAT_MODELS)
)

const activeModelsFromEnv = SILO_ENV.DEFAULT_ACTIVE_CHAT_MODELS;

export const useActiveModels = () => {
  const [value, setValue] = useAtom(activeModels);
  const setActiveModels = (models) => {
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, models);
    setValue(models);
  }

  const removeActiveModel = (model) => {
    const newValue = value.filter(item => item !== model);
    if (newValue.length == 0) {
      // 只有一个时，页面会禁用删除。但是有一种情况是：仅剩的一个不再提供了，此时需要添加一个
      newValue.push(getAllTextModels()[0].id);
    }
    setActiveModels(newValue);
    // if (value.length === 1) {
    //   message.info('一个都不想留吗' + model)
    //   return
    // }
    // setActiveModels(value.filter(item => item !== model))
  }

  const addMore = () => {
    const nonActiveModels = getAllTextModels().filter(item => !value.includes(item.id)).map(item => item.id);

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

export function useSetDefaultActiveModels() {
  const setDefaultActiveModels = () => {
    // 更新本地存储
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.USER_SORT_SETTINGS, [activeModelsFromEnv]);
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, activeModelsFromEnv);
    // 刷新浏览器
    window.location.reload();
  }

  return setDefaultActiveModels;
}