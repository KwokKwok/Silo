import { useActiveModels } from "../store/app";
import { streamChat } from "../services/model";
import { ERROR_PREFIX } from "./types";
import { useRefresh } from "./use";

/**
 * 用于存放用户信息，key 为时间戳
 */
let userMessages = {};

function _addUserMessage (message) {
  const chatId = Date.now();
  const newMessage = { content: message, chatId };
  userMessages[chatId] = message;
  return newMessage;
}

/**
 * {
 *    time1: 'xxxx'
 * }
 */
export function getUserMessages () {
  return userMessages
}


function _streamChat (chat, newMessage) {
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
 * 获取用户与模型完整的消息交互（用户消息和模型消息是分开存放的）
 * @param {string} model 模型 id 
 */
export function useChatMessages (model) {
  const chatMessages = allChats[model]?.messages || {};
  return Object.keys(chatMessages).map(chatId => ({
    chatId,
    user: userMessages[chatId],
    ai: chatMessages[chatId]
  }))
}

/**
 * 获取单个模型的数据（TODO 类型）
 */
export function useSingleChat (model) {
  return allChats[model] || {};
}

export function useSiloChat () {
  const { activeModels } = useActiveModels();
  const refresh = useRefresh(48);
  const activeChats = activeModels.map(item => {
    if (!allChats[item]) {
      allChats[item] = {
        loading: false,
        messages: [],
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
  if (!loading) {
    refresh.stop();
  }
  const onSubmit = (message) => {
    refresh.start();
    const newMessage = _addUserMessage(message);
    activeChats.forEach(chat => {
      _streamChat(chat, newMessage);
    })
  }
  const onStop = (clear) => {
    activeChats.forEach(chat => {
      chat.stop(clear);
    })
    if (clear) {
      userMessages = {}
    }
    refresh.refresh();
  }
  return { loading, onSubmit, onStop }
}