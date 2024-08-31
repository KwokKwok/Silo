import { getChatRequestOptions } from "./options/chat-options"
import { getChatResolver } from './models';
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
    return onError(new Error('API Key未配置'))
  }
  fetch(`${baseUrl}/chat/completions`, { ...createOpenAICompatibleRequestOptions(sk, modelId, messages, chatOptions), signal: controller.current.signal })
    .then(async response => {
      if (!response.body) {
        throw new Error('Stream not available');
      }
      if (response.status != '200') {
        const data = await response.json();
        throw new Error(`${data.message}`)
      }
      return response.body; // 获取响应体的流
    })
    .then(stream => {
      const reader = stream.getReader(); // 创建一个读取器
      const decoder = new TextDecoder(); // 创建文本解码器

      // 读取流中的数据
      function read () {
        reader.read().then(({ done, value }) => {
          if (!controller.current) return;
          if (done) {
            onEnd()
            return;
          }
          const decodedData = decoder.decode(value); // 解码数据
          const content = decodedData.split('data: ').filter(item => item.trim() && item.startsWith('{')).map(item => JSON.parse(item).choices[0].delta.content).join("");
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

export function streamChat (model, messages, controller, onChunk, onEnd, onError) {
  const modelChatOptions = getChatRequestOptions(model)
  const resolver = getChatResolver(model);
  return resolver(model, messages, modelChatOptions, controller, onChunk, onEnd, onError)
}