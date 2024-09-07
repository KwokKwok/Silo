import { getSecretKey } from "../store/storage";
import { getChatCompletion } from "../utils/helpers";
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
  const result = await getChatCompletion(userInput, { json: true, systemPrompt: imageGenPrompt })
  const { advise, en, zh } = result;
  if ([advise, en, zh].some(item => !item)) return getOptimizedPrompts(userInput);
  return { advise, en, zh };
};

export const getEnglishText = async (userInput) => {
  const result = await getChatCompletion(`Translate the following source text to English, Output translation directly without any additional text.
  Source Text: ${userInput}
  Translated Text:`, { systemPrompt: 'You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately into English, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text.' })
  return result;
};