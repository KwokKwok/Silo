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
  EXPERIENCE_SK: _EXPERIENCE_SK == '0' ? '' : _EXPERIENCE_SK,
  PAID_SK: (import.meta.env.SILO_PAID_SK || '').trim(),
  AFF_LINK: (import.meta.env.SILO_AFF_LINK || 'https://cloud.siliconflow.cn/i/Vry8ZUHq').trim(),
  DEFAULT_ACTIVE_CHAT_MODELS: modelStrToIds(import.meta.env.SILO_DEFAULT_ACTIVE_CHAT_MODELS, ["Qwen/Qwen2.5-7B-Instruct", "THUDM/glm-4-9b-chat", "01-ai/Yi-1.5-9B-Chat-16K"]),
  DEFAULT_ACTIVE_IMAGE_MODELS: modelStrToIds(import.meta.env.SILO_DEFAULT_ACTIVE_IMAGE_MODELS, ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-medium']),
};


console.log(SILO_ENV, import.meta.env);
