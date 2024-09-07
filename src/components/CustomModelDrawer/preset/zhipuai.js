import { openAiCompatibleChat } from "../../../utils/utils"

export default function zhipuaiChat ({ apiKey }, ...args) {
  return openAiCompatibleChat('https://open.bigmodel.cn/api/paas/v4/', apiKey, null, ...args)
}