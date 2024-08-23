import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  solarizedDarkAtom,
  solarizedlight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ERROR_PREFIX } from '../utils/types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import remarkGfm from 'remark-gfm';
import '../assets/styles/markdown.scss';
import MessageShortcuts from './MessageShortcuts';
import { useDarkMode } from '../utils/use';
import { useSingleChat } from '../utils/chat';
import { Skeleton } from 'tdesign-react';

export default function AiMessage({
  model,
  content,
  isLast,
  showModelName = false,
}) {
  // 最新消息，如果没有的话先展示个空格
  const [isDark] = useDarkMode();
  const { loading } = useSingleChat(model);

  if (content.startsWith(ERROR_PREFIX)) {
    return (
      <span className="w-full text-center dark:text-red-300 text-red-700 mb-2">
        {content.replace(ERROR_PREFIX, '')}
      </span>
    );
  }

  const inner = (
    <div className="flex-shrink-0 max-w-full mb-2 px-4 py-2 dark:bg-teal-900 bg-slate-200 rounded-r-2xl rounded-l-md">
      {showModelName && (
        <span className="text-xs mb-1 text-gray-500 dark:text-gray-400">
          {model}
        </span>
      )}
      {!content ? (
        <div className="py-1">
          <Skeleton animation="gradient" theme="text" />
        </div>
      ) : (
        <Markdown
          children={content}
          remarkPlugins={[remarkGfm]}
          className="silo-markdown"
          components={{
            code(props) {
              const { children, className, node, ...rest } = props;
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
      )}
    </div>
  );

  // 聊天中如果鼠标悬浮，会造成布局抖动
  // return loading ? (
  //   inner
  // ) : (
  //   <MessageShortcuts placement="bottom-left" copyText={content}>
  //     {inner}
  //   </MessageShortcuts>
  // );

  // 暂时移除响应全部复制功能，代码复制保留
  return inner;
}
