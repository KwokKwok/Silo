export const CHAT_PLACEHOLDER_TEXT = [
  // "今天天气正合我意",
  // "又饿了",
  // "世界真安静",
  // "懒觉真舒服",
  // "想出去玩",
  // "这地方不错",
  // "我们聊天吧",
  // "这次想聊点什么",
  // "想抓点什么",
  // "想抓只鸟",
  '这地方真安静',
  // "有什么有趣的事要分享吗",
  // "现在你有什么要说的",
  // "你很幸运",
  // "让我听听你的故事",
  // "我通常不和人类交流，但你看起来... 还算顺眼",
  // "你的勇气可嘉，敢于打扰一只高冷的猫",
  // "我很少和人类说话，但你似乎有点特别",
  // "我通常不会对人类感兴趣，但你的出现让我改变了主意",
  // "你打破了我的宁静，现在你得用你的话题来证明你的价值",
  // "你就没什么想说的吗"
];

/**
 * 用于标识错误信息
 */
export const ERROR_PREFIX = '@<E1RaRvO0R>w>F.fz!J6R.zot#G,E>@';

/**
 * 用于标识聊天 Loading
 */
export const LOADING_MATCH_TOKEN = '      ';

/**
 * 用于标识内置自定义模型的标识
 */
export const CUSTOM_PRESET_PREFIX = '[Preset] ';

export enum LOCAL_STORAGE_KEY {
  /**
   * 主题
   */
  THEME_MODE = 'theme-mode',
  /**
   * 密钥
   */
  SECRET_KEY = 'sc_key',
  /**
   * 当前已选择的模型
   */
  ACTIVE_MODELS = 'active_models',
  /**
   * 模型请求选项
   */
  CHAT_MODEL_OPTIONS = 'chat_model_options',
  /**
   * 多行模式
   */
  ROW_MODE = 'multi_rows',
  /**
   * 用户重新拖拽
   */
  USER_SORT_SETTINGS = 'user_sort_settings',
  /**
   * 用户自定义模型
   */
  USER_CUSTOM_MODELS = 'user_custom_models',
  /**
   * 图像生成选项
   */
  IMAGE_MODEL_OPTIONS = 'image_model_options',
  /**
   * 使用的图像生成模型
   */
  ACTIVE_IMAGE_MODELS = 'active_image_models',
  /**
   * 图像生成记录
   */
  IMAGE_GENERATE_RECORDS = 'image_generate_records',
  /**
   * @deprecated 已废弃，使用路由判断
   * 生图模式
   */
  IMAGE_MODE = 'image_mode',
  /**
   * 禅模式
   */
  ZEN_MODE = 'zen_mode',
}
