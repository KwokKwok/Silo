import Sortable from 'sortablejs';
import { useActiveModels, useIsRowMode } from '../store/app';
import SingleChatPanel from './SingleChatPanel';
import { useEffect } from 'react';
import { useMultiRows } from '../utils/use';
import { useRef } from 'react';
import { useMemo } from 'react';

export default function () {
  const [multiRows, setRows] = useMultiRows();
  const containerRef = useRef();
  useEffect(() => {
    const sorts = multiRows.map((line, index) => {
      return new Sortable(document.getElementById(`chat-line-${index}`), {
        animation: 150,
        delay: 100,
        scrollSensitivity: 200,
        delayOnTouchOnly: false,
        swapThreshold: 0.5,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        group: 'multi-chat',
        onEnd: () => {
          setRows(
            Array.from(containerRef.current.children).map(line =>
              Array.from(line.children).map(item => item.dataset.model)
            )
          );
        },
      });
    });
    // return () => {
    //   sorts.forEach(item => item.destroy());
    // };
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
