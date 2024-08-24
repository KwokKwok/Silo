export const CUSTOM_MODEL_PRESET = [
  {
    name: '[Preset] 爱笑的小孩',
    icon: 'https://chat.kwok.ink/logo.svg',
    id: 'preset-ai-laughing-baby',
    ids: 'Silo/Laughing-Baby-16K,Silo/Laughing-Baby-32K',
    length: '2048',
    price: 0,
    resolveFn: laughingBabyChat.toString(),
    isPreset: true,
    link: 'https://chat.kwok.ink/'
  },
  {
    name: '[Preset] Google Gemini',
    id: 'preset-gemini',
    icon: '',
    ids: 'google/gemini-1.5-flash,google/gemini-1.5-pro',
    length: '',
    price: 0,
    resolveFn: geminiChat.toString(),
    isPreset: true,
    link: 'https://chat.kwok.ink/'
  }
];

async function geminiChat (modelId, messages, options, controller, onChunk, onEnd, onError) {
  // 请填写 API_KEY ！！！
  const API_KEY = ''
  if (!API_KEY) {
    onError(new Error('请在自定义处理函数中填写 API_KEY'));
    return;
  }
  const model = modelId.split('/')[1];
  fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "contents": messages.map(({ role, content }) => ({ role: role == 'user' ? 'user' : 'model', "parts": [{ "text": content }] })),
      "generationConfig": {
        "stopSequences": [
        ],
        "temperature": options.temperature,
        "maxOutputTokens": options.max_tokens,
        "topP": options.top_p,
        "topK": 10
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

      // 读取流中的数据
      function read () {
        reader.read().then(({ done, value }) => {
          // 被取消
          if (!controller.current) return;
          const decodedDataString = decoder.decode(value);
          if (!decodedDataString || done) {
            onEnd()
            return;
          }
          // 提取 `{` 和 `}` 之间的 JSON 数据，可能有多个块。比如输入可能是 `[{},{}`
          const jsonChunksStr = decodedDataString.substring(decodedDataString.indexOf('{'), decodedDataString.lastIndexOf('}') + 1);

          const chunks = JSON.parse(`[\n${jsonChunksStr}\n]`)

          // 如果存在无法输出的块，则抛出错误。可能原因：过载、安全设置等
          const error = chunks.find(item => !item?.candidates?.[0]?.content?.['parts']?.[0]);
          if (error) {
            onError(new Error(`${JSON.stringify(error)}`));
            return;
          }
          // 解析 JSON、根据响应取出 content、最后合并起来
          const content = chunks.map(item => item.candidates[0].content['parts'][0].text).join('');
          if (content) {
            // 将本次拿到的 content 返回
            onChunk(content);
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


async function laughingBabyChat (modelId, messages, options, controller, onChunk, onEnd, onError) {
  const laughingTimes = parseInt(modelId.replace('Silo/Laughing-Baby-', ''));
  if (Math.random() > 0.8) {
    onError(new Error('宝宝去别的地方玩了'))
    return;
  }
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let count = 0;
  while (count++ < laughingTimes) {
    await wait(Math.random() * 32);
    onChunk('😁😁😁');
  }
  onEnd();
}