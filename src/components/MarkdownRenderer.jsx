import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedDarkAtom } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LOADING_MATCH_TOKEN } from '@src/utils/types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '@src/assets/styles/markdown.scss';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'tdesign-react';
import { Popup } from 'tdesign-react';

// From https://github.com/remarkjs/react-markdown/issues/785

export function escapeBrackets(text) {
  const pattern =
    /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replace(
    pattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      if (codeBlock != null) {
        return codeBlock;
      } else if (squareBracket != null) {
        return `$$${squareBracket}$$`;
      } else if (roundBracket != null) {
        return `$${roundBracket}$`;
      }
      return match;
    }
  );
}

export function escapeMhchem(text) {
  return text.replaceAll('$\\ce{', '$\\\\ce{').replaceAll('$\\pu{', '$\\\\pu{');
}

/**
 * Preprocesses LaTeX content by replacing delimiters and escaping certain characters.
 *
 * @param content The input string containing LaTeX expressions.
 * @returns The processed string with replaced delimiters and escaped characters.
 */
export function preprocessLaTeX(content) {
  // Step 1: Protect code blocks
  const codeBlocks = [];
  content = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match, code) => {
    codeBlocks.push(code);
    return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
  });

  // Step 2: Protect existing LaTeX expressions
  const latexExpressions = [];
  content = content.replace(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g,
    match => {
      latexExpressions.push(match);
      return `<<LATEX_${latexExpressions.length - 1}>>`;
    }
  );

  // Step 3: Escape dollar signs that are likely currency indicators
  content = content.replace(/\$(?=\d)/g, '\\$');

  // Step 4: Restore LaTeX expressions
  content = content.replace(
    /<<LATEX_(\d+)>>/g,
    (_, index) => latexExpressions[parseInt(index)]
  );

  // Step 5: Restore code blocks
  content = content.replace(
    /<<CODE_BLOCK_(\d+)>>/g,
    (_, index) => codeBlocks[parseInt(index)]
  );

  // Step 6: Apply additional escaping functions
  content = escapeBrackets(content);
  content = escapeMhchem(content);

  return content;
}

const LOADING_MARK = ` \`${LOADING_MATCH_TOKEN}\``;
export default function MarkdownRenderer({
  content,
  loading = false,
  citations = [],
}) {
  const { t } = useTranslation();

  /**
   * 预处理 LaTeX 表达式
   */
  content = preprocessLaTeX(content);

  if (loading) {
    /**
     * 插入一个空白的代码块，用于在 code 标签中匹配 loading 状态
     */
    content += LOADING_MARK;
  }

  // 复制功能仅保留代码复制
  return (
    <Markdown
      children={content}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className="silo-markdown prose !max-w-none prose-pre:bg-transparent prose-slate prose-red prose-sm dark:prose-invert prose-headings:text-primary dark:prose-headings:text-[#2ddaff] group"
      components={{
        code(props) {
          let { children, className, node, ...rest } = props;
          if (!children) return null;

          /**
           * 如果 children 是 loading 状态的匹配 token，则返回一个 loading 动画
           */
          if (children === LOADING_MATCH_TOKEN) {
            return (
              <span className="relative inline-flex translate-y-[1px] leading-4 h-3 w-3">
                <span className="animate-ping animate-delay-150 absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-current"></span>
              </span>
            );
          }

          /**
           * 移除 loading 状态的匹配 token
           */
          children = children.replace(LOADING_MARK, '');

          /**
           * 匹配代码块对应的语言类型
           */
          const matchedLanguage = /language-(\w+)/.exec(className || '');
          return (
            <>
              {matchedLanguage ? (
                <div
                  className={'not-prose relative group rounded overflow-hidden'}
                >
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
                    language={matchedLanguage ? matchedLanguage[1] : 'plain'}
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
        a(props) {
          return <a {...props} target="_blank" rel="noopener noreferrer" />;
        },
        em(props) {
          const { children } = props;

          if (children.startsWith('!cite')) {
            const refIds = children.replace('!cite', '');
            return refIds.split(',').map(id => {
              const refId = id.trim();
              const citation = citations.find(c => c.refer === refId);
              return (
                <Popup
                  key={refId}
                  overlayClassName="!max-w-xs"
                  content={
                    citation ? (
                      <div className="max-w-md ">
                        <div className="flex gap-1 items-center">
                          {!!citation.icon && (
                            <img
                              src={citation.icon}
                              alt={citation.title}
                              className="w-[12px] h-[12px] mr-1 rounded-sm"
                            />
                          )}
                          <span className="line-clamp-1 text-ellipsis">
                            {citation.title}
                          </span>
                        </div>
                        <div className="text-xs opacity-60 mt-2 line-clamp-4">
                          {citation.content}
                        </div>
                      </div>
                    ) : (
                      `引用来源 ${refId}`
                    )
                  }
                >
                  <span
                    onClick={() => {
                      citation.link && window.open(citation.link, '_blank');
                    }}
                    className={`cursor-pointer relative -top-[2px] rounded-[10px] inline-flex items-center justify-center  px-1 text-[10px] leading-[14px] font-medium text-blue-600/90 bg-blue-50/50 border border-blue-100 transition-colors hover:bg-blue-100/50 dark:text-blue-300 dark:bg-blue-500/5 dark:border-blue-400/20 dark:hover:bg-blue-400/10`}
                  >
                    {refId.replace('ref_', '')}
                  </span>
                </Popup>
              );
            });
          }
          return <em {...props} />;
        },
      }}
    />
  );
}
