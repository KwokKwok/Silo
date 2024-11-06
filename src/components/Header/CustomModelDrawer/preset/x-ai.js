import { openAiCompatibleChat } from '@src/utils/utils';

export default function xAiChat ({ apiKey }, ...args) {
  return openAiCompatibleChat('https://api.x.ai/v1', apiKey, null, ...args)
}