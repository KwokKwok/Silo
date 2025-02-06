import { ERROR_PREFIX } from '@src/utils/types';
import 'katex/dist/katex.min.css';
import '@src/assets/styles/markdown.scss';
import { useDarkMode } from '@src/utils/use';
import { getModelThoughts, useSingleChat } from '@src/utils/chat';
import { getModelIcon } from '@src/utils/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MarkdownRenderer from '@src/components/MarkdownRenderer';
import CopyToClipboard from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import { Collapse } from 'tdesign-react';
import './index.scss';

export default function AiMessage({
  chatId,
  model,
  content,
  isLast,
  mobile = false,
  plain = false,
  evaluate = {},
  info = {},
}) {
  const { t, i18n } = useTranslation();
  const [isDark] = useDarkMode();
  const { loading } = useSingleChat(model);

  const {
    total_tokens: tokenUsage,
    completion_tokens: completionTokens,
    prompt_tokens: promptTokens,
  } = info.usage || {};
  const formattedInfo = useMemo(
    () => (
      <>
        {tokenUsage && (
          <span className="inline-flex items-center mr-1">
            {tokenUsage} tokens used (
            <i className="iconify mingcute--arrow-up-line" />
            {promptTokens},
            <i className="iconify mingcute--arrow-down-line ml-2" />
            {completionTokens}) ,
          </span>
        )}
        {info?.costTime && <span>{info.costTime / 1000} s</span>}
      </>
    ),
    [tokenUsage, promptTokens, completionTokens, info.costTime]
  );

  /**
   * @deprecated 暂时不显示最佳答案文案，仅显示点赞
   */
  const isBest = (evaluate?.best || []).some(item => item.model === model);

  const thought = getModelThoughts(chatId, model);

  const likes = (evaluate?.results || [])
    .map(item => (item.winners.includes(model) ? item.judge : ''))
    .filter(Boolean);

  return useMemo(
    () =>
      content.startsWith(ERROR_PREFIX) ? (
        <span className="w-full text-center dark:text-red-300 text-red-700 mb-2">
          {t(content.replace(ERROR_PREFIX, ''))}
        </span>
      ) : (
        <div
          className={
            'group relative flex-shrink-0 max-w-full leading-6 mb-2  ' +
            (plain
              ? ''
              : mobile
              ? 'pl-2 pr-2 py-2 dark:bg-teal-900 bg-slate-200 rounded-r-2xl rounded-l'
              : 'pl-2 pr-4 py-2 dark:bg-teal-900 bg-slate-200 rounded-r-lg rounded-l-md')
          }
        >
          {mobile && (
            <span className="text-xs mb-2 flex items-center text-gray-500 dark:text-gray-400">
              <img
                src={getModelIcon(model)}
                alt=""
                className="w-3 h-3 mr-1 rounded-sm"
              />{' '}
              {model}
            </span>
          )}
          {!!thought && (
            <Collapse
              borderless
              defaultExpandAll
              expandIconPlacement="right"
              className="overflow-hidden !bg-transparent"
            >
              <Collapse.Panel
                className="thinking-section"
                header={
                  <span className="flex items-center">
                    <i className="iconify ri--brain-line mr-1"></i>
                    {loading && !content
                      ? t('common.thinking')
                      : t('common.think_end')}
                  </span>
                }
              >
                <MarkdownRenderer
                  content={thought}
                  loading={isLast && loading && !content}
                />
              </Collapse.Panel>
            </Collapse>
          )}
          <MarkdownRenderer
            content={content}
            loading={isLast && loading && (!thought || content)}
          />
          {likes.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <div className="flex items-center border border-primary rounded-[12px] overflow-hidden h-6 box-border pl-6 pr-2 relative ">
                <div className="absolute -left-[1px] flex items-center justify-center h-6 w-6 rounded-[12px] bg-primary ">
                  <i className="iconify mingcute--thumb-up-2-fill text-white" />
                </div>
                {likes.map(item => (
                  <img
                    alt={item}
                    key={item}
                    title={item}
                    className="ml-2 w-4 h-4 rounded-sm"
                    src={getModelIcon(item)}
                  />
                ))}
              </div>
            </div>
          )}
          {!loading && (
            <div
              className={
                `absolute right-2 flex text-sm items-center justify-end cursor-pointer z-20 ` +
                (plain ? 'bottom-0 ' : 'bottom-2')
              }
            >
              <CopyToClipboard
                text={content.trim()}
                onCopy={() => message.success(t('common.copied'))}
              >
                <i className="opacity-0 group-hover:opacity-60 transition-opacity duration-300 text-base  i-ri-file-copy-line cursor-pointer"></i>
              </CopyToClipboard>
            </div>
          )}
          {formattedInfo && (
            <div className="mt-1 text-xs opacity-25">{formattedInfo}</div>
          )}
        </div>
      ),
    [
      thought,
      content,
      loading,
      likes.length,
      isDark,
      i18n.language,
      formattedInfo,
    ]
  );
}
