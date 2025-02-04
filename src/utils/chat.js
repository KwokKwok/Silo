import { useEffect } from "react";
import { useActiveModels } from "../store/app";
import { getModelIcon, isVisionModel } from "./models";
import { ERROR_PREFIX } from "./types";
import { useMultiRows, useRefresh } from "./use";
import { resizeBase64Image, streamChat } from "./utils";
import { getQuestionEvaluation, getResponseEvaluationResults } from "../services/api";
import { getVisionModelOptionWidth } from "./options/chat-options";

/**
 * 用于存放用户信息，key 为时间戳
 */
let userMessages = {};
/**
 * 用于存放对话图片信息，key 为时间戳
 */
let messageImages = {};
let lastMessage = null;
/**
 * 评估信息
 */
let evaluationInput = {};

let messageHistory = [];

let thoughts = {};

function _addThought (chatId, model, content) {
  if (!thoughts[chatId]) {
    thoughts[chatId] = {};
  }
  if (!thoughts[chatId][model]) {
    thoughts[chatId][model] = '';
  }
  thoughts[chatId][model] += content;
}

export function getModelThoughts (chatId, model) {
  return thoughts[chatId]?.[model] || '';
}

function _addUserMessage (message, systemPrompt, image, activeModels) {
  const chatId = Date.now();
  messageHistory.push({ message, image, chatId });
  const newMessage = { content: message, chatId };
  // 可仅评估第一个问题：&& Object.keys(userMessages).length < 1
  // 多模态问题不做评估，仅一个模型不做评估
  if (!image && activeModels.length > 1) {
    getQuestionEvaluation(message, systemPrompt).then(isEvaluate => {
      if (isEvaluate) {
        evaluationInput[chatId] = {
          done: false,
          message: newMessage,
          results: [],
          best: [],
        }
      }
    })
  }
  userMessages[chatId] = message;
  messageImages[chatId] = image;
  lastMessage = newMessage;
  return newMessage;
}

function _evaluateResponse (activeChats, refreshController, systemPrompt) {
  if (!lastMessage) return;
  const { chatId, content } = lastMessage
  if (!evaluationInput[chatId] || evaluationInput[chatId].done) return
  // 多模态模型不参与评估
  const responses = activeChats.map(item => ({ model: item.model, content: item.messages[chatId] })).filter(item => item.content);
  const promises = getResponseEvaluationResults(content, systemPrompt, responses);
  const evaluate = evaluationInput[chatId];
  promises.forEach(p => {
    p.then(result => {
      evaluate.results.push(result);
      refreshController.refresh()
    })
  })
  Promise.all(promises).then(() => {
    evaluate.done = true;
    const winners = evaluate.results.flatMap(item => item.winners);
    const winnerCounts = winners.reduce((counts, winner) => {
      counts[winner] = (counts[winner] || 0) + 1;
      return counts;
    }, {});
    const maxCount = Math.max(...Object.values(winnerCounts));
    const mostFrequentWinners = Object.keys(winnerCounts).filter(winner => winnerCounts[winner] === maxCount);
    evaluate.best = mostFrequentWinners.map(model => {
      const supports = evaluate.results.reduce((arr, cur) => {
        if (cur.winners.includes(model)) {
          arr.push(cur.judge)
        }
        return arr
      }, [])
      return { model, supports }
    })
    refreshController.refresh()
  })
}

/**
 * {
 *    time1: 'xxxx'
 * }
 */
export function getUserMessages () {
  return userMessages
}

export function removeUserMessage (chatId) {
  delete userMessages[chatId];
  Object.keys(allChats).forEach(model => {
    delete allChats[model].messages[chatId];
  })
}


