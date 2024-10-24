import { getSecretKey } from "../store/storage";
import { getChatCompletion } from "../utils/helpers";
import imageGenPrompt from "./prompt/image-gen.txt?raw"

export const fetchUserInfo = async () => {
  const sk = getSecretKey();
  if (!sk) throw new Error('No secret key');
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
    throw new Error(await res.text());
  }
  return await res.json();
}

export const getOptimizedPrompts = async (userInput) => {
  const result = await getChatCompletion(userInput, { json: true, systemPrompt: imageGenPrompt })
  const { advise, optimized } = result;
  if ([advise, optimized].some(item => !item)) return getOptimizedPrompts(userInput);
  return { advise, optimized };
};

export const getEnglishText = async (userInput) => {
  const result = await getChatCompletion(`Translate the following source text to English, Output translation directly without any additional text.
  Source Text: ${userInput}
  Translated Text:`, { systemPrompt: 'You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately into English, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text.' })
  return result;
};

export const getQuestionEvaluation = async (userInput, systemPrompt) => {
  const result = await getChatCompletion(`你将判断用户的输入在指定的 System Prompt 下，是否可能会有可评估的回答。System Prompt 可能为空，为空则表示无背景信息。输出 0 到 100 的数字，数字越大表示回答越可能具有评估性，数字越小表示越不可能。
  输出数字，不要输出其他任何内容。详情如下：<system_prompt>${systemPrompt}</system_prompt>
  <input>${userInput}</input>，take a breath, and think step by step`, { top_p: 0.2 })
  return parseInt(result) >= 50;
}

export const getResponseEvaluationResults = (userInput, systemPrompt, responses, judges = ['Qwen/Qwen2.5-7B-Instruct', 'THUDM/glm-4-9b-chat', '01-ai/Yi-1.5-9B-Chat-16K', 'internlm/internlm2_5-7b-chat']) => {
  const prompt = `请对模型的回答进行细致的分析和评估，输出 0 到 100 分的分数，数字越大表示回答的质量越高，数字越小表示回答的质量越低。
  严格输出 JSON 格式的分数： { "<model_id1>":<score>, "<model_id2>": <score>, "best": "model_id of the best response" } 。
  详情如下：
  <system_prompt>${systemPrompt}</system_prompt>
  <input>${userInput}</input>
  各模型回答如下：
  ${responses.map((item) => `<id>${item.model}</id><response>${item.content}</response>`).join('\n')}
  
  take a breath, and think step by step`
  console.log(prompt);
  const models = responses.map(item => item.model);
  return judges.map(judge => getChatCompletion(prompt, { modelId: judge, json: true, top_p: 0.2 }).then(res => {
    try {
      console.log(res);
      let { best } = res;
      if (models.includes(best)) {
        return [best]
      }
      let winner = models[0];
      models.forEach(id => {
        if (res[id] > res[winner]) {
          winner = id;
        }
      })
      const winnerScore = res[winner];
      return models.filter(id => res[id] == winnerScore);
    } catch (error) {
      return []
    }
  }).then(winners => ({
    judge,
    winners
  })))
}