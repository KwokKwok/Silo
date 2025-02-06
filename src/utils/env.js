function modelStrToIds (str, defaultValue) {
  try {
    const models = str.split(',').map(item => item.trim()).filter(item => item) || []
    return models.length ? models : defaultValue
  } catch (error) {
    return defaultValue
  }
}

// 0 表示不提供该方式，直接置空
const _EXPERIENCE_SK = (import.meta.env.SILO_EXPERIENCE_SK || '').trim();

export const SILO_ENV = {
  IS_PAID_SK_ENCRYPTED: import.meta.env.SILO_IS_PAID_SK_ENCRYPTED === 'true',
  EXPERIENCE_SK: _EXPERIENCE_SK == '0' ? '' : _EXPERIENCE_SK,
  PAID_SK: (import.meta.env.SILO_PAID_SK || import.meta.env.VITE_PAID_SK || '').trim(),
  AFF_LINK: (import.meta.env.SILO_AFF_LINK || 'https://cloud.siliconflow.cn/i/Vry8ZUHq').trim(),
  DEFAULT_ACTIVE_CHAT_MODELS: modelStrToIds(import.meta.env.SILO_DEFAULT_ACTIVE_CHAT_MODELS, ["deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", "Qwen/Qwen2.5-7B-Instruct", "Pro/Qwen/Qwen2-VL-7B-Instruct"]),
  DEFAULT_ACTIVE_IMAGE_MODELS: modelStrToIds(import.meta.env.SILO_DEFAULT_ACTIVE_IMAGE_MODELS, ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-medium']),
  DEFAULT_WEB_COPILOT_ACTIVE_MODELS: modelStrToIds(import.meta.env.SILO_DEFAULT_WEB_COPILOT_ACTIVE_MODELS, ['Qwen/Qwen2.5-7B-Instruct']),
};
