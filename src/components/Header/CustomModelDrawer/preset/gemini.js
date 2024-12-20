export default async function geminiChat (modelConfig, modelId, messages, options, controller, onChunk, onEnd, onError, onThinking) {
  const { apiKey = '', baseUrl = '' } = modelConfig;
  if (!apiKey) {
    onError(new Error('请填写 API_KEY'))
    return;
  }

  // 转换消息格式的函数
  const convertMessage = (message) => {
    const { role, content } = message;

    // 如果content是字符串，直接返回文本格式
    if (typeof content === 'string') {
      return {
        role: role === 'user' ? 'user' : 'model',
        parts: [{ text: content }]
      };
    }

    // 处理多模态内容
    const parts = content.map(item => {
      if (item.type === 'text') {
        return { text: item.text };
      } else if (item.type === 'image_url') {
        // Gemini 需要 base64 格式的图片数据
        // 从 image_url.url 中提取 base64 数据
        const base64Data = item.image_url.url.split(',')[1] || item.image_url.url;
        return {
          inline_data: {
            mime_type: item.image_url.mime_type || 'image/jpeg',
            data: base64Data
          }
        };
      }
      return null;
    }).filter(Boolean);

    return {
      role: role === 'user' ? 'user' : 'model',
      parts
    };
  };

  const model = modelId.split('/')[1];
  const startTime = Date.now();
  fetch(`${baseUrl}/models/${model}:streamGenerateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: messages.map(convertMessage),
      generationConfig: {
        stopSequences: [],
        temperature: options.temperature,
        maxOutputTokens: options.max_tokens,
        topP: options.top_p,
        topK: 10
      }
    }),
    signal: controller.current.signal
  }).then(async response => {
    if (!response.ok) {
      console.log(`[fetch error] `, response);
      throw new Error(`Request failed with status code: ${response.status}`);
    }
    if (!response.body) {
      throw new Error('Stream not available');
    }
    return response.body; // 获取响应体的流
  })
    .then(stream => {
      const reader = stream.getReader(); // 创建一个读取器
      const decoder = new TextDecoder(); // 创建文本解码器
      const info = {
        usage: {
          total_tokens: 0
        },
        costTime: 0
      }
      // 读取流中的数据
      function read () {
        reader.read().then(({ done, value }) => {
          // 被取消
          if (!controller.current) return;
          const decodedDataString = decoder.decode(value);
          if (!decodedDataString || done) {
            info.costTime = Date.now() - startTime;
            onEnd(info)
            return;
          }
          // 提取 `{` 和 `}` 之间的 JSON 数据，可能有多个块。比如输入可能是 `[{},{}`
          const jsonChunksStr = decodedDataString.substring(decodedDataString.indexOf('{'), decodedDataString.lastIndexOf('}') + 1);

          const chunks = JSON.parse(`[\n${jsonChunksStr}\n]`).filter(Boolean);

          // 如果存在无法输出的块，则抛出错误。可能原因：过载、安全设置等
          const error = chunks.find(item => !item?.candidates?.[0]?.content?.['parts']?.[0]);
          if (error) {
            onError(new Error(`${JSON.stringify(error)}`));
            return;
          }
          // 解析 JSON、根据响应取出 content、最后合并起来
          let thingContent = '';
          let content = ''
          for (const chunk of chunks) {
            const parts = chunk.candidates[0].content['parts'];
            for (const part of parts) {
              if (part.thought) {
                thingContent += part.text;
              } else {
                content += part.text;
              }
            }
          }
          if (chunks.length > 0) {
            info.usage.total_tokens += chunks[chunks.length - 1].usageMetadata?.totalTokenCount || 0;
          }
          if (content) {
            // 将本次拿到的 content 返回
            onChunk(content);
          }
          if (thingContent) {
            onThinking(thingContent);
          }
          read(); // 读取下一块数据
        });
      }
      read(); // 开始读取流
    }).catch(err => {
      console.log(err);
      onError(err);
    })
}