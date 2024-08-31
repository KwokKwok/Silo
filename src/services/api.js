import { getSecretKey } from "../store/storage";

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
      model: "Qwen/Qwen2-7B-Instruct",
      messages: [
        {
          role: "system",
          content: `
          你是一个AI绘画提示词专家。现在用户正在向你学习怎么写出更有效的提示词。
          ###
          我会将用户输入的提示词给你，要求：
          1. 请根据该提示词给出两个优化过的 prompt（一个英文，一个中文），这两个 prompt 中不要包含对用户的建议。如果用户输入不明确，可以随机返回一个场景。
          2. 另外针对用户输入可能存在的问题给出一个合理的建议。
          3. 请以JSON格式返回结果。
          ###
          请务必按照以下格式返回结果：
          {
            advise: '此处是你针对用户的提示词提出的建议，如果用户输入很完善，可以做适当夸奖',
            zh: '你优化过的中文的AI绘画提示词',
            en: '你优化过的英文的AI绘画提示词'
          }
          `
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
