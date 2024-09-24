import { getJsonDataFromLocalStorage } from "../helpers";
import { LOCAL_STORAGE_KEY } from "../types";
import { setJsonDataToLocalStorage } from "../helpers";
import { useRefresh } from "../use"

const inputNumberOptionOf = (
  prop,
  label,
  tooltip,
  defaultValue,
  step = 1,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER
) => {
  return {
    prop,
    tooltip,
    label,
    type: 'input_number',
    step,
    defaultValue,
    max,
    min,
  };
};

const imageSizeOf = options => ({
  prop: 'image_size',
  type: 'rect_select',
  tooltip: '生成图像的宽度和高度（像素）',
  label: '图像尺寸',
  options,
  defaultValue: options[0].value
});

const fluxOf = id => {
  return {
    id,
    options: [
      imageSizeOf([
        {
          x: 1,
          y: 1,
          value: '1024x1024',
        },
        {
          x: 1,
          y: 2,
          value: '512x1024',
        },
        {
          x: 3,
          y: 2,
          value: '768x512',
        },
        {
          x: 3,
          y: 4,
          value: '768x1024',
        },
        {
          x: 16,
          y: 9,
          value: '1024x576',
        },
        {
          x: 9,
          y: 16,
          value: '576x1024',
        },
      ]),
      inputNumberOptionOf(
        'num_inference_steps',
        '推理步骤',
        '生成图像的迭代次数。更多步骤通常会产生更好的结果，但需要更长的处理时间',
        20,
        1,
        1,
        50
      )
    ],
  };
};

const sdOf = (id, smaller = false, maxInferenceStep = 50) => {
  const options = smaller ? [
    {
      x: 1,
      y: 1,
      value: '512x512',
    },
    {
      x: 1,
      y: 2,
      value: '512x1024',
    },
    {
      x: 3,
      y: 2,
      value: '768x512',
    },
    {
      x: 3,
      y: 4,
      value: '768x1024',
    },
    {
      x: 16,
      y: 9,
      value: '1024x576',
    },
    {
      x: 9,
      y: 16,
      value: '576x1024',
    },
  ] : [
    {
      x: 1,
      y: 1,
      value: '1024x1024',
    },
    {
      x: 1,
      y: 2,
      value: '1024x2048',
    },
    {
      x: 3,
      y: 2,
      value: '1536x1024',
    },
    {
      x: 3,
      y: 4,
      value: '1536x2048',
    },
    {
      x: 16,
      y: 9,
      value: '2048x1152',
    },
    {
      x: 9,
      y: 16,
      value: '1152x2048',
    },
  ]

  const inferenceStepOption = inputNumberOptionOf(
    'num_inference_steps',
    '推理步骤',
    '生成图像的迭代次数。更多步骤通常会产生更好的结果，但需要更长的处理时间',
    Math.min(20, maxInferenceStep),
    1,
    1,
    maxInferenceStep
  )
  return {
    id,
    options: [
      imageSizeOf(options),
      inputNumberOptionOf(
        'batch_size',
        '生成图像数量',
        '一次生成的图像数量',
        1,
        1,
        1,
        4
      ),
      inputNumberOptionOf(
        'guidance_scale',
        '指导比例',
        '控制生成图像与提示的相似程度。较高的值会产生更接近提示的图像，但可能降低整体质量',
        1,
        0.1,
        0,
        2
      ),
      inferenceStepOption
    ],
  };
};

const IMAGE_MODEL_OPTIONS = [
  fluxOf('black-forest-labs/FLUX.1-dev'),
  fluxOf('black-forest-labs/FLUX.1-schnell'),
  fluxOf('Pro/black-forest-labs/FLUX.1-schnell'),
  sdOf("stabilityai/stable-diffusion-3-medium"),
  sdOf("stabilityai/stable-diffusion-xl-base-1.0"),
  sdOf("stabilityai/stable-diffusion-2-1", true),
  sdOf("stabilityai/sd-turbo", true, 10),
  sdOf("stabilityai/sdxl-turbo", true, 10),
  sdOf("ByteDance/SDXL-Lightning", false, 4),
];

