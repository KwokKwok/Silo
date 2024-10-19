import { getBuildInResolveFn } from "../components/CustomModelDrawer/preset";
import { getSecretKey, isExperienceSK } from "../store/storage";
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from "./helpers";
import { LOCAL_STORAGE_KEY } from "./types";
import { checkModelLimit, openAiCompatibleChat } from "./utils";

const modules = import.meta.glob('../assets/img/models/*.*', { eager: true });

const _iconCache = {};

let customModels = null;
let normalizedCustomModel = null;

// 辅助函数：解析模型ID，提取 series、name 和 isPro 标志
function parseModelId (id) {
  let isPro = false;
  let isVendorA = false;
  let fullName = id;
  if (id.startsWith('Pro/')) {
    isPro = true;
    fullName = id.replace('Pro/', '');
  }
  if (id.startsWith('Vendor-A/')) {
    isVendorA = true;
    fullName = id.replace('Vendor-A/', '');
  }
  const [series, ...nameParts] = fullName.split('/');
  const name = nameParts.join('/');
  return { series, name, isPro, isVendorA };
}

const keywordsMap = {
  'Qwen': '阿里云,aliyun,通义千问',
  'THUDM': '智谱AI,智谱清言,BigModel,清华大学',
  'google': '谷歌,Brad',
  'meta-llama': 'Facebook',
  'internlm': '书生浦语大模型书生大模型,上海AI实验室,商汤科技,上海人工智能实验室香港中文大学和复旦大学',
  'mistralai': '法国欧洲',
  'deepseek-ai': '私募巨头幻方量化深度求索',
  '01-ai': '01万物零一万物李开复',
};

// 修改后的 textModelOf 函数，统一处理 "Pro/" 前缀
const textModelOf = (id, price, length, needVerify, vision) => {
  const { series, name, isPro, isVendorA } = parseModelId(id);
  const icon = getModelIcon(id); // 使用原始id获取图标
  let keywords = keywordsMap[series];
  if (vision) {
    keywords += ',多模态,视觉,图像,VL,vision,image'
  }
  if (isVendorA) {
    keywords += ',Vendor-A,国产算力芯片'
  }
  const displayName = isPro ? `Pro/${name}` : isVendorA ? `Vendor-A/${name}` : name; // 根据 isPro 添加前缀
  return { id, name: displayName, series, price, length, icon, keywords, needVerify, isPro, isVendorA, vision };
};

export function getCustomModels () {
  if (!customModels) {
    customModels = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.USER_CUSTOM_MODELS, []);
    normalizedCustomModel = customModels.map(item => {
      const resolveFn = (item.paramsMode || item.isOpenAiCompatible)
        ? getBuildInResolveFn(item)
        : new Function(`return ${item.resolveFn}`)();

      // 拆分多个模型ID，并处理每个ID
      return item.ids.split(',').map(id => {
        const { series, name, isPro } = parseModelId(id);
        const icon = item.icon || getModelIcon(id); // 使用原始id获取图标
        const displayName = isPro ? `Pro/${name}` : name; // 根据 isPro 添加前缀
        return ({
          ...item,
          keywords: item.keywords || keywordsMap[series],
          ids: void 0, // 移除原始ids字段
          id,
          series,
          name: displayName,
          resolveFn,
          icon,
          isCustom: true,
          isPro
        });
      });
    }).reduce((acc, cur) => [...acc, ...cur], []);
  }
  return { raw: customModels, normalized: normalizedCustomModel };
}

export function setCustomModels (models) {
  setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.USER_CUSTOM_MODELS, models);
  getCustomModels();
}

// 修改 getModelIcon 函数，确保使用正确的 fullName 获取图标
export function getModelIcon (model) {
  if (!_iconCache[model]) {
    const { series } = parseModelId(model);
    _iconCache[model] = modules[Object.keys(modules).find(i => i.includes(series))]?.default;
    if (!_iconCache[model]) {
      _iconCache[model] = 'https://chat.kwok.ink/logo.svg';
    }
  }
  return _iconCache[model];
}

