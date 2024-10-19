import GroupMessages from '../components/GroupMessages';
import MultiPanelMessages from '../components/MultiPanelMessages';
import { useIsMobile } from '../utils/use';
import { useSiloChat } from '../utils/chat';
import InputControl from '../components/InputControl';
import { useSystemPrompts } from '@src/utils/system-prompt';

function Chat () {
  const { active } = useSystemPrompts();
  const { loading, onSubmit, onStop, hasVisionModel } = useSiloChat(
    active.content
  );
  const isMobile = useIsMobile();
  return (
    <>
      <div className="flex-1 h-0 w-full pb-2">
        {isMobile ? <GroupMessages /> : <MultiPanelMessages />}
      </div>
      <div className="flex-shrink-0 w-full relative">
        <InputControl
          onStop={onStop}
          onSubmit={onSubmit}
          loading={loading}
          hasVisionModel={hasVisionModel}
        />
      </div>
    </>
  );
}

export default Chat;