const _savedOptions = getJsonDataFromLocalStorage(LOCAL_STORAGE_KEY.IMAGE_MODEL_OPTIONS, {});

function loadOptions () {
  // 合并保存的选项和默认选项
  const mergedOptions = IMAGE_MODEL_OPTIONS.reduce((result, curDefaultOption) => {
    const savedOption = _savedOptions[curDefaultOption.id] || {};
    const savedOptionKeys = Object.keys(savedOption);
    const optionData = curDefaultOption.options.reduce((data, curOptionItem) => {
      const { prop, defaultValue } = curOptionItem
      data[prop] = savedOptionKeys.includes(prop) ? savedOption[prop] : defaultValue;
      return data
    }, {})
    result[curDefaultOption.id] = optionData
    return result;
  }, {});
  return mergedOptions;
}

const _finalOptions = loadOptions();

function _applyToAll (options, configItems) {
  Object.keys(options).forEach(prop => {
    if (prop === 'image_size') {
      // 找到图片尺寸对应的选项，来获取 x、y
      const { x, y } = configItems.find(item => item.prop === 'image_size').options.find(item => item.value === options[prop]);
      Object.keys(_finalOptions).forEach(modelId => {
        const modelOptions = _finalOptions[modelId];
        const availableSizes = IMAGE_MODEL_OPTIONS.find(item => item.id === modelId)?.options.find(option => option.prop === 'image_size')?.options;
        if (availableSizes) {
          const targetSize = availableSizes.find(item => item.x == x && item.y == y);
          if (targetSize) {
            modelOptions[prop] = targetSize.value;
          }
        }
      });
    } else {
      // 对于需要应用参数的配置项，检查并调整值以确保在有效范围内
      const configItem = configItems.find(item => item.prop === prop);
      if (configItem && (configItem.type === 'input_number' || configItem.type === 'slider')) {
        const { min, max } = configItem;
        console.log(min, max, options[prop]);
        const adjustedValue = Math.max(min, Math.min(max, options[prop]));
        // 不修改 options 的值，而是使用调整后的值
        Object.keys(_finalOptions).forEach(modelId => {
          const modelConfigItem = IMAGE_MODEL_OPTIONS.find(item => item.id === modelId)?.options.find(item => item.prop === prop);
          if (_finalOptions[modelId].hasOwnProperty(prop) && modelConfigItem) {
            const modelMin = modelConfigItem.min || min;
            const modelMax = modelConfigItem.max || max;
            _finalOptions[modelId][prop] = Math.max(modelMin, Math.min(modelMax, adjustedValue));
          }
        });
      } else {
        // 对于非 input_number 类型，直接应用值
        Object.keys(_finalOptions).forEach(modelId => {
          if (_finalOptions[modelId].hasOwnProperty(prop)) {
            _finalOptions[modelId][prop] = options[prop];
          }
        });
      }
    }
  });
  setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.IMAGE_MODEL_OPTIONS, _finalOptions);
}

export function useImageModelOptions (modelId) {
  const refreshController = useRefresh()
  const options = _finalOptions[modelId];
  const configItems = IMAGE_MODEL_OPTIONS.find(item => item.id === modelId)?.options;
  const setOption = (prop, value) => {
    options[prop] = value;
    setJsonDataToLocalStorage(LOCAL_STORAGE_KEY.IMAGE_MODEL_OPTIONS, _finalOptions);
    refreshController.refresh();
  };
  const applyToAll = () => {
    _applyToAll(options, configItems);
    // 不需要刷新，因为改的是其他的界面
  }

  return { options, setOption, configItems, applyToAll };
}


export function getImageGenerateOptions () {
  return _finalOptions;
}