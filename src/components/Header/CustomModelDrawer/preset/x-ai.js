import { openAiCompatibleChat } from '@src/utils/utils';

export default function xAiChat ({ baseUrl, apiKey }, ...args) {
  return openAiCompatibleChat(baseUrl, apiKey, null, ...args)
}
