import { LOCAL_STORAGE_KEY } from "@src/utils/types";
import { getSecretKey } from "../store/storage";
import { getChatCompletion, getJsonDataFromLocalStorage } from "../utils/helpers";
import imageGenPrompt from "./prompt/image-gen.txt?raw"
import { message } from "tdesign-react";
import { isMixedThinkingModel } from "@src/utils/models";
import { sleep } from "@src/utils/utils";

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

function isEnglish (text) {
  // 移除常见标点和数字
  const cleanText = text.replace(/[\s\d.,!?'"]/g, '');

  // 计算非英文字符的比例
  const nonEnglishChars = cleanText.replace(/[A-Za-z]/g, '');
  const ratio = nonEnglishChars.length / cleanText.length;

  // 如果非英文字符比例小于 20%，认为是英文
  return ratio < 0.2;
}

export const getEnglishText = async (userInput, language) => {
  // 判断 userInput 的句子是否为英文
  const targetLanguage = isEnglish(userInput) ? language : 'English';
  const result = await getChatCompletion(`${userInput}`, { systemPrompt: `You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately to ${targetLanguage}, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text. Output translation directly without any additional text.` })
  return result;
};

export const getQuestionEvaluation = async (userInput, systemPrompt) => {
  const result = await getChatCompletion(`你将判断用户的输入在指定的 System Prompt 下，是否可能会有可评估的回答。System Prompt 可能为空，为空则表示无背景信息。输出 0 到 100 的数字，数字越大表示回答越可能具有评估性，数字越小表示越不可能。
  输出数字，不要输出其他任何内容。详情如下：<system_prompt>${systemPrompt}</system_prompt>
  <input>${userInput}</input>，take a breath, and think step by step`, { top_p: 0.2 })
  return parseInt(result) >= 50;
}

export const checkWebSearch = async (userInput, onResultUpdate = () => { }) => {
  const { zhipuai } = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.WEB_SEARCH_SETTINGS) || {};
  const { active, model, prompt, skipIntent } = zhipuai || { active: false };

  const result = {
    active,
    skipIntent,
    done: false,
    checking: false,
    needSearch: false,
    searching: false,
    results: undefined
  }
  let webResults = [];
  let needSearch = true;

  if (!active) {
    onResultUpdate({ ...result, done: true });
    return [];
  };


  if (!skipIntent) {
    onResultUpdate({ ...result, checking: true });
    const startTime = Date.now();
    try {
      const result = await getChatCompletion(userInput, {
        systemPrompt: prompt, modelId: model
      })
      const spendTime = Date.now() - startTime;
      console.log(`[${userInput}] \n是否需要搜索：${result}，耗时：${spendTime}ms`);
      needSearch = result.includes('是') || result.toLowerCase().includes('yes') || result.includes('true');
    } catch (error) {
      console.warn(`检查失败：${error.message}`)
    }
    onResultUpdate({ ...result, checking: false });
  }
  if (needSearch) {
    onResultUpdate({ ...result, searching: true });
    try {
      webResults = await getWebSearchResults(userInput);

    } catch (error) {
      message.warning(`搜索失败：${error.message}`, 5000)
    }
  }
  onResultUpdate({ ...result, needSearch, results: webResults, searching: false, done: true });
  return webResults;
}

export const getWebSearchResults = async (userInput) => {
  const { zhipuai } = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.WEB_SEARCH_SETTINGS);
  const { apiKey, searchEngine = 'search_std' } = zhipuai;
  const url = "https://open.bigmodel.cn/api/paas/v4/web_search";
  const data = {
    search_query: userInput,
    search_engine: searchEngine
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then(res => res.json())
  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.search_result || []
}

export const getResponseEvaluationResults = (userInput, systemPrompt, responses, judges = ['Qwen/Qwen2.5-7B-Instruct', 'THUDM/GLM-4-9B-0414', 'internlm/internlm2_5-7b-chat']) => {
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

const thinkingCheckCacheMap = new Map();

/**
 * 检查是否需要启用思考，针对部分模型
 */
export const checkNeedEnableThinking = async (modelId, content) => {
  const isMixedThinkModel = isMixedThinkingModel(modelId);
  if (!isMixedThinkModel) {
    return undefined;
  }

  if (thinkingCheckCacheMap.has(content)) {
    while (thinkingCheckCacheMap.get(content) === null) {
      await sleep(50)
    }
    return thinkingCheckCacheMap.get(content);
  }

  thinkingCheckCacheMap.set(content, null);

  const start = Date.now();
  const res = await getChatCompletion(`以下是一个用户输入，请你判断该输入是否需要模型进行“深度推理”。  
— “深度推理”指需要模型多步思考、逻辑分析或跨信息综合推断的场景；  
— 简单问候、固定事实查询、翻译、语法校正等场景“不需要”深度推理。  

请严格按照下面的格式输出： true/false

---

<user_input>${content}</user_input>`, { json: true })
  console.log(`[${content}] \n是否需要思考：${res} \n 耗时：${Date.now() - start}ms`, res);
  thinkingCheckCacheMap.set(content, res);
  return !!res;
}