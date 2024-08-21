import { Popup } from 'tdesign-react';
import MessageShortcuts from './MessageShortcuts';

export default function UserMessage({ content }) {
  return (
    <MessageShortcuts copyText={content} placement="bottom-right">
      <div className="flex-shrink-0 mb-2 ml-8 self-end px-4 py-2 bg-white selection:bg-yellow whitespace-pre-line dark:bg-gray-950 rounded-l-2xl rounded-r-md">
        {content}
      </div>
    </MessageShortcuts>
  );
}
