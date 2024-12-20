import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@src/utils/use';
import SystemPromptSelector from './SystemPromptSelector';
import { useTranslation } from 'react-i18next';
import ImageUploader from './ImageUploader';
import { useMemo } from 'react';
import { Popup } from 'tdesign-react';
import SingleImageViewer from '@src/components/SingleImageViewer';
import Shortcuts, { SHORTCUTS_ACTIONS, useShortcuts } from './Shortcuts';
import { GUIDE_STEP } from '@src/utils/types';
import { removeUserMessage } from '@src/utils/chat';

/**
 * 不使用输入框的历史记录
 */
const NO_INPUT_HISTORY_INDEX = -1;

export default function ({
  onStop,
  onSubmit,
  loading,
  enter,
  placeholder,
  plain = false,
  onCursorPre,
  onCursorNext,
  hasVisionModel,
  messageHistory = [],
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const inputRef = useRef();
  const isMobile = useIsMobile();
  const validInput = input.trim();
  const [image, setImage] = useState(null);
  const [historyIndex, setHistoryIndex] = useState(NO_INPUT_HISTORY_INDEX);

  const handleShortcutSelect = action => {
    if (action === SHORTCUTS_ACTIONS.CLEAR) {
      onStop(true);
    } else if (action === SHORTCUTS_ACTIONS.STOP) {
      onStop(false);
    } else if (
      action === SHORTCUTS_ACTIONS.RESEND_LAST &&
      messageHistory.length > 0
    ) {
      const { message, image, chatId } =
        messageHistory[messageHistory.length - 1];
      removeUserMessage(chatId);
      onSubmit(message, image);
    }
    setInput('');
    onInputHook('');
    inputRef.current.focus();
  };
  const { onInputHook, onKeyDownHook, showShortcuts, selectedShortcutIndex } =
    useShortcuts(handleShortcutSelect);

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
    const value = e.target.value;
    setInput(value);
    onInputHook(value);
  };

  const canSend = image || validInput;

  const onSend = () => {
    if (!canSend) return;
    if (loading) {
      onStop(false);
    }
    onSubmit(validInput, image);
    setInput('');
    setImage(null);
    setHistoryIndex(NO_INPUT_HISTORY_INDEX);
  };

  useEffect(() => {
    if (!hasVisionModel) {
      setImage(null);
    }
  }, [hasVisionModel]);

  const systemPromptSelectorRef = useRef();

  const _onPre = onCursorPre || (() => systemPromptSelectorRef.current?.pre());
  const _onNext =
    onCursorNext || (() => systemPromptSelectorRef.current?.next());

  /**
   * 切换历史记录
   */
  const _onSwitchHistory = isUp => {
    let targetIndex = 0;
    if (isUp) {
      // 向上切换
      // 如果没使用历史记录，则设置为最后一个历史记录
      if (historyIndex === NO_INPUT_HISTORY_INDEX) {
        targetIndex = messageHistory.length - 1;
      } else {
        targetIndex = Math.max(historyIndex - 1, 0);
      }
    } else {
      // 向下切换
      // 如果没使用历史记录，则不进行切换
      if (historyIndex === NO_INPUT_HISTORY_INDEX) {
        return;
      } else if (historyIndex === messageHistory.length - 1) {
        // 如果当前是最后一个历史记录，则重置为不使用历史记录
        targetIndex = NO_INPUT_HISTORY_INDEX;
      } else {
        targetIndex = Math.min(historyIndex + 1, messageHistory.length - 1);
      }
    }

    if (targetIndex === historyIndex) return;
    console.log(targetIndex);

    // 根据历史记录设置输入框的内容
    if (targetIndex === NO_INPUT_HISTORY_INDEX) {
      setInput('');
      setImage(null);
    } else {
      const { message, image } = messageHistory[targetIndex];
      setInput(message);
      setImage(image);
    }
    setHistoryIndex(targetIndex);
  };

  const onKeyDown = e => {
    if (onKeyDownHook(e)) return;
    if (!enter && isMobile) return; // 移动端只允许点击发送
    if (e.key === 'Enter') {
      // 允许回车键发送
      if (!e.shiftKey) {
        // shift+回车 换行不发送
        e.preventDefault();
        onSend();
      }
    }
    // 获取光标的位置
    const selectionStart = inputRef.current.selectionStart;
    const isOnStart = selectionStart === 0;
    const isOnEnd = selectionStart === input.length;
    // 在输入框的开始位置
    if (isOnStart) {
      switch (e.key) {
        case 'ArrowLeft':
          _onPre();
          break;
        case 'ArrowRight':
          if (!input.length) {
            // 如果输入框没有内容，则切换到下一个快捷指令（系统提示词）
            _onNext();
          }
          break;
        case 'ArrowUp':
          _onSwitchHistory(true);
          break;
        default:
          break;
      }
    }
    if (isOnEnd) {
      if (e.key === 'ArrowDown') {
        _onSwitchHistory(false);
      }
    }
  };

  const actionBaseClassName =
    'absolute bottom-3 right-4 w-6 h-6 cursor-pointer transition-all duration-500 ease-in-out ';
  const onUpload = img => {
    setImage(img);
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  const imageUploaderRef = useRef();
  useEffect(() => {
    if (!image) {
      imageUploaderRef.current?.clear();
    }
  }, [image]);
  const imageUploader = useMemo(() => {
    return (
      <ImageUploader
        ref={imageUploaderRef}
        onUpload={onUpload}
        className="ml-2"
      />
    );
  }, [image]);

  // 添加粘贴事件处理函数
  const handlePaste = e => {
    e.preventDefault(); // 阻止默认粘贴行为
    const items = e.clipboardData.items;

    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = event => {
          setImage(event.target.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }

    // 只有在没有图片的情况下才处理文本
    if (!hasImage) {
      const text = e.clipboardData.getData('text');
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentValue = target.value;
      const newValue =
        currentValue.substring(0, start) + text + currentValue.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + text.length;
      setInput(newValue);
    }
  };

  return (
    <>
      <div className="h-12"></div>
      <Popup
        content={
          <SingleImageViewer image={image}>
            <span onClick={() => setImage(null)}>
              <i className="i-mingcute-delete-2-line mr-2" />{' '}
              {t('common.remove')}
            </span>
          </SingleImageViewer>
        }
        showArrow
        visible={!!image && !showShortcuts}
        placement="top-left"
      >
        <div
          className={`min-h-12 z-40 absolute left-2 right-2 bottom-0 bg-white dark:bg-black flex pl-4 pr-10 py-3 shadow-md overflow-hidden transition-[border-radius] duration-400 ${
            input.includes('\n') ? 'rounded-2xl' : 'rounded-3xl'
          } ${plain ? '!bg-opacity-70' : ''}`}
        >
          {!plain && <SystemPromptSelector ref={systemPromptSelectorRef} />}
          {hasVisionModel && imageUploader}
          <Popup
            content={
              <Shortcuts
                onAction={handleShortcutSelect}
                selectedIndex={selectedShortcutIndex}
              />
            }
            showArrow
            placement="top-left"
            visible={showShortcuts}
          >
            <textarea
              id={GUIDE_STEP.CHAT_INPUT}
              type="text"
              rows={1}
              value={input}
              style={{ height: '1.5rem' }}
              onInput={onInput}
              onKeyDown={onKeyDown}
              onPaste={handlePaste}
              placeholder={loading ? '正在思考中...' : placeholder}
              ref={inputRef}
              className="outline-none overflow-y-auto w-full bg-transparent resize-none px-2 text-base leading-6"
            />
          </Popup>
          <i
            className={
              actionBaseClassName +
              '  i-mingcute-arrow-up-circle-fill ' +
              (canSend
                ? 'translate-y-0 opacity-100 z-10 '
                : 'translate-y-0 opacity-20 z-0 ') +
              (!canSend && loading ? 'rotate-180 !opacity-0 ' : 'rotate-0 ')
            }
            onClick={onSend}
          ></i>
          <>
            <i
              className={
                (!canSend && loading
                  ? 'opacity-100 z-10 '
                  : 'opacity-0 z-0  ') +
                ' i-mingcute-stop-circle-fill ' +
                actionBaseClassName
              }
              onClick={() => onStop(false)}
            ></i>
          </>
        </div>
      </Popup>
    </>
  );
}
