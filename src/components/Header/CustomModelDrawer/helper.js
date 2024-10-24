import { message } from 'tdesign-react';
import { generateId } from '@src/utils/helpers';
import { getAllTextModels, getCustomModels, setCustomModels } from '@src/utils/models';

export function removeCustomModel (id) {
  const oldModels = [...getCustomModels().raw];
  const index = oldModels.findIndex(item => item.id === id);
  oldModels.splice(index, 1);
  // 保存后直接刷新页面
  setCustomModels(oldModels)
  location.reload()
}

export function saveCustomModel (model) {
  const oldModels = [...getCustomModels().raw];
  let isAdd = false;
  model.isPreset = false;
  if (model.id) {
    const index = oldModels.findIndex(item => item.id === model.id);
    if (index < 0) {
      // 可能是参数模式的预设
      isAdd = true;
    } else {
      oldModels.splice(index, 1, model);
    }
  } else {
    isAdd = true;
  }

  if (isAdd) {
    // 可能是新增参数模式的预设，需要保留 ID
    model.id = model.id || generateId();
    const ids = model.ids.split(',');
    const allId = getAllTextModels().map(item => item.id)
    if (ids.some(item => allId.includes(item))) {
      message.warning('模型ID不能与已有的重复')
      throw new Error('模型ID不能与已有的重复')
    }
    oldModels.push(model);
  }

  // 保存后直接刷新页面
  setCustomModels(oldModels)
  location.reload()
}