import GroupMessages from './components/GroupMessages';
import MultiPanelMessages from './components/MultiPanelMessages';
import { useIsMobile } from '@src/utils/use';
import { useSiloChat } from '@src/utils/chat';
import ChatInput from './components/ChatInput';
import { useSystemPrompts } from '@src/utils/system-prompt';
import { useActiveModels } from '@src/store/app';
import { LOCATION_QUERY_KEY } from '@src/utils/types';
import { useEffect } from 'react';

function Chat() {
  const { active, all, setActive: setActiveSystemPrompt } = useSystemPrompts();
  const { setActiveModels } = useActiveModels();

  const { loading, onSubmit, onStop, hasVisionModel, messageHistory } =
    useSiloChat(active.content);
  const isMobile = useIsMobile();
  useEffect(() => {
    const onHashChange = () => {
      const search = new URLSearchParams(
        decodeURIComponent(location.hash.split('?')[1])
      );
      const activeModels = search.get(LOCATION_QUERY_KEY.ACTIVE_MODELS);
      const systemPromptId = search.get(LOCATION_QUERY_KEY.SYSTEM_PROMPT_ID);
      const question = search.get(LOCATION_QUERY_KEY.QUESTION);
      if (activeModels) {
        setActiveModels(activeModels.split(','));
      }
      const systemPrompt = all.find(p => p.id === systemPromptId);

      if (systemPrompt) {
        setActiveSystemPrompt(systemPrompt);
      }
      if (question) {
        onStop(true);
        requestAnimationFrame(() => {
          onSubmit(question, null, systemPrompt?.content);
        });
      }
    };
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
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