async function _streamChat (chat, newMessage, systemPrompt) {
  const { chatId, content } = newMessage;
  chat.controller.current = new AbortController();
  chat.loading = true;
  const { model, controller } = chat

  const _onThinking = (content) => {
    _addThought(chatId, model, content);
  }

  let isThoughtStart = false;
  let isThoughtEnd = false;
  const _onChunkContent = (content) => {
    chat.messages[chatId] += content;
  }
  const _onChunkThought = (content) => {
    _onThinking(content)
  }
  const _onChunk = (content) => {
    // 阿里国际站团队推出的 Marco-o1 模型，可以模拟 o1 的思考过程。实现方式是使用两个标签 <Thought> 和 <Output> 包裹内容。
    if (chat.messages[chatId].trim().startsWith('<Thought>')) {
      isThoughtStart = true;
      _addThought(chatId, model, chat.messages[chatId].replace('<Thought>', ''));
      chat.messages[chatId] = '';
    }
    if (!isThoughtStart) {
      // 非 thought 模式，直接输出内容
      _onChunkContent(content);
      return;
    } else if (!isThoughtEnd) {
      // 是 <Thought> 标签包裹的内容，且没有结束
      _onChunkThought(content);
      const currentThought = thoughts[chatId][model];
      if (currentThought.includes('</Thought>')) {
        isThoughtEnd = true;
        const [thought, _output] = currentThought.split('</Thought>');
        thoughts[chatId][model] = thought;
        if (!thought.trim()) {
          delete thoughts[chatId][model]
        }
        content = _output;
      } else {
        content = ''
      }
    }
    if (content) {
      _onChunkContent(content);
      chat.messages[chatId] = chat.messages[chatId].replace('<Output>', '').replace('</Output>', '');
    }
  }
  const _onEnd = (info) => {
    chat.loading = false;
    chat.infos[chatId] = info;
    chat.controller.current = null;
  }

  const _onError = (err) => {
    chat.messages[chatId] = ERROR_PREFIX + err.message;
    _onEnd();
  }


  // 构建对话历史
  const chatMessage = Object.keys(chat.messages).reduce((arr, curTime) => {
    const userMessage = userMessages[curTime];
    const image = chat.images[curTime];
    const aiMessage = chat.messages[curTime];
    if (aiMessage.startsWith(ERROR_PREFIX)) {
      return arr;
    }
    return [...arr, { role: 'user', content: userMessage, image }, { role: 'assistant', content: aiMessage }]
  }, [])
  const messageImage = messageImages[chatId];
  let image = messageImage;
  const isVision = isVisionModel(model);
  if (image) {
    if (isVision) {
      image = await resizeBase64Image(messageImage, getVisionModelOptionWidth(model))
    }
    chat.images[chatId] = image;
  }

  chatMessage.push({ role: 'user', content, image })
  if (systemPrompt) {
    chatMessage.unshift({ role: 'system', content: systemPrompt })
  }


  // 格式化消息，兼容多模态
  const finalMessages = chatMessage.map(item => {
    const { role, content, image } = item;
    let formattedContent = [];
    if (isVision && image) {
      // detail 用 high，通过配置的图片宽度调整
      formattedContent.push({ type: 'image_url', image_url: { url: image, detail: 'high' } })
    }
    // 文字提示放后面对 InternVL 效果更好，其他无顺序影响
    formattedContent.push({ type: 'text', text: content })
    return {
      role,
      // 部分 LLM 不支持复杂结构，做兼容处理
      content: isVision ? formattedContent : content
    }
  })

  // 可以先展示用户消息
  chat.messages[chatId] = ''
  // 如果模型不是多模态，但是用户上传了图片，则直接报错
  if (!isVision && image) {
    _onError({ message: 'error.model_not_vlm' })
    return;
  }
  streamChat(model, finalMessages, controller, _onChunk, _onEnd, _onError, _onThinking)
}


/**
 * 用于存放所有模型的聊天信息
 */
const allChats = {}

export function useActiveChatsMessages () {
  const { activeModels } = useActiveModels()
  const messages = Object.keys(userMessages).map(chatId => {
    const result = { chatId, user: userMessages[chatId], image: messageImages[chatId], ai: {} }
    activeModels.forEach(model => {
      result.ai[model] = allChats[model]?.messages[chatId] || '';
    })
    return result;
  })
  return messages
}

/**
 * 获取最后的响应
 */
export function useLastGptResponse () {
  const [rows] = useMultiRows();

  const sortedActiveModels = (rows[0] || []).flatMap((item, index) =>
    rows[1]?.[index] ? [item, rows[1][index]] : [item]
  );
  console.log(rows, sortedActiveModels);

  const chatId = Object.keys(userMessages)[0];
  return sortedActiveModels.map(model => ({
    model,
    message: allChats[model]?.messages[chatId] || '',
    loading: allChats[model]?.loading || false,
    icon: getModelIcon(model),
  }))
}

/**
 * 获取单次对话的对话信息，token 使用情况，耗时等
 */
export function getChatMessageInfo (model, chatId) {
  return allChats[model]?.infos[chatId] || {}
}

/**
 * 获取用户与模型完整的消息交互（用户消息和模型消息是分开存放的）
 * @param {string} model 模型 id 
 */
export function useChatMessages (model) {
  const chatMessages = allChats[model]?.messages || {};
  const images = allChats[model]?.images || {};
  return Object.keys(chatMessages).map(chatId => ({
    chatId,
    evaluate: evaluationInput[chatId],
    user: userMessages[chatId],
    image: images[chatId],
    ai: chatMessages[chatId],
  }))
}

/**
 * 获取单个模型的数据（TODO 类型）
 */
export function useSingleChat (model) {
  return allChats[model] || {};
}

export function useSiloChat (systemPrompt) {
  const { activeModels } = useActiveModels();
  const hasVisionModel = activeModels.some(item => isVisionModel(item));
  const refreshController = useRefresh(48);
  const activeChats = activeModels.map(item => {
    if (!allChats[item]) {
      allChats[item] = {
        loading: false,
        messages: {},
        /**
         * 用于存放 token 使用情况，耗时等
         */
        infos: {},
        /**
         * 用于存放实际使用的图片（不同的模型可能使用不同的清晰度设置）
         */
        images: {},
        controller: {},
        model: item,
        stop (clear) {
          try {
            this.controller.current?.abort()
          } catch (error) {

          }
          this.loading = false;
          if (clear) {
            this.messages = {};
          }
        }
      }
    }
    return allChats[item];
  })
  const loading = activeChats.some(chat => chat.loading);
  useEffect(() => {
    if (!loading) {
      refreshController.refresh();
      refreshController.stop();
      _evaluateResponse(activeChats, refreshController, systemPrompt);
    }
  }, [loading])
  const onSubmit = (message, image) => {
    refreshController.start();
    const newMessage = _addUserMessage(message, systemPrompt, image, activeModels);
    activeChats.forEach(chat => {
      _streamChat(chat, newMessage, systemPrompt);
    })
  }
  const onStop = (clear) => {
    activeChats.forEach(chat => {
      chat.stop(clear);
    })
    if (clear) {
      userMessages = {}
    }
    refreshController.refresh();
  }

  return { loading, onSubmit, onStop, hasVisionModel, messageHistory }
}