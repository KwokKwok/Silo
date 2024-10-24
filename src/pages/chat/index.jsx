import GroupMessages from './components/GroupMessages';
import MultiPanelMessages from './components/MultiPanelMessages';
import { useIsMobile } from '@src/utils/use';
import { useSiloChat } from '@src/utils/chat';
import ChatInput from './components/ChatInput';
import { useSystemPrompts } from '@src/utils/system-prompt';

function Chat() {
  const { active } = useSystemPrompts();
  const { loading, onSubmit, onStop, hasVisionModel, messageHistory } =
    useSiloChat(active.content);
  const isMobile = useIsMobile();
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
