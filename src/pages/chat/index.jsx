import GroupMessages from './components/GroupMessages';
import MultiPanelMessages from './components/MultiPanelMessages';
import { useIsMobile } from '@src/utils/use';
import { useSiloChat } from '@src/utils/chat';
import ChatInput from './components/ChatInput';
import { useSystemPrompts } from '@src/utils/system-prompt';
import { useActiveModels } from '@src/store/app';
import { LOCATION_QUERY_KEY } from '@src/utils/types';
import { useEffect } from 'react';
import { useState } from 'react';

function Chat() {
  const {
    active,
    all,
    setActive: setActiveSystemPrompt,
    disablePersist: disablePersistSystemPrompt,
  } = useSystemPrompts();
  const { setActiveModels, disablePersist: disablePersistModels } =
    useActiveModels();

  const [questionNeedSubmit, setQuestionNeedSubmit] = useState('');

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
        disablePersistModels(true);
        setActiveModels(activeModels.split(','));
      }
      const systemPrompt = all.find(p => p.id === systemPromptId);

      if (systemPrompt) {
        disablePersistSystemPrompt(true);
        setActiveSystemPrompt(systemPrompt);
      }
      if (question) {
        setQuestionNeedSubmit(question);
      }
    };
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (questionNeedSubmit) {
      onStop(true);
      onSubmit(questionNeedSubmit);
      setQuestionNeedSubmit('');
    }
  }, [questionNeedSubmit]);

  return (
    <>
      <div className="flex-1 h-0 w-full pb-2">
        {isMobile ? (
          <GroupMessages loading={loading} />
        ) : (
          <MultiPanelMessages />
        )}
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
      <div className="pb-safe"></div>
    </>
  );
}

export default Chat;
