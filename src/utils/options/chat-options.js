import { debounce } from "lodash-es";
import { LOCAL_STORAGE_KEY } from "../types";
import { useState } from "react";
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from "../helpers";
import { getAllTextModels, isVisionModel } from "../models";

//#region 工具类
const optionOf = (name, prop, tooltip, min, max, defaultValue, vision = false, step = 0) => ({
  name,
  prop,
  tooltip,
  min,
  max,
  step: step || (['n', 'max_tokens'].includes(prop) ? 1 : 0.1),
  defaultValue,
  value: defaultValue,
  vision
});
function getDefaultChatOptions () {
  return [
    optionOf(
      'Max Tokens',
      'max_tokens',
      'chat.options.max_tokens_desc',
      50,
      8192,
      4086
    ),
    optionOf(
      'Temperature',
      'temperature',
      'chat.options.temperature_desc',
      0,
      2,
      1
    ),
    optionOf(
      'Top P',
      'top_p',
      'chat.options.top_p_desc',
      0.1,
      1,
      0.7
    ),
    // optionOf(
    //   'Top K',
    //   'top_k',
    //   'Only sample from the top K options for each subsequent token. 对于每个后续标记，仅从前 K 个选项中进行采样。',
    //   0,
    //   100,
    //   50
    // ),
    optionOf(
      'Frequency Penalty',
      'frequency_penalty',
      'chat.options.frequency_penalty_desc',
      -2,
      2,
      0
    ),
    // optionOf('N', 'n', 'Number of generations to return', 1, 100, 1),
    optionOf('chat.options.image_width', 'image_width', 'chat.options.image_width_desc', 448, 5600, 896, true, 28),
  ];
}
//#endregion

const _allModelChatOptions = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.CHAT_MODEL_OPTIONS, {})

/**
 * 将 options 数组，转换为对象形式，方便访问
 */
const _optionsToObj = (options) => {
  return options.reduce((acc, option) => {
    acc[option.prop] = option.value;
    return acc;
  }, {});
}

const _optionObjMap = {}
Object.keys(_allModelChatOptions).forEach(model => {
  _optionObjMap[model] = _optionsToObj(_allModelChatOptions[model])
})

const setAllModelRequestOptions = (options) => {
  getAllTextModels().forEach(({ id: model }) => {
    _optionObjMap[model] = _optionsToObj(options)
    _allModelChatOptions[model] = options
  })
  setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.CHAT_MODEL_OPTIONS, _allModelChatOptions)
}

const setModelRequestOptions = debounce((model, options) => {
  _optionObjMap[model] = _optionsToObj(options)
  _allModelChatOptions[model] = options
  setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.CHAT_MODEL_OPTIONS, _allModelChatOptions)
}, 300)


const _defaultChatOptions = _optionsToObj(getDefaultChatOptions());

/**
 * 请求模型参数，用户参数不全时会以默认参数补全
 */
export function getChatOptions (model, isRequest = false) {
  // 后续可能会加参数，当前用户的参数可能是不全的，需要以默认参数补全
  const userOptions = _optionObjMap[model] || {};
  const result = Object.assign({}, _defaultChatOptions, userOptions);
  if (isRequest) {
    // 该参数仅在本应用有效，不应该传入请求
    delete result.image_width
  }
  return result
}

/**
 * 获取多模态模型的图片宽度
 */
export function getVisionModelOptionWidth (model) {
  const options = getChatOptions(model);
  return options.image_width;
}


export const useChatOptions = (model) => {
  const options = _allModelChatOptions[model] || getDefaultChatOptions();
  const hooks = {};
  options.forEach(option => {
    const { prop, value } = option;
    hooks[prop] = useState(value);
  });
  const onPropChange = (prop, newValue) => {
    options.find(item => item.prop === prop).value = newValue;
    setModelRequestOptions(model, options);
    const [_, setState] = hooks[prop];
    setState(newValue);
  };

  options.forEach(option => {
    option.value = hooks[option.prop][0];
  });

  const onApplyToAll = () => {
    setAllModelRequestOptions(options);
    options.forEach(option => {
      const { prop, value } = option;
      hooks[prop][1](value);
    });
  }

  return { options, onPropChange, onApplyToAll };
}