import { getBuildInResolveFn } from "../components/CustomModelDrawer/preset";
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from "./helpers";
import { LOCAL_STORAGE_KEY } from "./types";

const modules = import.meta.glob('../assets/img/models/*.*', { eager: true })

const _iconCache = {};

let customModels = null;
let normalizedCustomModel = null;
export function getCustomModels () {
  if (!customModels) {
    customModels = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.USER_CUSTOM_MODELS, [])
    normalizedCustomModel = customModels.map(item => {
      const resolveFn = item.paramsMode ? getBuildInResolveFn(item) : new Function(`return ${item.resolveFn}`)();

      // 存的是系列模型，需要拆分
      return item.ids.split(',').map(id => {
        const icon = item.icon || getModelIcon(id);
        const [series, name] = id.split('/');
        return ({ ...item, ids: void 0, id, series, name, resolveFn, icon, isCustom: true })
      })
    }).reduce((acc, cur) => [...acc, ...cur], []);
  }
  return { raw: customModels, normalized: normalizedCustomModel };
}

export function setCustomModels (models) {
  setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.USER_CUSTOM_MODELS, models);
  getCustomModels();
}

export function getModelIcon (model) {
  if (!_iconCache[model]) {
    const [series] = model.split('/');
    _iconCache[model] = modules[Object.keys(modules).find(i => i.includes(series))]?.default
    if (!_iconCache[model]) {
      _iconCache[model] = 'https://chat.kwok.ink/logo.svg'
    }
  }
  return _iconCache[model];
}

const textModelOf = (id, price, length) => {
  const [series, name] = id.split('/');
  const icon = getModelIcon(id);
  return { id, name, series, price, length, icon }
}

export const SILICON_MODELS = [
  textModelOf("Qwen/Qwen2-7B-Instruct", 0, 32),
  textModelOf("Qwen/Qwen2-1.5B-Instruct", 0, 32),
  textModelOf("Qwen/Qwen1.5-7B-Chat", 0, 32),
  textModelOf("THUDM/glm-4-9b-chat", 0, 32),
  textModelOf("THUDM/chatglm3-6b", 0, 32),
  textModelOf("01-ai/Yi-1.5-9B-Chat-16K", 0, 16),
  textModelOf("01-ai/Yi-1.5-6B-Chat", 0, 4),
  textModelOf("google/gemma-2-9b-it", 0, 8,),
  textModelOf("internlm/internlm2_5-7b-chat", 0, 32),
  textModelOf("meta-llama/Meta-Llama-3-8B-Instruct", 0, 8),
  textModelOf("meta-llama/Meta-Llama-3.1-8B-Instruct", 0, 8),
  textModelOf("mistralai/Mistral-7B-Instruct-v0.2", 0, 32),
  textModelOf("Qwen/Qwen2-72B-Instruct", 4.13, 32),
  textModelOf("Qwen/Qwen2-Math-72B-Instruct", 4.13, 32),
  textModelOf("Qwen/Qwen2-57B-A14B-Instruct", 1.26, 32),
  textModelOf("Qwen/Qwen1.5-110B-Chat", 4.13, 32),
  textModelOf("Qwen/Qwen1.5-32B-Chat", 1.26, 32),
  textModelOf("Qwen/Qwen1.5-14B-Chat", 0.70, 32),
  textModelOf("01-ai/Yi-1.5-34B-Chat-16K", 1.26, 16),
  textModelOf("deepseek-ai/DeepSeek-Coder-V2-Instruct", 1.33, 32),
  textModelOf("deepseek-ai/DeepSeek-V2-Chat", 1.33, 32),
  textModelOf("deepseek-ai/deepseek-llm-67b-chat", 1, 4),
  textModelOf("internlm/internlm2_5-20b-chat", 32, 1),
  textModelOf("meta-llama/Meta-Llama-3.1-405B-Instruct", 21, 32),
  textModelOf("meta-llama/Meta-Llama-3.1-70B-Instruct", 4.13, 32),
  textModelOf("meta-llama/Meta-Llama-3-70B-Instruct", 4.13, 32),
  textModelOf("mistralai/Mixtral-8x7B-Instruct-v0.1", 1.26, 32),
  textModelOf("google/gemma-2-27b-it", 1.26, 8),
]

export const SILICON_MODELS_IDS = SILICON_MODELS.map(i => i.id)

export function getAllTextModels () {
  return [
    ...getCustomModels().normalized,
    ...SILICON_MODELS
  ]
}