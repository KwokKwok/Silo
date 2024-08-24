import { getCustomModels, setCustomModels } from "../../utils/models";

export function saveCustomModel (model) {
  const models = model.ids.split(',').map(id => ({ ...model, ids: void 0, id }))
  const oldModels = getCustomModels().raw;

  const result = [];
  oldModels.forEach(item => {
    const updatedModel = models.find(m => m.id === item.id);
    if (updatedModel) {
      result.push(updatedModel);
      models.splice(models.indexOf(updatedModel), 1);
    } else {
      result.push(item);
    }
  })
  models.forEach(item => result.push(item))
  setCustomModels(result)
  location.reload()
}