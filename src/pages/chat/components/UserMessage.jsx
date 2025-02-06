import MessageShortcuts from '@src/pages/chat/components/MessageShortcuts';
import SingleImageViewer from '@src/components/SingleImageViewer';

export default function UserMessage({ content, image }) {
  return (
    <MessageShortcuts copyText={image ? '' : content} placement="left">
      <div
        className={
          'flex-shrink-0 leading-6 mb-2 ml-8 self-end pl-4 pr-2 py-2 bg-white selection:bg-yellow whitespace-pre-line dark:bg-gray-950 rounded-l-2xl rounded-r-md relative flex flex-col '
        }
      >
        {image && <SingleImageViewer image={image} className="mb-1" />}
        {content}
      </div>
    </MessageShortcuts>
  );
}
