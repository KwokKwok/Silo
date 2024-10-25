import { useState } from 'react';
import mockData from './mock.json';
import { useEffect } from 'react';
import WordExplainer from './components/WordExplainer';
import { isBrowserExtension } from '@src/utils/utils';
export default function () {
  const [message, setMessage] = useState(!isBrowserExtension ? mockData : null);

  console.log(message);

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
      {message && (
        <WordExplainer
          context={JSON.stringify(message.context)}
          word={message.selection || message.message}
        />
      )}
    </div>
  );
}
