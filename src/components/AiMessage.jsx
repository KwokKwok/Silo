import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedDarkAtom } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ERROR_PREFIX, LOADING_MATCH_TOKEN } from '../utils/types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import remarkGfm from 'remark-gfm';
import '../assets/styles/markdown.scss';
import { useDarkMode } from '../utils/use';
import { useSingleChat } from '../utils/chat';
import { getModelIcon } from '../utils/models';
import { useMemo } from 'react';
export default function AiMessage({
  model,
  content,
  isLast,
  showModelName = false,
  plain = false,
  evaluate = {},
}) {
  const [isDark] = useDarkMode();
  const { loading } = useSingleChat(model);
  // 用于渲染一个行内的 loading
  const APPEND_MARK = ` \`${LOADING_MATCH_TOKEN}\``;

  const isBest = (evaluate?.best || []).some(item => item.model === model);
  const likes = (evaluate?.results || [])
    .map(item => (item.winners.includes(model) ? item.judge : ''))
    .filter(Boolean);
  if (likes.length) {
    console.log(model, content);
  }

  if (isLast && loading) {
    content += APPEND_MARK;
  }

  // 复制功能仅保留代码复制
  return useMemo(
    () =>
      content.startsWith(ERROR_PREFIX) ? (
        <span className="w-full text-center dark:text-red-300 text-red-700 mb-2">
          {content.replace(ERROR_PREFIX, '')}
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
          <Markdown
            children={content}
            remarkPlugins={[remarkGfm]}
            className="silo-markdown"
            components={{
              code(props) {
                let { children, className, node, ...rest } = props;
                if (!children) return null;
                if (children === LOADING_MATCH_TOKEN) {
                  return (
                    <span className="relative inline-flex leading-4 h-3 w-3">
                      <span className="animate-ping animate-delay-150 absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-current"></span>
                    </span>
                  );
                }
                children = children.replace(APPEND_MARK, '');
                const match = /language-(\w+)/.exec(className || '');
                return (
                  <>
                    {match || children?.length > 24 ? (
                      <div className="relative group">
                        <CopyToClipboard
                          text={children}
                          onCopy={() => message.success('已复制')}
                        >
                          <i className="absolute top-3 right-3 opacity-10 text-white group-hover:opacity-50 transition-opacity duration-300 text-base  i-ri-file-copy-line cursor-pointer"></i>
                        </CopyToClipboard>
                        <SyntaxHighlighter
                          {...rest}
                          customStyle={{
                            overflowX: 'auto',
                            fontSize: '12px',
                          }}
                          PreTag="div"
                          children={children}
                          language={match ? match[1] : 'plain'}
                          style={solarizedDarkAtom}
                        />
                      </div>
                    ) : (
                      <code
                        {...rest}
                        className={
                          className +
                          '  text-xs leading-4 px-1 rounded-sm bg-[#878378] bg-opacity-15 dark:bg-teal  text-[#EB5757] dark:text-cyan-300 font-code'
                        }
                      >
                        {children}
                      </code>
                    )}
                  </>
                );
              },
            }}
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
                    className="ml-2 w-4 h-4 rounded-sm"
                    src={getModelIcon(item)}
                  />
                ))}
              </div>
              {isBest ? (
                <span className="ml-4">已由 AI 票选为最佳回复 </span>
              ) : null}
            </div>
          )}
        </div>
      ),
    [content, likes, isBest]
  );
}