/**
 * 关于模型顺序：
 * 1. 免费模型在前
 * 2. 免费模型中，尽量根据模型能力排序，最新最强的在前
 * 3. 中文模型应排在英文模型前面
 * 4. Pro 开头的模型为免费模型的付费版本，优先级最低
 * 5. 新增模型请参考上述规则
 */
const SILICON_MODELS = [
  textModelOf("Qwen/Qwen2.5-7B-Instruct", 0, 32, false),
  textModelOf("THUDM/glm-4-9b-chat", 0, 128, false),
  textModelOf("01-ai/Yi-1.5-9B-Chat-16K", 0, 16, false),
  textModelOf("internlm/internlm2_5-7b-chat", 0, 32, false),
  textModelOf("Qwen/Qwen2.5-Coder-7B-Instruct", 0, 32, false),
  textModelOf("Qwen/Qwen2-7B-Instruct", 0, 32, false),
  textModelOf("01-ai/Yi-1.5-6B-Chat", 0, 4, false),
  textModelOf("THUDM/chatglm3-6b", 0, 32, false),
  textModelOf("Qwen/Qwen2-1.5B-Instruct", 0, 32, false),
  textModelOf("google/gemma-2-9b-it", 0, 8, true),
  textModelOf("meta-llama/Meta-Llama-3.1-8B-Instruct", 0, 32, true),
  textModelOf("meta-llama/Meta-Llama-3-8B-Instruct", 0, 8, true),
  textModelOf("Qwen/Qwen2.5-14B-Instruct", 0.7, 32, false),
  textModelOf("internlm/internlm2_5-20b-chat", 1, 32, false),
  textModelOf("01-ai/Yi-1.5-34B-Chat-16K", 1.26, 16, false),
  textModelOf("Qwen/Qwen2.5-32B-Instruct", 1.26, 32, false),
  textModelOf("Qwen/Qwen2-57B-A14B-Instruct", 1.26, 32, false),
  textModelOf("DianXin/DianXin-V1-Chat", 1.33, 8, false),
  textModelOf("deepseek-ai/DeepSeek-V2.5", 1.33, 32, false),
  textModelOf("deepseek-ai/DeepSeek-Coder-V2-Instruct", 1.33, 32, false),
  textModelOf("deepseek-ai/DeepSeek-V2-Chat", 1.33, 32, false),
  textModelOf("Qwen/Qwen2.5-Math-72B-Instruct", 4.13, 4, false),
  textModelOf("Qwen/Qwen2.5-72B-Instruct-128K", 4.13, 128, false),
  textModelOf("Qwen/Qwen2.5-72B-Instruct", 4.13, 32, false),
  textModelOf("Qwen/Qwen2-72B-Instruct", 4.13, 32, false),
  textModelOf("Vendor-A/Qwen/Qwen2.5-72B-Instruct", 1, 32, false),
  textModelOf("Vendor-A/Qwen/Qwen2-72B-Instruct", 1, 32, false),
  textModelOf("google/gemma-2-27b-it", 1.26, 8, true),
  textModelOf("meta-llama/Meta-Llama-3.1-70B-Instruct", 4.13, 8, true),
  textModelOf("meta-llama/Meta-Llama-3-70B-Instruct", 4.13, 8, true),
  textModelOf("meta-llama/Meta-Llama-3.1-405B-Instruct", 21, 32, true),
  textModelOf("Qwen/Qwen2-VL-72B-Instruct", 4.13, 32, false, true),
  textModelOf("OpenGVLab/InternVL2-26B", 1, 32, false, true),
  textModelOf("Pro/OpenGVLab/InternVL2-8B", 0.35, 32, false, true),
  textModelOf("Pro/Qwen/Qwen2-VL-7B-Instruct", 0.35, 32, false, true),
  textModelOf("OpenGVLab/InternVL2-Llama3-76B", 4.13, 8, false, true),
  textModelOf("Pro/Qwen/Qwen2-1.5B-Instruct", 0.14, 32, false),
  textModelOf("Pro/Qwen/Qwen2.5-7B-Instruct", 0.35, 32, false),
  textModelOf("Pro/internlm/internlm2_5-7b-chat", 0.35, 32, false),
  textModelOf("Pro/Qwen/Qwen2-7B-Instruct", 0.35, 32, false),
  textModelOf("Pro/01-ai/Yi-1.5-6B-Chat", 0.35, 4, false),
  textModelOf("Pro/THUDM/chatglm3-6b", 0.35, 32, false),
  textModelOf("Pro/01-ai/Yi-1.5-9B-Chat-16K", 0.42, 16, false),
  textModelOf("Pro/THUDM/glm-4-9b-chat", 0.6, 128, false),
  textModelOf("Pro/meta-llama/Meta-Llama-3.1-8B-Instruct", 0.42, 32, true),
  textModelOf("Pro/meta-llama/Meta-Llama-3-8B-Instruct", 0.42, 8, true),
  textModelOf("Pro/google/gemma-2-9b-it", 0.6, 8, true),
];

