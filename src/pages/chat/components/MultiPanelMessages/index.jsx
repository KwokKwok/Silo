import Sortable from 'sortablejs';
import SingleChatPanel from './SingleChatPanel';
import { useEffect } from 'react';
import { useMultiRows, useRefresh } from '@src/utils/use';
import { useRef } from 'react';

export default function () {
  const [multiRows, setRows] = useMultiRows();
  const { refresh } = useRefresh();
  const containerRef = useRef();
  useEffect(() => {
    const sorts = multiRows.map((line, index) => {
      return new Sortable(document.getElementById(`chat-line-${index}`), {
        delay: 0,
        scrollSensitivity: 200,
        delayOnTouchOnly: true,
        swapThreshold: 0.2,
        animation: 300,
        // invertSwap: true,
        ghostClass: 'sortable-ghost',
        chosenClass: 'opacity-60',
        // dragClass: 'sortable-drag',
        handle: '.sortable-drag',
        group: 'multi-chat',
        onEnd: () => {
          setRows(
            Array.from(containerRef.current.children).map(line =>
              Array.from(line.children).map(item => item.dataset.model)
            )
          );
          refresh();
        },
      });
    });
    return () => {
      sorts.forEach(item => item.destroy());
    };
  }, [multiRows]);
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {multiRows.map((line, index) => (
        <div
          key={line.join(',')}
          id={`chat-line-${index}`}
          className="overflow-x-auto flex-1 h-0 flex last:mt-2"
        >
          {line.map(model => (
            <SingleChatPanel key={model} model={model} />
          ))}
        </div>
      ))}
    </div>
  );
}
