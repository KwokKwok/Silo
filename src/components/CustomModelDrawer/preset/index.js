import laughingBabyResolveFn from "./laughingBaby.js?raw"
import geminiResolveFn from "./gemini.js"
import deepseekResolveFn from "./deepseek.js"
import { CUSTOM_PRESET_PREFIX } from "../../../utils/types";

const CUSTOM_MODEL_PRESET = [
  {
    name: '爱笑的小孩（带参数说明）',
    icon: 'https://chat.kwok.ink/logo.svg',
    id: 'preset-ai-laughing-baby',
    ids: 'Silo/Laughing-Baby-16K,Silo/Laughing-Baby-32K',
    length: '2048',
    price: 0,
    resolveFn: laughingBabyResolveFn,
    link: 'https://chat.kwok.ink/'
  },
  {
    name: 'Google Gemini',
    id: 'preset-gemini',
    icon: '',
    ids: 'google/gemini-1.5-flash,google/gemini-1.5-pro',
    length: '',
    price: void 0,
    paramsMode: true,
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: '必填', type: 'error' }
        ],
        label: '密钥',
        prop: 'apiKey',
        placeholder: '请输入 API_KEY',
        url: 'https://chat.kwok.ink'
      }
    ],
    resolveFn: geminiResolveFn,
    link: 'https://deepmind.google/technologies/gemini/'
  },
  {
    name: 'DeepSeek',
    id: 'preset-deepseek',
    icon: '',
    ids: 'deepseek/deepseek-coder,deepseek/deepseek-chat',
    price: void 0,
    paramsMode: true,
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: '必填', type: 'error' }
        ],
        label: '密钥',
        prop: 'apiKey',
        placeholder: '请输入 API_KEY',
        url: 'https://chat.kwok.ink'
      }
    ],
    resolveFn: deepseekResolveFn,
    link: 'https://www.deepseek.com/'
  }
].map(item => ({ ...item, name: CUSTOM_PRESET_PREFIX + item.name, isPreset: true }));

export default CUSTOM_MODEL_PRESET;

/**
 * 获取内置的解析函数 
 */
export function getBuildInResolveFn (modelConfig) {
  const model = CUSTOM_MODEL_PRESET.find(item => item.id === modelConfig.id);
  // 在标准的函数入参之外，添加上用户配置的数据（内含 apiKey 等东西）
  return (...args) => model.resolveFn(...args, modelConfig);
}
