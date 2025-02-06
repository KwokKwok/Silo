import React from 'react';
import { useEffect, useRef } from 'react';
import UserMessage from '../UserMessage';
import AiMessage from '../AiMessage';
import ChatHolder from '../ChatHolder';
import { getChatMessageInfo, useActiveChatsMessages } from '@src/utils/chat';
import { useAutoScrollToBottomRef } from '@src/utils/use';

export default function ({ loading }) {
  const { scrollRef, scrollToBottom } = useAutoScrollToBottomRef();
  const messages = useActiveChatsMessages();
  const isTouchedRef = useRef(false);
  useEffect(() => {
    setTimeout(() => {
      isTouchedRef.current = false;
    }, 100);
    if (loading) {
      // 从非loading状态切换到loading状态时，需要自动滚动到底部
      scrollToBottom();
    }
  }, [loading]);
  useEffect(() => {
    if (messages.length > 0 && !isTouchedRef.current) {
      scrollToBottom();
    }
  }, [messages]);
  return messages.length > 0 ? (
    <div
      className="h-full max-w-full flex flex-col items-start px-1 overflow-auto"
      ref={scrollRef}
      onTouchStart={() => {
        isTouchedRef.current = true;
      }}
    >
      {messages.map((item, index) => (
        <React.Fragment key={item.chatId}>
          <UserMessage content={item.user} image={item.image} />
          {Object.keys(item.ai).map(key => (
            <AiMessage
              key={`${item.chatId}-${key}`}
              chatId={item.chatId}
              model={key}
              info={getChatMessageInfo(key, item.chatId)}
              mobile
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
