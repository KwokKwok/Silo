import { useLastGptResponse } from '@src/utils/chat';
import { useState } from 'react';
import { useEffect } from 'react';
import SingleChatPanel from '../SingleChatPanel';
import InputControl from '../InputControl';
import { useSiloChat } from '@src/utils/chat';
import wordExplainPrompt from '@src/services/prompt/web-copilot.txt?raw';

export default function ({ message }) {
  const { loading, onSubmit, onStop } = useSiloChat(
    `${wordExplainPrompt}<context>${JSON.stringify(
      message.context
    )}</context>\n`
  );

  useEffect(() => {
    onStop(true);
    if (message) {
      setTimeout(() => {
        onSubmit(message.message);
      }, 16);
    }
  }, [message]);

  const modelResponses = useLastGptResponse();
  const [activeIndex, setActiveIndex] = useState(0);
  const optionLength = modelResponses.length;
  const onCursor = offset => {
    setActiveIndex(prev => {
      let target = prev;
      target += offset;
      target = Math.max(0, Math.min(target, optionLength - 1));
      return target;
    });
  };

  if (!modelResponses.length) return null;
  return (
    <div className="flex-1 flex flex-col h-full w-full pb-[8px]">
      <div className="flex-1 h-0 overflow-auto pb-4 relative text-sm leading-6">
        {modelResponses[activeIndex] && (
          <SingleChatPanel model={modelResponses[activeIndex].model} plain />
        )}
      </div>

      <div className=" mt-[8px] flex-shrink-0 px-4 items-center flex">
        <div className=" flex items-center relative flex-shrink-0 ">
          <div
            style={{
              transform: `translateX(${activeIndex * (32 + 8)}px)`,
            }}
            className="absolute left-0 top-0 h-[32px] w-[32px] transform transition-transform duration-300 opacity-75 outline-primary outline outline-[2px] rounded-[4px]"
          ></div>
          {modelResponses.map((response, index) => (
            <div
              key={index}
              className={`cursor-pointer mr-[8px] p-[4px] transition-transform duration-300 select-none ${activeIndex === index
                  ? ' overflow-hidden shadow-lg scale-105'
                  : 'scale-100'
                }`}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={response.icon}
                alt={response.model}
                className={
                  'w-[24px] h-[24px] rounded-[4px] ' +
                  (response.loading ? 'animate-pulse' : '')
                }
              />
            </div>
          ))}
        </div>
        <div className="flex-1 relative flex-shrink-0 ml-2">
          <InputControl
            placeholder="继续问我吧"
            plain
            enter
            onCursorPre={() => onCursor(-1)}
            onCursorNext={() => onCursor(1)}
            onStop={onStop}
            onSubmit={onSubmit}
            loading={modelResponses[activeIndex]?.loading}
          />
        </div>
      </div>
    </div>
  );
}