const _visionModelIds = SILICON_MODELS.filter(item => item.vision).map(item => item.id);

export function isVisionModel (modelId) {
  return _visionModelIds.includes(modelId)
}

export const SILICON_MODELS_IDS = SILICON_MODELS.map(i => i.id);

export function getAllTextModels () {
  return [
    ...getCustomModels().normalized,
    ...SILICON_MODELS
  ];
}

const customResolveFns = getAllTextModels().filter(item => item.resolveFn).reduce((acc, item) => {
  acc[item.id] = item.resolveFn;
  return acc;
}, {});

/**
 * 获取聊天解析器，根据模型ID选择合适的解析函数
 */
export function getChatResolver (modelId) {
  if (customResolveFns[modelId]) return customResolveFns[modelId];
  return (...args) => {
    // 硅基模型校验模型限制
    checkModelLimit(modelId);
    return openAiCompatibleChat('https://api.siliconflow.cn/v1', getSecretKey(), modelId => modelId, ...args);
  };
}

const imageModelOf = (id, price) => {
  const { series, name, isPro } = parseModelId(id);
  const icon = getModelIcon(id);
  const displayName = isPro ? `Pro/${name}` : name;
  return { id, name: displayName, series, price, icon, isPro };
};

const IMAGE_MODELS = [
  imageModelOf("black-forest-labs/FLUX.1-dev", 1),
  imageModelOf("black-forest-labs/FLUX.1-schnell", -1),
  imageModelOf("stabilityai/stable-diffusion-3-medium", -1),
  imageModelOf("stabilityai/stable-diffusion-xl-base-1.0", -1),
  imageModelOf("stabilityai/stable-diffusion-2-1", -1),
  // 已弃模型
  // imageModelOf("stabilityai/sd-turbo", -1),
  // imageModelOf("stabilityai/sdxl-turbo", -1),
  // imageModelOf("ByteDance/SDXL-Lightning", -1),
  imageModelOf('Pro/black-forest-labs/FLUX.1-schnell', 1)
];

/**
 * 判断体验密钥是否可用
 */
export function isLimitedModel (modelId) {
  const IMAGE_LIMITED_MODELS = IMAGE_MODELS.filter(item => item.price > 0).map(item => item.id);
  const TEXT_LIMITED_MODELS = SILICON_MODELS.filter(item => item.price > 0).map(item => item.id);
  return IMAGE_LIMITED_MODELS.includes(modelId) || TEXT_LIMITED_MODELS.includes(modelId);
}

export function getImageModels () {
  return [...IMAGE_MODELS];
}