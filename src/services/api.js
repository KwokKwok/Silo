import { getSecretKey } from "../store/storage";
import imageGenPrompt from "./prompt/image-gen.txt?raw"

export const fetchUserInfo = async () => {
  const sk = getSecretKey();
  if (!sk) throw new Error('');
  const url = 'https://api.siliconflow.cn/v1/user/info';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${sk}`
    }
  };
  const res = await fetch(url, options);
  if (res.status != 200) {
    throw new Error('密钥不可用');
  }
  return await res.json();
}

export const getOptimizedPrompts = async (userInput) => {
  const sk = getSecretKey();
  if (!sk) throw new Error('缺少密钥');

  const url = 'https://api.siliconflow.cn/v1/chat/completions';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sk}`
    },
    body: JSON.stringify({
      model: "THUDM/glm-4-9b-chat",
      messages: [
        {
          role: "system",
          content: imageGenPrompt
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.7,
      response_format: {
        'type': 'json_object'
      }
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    const data = await response.json();
    try {
      const result = JSON.parse(data.choices[0].message.content);
      const { advise, en, zh } = result;
      if ([advise, en, zh].some(item => !item)) throw new Error('生成的数据不满足需要')
      return { advise, en, zh };
    } catch (e) {
      console.log('解析数据出错：', e);
      return getOptimizedPrompts(userInput)
    }
    return result;
  } catch (error) {
    console.error('获取优化prompt失败:', error);
    throw error;
  }
};
