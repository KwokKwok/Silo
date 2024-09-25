import { useEffect } from "react";
import { useActiveModels } from "../store/app";
import { getModelIcon } from "./models";
import { ERROR_PREFIX } from "./types";
import { useMultiRows, useRefresh } from "./use";
import { streamChat } from "./utils";
import { getQuestionEvaluation, getResponseEvaluationResults } from "../services/api";

/**
 * 用于存放用户信息，key 为时间戳
 */
let userMessages = {};
let lastMessage = null;
/**
 * 评估信息
 */
let evaluationInput = {};

function _addUserMessage (message, systemPrompt) {
  const chatId = Date.now();
  const newMessage = { content: message, chatId };
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
  userMessages[chatId] = message;
  lastMessage = newMessage;
  return newMessage;
}

function _evaluateResponse (activeChats, refreshController, systemPrompt) {
  if (!lastMessage) return;
  const { chatId, content } = lastMessage
  if (!evaluationInput[chatId] || evaluationInput[chatId].done) return
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


function _streamChat (chat, newMessage, systemPrompt) {
  const { chatId, content } = newMessage;
  chat.controller.current = new AbortController();
  chat.loading = true;
  const { model, controller } = chat
  const _onChunk = (content) => {
    chat.messages[chatId] += content;
  }
  const _onEnd = () => {
    chat.loading = false;
    chat.controller.current = null;
  }

  const _onError = (err) => {
    chat.messages[chatId] = ERROR_PREFIX + err.message;
    _onEnd();
  }

  // 构建对话历史
  const chatMessage = Object.keys(chat.messages).reduce((arr, curTime) => {
    const userMessage = userMessages[curTime];
    const aiMessage = chat.messages[curTime];
    return [...arr, { role: 'user', content: userMessage }, { role: 'assistant', content: aiMessage }].filter(item => item.role != 'assistant' || !item.content.startsWith(ERROR_PREFIX))
  }, [])
  chatMessage.push({ role: 'user', content })
  if (systemPrompt) {
    chatMessage.unshift({ role: 'system', content: systemPrompt })
  }

  // 可以先展示用户消息
  chat.messages[chatId] = ''
  streamChat(model, chatMessage, controller, _onChunk, _onEnd, _onError)
}


/**
 * 用于存放所有模型的聊天信息
 */
const allChats = {}

export function useActiveChatsMessages () {
  const { activeModels } = useActiveModels()
  const messages = Object.keys(userMessages).map(chatId => {
    const result = { chatId, user: userMessages[chatId], ai: {} }
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
  const chatId = Object.keys(userMessages)[0];
  return sortedActiveModels.map(model => ({
    model,
    message: allChats[model]?.messages[chatId] || '',
    loading: allChats[model]?.loading || false,
    icon: getModelIcon(model),
  }))
}

/**
 * 获取用户与模型完整的消息交互（用户消息和模型消息是分开存放的）
 * @param {string} model 模型 id 
 */
export function useChatMessages (model) {
  const chatMessages = allChats[model]?.messages || {};
  return Object.keys(chatMessages).map(chatId => ({
    chatId,
    evaluate: evaluationInput[chatId],
    user: userMessages[chatId],
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
  const refreshController = useRefresh(48);
  const activeChats = activeModels.map(item => {
    if (!allChats[item]) {
      allChats[item] = {
        loading: false,
        messages: {},
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
  const onSubmit = (message) => {
    refreshController.start();
    const newMessage = _addUserMessage(message, systemPrompt);
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
  return { loading, onSubmit, onStop }
}