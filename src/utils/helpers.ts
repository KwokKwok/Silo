import { isNumber } from 'lodash-es';
import { getSecretKey } from '../store/storage';
import { LOCAL_STORAGE_KEY } from './types';

export function getJsonDataFromLocalStorage<T>(
  key: LOCAL_STORAGE_KEY,
  defaultValue: T
) {
  return JSON.parse(getLocalStorage(key) || 'null') || defaultValue;
}

export function setJsonDataToLocalStorage(key: LOCAL_STORAGE_KEY, value: any) {
  setLocalStorage(key, JSON.stringify(value));
}

export function setLocalStorage(key: LOCAL_STORAGE_KEY, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalStorage(key: LOCAL_STORAGE_KEY, defaultValue = '') {
  return localStorage.getItem(key) || defaultValue;
}

/**
 * 生成唯一id
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * 清除用户数据，重启用
 */
export function clearUserData(clearToken = false) {
  let token = '';
  if (!clearToken) {
    token = getLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY);
  }
  localStorage.clear();
  setLocalStorage(LOCAL_STORAGE_KEY.SECRET_KEY, token);
}

interface ChatCompletionOptions {
  modelId?: string;
  systemPrompt?: string;
  json?: boolean;
  temperature?: number;
  top_p?: number;
  [key: string]: any;
}

export const getChatCompletion = async (
  prompt: string,
  options: ChatCompletionOptions = {},
  retryLimit = 3
) => {
  const sk = getSecretKey();
  if (!sk) throw new Error('缺少密钥');
  const { modelId, systemPrompt, temperature, json, top_p, ...rest } =
    options || {};

  const url = 'https://api.siliconflow.cn/v1/chat/completions';
  const messages = [] as any[];
  const response_format = options?.json
    ? {
        type: 'json_object',
      }
    : undefined;
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const requestOption = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sk}`,
    },
    body: JSON.stringify({
      model: modelId || 'THUDM/glm-4-9b-chat',
      messages,
      temperature: top_p || isNumber(temperature) ? temperature : 0.7,
      top_p,
      response_format,
      ...rest,
    }),
  };
  try {
    const response = await fetch(url, requestOption);
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    const data = await response.json();
    try {
      const result = data.choices[0].message.content;
      if (json) return JSON.parse(result);
      return result;
    } catch (e) {
      console.log('解析GPT数据出错：', e);
      if (retryLimit > 0) {
        return getChatCompletion(prompt, options, retryLimit - 1);
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('获取GPT响应失败:', error);
    throw error;
  }
};
