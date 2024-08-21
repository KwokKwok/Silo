import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useIsMobile } from '../utils/use';

export default function ({ onStop, onSubmit, loading }) {
  const [input, setInput] = useState('');
  const inputRef = useRef();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [loading]);

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      const el = inputRef.current;
      if (!input) {
        el.style.height = '1.5rem';
      } else {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 300) + 'px';
      }
    }
  }, [input]);

  const onInput = e => {
    setInput(e.target.value.trimStart());
  };

  const onSend = () => {
    if (input) {
      if (input == '/clear') {
        onStop(true);
      } else {
        onSubmit(input.trim());
      }
      setInput('');
    }
  };

  const onKeyDown = e => {
    if (isMobile) return; // 移动端只允许点击发送
    if (e.key === 'Enter') {
      // 允许回车键发送
      if (!e.shiftKey) {
        // shift+回车 换行不发送
        onSend();
      } else {
      }
    }
  };
  return (
    <>
      <div className="h-12"></div>
      <div
        className={
          'min-h-12 z-50 absolute left-2 right-2 bottom-0 bg-white dark:bg-black flex px-4 py-3 shadow-md overflow-hidden transition-[border-radius] duration-400 ' +
          (input.includes('\n') ? 'rounded-2xl' : 'rounded-3xl')
        }
      >
        <i
          className={
            (loading
              ? 'i-mingcute-pause-circle-line'
              : 'i-mingcute-broom-line') +
            ' absolute top-3 left-4 w-6 h-6 opacity-75 z-20 cursor-pointer'
          }
          onClick={() => onStop(!loading)}
        ></i>
        <textarea
          type="text"
          rows={1}
          value={input}
          style={{ height: '1.5rem' }}
          onInput={onInput}
          onKeyDown={onKeyDown}
          ref={inputRef}
          disabled={loading}
          className=" outline-none overflow-y-auto flex-1 bg-transparent resize-none px-10 leading-6"
        />
        <i
          className={
            'i-mingcute-send-fill absolute bottom-3 right-4 z-20 w-6 h-6  mr-2 cursor-pointer transition-all duration-500 ease-in-out ' +
            (input.length
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-20')
          }
          onClick={onSend}
        ></i>
      </div>
    </>
  );
}
