import laughingBabyResolveFn from "./laughingBaby.js?raw"
import geminiResolveFn from "./gemini.js"
import claudeChat from "./claude.js";
import zhipuaiChat from "./zhipuai.js";
import deepseekResolveFn from "./deepseek.js"
import { CUSTOM_PRESET_PREFIX } from '@src/utils/types';
import { openAiCompatibleChat } from '@src/utils/utils.js';
import { getSecretKey } from '@src/store/storage.js';
import xAiChat from "./x-ai";

const CUSTOM_MODEL_PRESET = [
  {
    name: 'Laughing Baby（Example）',
    icon: '/logo.svg',
    id: 'preset-ai-laughing-baby',
    ids: 'Silo/Laughing-Baby-16K,Silo/Laughing-Baby-32K',
    length: '2048',
    price: 0,
    resolveFn: laughingBabyResolveFn,
    link: 'https://github.com/KwokKwok/Silo'
  },
  {
    name: 'OpenAI Compatible',
    icon: '/logo.svg',
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
    ids: 'google/gemini-1.5-flash,google/gemini-1.5-pro,google/gemini-2.0-flash-exp,google/gemini-2.0-flash-thinking-exp',
    length: '',
    price: void 0,
    vision: true,
    baseUrl: 'https://generativelanguage.googleapis.com/v1alpha',
    paramsMode: true,
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.secret_key',
        prop: 'apiKey',
        url: 'https://aistudio.google.com/apikey'
      },
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.base_url',
        prop: 'baseUrl',
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
    vision: true,
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.secret_key',
        prop: 'apiKey',
      },
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.base_url',
        prop: 'baseUrl',
      },
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.api_version',
        prop: 'apiVersion',
      },
    ],
    resolveFn: claudeChat,
    link: 'https://claude.ai/'
  },
  {
    name: 'X.AI/Grok',
    id: 'preset-x-ai',
    icon: '',
    ids: 'x-ai/grok-beta,x-ai/grok-vision-beta',
    price: void 0,
    paramsMode: true,
    baseUrl: 'https://api.x.ai/v1',
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.secret_key',
        prop: 'apiKey',
        url: 'https://console.x.ai/'
      },
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.base_url',
        prop: 'baseUrl',
      }
    ],
    resolveFn: xAiChat,
    link: 'https://console.x.ai/'
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
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.secret_key',
        prop: 'apiKey',
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
    ids: 'THUDM/GLM-4-Flash',
    price: void 0,
    paramsMode: true,
    params: [
      {
        type: 'input',
        rules: [
          { required: true, message: 'common.required', type: 'error' }
        ],
        label: 'custom_model.secret_key',
        prop: 'apiKey',
        url: 'https://bigmodel.cn/usercenter/apikeys'
      }
    ],
    resolveFn: zhipuaiChat,
    link: 'https://bigmodel.cn/'
  }
].map(item => ({ ...item, name: CUSTOM_PRESET_PREFIX + item.name, isPreset: true, params: item.paramsMode ? item.params || [] : [] }));

export default CUSTOM_MODEL_PRESET;



export function openAiCompatibleResolver (modelConfig, ...args) {
  const { baseUrl, sk, idResolver } = modelConfig;
  let idResolverFn = '';
  if (idResolver) {
    idResolverFn = new Function(`return ${idResolver}`)();
  }
  return openAiCompatibleChat(baseUrl, sk, idResolverFn, ...args);
}
