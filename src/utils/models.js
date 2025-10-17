import CUSTOM_MODEL_PRESET from '@src/components/Header/CustomModelDrawer/preset';
import { getSecretKey } from '@src/store/storage';
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from '@src/utils/helpers';
import { LOCAL_STORAGE_KEY } from '@src/utils/types';
import { checkModelLimit, openAiCompatibleChat } from "./utils";
import chatModelData from '../data/chat-models.json';

const _iconCache = {};
const modules = import.meta.glob('../assets/img/models/*.*', { eager: true });

/**
 * @type {Array<{
 *   id: string,
 *   series: string,
 *   icon: string,
 *   size: string,
 *   length: number,
 *   name: string,
 *   priceIn: number,
 *   priceOut: number,
 *   price: number,
 *   vision: boolean,
 *   noGift: boolean
 * }>}
 */
const SILICON_MODELS = chatModelData.map(({ icon, ...item }) => ({
  ...item,
  icon: getModelIcon(item.id, false) || (icon.startsWith('http') ? icon : `https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/${icon}`)
}));

console.log(SILICON_MODELS);


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
  'AIDC-AI': 'AIDC-AI,阿里云,CoT',
  'baidu': '百度,文心一言',
  'tencent': '腾讯,Hunyuan',
  'moonshotai': '月之暗面,Kimi',
};

/**
 * 获取内置的自定义模型解析函数 
 */
function getCustomModelResolveFn (modelConfig) {
  const model = CUSTOM_MODEL_PRESET.find(item => modelConfig.isOpenAiCompatible ? item.isOpenAiCompatible : item.id === modelConfig.id);
  // 在标准的函数入参之外，添加上用户配置的数据（内含 apiKey 等东西）
  return (...args) => model.resolveFn(modelConfig, ...args);
}

const VISION_CUSTOM_MODELS = ['grok-vision-beta'];

export function getCustomModels () {
  if (!customModels) {
    customModels = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.USER_CUSTOM_MODELS, []);
    normalizedCustomModel = customModels.map(item => {
      const resolveFn = (item.paramsMode || item.isOpenAiCompatible)
        ? getCustomModelResolveFn(item)
        : new Function(`return ${item.resolveFn}`)();

      // 拆分多个模型ID，并处理每个ID
      return item.ids.split(',').map(id => {
        const { series, name, isPro } = parseModelId(id);
        const icon = item.icon || getModelIcon(id); // 使用原始id获取图标
        const displayName = isPro ? `Pro/${name}` : name; // 根据 isPro 添加前缀
        const vision = VISION_CUSTOM_MODELS.includes(name) || item.vision;
        return ({
          ...item,
          vision,
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
export function getModelIcon (model, autoFallback = true) {
  if (!_iconCache[model]) {
    const { series } = parseModelId(model);
    _iconCache[model] = modules[Object.keys(modules).find(i => i.includes(series))]?.default;
    if (!_iconCache[model] && autoFallback) {
      _iconCache[model] = '/logo.svg';
    }
  }
  return _iconCache[model];
}


export function isMixedThinkingModel (modelId) {
  return modelId.includes('Qwen/Qwen3')
}

export const SILICON_MODELS_IDS = SILICON_MODELS.map(item => item.id)

export const isSiliconModel = (modelId) => {
  return SILICON_MODELS.some(item => modelId === item.id)
}

export function getAllTextModels () {
  return [
    ...getCustomModels().normalized,
    ...SILICON_MODELS
  ];
}

const _visionModelIds = getAllTextModels().filter(item => item.vision).map(item => item.id);

export function isVisionModel (modelId) {
  return _visionModelIds.includes(modelId)
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
  imageModelOf("black-forest-labs/FLUX.1-schnell", 1),
  imageModelOf('Pro/black-forest-labs/FLUX.1-schnell', 1),
  // 已弃模型
  // imageModelOf("stabilityai/stable-diffusion-2-1", -1),
  // imageModelOf("stabilityai/stable-diffusion-3-5-large", -1),
  // imageModelOf("stabilityai/stable-diffusion-xl-base-1.0", -1),
  // imageModelOf("stabilityai/stable-diffusion-3-medium", -1),
  // imageModelOf("stabilityai/sd-turbo", -1),
  // imageModelOf("stabilityai/sdxl-turbo", -1),
  // imageModelOf("ByteDance/SDXL-Lightning", -1),
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

