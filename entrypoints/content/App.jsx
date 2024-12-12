import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Logo from '@/public/logo.svg';

async function registerContentMessage(onQuery) {
  browser.runtime.onMessage.addListener(function (request, sendResponse) {
    console.log('[message] ', request);
    if (request.type === 'ping') {
      sendResponse('pong');
    } else if (request.type === 'ai') {
      onQuery(request.payload);
      sendResponse('ok');
    }
  });
}

const getPageContext = () => {
  return {
    content: document.body.innerText,
    title: document.title,
    keywords: document.querySelector('meta[name="keywords"]')?.content,
    description: document.querySelector('meta[name="description"]')?.content,
  };
};

export default ({ ctx }) => {
  const [showPage, setShowPage] = useState(false);
  const [payload, setPayload] = useState({});

  useEffect(() => {
    registerContentMessage(async payload => {
      const { menuItemId, selectionText } = payload;
      setPayload({
        message: menuItemId === 'explain' ? selectionText : '',
        type: menuItemId,
        context: getPageContext(),
        from: 'silo:extension',
      });
      setShowPage(true);
    });
  }, []);

  useEffect(() => {
    if (showPage) {
      document.querySelector('html').style.overflow = 'hidden';
    } else {
      document.querySelector('html').style.overflow = 'auto';
    }
  }, [showPage]);

  return (
    <div className="fixed right-0 my-auto top-0 bottom-0 flex items-center">
      <Modal
        visible={showPage}
        close={() => setShowPage(false)}
        payload={payload}
      />
    </div>
  );
};
