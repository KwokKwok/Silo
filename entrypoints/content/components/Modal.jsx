import { useEffect } from 'react';
import { useState } from 'react';

export default function ({ close, payload, visible }) {
  const url = browser.runtime.getURL('ext.html') + '#web-copilot';
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const listener = event => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type === 'silo:web-copilot-close') {
        close();
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    if (payload.type) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify(payload), '*');
    }
  }, [payload]);
  return (
    <div
      className={
        'fixed inset-0 z-[99999] transform bg-black bg-opacity-70 filter backdrop-blur flex justify-center items-center h-full ' +
        (visible ? '' : 'translate-x-full translate-y-full')
      }
      onClick={close}
    >
      <iframe
        ref={iframeRef}
        onLoad={() => {
          setLoaded(true);
        }}
        className={
          'border-none transition-opacity duration-300 outline-none rounded-[16px] shadow-xl bg-black overflow-hidden w-[512px] h-[80dvh] ' +
          (loaded ? 'opacity-100' : 'opacity-0')
        }
        src={url}
      ></iframe>
    </div>
  );
}
