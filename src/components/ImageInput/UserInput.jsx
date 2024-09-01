import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../../utils/use';
import { TooltipLite } from 'tdesign-react';
import { Button } from 'tdesign-react';
import { useRequest } from 'ahooks';
import { getOptimizedPrompts } from '../../services/api';
import { message } from 'tdesign-react';
import { notification } from 'tdesign-react';
import Tooltip from '../MobileCompatible/Tooltip';

const SingleInput = ({
  main,
  onAdd,
  onRemove,
  addGeneratedPrompt,
  value,
  className,
  onChange,
  disabled,
}) => {
  const inputRef = useRef();
  const isMobile = useIsMobile();
  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      const el = inputRef.current;
      if (!value) {
        el.style.height = '1.5rem';
      } else {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 300) + 'px';
      }
    }
  }, [value]);

  const {
    loading,
    data: gptResponse,
    runAsync,
  } = useRequest(getOptimizedPrompts, {
    manual: true,
  });

  const onGeneratePrompt = () => {
    runAsync(value).then(data => {
      notification.info({
        title: '优化提示',
        content:
          data.advise,
        closeBtn: true,
        duration: 1000 * 6,
        placement: 'bottom-right',
        offset: [-20, -20],
      });
      addGeneratedPrompt(data);
    });
  };

  const onInput = e => {
    onChange(e.target.value.trimStart());
  };

  const onKeyDown = e => {
    if (isMobile) return; // 移动端只允许点击发送
    if (e.key === 'Enter') {
      // 允许回车键发送
      if (!e.shiftKey) {
        // shift+回车 换行不发送
      } else {
      }
    }
  };

  return (
    <div
      className={
        'relative min-h-12 w-full z-10 bg-white dark:bg-black flex px-4 py-3 shadow-md overflow-hidden transition-[border-radius] duration-400 ' +
        (value?.includes('\n') ? 'rounded-2xl' : 'rounded-3xl') +
        ` ${className}`
      }
    >
      <textarea
        type="text"
        rows={1}
        value={value}
        style={{ height: '1.5rem' }}
        onInput={onInput}
        onKeyDown={onKeyDown}
        ref={inputRef}
        disabled={disabled}
        className=" outline-none overflow-y-auto flex-1 bg-transparent resize-none pl-2 pr-16 text-base leading-6"
      />
      {main && (
        <Tooltip
          content={'生成优化版中英文 Prompt'}
        >
          <i
            onClick={loading || !value.length ? null : onGeneratePrompt}
            className={
              'absolute bottom-3 right-12 z-20 w-6 h-6  mr-2 cursor-pointer transition-all duration-500 ease-in-out ' +
              (loading
                ? ' i-mingcute-loading-3-fill animate-spin '
                : ' iconify mingcute--quill-pen-ai-line') +
              (!value.length ? ' opacity-60' : '')
            }
          ></i>
        </Tooltip>
      )}
      <i
        onClick={main ? onAdd : onRemove}
        className={
          'absolute bottom-3 right-4 z-20 w-6 h-6  mr-2 cursor-pointer transition-all duration-500 ease-in-out ' +
          (main
            ? ' i-mingcute-add-circle-fill'
            : ' i-mingcute-minus-circle-fill')
        }
      ></i>
    </div>
  );
};

export default function ({ inputs, setInputs, onStop, onSubmit, onGenerate }) {
  const validInputs = inputs.filter(item => item.trim());

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addGeneratedPrompt = data => {
    const [main, ...rest] = inputs;
    const newInputs = [main, data.zh, data.en, ...rest];
    setInputs(newInputs);
  };

  const removeInput = index => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };
  return (
    <div className="w-full flex flex-col items-center justify-center px-2">
      {inputs.map((input, index) => (
        <SingleInput
          className="mb-2"
          key={index}
          value={input}
          main={index == 0}
          onChange={value => updateInput(index, value)}
          onRemove={() => removeInput(index)}
          onAdd={addInput}
          addGeneratedPrompt={addGeneratedPrompt}
        />
      ))}
      <div className="mt-4 flex items-center justify-center">
        <Button
          variant="outline"
          disabled={validInputs.length === 0}
          onClick={onSubmit}
        >
          调整模型或参数
        </Button>
        <Button
          variant="outline"
          theme="primary"
          className="ml-2"
          disabled={validInputs.length === 0}
          onClick={onGenerate}
        >
          开始生成
        </Button>
      </div>
    </div>
  );
}
