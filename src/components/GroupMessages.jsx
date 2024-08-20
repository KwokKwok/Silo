import React from 'react';
import { useEffect } from 'react';
import UserMessage from './UserMessage';
import AiMessage from './AiMessage';
import ChatHolder from './ChatHolder';
import { useActiveChatsMessages } from '../utils/chat';
import { useAutoScrollToBottomRef } from '../utils/use';

export default function () {
  const { scrollRef, scrollToBottom } = useAutoScrollToBottomRef();
  const messages = useActiveChatsMessages();
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  return messages.length > 0 ? (
    <div
      className="h-full max-w-full flex flex-col items-start px-1 overflow-auto"
      ref={scrollRef}
    >
      {messages.map(item => (
        <React.Fragment key={item.chatId}>
          <UserMessage content={item.user} />
          {Object.keys(item.ai).map(key => (
            <AiMessage
              key={`${item.chatId}-${key}`}
              model={key}
              content={item.ai[key]}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  ) : (
    <ChatHolder />
  );
}
