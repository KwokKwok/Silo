import { useEffect, useRef } from 'react';
import { useIsMobile } from '@src/utils/use';
import { Button } from 'tdesign-react';
import { useRequest } from 'ahooks';
import { getOptimizedPrompts, getEnglishText } from '@src/services/api';
import Tooltip from '@src/components/MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';

const SingleInput = ({
  single,
  onRemove,
  addGeneratedPrompt,
  value,
  className,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (single) {
      inputRef.current.focus();
    }
  }, [single, inputRef]);

  const {
    loading: generateLoading,
    data: generateGpt,
    runAsync: runGenerate,
  } = useRequest(getOptimizedPrompts, {
    manual: true,
  });

  const { loading: translateLoading, runAsync: runTranslate } = useRequest(
    getEnglishText,
    {
      manual: true,
    }
  );

  const { i18n } = useTranslation();

  const onTranslate = () => {
    if (translateLoading) return;
    runTranslate(value, i18n.language).then(data => {
      onChange(data.trim());
    });
  };

  const onGeneratePrompt = () => {
    runGenerate(value).then(data => {
      // notification.info({
      //   title: '优化提示',
      //   content:
      //     data.advise,
      //   closeBtn: true,
      //   duration: 1000 * 6,
      //   placement: 'bottom-right',
      //   offset: [-20, -20],
      // });
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
        className=" outline-none overflow-y-auto flex-1 bg-transparent resize-none pl-2 pr-28 text-base leading-6"
      />
      <div className="absolute flex items-center top-0 h-12 right-4 z-20 ">
        <Tooltip
          content={generateGpt?.advise || t('chat.generate_optimized_prompt')}
        >
          <i
            onClick={generateLoading || !value.length ? null : onGeneratePrompt}
            className={
              'w-6 h-6 block mr-2 cursor-pointer transition-all duration-500 ease-in-out ' +
              (generateLoading
                ? ' i-mingcute-loading-3-fill animate-spin '
                : ' iconify mingcute--quill-pen-ai-line') +
              (!value.length ? ' opacity-60' : '')
            }
          ></i>
        </Tooltip>
        {
          <Tooltip content={t('common.translate_to_english')}>
            <i
              onClick={onTranslate}
              className={
                'w-6 h-6 block mr-2 transition-all duration-500 ease-in-out ' +
                (translateLoading
                  ? ' i-mingcute-loading-3-fill animate-spin '
                  : ' iconify mingcute--translate-2-ai-line') +
                (!value.length ? ' opacity-60' : ' cursor-pointer')
              }
            ></i>
          </Tooltip>
        }
        <i
          onClick={() => {
            if (!single) {
              onRemove();
            }
          }}
          className={
            'w-6 h-6  mr-2 cursor-pointer transition-all duration-500 ease-in-out i-mingcute-minus-circle-fill ' +
            (single ? ' opacity-60' : '')
          }
        ></i>
      </div>
    </div>
  );
};

export default function ({ inputs, setInputs, onStop, onSubmit, onGenerate }) {
  const { t } = useTranslation();
  const validInputs = inputs.filter(item => item.trim());

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addGeneratedPrompt = (currentInput, data) => {
    setInputs(inputs => {
      const newInputs = [...inputs];
      const index = newInputs.findIndex(item => item === currentInput);
      newInputs.splice(index + 1, 0, data.optimized);
      return newInputs;
    });
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
          single={inputs.length === 1}
          onChange={value => updateInput(index, value)}
          onRemove={() => removeInput(index)}
          addGeneratedPrompt={addGeneratedPrompt.bind(null, input)}
        />
      ))}
      <div className="mt-4 flex items-center justify-center">
        <Button
          icon={<i className="iconify mingcute--add-line mr-1" />}
          variant="outline"
          onClick={addInput}
        >
          {t('chat.add_prompt')}
        </Button>
        <Button
          variant="outline"
          className="ml-2"
          disabled={validInputs.length === 0}
          onClick={onSubmit}
        >
          {t('chat.adjust_model_or_parameters')}
        </Button>
        <Button
          variant="outline"
          theme="primary"
          className="ml-2"
          disabled={validInputs.length === 0}
          onClick={onGenerate}
        >
          {t('chat.start_generation')}
        </Button>
      </div>
    </div>
  );
}
