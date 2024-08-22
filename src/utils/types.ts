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

export enum LOCAL_STORAGE_KEY {
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
}
