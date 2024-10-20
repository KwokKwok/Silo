import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedDarkAtom } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ERROR_PREFIX, LOADING_MATCH_TOKEN } from '../utils/types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../assets/styles/markdown.scss';
import { useDarkMode } from '../utils/use';
import { useSingleChat } from '../utils/chat';
import { getModelIcon, isVisionModel } from '../utils/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// From https://github.com/remarkjs/react-markdown/issues/785

export function escapeBrackets (text) {
  const pattern = /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock != null) {
      return codeBlock;
    } else if (squareBracket != null) {
      return `$$${squareBracket}$$`;
    } else if (roundBracket != null) {
      return `$${roundBracket}$`;
    }
    return match;
  });
}

export function escapeMhchem (text) {
  return text.replaceAll('$\\ce{', '$\\\\ce{').replaceAll('$\\pu{', '$\\\\pu{');
}

/**
 * Preprocesses LaTeX content by replacing delimiters and escaping certain characters.
 *
 * @param content The input string containing LaTeX expressions.
 * @returns The processed string with replaced delimiters and escaped characters.
 */
export function preprocessLaTeX (content) {
  // Step 1: Protect code blocks
  const codeBlocks = [];
  content = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match, code) => {
    codeBlocks.push(code);
    return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
  });

  // Step 2: Protect existing LaTeX expressions
  const latexExpressions = [];
  content = content.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g, match => {
    latexExpressions.push(match);
    return `<<LATEX_${latexExpressions.length - 1}>>`;
  });

  // Step 3: Escape dollar signs that are likely currency indicators
  content = content.replace(/\$(?=\d)/g, '\\$');

  // Step 4: Restore LaTeX expressions
  content = content.replace(/<<LATEX_(\d+)>>/g, (_, index) => latexExpressions[parseInt(index)]);

  // Step 5: Restore code blocks
  content = content.replace(/<<CODE_BLOCK_(\d+)>>/g, (_, index) => codeBlocks[parseInt(index)]);

  // Step 6: Apply additional escaping functions
  content = escapeBrackets(content);
  content = escapeMhchem(content);

  return content;
}

export default function AiMessage ({
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
  // 用于渲染一个行内的 loading
  const APPEND_MARK = ` \`${LOADING_MATCH_TOKEN}\``;

  const tokenUsage = info.usage?.total_tokens || 0;
  const formattedInfo = (tokenUsage ? `${tokenUsage} tokens used, ` : '') + (info?.costTime ? `${info.costTime / 1000} s` : '')

  const isBest = (evaluate?.best || []).some(item => item.model === model);
  const likes = (evaluate?.results || [])
    .map(item => (item.winners.includes(model) ? item.judge : ''))
    .filter(Boolean);

  content = preprocessLaTeX(content);

  if (isLast && loading) {
    content += APPEND_MARK;
  }

  // 复制功能仅保留代码复制
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
            (plain ? '' : 'mb-2 px-4 py-2 dark:bg-teal-900 bg-slate-200 rounded-r-2xl rounded-l-md')
          }
        >
          {showModelName && (
            <span className="text-xs mb-1 flex items-center text-gray-500 dark:text-gray-400">
              <img src={getModelIcon(model)} alt="" className="w-3 h-3 mr-1 rounded-sm" /> {model}
            </span>
          )}
          <Markdown
            children={content}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className="silo-markdown prose !max-w-none prose-pre:bg-transparent prose-slate prose-red prose-sm dark:prose-invert prose-headings:text-primary dark:prose-headings:text-[#2ddaff]"
            components={{
              code (props) {
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
                    {match ? (
                      <div className={'not-prose relative group rounded overflow-hidden'}>
                        <CopyToClipboard
                          text={children}
                          onCopy={() => message.success(t('common.copied'))}
                        >
                          <i className="absolute top-3 right-3 opacity-10 text-white group-hover:opacity-50 transition-opacity duration-300 text-base  i-ri-file-copy-line cursor-pointer"></i>
                        </CopyToClipboard>
                        <SyntaxHighlighter
                          {...rest}
                          customStyle={{
                            overflowX: 'auto',
                            borderRadius: '4px',
                            fontSize: '12px',
                            margin: '0',
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
                          ' text-xs leading-4 px-1 rounded-sm bg-[#878378] bg-opacity-15 dark:bg-teal  text-[#EB5757] dark:text-cyan-300 font-code'
                        }
                      >
                        {children.trim()}
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
              {isBest ? <span className="ml-4">{t('ai_message.best_reply')} </span> : null}
            </div>
          )}
          {formattedInfo && (
            <div className="mt-1 text-xs opacity-25">
              {formattedInfo}
            </div>
          )}
        </div>
      ),
    [content, likes.length, isBest, isDark, i18n.language, formattedInfo]
  );
}
