import laughingBabyResolveFn from "./laughingBaby.js?raw"
import geminiResolveFn from "./gemini.js"
import claudeChat from "./claude.js";
import deepseekResolveFn from "./deepseek.js"
import { CUSTOM_PRESET_PREFIX } from "../../../utils/types";
import { openAiCompatibleChat } from "../../../utils/utils.js";
import { getSecretKey } from "../../../store/storage.js";
import zhipuaiChat from "./zhipuai.js";

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
    name: 'OpenAI Compatible',
    icon: 'https://chat.kwok.ink/logo.svg',
    id: 'preset-openai-compatible',
    ids: 'silicon-flow/Qwen/Qwen2-7B-Instruct',
    sk: getSecretKey(),
    length: '32',
    price: 0,
    baseUrl: 'https://api.siliconflow.cn/v1',
    resolveFn: openAiCompatibleResolver,
    link: 'https://siliconflow.cn/zh-cn/pricing',
    isOpenAiCompatible: true,
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
      }
    ],
    resolveFn: geminiResolveFn,
    link: 'https://deepmind.google/technologies/gemini/'
  },
  {
    name: 'Claude',
    id: 'preset-claude',
    icon: 'https://cdn-avatars.huggingface.co/v1/production/uploads/1670531762351-6200d0a443eb0913fa2df7cc.png',
    ids: 'anthropic/claude-3-5-sonnet-20240620,anthropic/claude-3-opus-20240229,anthropic/claude-3-sonnet-20240229,anthropic/claude-3-haiku-20240307',
    length: '',
    price: void 0,
    paramsMode: true,
    apiVersion: '2023-06-01', // 默认值
    baseUrl: 'https://api.anthropic.com',
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: '必填', type: 'error' }
        ],
        label: '密钥',
        prop: 'apiKey',
        placeholder: '请输入 API KEY',
      },
      {
        type: 'input',
        rules: [
          { required: true, message: '必填', type: 'error' }
        ],
        label: '请求域名',
        prop: 'baseUrl',
        placeholder: '请输入请求域名',
      },
      {
        type: 'input',
        rules: [
          { required: true, message: '必填', type: 'error' }
        ],
        label: 'API版本',
        prop: 'apiVersion',
        placeholder: '请输入 API 版本',
      },
    ],
    resolveFn: claudeChat,
    link: 'https://claude.ai/'
  },
  {
    name: 'DeepSeek',
    id: 'preset-deepseek',
    icon: '',
    ids: 'deepseek-ai/deepseek-coder,deepseek-ai/deepseek-chat',
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
        url: 'https://platform.deepseek.com/api_keys'
      }
    ],
    resolveFn: deepseekResolveFn,
    link: 'https://www.deepseek.com/'
  },
  {
    name: '智谱AI',
    id: 'preset-zhipuai',
    icon: '',
    ids: 'THUDM/GLM-4-Flash,THUDM/GLM-4-0520',
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
        url: 'https://bigmodel.cn/usercenter/apikeys'
      }
    ],
    resolveFn: zhipuaiChat,
    link: 'https://bigmodel.cn/'
  }
].map(item => ({ ...item, name: CUSTOM_PRESET_PREFIX + item.name, isPreset: true, params: item.paramsMode ? item.params || [] : [] }));

export default CUSTOM_MODEL_PRESET;

/**
 * 获取内置的解析函数 
 */
export function getBuildInResolveFn (modelConfig) {
  const model = CUSTOM_MODEL_PRESET.find(item => modelConfig.isOpenAiCompatible ? item.isOpenAiCompatible : item.id === modelConfig.id);
  // 在标准的函数入参之外，添加上用户配置的数据（内含 apiKey 等东西）
  return (...args) => model.resolveFn(modelConfig, ...args);
}

export function openAiCompatibleResolver (modelConfig, ...args) {
  const { baseUrl, sk, idResolver } = modelConfig;
  let idResolverFn = '';
  if (idResolver) {
    idResolverFn = new Function(`return ${idResolver}`)();
  }
  return openAiCompatibleChat(baseUrl, sk, idResolverFn, ...args);
}
