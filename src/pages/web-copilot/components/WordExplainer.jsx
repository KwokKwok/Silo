import { useLastGptResponse } from '@src/utils/chat';
import { useState, useEffect } from 'react';
import SingleChatPanel from '../../chat/components/MultiPanelMessages/SingleChatPanel';
import InputControl from '../../chat/components/ChatInput';
import { useSiloChat } from '@src/utils/chat';
import {
  useLocalStorageAtom,
  useLocalStorageJSONAtom,
} from '@src/store/storage';
import { LOCAL_STORAGE_KEY } from '@src/utils/types';
import { useActiveModels } from '@src/store/app';
import { getAllTextModels, isVisionModel } from '@src/utils/models';

const SYSTEM_PROMPT_CONTEXT_KEY = '${silo_page_context}';

const allTextModels = getAllTextModels();

export default function ({ context, word }) {
  const [activeModels] = useLocalStorageJSONAtom(
    LOCAL_STORAGE_KEY.WORD_EXPLAINER_ACTIVE_MODELS
  );
  const {
    activeModels: appActiveModels,
    disablePersist: disablePersistAppActiveModels,
    setActiveModels: setAppActiveModels,
  } = useActiveModels();
  const [isModelInit, setIsModelInit] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prompt] = useLocalStorageAtom(LOCAL_STORAGE_KEY.WORD_EXPLAINER_PROMPT);

  useEffect(() => {
    setActiveIndex(0);
    disablePersistAppActiveModels(true);
    setAppActiveModels(activeModels);
    setTimeout(() => {
      setIsModelInit(true);
    }, 16);
  }, [activeModels]);

  const systemPrompt = prompt.includes(SYSTEM_PROMPT_CONTEXT_KEY)
    ? prompt.replace(
        SYSTEM_PROMPT_CONTEXT_KEY,
        `<context>${context}</context>\n`
      )
    : `${prompt}\n<context>${context}</context>\n`;

  const { loading, onSubmit, onStop, messageHistory } = useSiloChat(
    systemPrompt,
    activeModels
  );

  useEffect(() => {
    if (!isModelInit) return;

    if (word) {
      setTimeout(() => {
        onSubmit(word);
      }, 16);
    }
  }, [context, word, isModelInit]);

  const modelResponses = useLastGptResponse();
  const filteredResponses =
    activeModels.length > 0
      ? modelResponses.filter(response => activeModels.includes(response.model))
      : modelResponses;
  const optionLength = activeModels.length;

  const onCursor = offset => {
    setActiveIndex(prev => {
      let target = prev;
      target += offset;
      target = Math.max(0, Math.min(target, optionLength - 1));
      return target;
    });
  };

  if (!isModelInit || !activeModels.length) return null;
  return (
    <div className="flex-1 flex flex-col h-full w-full pb-[8px]">
      <div className="flex-1 h-0 overflow-auto pb-4 relative text-sm leading-6 pl-[4px]">
        {activeModels[activeIndex] && (
          <SingleChatPanel model={activeModels[activeIndex]} plain />
        )}
      </div>

      <div className="mt-[8px] flex-shrink-0 px-4 items-center flex">
        <div className="flex items-center relative flex-shrink-0">
          <div
            style={{
              transform: `translateX(${activeIndex * (32 + 8)}px)`,
            }}
            className="absolute left-0 top-0 h-[32px] w-[32px] transform transition-transform duration-300 opacity-75 outline-primary outline outline-[2px] rounded-[4px]"
          ></div>
          {activeModels.map((model, index) => {
            const response = filteredResponses.find(
              item => item.model === model
            );
            const modelDetail =
              allTextModels.find(item => item.id === model) || {};

            return (
              <div
                key={index}
                className={`cursor-pointer mr-[8px] last:mr-0 p-[4px] transition-transform duration-300 select-none ${
                  activeIndex === index
                    ? ' overflow-hidden shadow-lg scale-105'
                    : 'scale-100'
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={modelDetail.icon}
                  alt={model}
                  className={
                    'w-[24px] h-[24px] rounded-[4px] ' +
                    (response?.loading ? 'animate-pulse' : '')
                  }
                />
              </div>
            );
          })}
        </div>
        <div className="flex-1 relative flex-shrink-0 ml-2">
          <InputControl
            placeholder=""
            plain
            hasVisionModel={isVisionModel(
              filteredResponses[activeIndex]?.model
            )}
            onCursorPre={() => onCursor(-1)}
            onCursorNext={() => onCursor(1)}
            onStop={onStop}
            onSubmit={onSubmit}
            loading={filteredResponses[activeIndex]?.loading}
            messageHistory={messageHistory}
          />
        </div>
      </div>
    </div>
  );
}
