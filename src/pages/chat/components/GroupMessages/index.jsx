import React from 'react';
import { useEffect } from 'react';
import UserMessage from '../UserMessage';
import AiMessage from '../AiMessage';
import ChatHolder from '../ChatHolder';
import { useActiveChatsMessages } from '@src/utils/chat';
import { useAutoScrollToBottomRef } from '@src/utils/use';

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
      {messages.map((item, index) => (
        <React.Fragment key={item.chatId}>
          <UserMessage content={item.user} image={item.image} />
          {Object.keys(item.ai).map(key => (
            <AiMessage
              key={`${item.chatId}-${key}`}
              chatId={item.chatId}
              model={key}
              showModelName
              isLast={index === messages.length - 1}
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
