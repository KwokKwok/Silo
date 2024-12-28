import { useState, useRef } from 'react';
import mockData from './mock.json';
import { useEffect } from 'react';
import WordExplainer from './components/WordExplainer';
import { isBrowserExtension } from '@src/utils/utils';
import WebCopilotSettings from '@src/components/Header/WebCopilotSettingsModal';
import { useDarkMode } from '@src/utils/use';
import { throttle } from 'lodash-es';

const commonIconClass =
  ' cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300 text-xl ml-2';

export default function () {
  const settingsRef = useRef(null);
  const [message, setMessage] = useState(!isBrowserExtension ? mockData : null);
  const [isDark, setDarkMode] = useDarkMode(false);
  const [isIFrame, setIsIFrame] = useState(false);

  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    const handleMessage = event => {
      if (event.data && typeof event.data === 'string') {
        console.log(event.data);

        const message = JSON.parse(event.data);
        if (message.type === 'silo:web-copilot-init') {
          setDarkMode(message.isDarkTheme);
          setIsIFrame(message.isIFrame);
        }
        if (message.type === 'silo:web-copilot-query') {
          setMessage(message);
          setTimeout(() => {
            console.log(document.getElementsByTagName('textarea'));

            document.getElementsByTagName('textarea')[0]?.focus();
          }, 100);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const dragHandle = document.getElementById('drag-handle');
    const startPoint = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    const lastPosition = { x: 0, y: 0 };
    let isDragging = false;
    const handleMouseDown = e => {
      startPoint.x = e.screenX;
      startPoint.y = e.screenY;
      isDragging = true;
    };

    const handleMouseMove = throttle(e => {
      if (isDragging) {
        position.x = e.screenX - startPoint.x + lastPosition.x;
        position.y = e.screenY - startPoint.y + lastPosition.y;
        window.parent?.postMessage(
          JSON.stringify({
            type: 'silo:web-copilot-move',
            position,
            timestamp: e.timeStamp,
          }),
          '*'
        );
      }
    }, 16);

    const handleMouseUp = () => {
      isDragging = false;
      lastPosition.x = position.x;
      lastPosition.y = position.y;
    };

    dragHandle?.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      dragHandle?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <WebCopilotSettings ref={settingsRef} />
      <div
        className="h-12 w-full flex items-center pl-4 pr-3"
        style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
      >
        <img
          src={browser.runtime.getURL('logo.svg')}
          className="w-6 cursor-pointer"
          alt="logo"
          onClick={() => {
            window.open(browser.runtime.getURL('ext.html'), '_blank');
          }}
        />
        <div
          id="drag-handle"
          className="flex-1 h-full bg-transparent cursor-move"
        ></div>
        <i
          className={`iconify ${
            isDark ? 'i-ri-sun-line' : 'i-ri-moon-line'
          } ${commonIconClass}`}
          onClick={() => setDarkMode(!isDark)}
        ></i>
        <i
          className={`iconify i-ri-settings-3-line ${commonIconClass} `}
          onClick={() => {
            settingsRef.current?.open();
          }}
        ></i>
        <i
          className={`iconify ri--collapse-diagonal-fill ${commonIconClass} ml-2`}
          onClick={() => {
            window.parent?.postMessage(
              JSON.stringify({ type: 'silo:web-copilot-close' }),
              '*'
            );
          }}
        ></i>
        <i
          className={`iconify hidden ri--collapse-diagonal-fill ${commonIconClass} ml-2`}
        ></i>
      </div>
      <div className=" flex-1 h-0 overflow-y-auto">
        {message && (
          <WordExplainer
            context={JSON.stringify(message.context)}
            word={message.selection || message.message}
          />
        )}
      </div>
    </div>
  );
}
