import { atom, useAtom } from 'jotai'
import { getAllTextModels } from '../utils/models';
import { getJsonDataFromLocalStorage, getLocalStorage, setJsonDataToLocalStorage, setLocalStorage } from '../utils/helpers';
import { LOCAL_STORAGE_KEY } from '../utils/types';

const activeModels = atom(getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.ACTIVE_MODELS, [
  'THUDM/glm-4-9b-chat',
  'Qwen/Qwen2.5-7B-Instruct',
  '01-ai/Yi-1.5-9B-Chat-16K',
]))

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