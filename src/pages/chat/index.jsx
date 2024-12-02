import GroupMessages from './components/GroupMessages';
import MultiPanelMessages from './components/MultiPanelMessages';
import { useIsMobile } from '@src/utils/use';
import { useSiloChat } from '@src/utils/chat';
import ChatInput from './components/ChatInput';
import { useSystemPrompts } from '@src/utils/system-prompt';
import { useEffect } from 'react';

function Chat() {
  const { active } = useSystemPrompts();
  const { loading, onSubmit, onStop, hasVisionModel, messageHistory } =
    useSiloChat(active.content);
  const isMobile = useIsMobile();
  useEffect(() => {
    // 让它作为一个搜索引擎使用，从 url 中获取 search 参数
    const query = new URLSearchParams(
      decodeURIComponent(location.hash.split('?')[1])
    ).get('q');

    if (query) {
      onSubmit(query);
    }
  }, []);
  return (
    <>
      <div className="flex-1 h-0 w-full pb-2">
        {isMobile ? <GroupMessages /> : <MultiPanelMessages />}
      </div>
      <div className="flex-shrink-0 w-full relative">
        <ChatInput
          onStop={onStop}
          onSubmit={onSubmit}
          loading={loading}
          hasVisionModel={hasVisionModel}
          messageHistory={messageHistory}
        />
      </div>
    </>
  );
}

export default Chat;
