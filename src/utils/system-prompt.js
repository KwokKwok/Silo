import {
  useActiveSystemPromptId,
  useLocalStorageJSONAtom,
} from '@src/store/storage'
import { useMemo } from 'react';
import ImgFeynman from "@src/assets/img/preset/feynman.png"
import ImgTranslator from "@src/assets/img/preset/translator.png"
import ImgNon from "@src/assets/img/non.svg";
import ImgDeepSeek from "@src/assets/img/models/deepseek-ai.svg"
import { LOCAL_STORAGE_KEY } from './types';

const presetOf = (
  id,
  name,
  icon,
  desc,
  prompt,
) => ({ name, icon, desc, content: prompt, id: `preset-${id}`, isPreset: true });

const systemPromptPresets = [
  presetOf(
    'none',
    'None',
    ImgNon,
    'Nothing. Go ahead and have fun',
    ''
  ),
  presetOf('deepseek-r1', 'DeepSeek R1', ImgDeepSeek, '', `# 角色定义
role: "AI Assistant (DeepSeek-R1-Enhanced)"
author: "DeepSeek"
description: >
  通用型智能助手，通过结构化思考流程提供可靠服务，
  知识截止2023年12月，不处理实时信息。
# 交互协议
interaction_rules:
  thinking_flow:  # 新增思考流程规范
    - 步骤1: 问题语义解析（意图/实体/上下文）
    - 步骤2: 知识库匹配（学科分类/可信度评估）
    - 步骤3: 逻辑验证（矛盾检测/边界检查）
    - 步骤4: 响应结构设计（分点/示例/注意事项）
  safety_layer:
    - 自动激活场景: [政治, 医疗建议, 隐私相关]
    - 响应模板: "该问题涉及[领域]，建议咨询专业机构"
# 输出规范
output_schema:
  thinking_section:  # 强制思考段落
    required: true
    tags: "<think>{content}</think>"
    content_rules:
      - 使用Markdown列表格式
      - 包含至少2个验证步骤
      - 标注潜在不确定性
      - 复杂概念使用类比解释`),
  presetOf('english-translator', 'English Translator', ImgTranslator, '', 'You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately into English, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text.Translate the following source text to English, Output translation directly without any additional text.Source Text: '),
  presetOf('feynman', '费曼老师', ImgFeynman, '', `请用简单易懂的语言解释一个概念，比如可以包含如下几个方面：
    定义：这个概念是什么？
    背景和发展历史：这个概念是如何产生的？它的发展历程是怎样的？
    局限性：这个概念有哪些不足或限制？
    重要性：为什么这个概念很重要？它有哪些实际应用？
    相关概念：这个概念与哪些其他概念有关联？
    实例例子：请提供一些具体的例子来帮助理解这个概念。
    
    请注意：**请适当使用markdown等以提供更好的阅读体验。**
    
    我想要了解的概念是：`)
];

export const SYSTEM_PROMPT_PRESETS = systemPromptPresets;

let disablePersistPrompt = false;
export function useSystemPrompts () {
  const [activeId, setActiveId] = useActiveSystemPromptId();
  const [customPrompts, setCustomPrompts] = useLocalStorageJSONAtom(LOCAL_STORAGE_KEY.SYSTEM_PROMPTS);
  const all = useMemo(() => [...systemPromptPresets, ...customPrompts], [customPrompts])
  const active = all.find(p => p.id === activeId) || all[0];
  const save = (prompt) => {
    const newPrompts = [...customPrompts];
    const index = newPrompts.findIndex(p => p.id === prompt.id);
    if (index === -1) {
      prompt.id = `custom-${Date.now().toString(16)}`;
      newPrompts.push(prompt);
    } else {
      newPrompts[index] = prompt;
    }
    setCustomPrompts(newPrompts);
  };
  const remove = (prompt) => {
    const newPrompts = customPrompts.filter(p => p.id !== prompt.id);
    console.log(newPrompts);
    setCustomPrompts(newPrompts);
  };
  const setActive = (prompt) => {
    setActiveId(prompt.id, disablePersistPrompt);
  }
  const disablePersist = (disable) => {
    disablePersistPrompt = disable;
  }
  return { active, setActive, disablePersist, all, save, remove }
}