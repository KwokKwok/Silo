import { useTranslation } from 'react-i18next';
import MessageShortcuts from './MessageShortcuts';
import Tooltip from './MobileCompatible/Tooltip';
import SingleImageViewer from './SingleImageViewer';

export default function UserMessage ({ content, evaluate, image }) {
  const { t } = useTranslation();
  return (
    <MessageShortcuts copyText={image ? '' : content} placement="left">
      <div
        className={
          'flex-shrink-0 leading-6 mb-2 ml-8 self-end px-4 py-2 bg-white selection:bg-yellow whitespace-pre-line dark:bg-gray-950 rounded-l-2xl rounded-r-md relative border-dashed border  border-primary transition-opacity flex flex-col ' +
          (evaluate
            ? ' border-opacity-20  dark:border-opacity-40 '
            : ' border-opacity-0')
        }
      >
        {image && <SingleImageViewer image={image} className="mb-1" />}
        <Tooltip content={evaluate ? t('该问题的响应将由 AI 进行评估') : ''}>
          {content}
        </Tooltip>
      </div>
    </MessageShortcuts>
  );
}
