import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Logo from '@/public/logo.svg';

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
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState('');
  const [payload, setPayload] = useState({});

  useEffect(() => {
    const handleSelection = e => {
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        setSelection(selection.toString());
        setShowButton(true);
        setButtonPosition({ x: e.clientX + 6, y: e.clientY + 8 });
      } else {
        setShowButton(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  useEffect(() => {
    if (showPage) {
      document.querySelector('html').style.overflow = 'hidden';
    } else {
      document.querySelector('html').style.overflow = 'auto';
    }
  }, [showPage]);

  const handleButtonClick = () => {
    setPayload({ selection, type: 'query', context: getPageContext() });
    setShowPage(true);
    setShowButton(false);
  };

  return (
    <div className="fixed right-0 my-auto top-0 bottom-0 flex items-center">
      <Modal
        visible={showPage}
        close={() => setShowPage(false)}
        payload={payload}
      />
      <div
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,.1)',
        }}
        className={
          'fixed z-[99998] p-[4px] cursor-pointer rounded-[4px] bg-white transition-all duration-300 transform hover:scale-105 ' +
          (showButton ? ' opacity-100' : 'opacity-0 hidden')
        }
        onClick={handleButtonClick}
      >
        <img src={Logo} className="!h-[16px] !w-[16px] " />
      </div>
    </div>
  );
};
