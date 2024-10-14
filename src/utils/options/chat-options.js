import { debounce } from "lodash-es";
import { LOCAL_STORAGE_KEY } from "../types";
import { useState } from "react";
import { getJsonDataFromLocalStorage, setJsonDataToLocalStorage } from "../helpers";
import { getAllTextModels } from "../models";

//#region 工具类
const optionOf = (name, prop, tooltip, min, max, defaultValue) => ({
  name,
  prop,
  tooltip,
  min,
  max,
  step: ['n', 'max_tokens'].includes(prop) ? 1 : 0.1,
  defaultValue,
  value: defaultValue,
});
function getDefaultChatOptions () {
  return [
    optionOf(
      'Max Tokens',
      'max_tokens',
      '生成的最大 token 数',
      50,
      4096,
      4096
    ),
    optionOf(
      'Temperature',
      'temperature',
      '确定响应的随机程度，较高的值意味着更多的随机性',
      0,
      2,
      1
    ),
    optionOf(
      'Top P',
      'top_p',
      '类似 Temperature 的另一种采样方式。例如 0.1 意味着仅考虑概率质量最高的 10% 的 tokens。不建议同时修改 Temperature 和 Top P',
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
      '影响模型重复使用相同单词或短语的可能性，较高的数值意味着越不鼓励重复，0 表示对模型的行为没有影响',
      -2,
      2,
      0
    ),
    // optionOf('N', 'n', 'Number of generations to return', 1, 100, 1),
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
export function getChatRequestOptions (model) {
  // 后续可能会加参数，当前用户的参数可能是不全的，需要以默认参数补全
  const userOptions = _optionObjMap[model] || {};
  return Object.assign({}, _defaultChatOptions, userOptions);
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