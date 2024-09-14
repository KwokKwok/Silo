import MessageShortcuts from './MessageShortcuts';
import Tooltip from './MobileCompatible/Tooltip';

export default function UserMessage({ content, evaluate }) {
  return (
    <MessageShortcuts copyText={content} placement="left">
      <div
        className={
          'flex-shrink-0 leading-6 mb-2 ml-8 self-end px-4 py-2 bg-white selection:bg-yellow whitespace-pre-line dark:bg-gray-950 rounded-l-2xl rounded-r-md relative border-dashed border  border-primary transition-opacity' +
          (evaluate
            ? ' border-opacity-20  dark:border-opacity-40 '
            : ' border-opacity-0')
        }
      >
        <Tooltip content={evaluate ? '该问题的响应将由 AI 进行评估' : ''}>
          {content}
        </Tooltip>
      </div>
    </MessageShortcuts>
  );
}
