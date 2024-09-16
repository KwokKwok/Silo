import { useState } from 'react';
import mockData from './mock.json';
import { useEffect } from 'react';
import WebCopilot from '@src/components/WebCopilot';
import { isBrowserExtension } from '@src/utils/utils';
export default function () {
  const [message, setMessage] = useState(!isBrowserExtension ? mockData : null);

  useEffect(() => {
    const handleMessage = event => {
      if (event.data && typeof event.data === 'string') {
        console.log(event.data);
        setMessage(JSON.parse(event.data));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  return (
    <div className="w-full h-full overflow-y-auto">
      {message && <WebCopilot message={message} />}
    </div>
  );
}
