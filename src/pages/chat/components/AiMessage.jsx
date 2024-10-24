import { ERROR_PREFIX } from '@src/utils/types';
import 'katex/dist/katex.min.css';
import '@src/assets/styles/markdown.scss';
import { useDarkMode } from '@src/utils/use';
import { useSingleChat } from '@src/utils/chat';
import { getModelIcon } from '@src/utils/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MarkdownRenderer from '@src/components/MarkdownRenderer';

export default function AiMessage({
  model,
  content,
  isLast,
  showModelName = false,
  plain = false,
  evaluate = {},
  info = {},
}) {
  const { t, i18n } = useTranslation();
  const [isDark] = useDarkMode();
  const { loading } = useSingleChat(model);

  const tokenUsage = info.usage?.total_tokens || 0;
  const formattedInfo =
    (tokenUsage ? `${tokenUsage} tokens used, ` : '') +
    (info?.costTime ? `${info.costTime / 1000} s` : '');

  /**
   * @deprecated 暂时不显示最佳答案文案，仅显示点赞
   */
  const isBest = (evaluate?.best || []).some(item => item.model === model);
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
            ' relative flex-shrink-0 max-w-full leading-6 ' +
            (plain
              ? ''
              : 'mb-2 px-4 py-2 dark:bg-teal-900 bg-slate-200 rounded-r-2xl rounded-l-md')
          }
        >
          {showModelName && (
            <span className="text-xs mb-1 flex items-center text-gray-500 dark:text-gray-400">
              <img
                src={getModelIcon(model)}
                alt=""
                className="w-3 h-3 mr-1 rounded-sm"
              />{' '}
              {model}
            </span>
          )}
          <MarkdownRenderer content={content} loading={isLast && loading} />
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
          {formattedInfo && (
            <div className="mt-1 text-xs opacity-25">{formattedInfo}</div>
          )}
        </div>
      ),
    [content, loading, likes.length, isDark, i18n.language, formattedInfo]
  );
}
