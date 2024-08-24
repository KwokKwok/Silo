import { generateId } from "../../utils/helpers";
import { getCustomModels, setCustomModels } from "../../utils/models";

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
  if (model.id && !model.id.startsWith('preset')) {
    const index = oldModels.findIndex(item => item.id === model.id);
    oldModels.splice(index, 1, model);
  } else {
    model.id = generateId();
    oldModels.push(model);
  }

  // 保存后直接刷新页面
  setCustomModels(oldModels)
  location.reload()
}