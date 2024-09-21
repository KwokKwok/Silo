import {
  useActiveSystemPromptId,
  useCustomSystemPrompts,
} from '@src/store/storage'
import { useMemo } from 'react';

import ImgNon from "@src/assets/img/non.svg";

const presetOf = (
  name,
  icon,
  desc,
  prompt,
) => ({ name, icon, desc, content: prompt, id: `preset-${name}`, isPreset: true });

const systemPromptPresets = [
  presetOf(
    '无',
    ImgNon,
    'Nothing. Go ahead and have fun',
    ''
  ),
  presetOf('小红书助手', 'https://avatar.vercel.sh/7lvegw8mhol056y0fm14jsa.svg?text=小红书', '以小红书博主的文章结构，以我给出的主题写一篇帖子推荐。', '你的任务是以小红书博主的文章结构，以我给出的主题写一篇帖子推荐。你的回答应包括使用表情符号来增加趣味和互动，以及与每个段落相匹配的图片。请以一个引人入胜的介绍开始，为你的推荐设置基调。然后，提供至少三个与主题相关的段落，突出它们的独特特点和吸引力。在你的写作中使用表情符号，使它更加引人入胜和有趣。对于每个段落，请提供一个与描述内容相匹配的图片。这些图片应该视觉上吸引人，并帮助你的描述更加生动形象。我给出的主题是：'),
  presetOf('费曼老师', 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/outputs/deeab01e-60eb-4e90-b421-e9937876c0d2_00001_.png', '', `请用简单易懂的语言解释一个概念，比如可以包含如下几个方面：
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

export function useSystemPrompts () {
  const [activeId, setActiveId] = useActiveSystemPromptId();
  const [customPrompts, setCustomPrompts] = useCustomSystemPrompts();
  const all = useMemo(() => [...systemPromptPresets, ...customPrompts], [customPrompts])
  const active = all.find(p => p.id === activeId) || all[0];
  const save = (prompt) => {
    const newPrompts = [...customPrompts];
    const index = newPrompts.findIndex(p => p.id === prompt.id);
    if (index === -1) {
      prompt.id = `custom-${Date.now()}`;
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
    setActiveId(prompt.id);
  }
  return { active, setActive, all, save, remove }
}