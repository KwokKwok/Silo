const resources = [
  {
    _key: 'title',
    en: 'Silo - Multi-model chat, text-to-image',
    zh: 'Silo - 多模型对话，文生图',
  },
  {
    en: 'This place is so quiet',
    zh: '这地方真安静'
  },
  {
    zh: '您正在使用体验密钥',
    en: 'You are using an experience key'
  },
  {
    zh: '体验密钥因为多人使用可能会触发限速，建议您及时更换为自己的密钥',
    en: 'The experience key may trigger speed limits due to multiple use, it is recommended that you timely replace it with your own key.'
  },
  {
    zh: '新增模型',
    en: 'Add model'
  },
  {
    zh: '切换对话模式',
    en: 'Switch to chat mode'
  },
  {
    zh: '切换文生图模式',
    en: 'Switch to image mode'
  },
  {
    zh: '多列模式',
    en: 'Multi-column mode'
  },
  {
    zh: '双行模式',
    en: 'Dual-line mode'
  },
  {
    zh: '退出禅模式',
    en: 'Exit Zen mode'
  },
  {
    zh: '禅模式',
    en: 'Zen mode'
  },
  {
    zh: '恢复默认布局',
    en: 'Restore default layout'
  },
  {
    zh: '修改密钥',
    en: 'Modify key'
  },
  {
    zh: '自定义模型',
    en: 'Add custom model'
  },
  {
    zh: '联系开发者',
    en: 'Contact Developer'
  },
  {
    zh: 'Chrome 扩展',
    en: 'Chrome Extension'
  },
  {
    zh: '需实名',
    en: 'Auth required'
  },
  {
    zh: '详情',
    en: 'Details'
  },
  {
    zh: '清空',
    en: 'Clear'
  },
  {
    zh: '关闭',
    en: 'Close'
  },
  {
    zh: '应用到全部',
    en: 'Apply to all'
  },
  {
    zh: '复制',
    en: 'Copy'
  },
  {
    zh: '删除',
    en: 'Delete'
  },
  {
    zh: '编辑',
    en: 'Edit'
  },
  {
    zh: '新增系统提示词',
    en: 'Add system prompt'
  },
  {
    zh: '编辑系统提示词',
    en: 'Edit system prompt'
  },
  {
    zh: '无',
    en: 'None'
  },
  {
    zh: '名称',
    en: 'Name'
  },
  {
    zh: '图标',
    en: 'Icon'
  },
  {
    zh: '描述',
    en: 'Description'
  },
  {
    zh: '内容',
    en: 'Content'
  },
  {
    _key: 'avatar-help',
    zh: '默认使用 Vercel Avatar 服务，{随机背景}.svg?text={文本}，文字前添加空格可调整间距。当然，你也可以直接使用图标地址，比如你可以使用本站的文生图生成一个图标，然后使用它的地址',
    en: 'Default to using the Vercel Avatar service, {random background}.svg?text={text}, adding a space before the text can adjust the spacing. Of course, you can also directly use the icon URL. For example, you can generate an icon using the text-to-image feature on this site and use its URL.'
  },
  {
    zh: '确定清空所有对话吗？',
    en: 'Are you sure to clear all conversations?'
  },
  {
    zh: '在这里输入 SiliconCloud API 密钥',
    en: 'Enter SiliconCloud API key here'
  },
  {
    _key: 'intro1',
    zh: '本站主要基于 SiliconCloud API 来提供开箱即用的多模型对话和文生图能力，需要您先注册一个 SiliconCloud 账号',
    en: 'This site provides multi-model chat and text-to-image capabilities mainly based on SiliconCloud API, you need to register a SiliconCloud account first'
  },
  {
    zh: '您的密钥将仅在浏览器中存储，请仅在安全的设备上使用本应用',
    en: 'Your key will only be stored in the browser, please use this app only on a secure device'
  },
  {
    zh: '先不注册，用用你的',
    en: "Don't register yet, let me use your"
  },
  {
    zh: '现在注册 SiliconCloud',
    en: 'Now register for SiliconCloud, '
  },
  {
    zh: '官方也会赠送 14 元额度可用于体验付费模型',
    en: 'and the official will also gift a 14 yuan credit for experiencing the paid model.'
  },
  {
    zh: '如您已有账号，请',
    en: 'If you already have an account, please'
  },
  {
    zh: '点击这里获取 SiliconCloud 密钥',
    en: 'click here to get the SiliconCloud key'
  },
  {
    zh: '您可以通过邮箱或是微信直接联系开发者',
    en: 'You can contact the developer directly via email or WeChat'
  },
  {
    zh: '发邮件',
    en: 'Send email'
  },
  {
    zh: '使用微信',
    en: 'Use WeChat'
  },
  {
    zh: '已复制',
    en: 'Copied'
  },
  {
    zh: '必填',
    en: 'Required'
  },
  {
    zh: 'ID格式错误，请检查是否符合: {manufacturer}/{model-name}，多个需用英文逗号隔开',
    en: 'ID format error, please check if it conforms to: {manufacturer}/{model-name}, multiple need to be separated by English commas'
  },
  {
    zh: '自定义模型调整后，会自动重载页面，请确保页面数据无需处理',
    en: 'After custom model adjustment, the page will be automatically reloaded. Please ensure that the page data does not need to be processed'
  },
  {
    zh: '模型ID',
    en: 'Model ID'
  },
  {
    zh: '格式：{manufacturer}/{model-name}，多个可用英文逗号隔开',
    en: 'Format: {manufacturer}/{model-name}, multiple can be separated by English commas'
  },
  {
    zh: '修改已添加的模型，或是选择预设导入',
    en: 'Modify the added model, or select a preset to import'
  },
  {
    zh: '移除',
    en: 'Remove'
  },
  {
    zh: '不支持的类型：',
    en: 'Unsupported type:'
  },
  {
    zh: '模型名字',
    en: 'Name'
  },
  {
    zh: '方便查看用',
    en: 'For easy viewing'
  },
  {
    zh: '请求地址',
    en: 'Base URL'
  },
  {
    zh: '不需要 `/chat/completions`',
    en: 'Does not require `/chat/completions`'
  },
  {
    zh: '密钥',
    en: 'Secret key'
  },
  {
    zh: '选择',
    en: 'Select'
  },
  {
    zh: '解析函数',
    en: 'Resolver'
  },
  {
    zh: '浏览器扩展暂不支持自定义解析函数',
    en: 'Custom resolver is not supported in browser extensions'
  },
  {
    zh: '建议调试好后复制过来，这里就不再做编辑器了',
    en: 'It is recommended to copy the debugged function here, no editor will be provided here'
  },
  {
    zh: '模型图标',
    en: 'Model Icon'
  },
  {
    zh: '厂商 Icon，可不填。建议从 HuggingFace 获取',
    en: 'Manufacturer Icon, optional. It is recommended to get it from HuggingFace'
  },
  {
    zh: '上下文长度',
    en: 'Context Length'
  },
  {
    zh: '价格',
    en: 'Price'
  },
  {
    zh: '详情地址',
    en: 'Details Link'
  },
  {
    zh: '比如 HuggingFace 的模型地址',
    en: 'For example, the model url on HuggingFace'
  },
  {
    zh: 'ID解析函数',
    en: 'ID Resolver'
  },
  {
    _key: 'id-resolver-help',
    zh: "默认会将模型ID去除 manufacturer 部分，然后传给调用函数。比如 `deepseek-ai/deepseek-coder` 会解析为 `deepseek-coder`。您也可以自定义 ID 解析函数。比如，如需原样传递给接口，这里可以填：`modelId => modelId`",
    en: "By default, the manufacturer part of the model ID will be removed and passed to the calling function. For example, `deepseek-ai/deepseek-coder` will be parsed as `deepseek-coder`. You can also customize the ID parsing function. For example, if you want to pass it directly to the interface, here can be filled in: `modelId => modelId`"
  },
  {
    zh: 'API 版本',
    en: 'API Version'
  },
  {
    zh: '调整模型或参数',
    en: 'Adjust Model or Parameters'
  },
  {
    zh: '开始生成',
    en: 'Start Generation'
  },
  {
    zh: '翻译为英文',
    en: 'Translate to English'
  },
  {
    zh: '生成优化版 Prompt',
    en: 'Generate Optimized Prompt'
  },
  {
    zh: '配置',
    en: 'Settings'
  },
  {
    zh: '不同模型支持的参数或有效区间可能存在不同，将尽可能将当前配置应用到其他的模型',
    en: 'Different models may support different parameters or valid ranges, and will try to apply the current configuration to other models as much as possible'
  },
  {
    zh: '确定',
    en: 'Confirm'
  },
  {
    zh: '返回',
    en: 'Back'
  },
  {
    zh: '正在生成...',
    en: 'Generating...'
  },
  {
    zh: '生成失败',
    en: 'Generation failed'
  },
  {
    zh: '点击预览',
    en: 'Click to preview'
  },
  {
    zh: '调整配置',
    en: 'Adjust Settings'
  },
  {
    zh: '图像尺寸',
    en: 'Image Size'
  },
  {
    zh: '生成图像数量',
    en: 'Counts'
  },
  {
    zh: '指导比例',
    en: 'Guidance Scale'
  },
  {
    zh: '推理步骤',
    en: 'Inference Steps'
  },
  {
    zh: '不同模型支持的参数或有效区间可能存在不同，将尽可能将当前配置应用到其他的模型',
    en: 'Different models may support different parameters or valid ranges, and will try to apply the current configuration to other models as much as possible'
  },
  {
    zh: '生成图像的宽度和高度（像素）',
    en: 'Width and Height of Generated Images (pixels)'
  },
  {
    zh: '生成图像的迭代次数。更多步骤通常会产生更好的结果，但需要更长的处理时间',
    en: 'Number of iterations for image generation. More steps usually produce better results but require longer processing time'
  },
  {
    zh: '一次生成的图像数量',
    en: 'Number of Images Generated at Once'
  },
  {
    zh: '控制生成图像与提示的相似程度。较高的值会产生更接近提示的图像，但可能降低整体质量',
    en: 'Control the similarity of the generated image to the prompt. Higher values produce images closer to the prompt but may reduce overall quality'
  },
  {
    zh: '生成的最大 token 数',
    en: 'Maximum number of tokens that can be generated'
  },
  {
    zh: '确定响应的随机程度，较高的值意味着更多的随机性',
    en: 'Determine the randomness of the response, higher values mean more randomness'
  },
  {
    zh: '类似 Temperature 的另一种采样方式。例如 0.1 意味着仅考虑概率质量最高的 10% 的 tokens。不建议同时修改 Temperature 和 Top P',
    en: 'Another sampling method similar to Temperature. For example, 0.1 means only considering the top 10% of tokens with the highest probability mass. It is not recommended to modify Temperature and Top P simultaneously'
  },
  {
    zh: '影响模型重复使用相同单词或短语的可能性，较高的数值意味着越不鼓励重复，0 表示对模型的行为没有影响',
    en: 'Affects the likelihood of the model repeating the same words or phrases, higher values mean less encouragement of repetition, 0 means no impact on the model\'s behavior'
  },
  {
    zh: '选择语言',
    en: 'Languages'
  },
  {
    zh: '更多',
    en: 'More'
  },
  {
    zh: '已由 AI 票选为最佳回复',
    en: 'AI voted as the best reply'
  },
  {
    zh: '该问题的响应将由 AI 进行评估',
    en: 'The response to this question will be evaluated by AI'
  },
  {
    zh: '为了长久的提供基础服务，体验密钥暂不支持该模型，请见谅',
    en: 'To ensure long-term provision of basic services, the experience key does not currently support this model. We appreciate your understanding.'
  },
  {
    _key: 'zenModeTip',
    zh: '鼠标移至页面顶部或按下 Esc 键退出禅模式',
    en: 'Move the mouse to the top of the page or press the Esc key to exit Zen Mode'
  },
  {
    zh: '不再提示',
    en: 'Okay'
  },
  {
    zh: '体验密钥不适用于付费模型。且可能因为其公开性而被人滥用而进一步被停用',
    en: 'The experience key is not applicable to the paid model. It may also be further disabled due to the risk of abuse arising from its public nature.'
  }
]

const i18nFormatted = ['zh', 'en'].reduce((result, lang) => {
  const langObj = {
    translation: resources.reduce((acc, item) => ({
      ...acc,
      [item._key || item.zh]: item[lang]
    }), {})
  }

  result[lang] = langObj
  return result
}, {})

export default i18nFormatted;