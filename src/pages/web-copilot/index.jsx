import { useState, useRef } from 'react';
import mockData from './mock.json';
import { useEffect } from 'react';
import WordExplainer from './components/WordExplainer';
import { isBrowserExtension } from '@src/utils/utils';
import WebCopilotSettings from '@src/components/Header/WebCopilotSettingsModal';
import { useDarkMode } from '@src/utils/use';

const commonIconClass =
  ' cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300 text-xl ml-2';

export default function () {
  const settingsRef = useRef(null);
  const [message, setMessage] = useState(!isBrowserExtension ? mockData : null);
  const [isDark, setDarkMode] = useDarkMode();

  useEffect(() => {
    const handleMessage = event => {
      if (event.data && typeof event.data === 'string') {
        const message = JSON.parse(event.data);
        if (message.from === 'silo:extension') {
          setMessage(message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
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
        <i
          className={`iconify ${
            isDark ? 'i-ri-sun-line' : 'i-ri-moon-line'
          } ${commonIconClass} ml-auto`}
          onClick={() => setDarkMode(!isDark)}
        ></i>
        <i
          className={`iconify i-ri-settings-3-line ${commonIconClass} `}
          onClick={() => {
            settingsRef.current?.open();
          }}
        ></i>
        <i
          className={`iconify ri--close-large-fill ${commonIconClass} ml-2`}
          onClick={() => {
            window.parent?.postMessage(
              JSON.stringify({ type: 'silo:web-copilot-close' }),
              '*'
            );
          }}
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
