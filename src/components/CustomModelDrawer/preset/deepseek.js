import { createOpenAICompatibleRequestOptions } from "../../../utils/utils"

export default function deepseekChat (model, messages, modelChatOptions, controller, onChunk, onEnd, onError, modelConfig) {
  const modelId = model.split('/')[1] // 取出模型ID
  const { apiKey = '' } = modelConfig;
  if (!apiKey) {
    return onError(new Error('请先填写API Key'))
  }
  fetch('https://api.deepseek.com/chat/completions', { ...createOpenAICompatibleRequestOptions(apiKey, modelId, messages, modelChatOptions), signal: controller.current.signal })
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