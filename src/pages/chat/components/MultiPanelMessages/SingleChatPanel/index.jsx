import { useEffect, Fragment } from 'react';
import AiMessage from '@src/pages/chat/components/AiMessage';
import UserMessage from '@src/pages/chat/components/UserMessage';
import ChatHolder from '@src/pages/chat/components/ChatHolder';
import { Popup } from 'tdesign-react';
import { getAllTextModels } from '@src/utils/models';
import { useActiveModels } from '@src/store/app';
import {
  getChatMessageInfo,
  useChatMessages,
  useSingleChat,
} from '@src/utils/chat';
import ChatOptionAdjust from './ChatOptionAdjust';
import { useAutoScrollToBottomRef, useRefresh } from '@src/utils/use';
import { useRef } from 'react';
import { useZenMode } from '@src/store/storage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'tdesign-react';
import ChatModelSelector from './ChatModelSelector';
import { message } from 'tdesign-react';
import { GUIDE_STEP } from '@src/utils/types';
export default function ({ model, plain = false, className = '' }) {
  const { t } = useTranslation();
  const messages = useChatMessages(model);
  const { activeModels, removeActiveModel } = useActiveModels();
  const allTextModels = getAllTextModels();
  const modelDetail = allTextModels.find(item => item.id === model) || {};

  const [isZenMode] = useZenMode();

  const chat = useSingleChat(model);

  const onClose = () => {
    removeActiveModel(model);
  };

  useEffect(() => {
    if (!modelDetail.id) {
      // 模型有可能不再提供了，或者自定义模型被删除了
      removeActiveModel(model);
    }
  }, [model]);

  const refreshControl = useRefresh();

  const onStop = () => {
    // 根据状态判断是停止还是清理
    chat.stop(!chat.loading);
    // 用的引用，需要手动刷新
    refreshControl.refresh();
  };

  const [isMouseOver, _setIsMouseOver] = useState(false);
  const mouseOverRef = useRef();
  const toggleMouseOver = value => {
    _setIsMouseOver(value);
    mouseOverRef.current = value;
  };
  const iconClassName = 'cursor-pointer text-lg opacity-70 ml-2 flex-shrink-0 ';
  const { scrollRef, scrollToBottom } = useAutoScrollToBottomRef();

  const lastAiMessage = messages[messages.length - 1];

  useEffect(() => {
    if (mouseOverRef.current) return;
    if (messages.length > 0) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [JSON.stringify(lastAiMessage)]);
  return (
    <div
      data-model={model}
      className={
        'h-full ' +
        (plain
          ? 'flex-1 relative '
          : 'flex-1 min-w-96 w-0 flex-shrink-0 relative mr-2 first:ml-2 rounded-md border-2 border-gray-200 dark:border-gray-950')
      }
      onMouseOver={() => toggleMouseOver(true)}
      onMouseOut={() => toggleMouseOver(false)}
    >
      {!plain && (
        <div
          className={
            'h-10 z-20 rounded filter  backdrop-blur overflow-hidden items-center px-2  flex absolute top-0 left-0 right-0 bg-[#fff8] dark:bg-[#0008] shadow-sm transform transition-visible duration-300 delay-150 ' +
            (isZenMode ? '-translate-y-full opacity-0 hover:opacity-100' : '')
          }
        >
          <ChatModelSelector model={model} />

          <i
            className={iconClassName + ' sortable-drag i-mingcute-move-line'}
          ></i>
          <Popup
            content={<ChatOptionAdjust model={model} />}
            placement="bottom-right"
            showArrow
            destroyOnClose
            trigger="click"
          >
            <i
              id={GUIDE_STEP.CHAT_OPTIONS_ADJUST}
              className={iconClassName + 'i-mingcute-settings-2-line '}
            />
          </Popup>
          <Dropdown
            maxColumnWidth="160"
            placement="bottom-right"
            trigger="click"
            options={[
              {
                icon: 'i-mingcute-copy-2-line',
                onClick: () => {
                  navigator.clipboard.writeText(model).then(() => {
                    message.success(t('common.copied'));
                  });
                },
                text: t('common.copy_id'),
              },
              {
                icon:
                  !modelDetail.link ||
                  modelDetail.link.startsWith('https://huggingface.co/')
                    ? 'i-logos-hugging-face-icon'
                    : 'i-mingcute-external-link-line',
                onClick: () => {
                  if (modelDetail.link) {
                    window.open(modelDetail.link, '_blank');
                    return;
                  }
                  window.open('https://huggingface.co/' + model, '_blank');
                },
                text: t('common.details'),
                hidden: modelDetail?.isCustom && !modelDetail.link,
              },
              {
                icon: 'i-mingcute-broom-line',
                onClick: () => onStop(true),
                text: t('common.clear'),
              },
              {
                icon: 'i-mingcute-close-line',
                danger: true,
                disabled: activeModels.length === 1,
                onClick: onClose,
                text: t('common.close'),
              },
            ]
              .filter(item => !item.hidden)
              .map(item => ({
                prefixIcon: <i className={item.icon + ' mr-0'} />,
                content: item.text,
                onClick: item.onClick,
                disabled: item.disabled,
                value: item.text,
              }))}
          >
            <i className={iconClassName + 'i-mingcute-more-2-fill'}></i>{' '}
          </Dropdown>
        </div>
      )}

      {messages.length == 0 ? (
        <ChatHolder model={model} />
      ) : (
        <div
          className={
            'w-full flex flex-col h-full overflow-auto ' +
            (plain || isZenMode ? ' pt-2 px-2' : ' pt-12 px-2 text-sm ')
          }
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <Fragment key={`${message.chatId}-ai-${model}`}>
              <UserMessage
                content={message.user}
                evaluate={!!message.evaluate}
                image={message.image}
              />
              <AiMessage
                plain={plain}
                model={model}
                chatId={message.chatId}
                info={getChatMessageInfo(model, message.chatId)}
                isLast={index === messages.length - 1}
                content={message.ai}
                evaluate={message.evaluate}
              />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
