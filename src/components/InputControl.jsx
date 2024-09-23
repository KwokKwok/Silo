import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../utils/use';
import { Popconfirm } from 'tdesign-react';
import SystemPromptSelector from './SystemPromptSelector';

export default function ({
  onStop,
  onSubmit,
  loading,
  enter,
  placeholder,
  plain = false,
}) {
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
    if (!enter && isMobile) return; // 移动端只允许点击发送
    if (e.key === 'Enter') {
      // 允许回车键发送
      if (!e.shiftKey) {
        // shift+回车 换行不发送
        onSend();
      } else {
      }
    }
  };

  const actionBaseClassName =
    'absolute bottom-3 right-4 z-20 w-6 h-6  mr-2 cursor-pointer transition-all duration-500 ease-in-out ';

  return (
    <>
      <div className="h-12"></div>
      <div
        className={
          'min-h-12 z-50 absolute left-2 right-2 bottom-0 bg-white dark:bg-black flex px-4 py-3 shadow-md overflow-hidden transition-[border-radius] duration-400 ' +
          (input.includes('\n') ? 'rounded-2xl' : 'rounded-3xl')
        }
      >
        {!plain && <SystemPromptSelector />}
        <textarea
          type="text"
          rows={1}
          value={input}
          style={{ height: '1.5rem' }}
          onInput={onInput}
          onKeyDown={onKeyDown}
          placeholder={loading ? '正在思考中...' : placeholder}
          ref={inputRef}
          disabled={loading}
          className=" outline-none overflow-y-auto flex-1 bg-transparent resize-none px-2 text-base leading-6"
        />
        <i
          className={
            actionBaseClassName +
            ' i-mingcute-send-fill ' +
            (input.length
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-20')
          }
          onClick={onSend}
        ></i>
        <>
          <i
            className={
              (!input.length && loading ? 'translate-x-0' : 'translate-x-20') +
              ' i-mingcute-pause-circle-line ' +
              actionBaseClassName
            }
            onClick={() => onStop(false)}
          ></i>
          <Popconfirm
            content={'确定清空所有对话吗？'}
            cancelBtn={null}
            placement="right-bottom"
            onConfirm={() => onStop(true)}
          >
            <i
              className={
                (!input.length && !loading
                  ? 'translate-x-0'
                  : 'translate-x-20') +
                ' i-mingcute-broom-line ' +
                actionBaseClassName
              }
            ></i>
          </Popconfirm>
        </>
      </div>
    </>
  );
}
