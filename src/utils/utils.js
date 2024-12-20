import { getChatOptions } from "./options/chat-options"
import { getChatResolver, isLimitedModel } from './models';
import { fmtBaseUrl } from "./format";
import { isExperienceSK } from "@src/store/storage";
import { LOCAL_STORAGE_KEY } from "./types";
export function createOpenAICompatibleRequestOptions (sk, model, messages, options = {}) {
  return {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${sk}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      // max_tokens: 4096,
      // temperature: 0.7,
      // top_p: 0.7,
      // top_k: 50,
      // frequency_penalty: 0.5,
      // n: 1
      ...options,
    })
  }
}

/**
 * 默认的 modelId 解析函数。去除 manufacturer 部分
 */
const defaultModelIdResolver = modelId => {
  const [_manufacturer, ...rest] = modelId.split('/');
  return rest.join('/');
}

export function openAiCompatibleChat (baseUrl, sk, modelIdResolver, model, messages, chatOptions, controller, onChunk, onEnd, onError) {
  const modelId = (modelIdResolver || defaultModelIdResolver)(model) // 取出模型ID
  if (!sk) {
    if (isBrowserExtension) {
      return onError(new Error('Please configure the API key in the extension main page and reload this page'))
    }
    return onError(new Error('API Key is missing'))
  }
  const startTime = Date.now()
  fetch(`${fmtBaseUrl(baseUrl)}/chat/completions`, { ...createOpenAICompatibleRequestOptions(sk, modelId, messages, chatOptions), signal: controller.current.signal })
    .then(async response => {
      if (!response.body) {
        throw new Error('Stream not available');
      }
      if (response.status != '200') {
        const data = await response.json();
        const { message, error } = data;
        throw new Error(message || error?.message || JSON.stringify(data))
      }
      return response.body; // 获取响应体的流
    })
    .then(stream => {
      const reader = stream.getReader(); // 创建一个读取器
      const decoder = new TextDecoder(); // 创建文本解码器
      let info = {};
      // 读取流中的数据
      function read () {
        reader.read().then(({ done, value }) => {
          if (!controller.current) return;
          if (done) {
            info.costTime = Date.now() - startTime
            onEnd(info)
            return;
          }
          const decodedData = decoder.decode(value); // 解码数据
          const content = decodedData.split('data: ').filter(item => item.trim() && item.startsWith('{')).map(item => {
            const { choices, ...rest } = JSON.parse(item)
            info = rest
            return choices[0].delta.content
          }).join("");
          if (content) {
            // 将本次拿到的 content 拼接到 streamingMessage 中
            onChunk(content);
          }
          read(); // 递归读取下一块数据
        });
      }

      read(); // 开始读取流
    }).catch(err => {
      console.log(err);
      onError(err);
    })
}

export async function streamChat (model, messages, controller, onChunk, onEnd, onError, onThinking) {
  const modelChatOptions = getChatOptions(model, true)
  try {
    const resolver = getChatResolver(model);
    return resolver(model, messages, modelChatOptions, controller, onChunk, onEnd, onError, onThinking)
  } catch (error) {
    onError(error);
  }
}

export const isBrowserExtension = !!import.meta.env.BROWSER

export function checkModelLimit (modelId) {
  if (isExperienceSK()) {
    if (isLimitedModel(modelId)) {
      throw new Error('为了长久的提供基础服务，体验密钥暂不支持该模型，请见谅')
    }
  }
}

/**
 * 调整 base64 图片的尺寸
 */
export function resizeBase64Image (base64Image, width, requiredHeight = 0) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 如果原图尺寸小于需要的宽度，则直接返回原图
      if (img.width <= width) {
        resolve(base64Image);
        return;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const aspectRatio = img.width / img.height;
      const height = requiredHeight || Math.round(width / aspectRatio);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const resizedBase64 = canvas.toDataURL('image/jpeg');
      resolve(resizedBase64);
    };
    img.onerror = (error) => reject(error);
    img.src = base64Image;
  });
}


export function exportConfig () {
  const keys = Object.values(LOCAL_STORAGE_KEY);
  const config = keys.reduce((result, curKey) => {
    const value = localStorage.getItem(curKey);
    if (value !== null) {
      result[curKey] = value;
    }
    return result;
  }, {});

  const jsonString = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'silo.config.json';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importConfig (config) {
  const keys = Object.values(LOCAL_STORAGE_KEY);
  Object.keys(config).forEach(item => {
    if (keys.includes(item)) {
      localStorage.setItem(item, config[item])
    }
  })
}

/**
 * 阿里国际站团队推出的 Marco-o1 模型，可以模拟 o1 的思考过程。实现方式是使用两个标签 <Thought> 和 <Output> 包裹内容。
 * 
 * 本函数的作用是解析出 <Thought> 和 <Output> 包裹的内容。
 * 
 * 例如：
 * 
 * <Thought>
 * 思考过程
 * </Thought>
 * <Output>
 * 输出内容
 * </Output>
 */
export function marcoLikeThought (content, tagThought = 'Thought', tagOutput = 'Output') {

  return {
    isThoughtStart: false,
    isThoughtEnd: false,
    thought: "",
    output: ""
  }
}