import { useEffect, Fragment } from 'react';
import AiMessage from '../AiMessage';
import UserMessage from '../UserMessage';
import ChatHolder from '../ChatHolder';
import { Select, Tag, Popup, Button } from 'tdesign-react';
import TEXT_MODEL_LIST, { getModelIcon } from '../../utils/models';
import { useActiveModels } from '../../store/app';
import { useChatMessages, useSingleChat } from '../../utils/chat';
import ChatOptionAdjust from '../ChatOptionAdjust';
import { useAutoScrollToBottomRef, useRefresh } from '../../utils/use';
import { useRef } from 'react';

export default function ({ model }) {
  const messages = useChatMessages(model);
  const { activeModels, setActiveModels, removeActiveModel } =
    useActiveModels();
  const modelOptions = TEXT_MODEL_LIST.filter(
    item => model === item.id || !activeModels.includes(item.id)
  );
  const modelDetail = TEXT_MODEL_LIST.find(item => item.id === model);

  const chat = useSingleChat(model);

  const onClose = () => {
    removeActiveModel(model);
  };

  const refreshControl = useRefresh();

  const onStop = () => {
    // 根据状态判断是停止还是清理
    chat.stop(!chat.loading);
    // 用的引用，需要手动刷新
    refreshControl.refresh();
  };

  const onModelChange = newModel => {
    const index = activeModels.indexOf(model);
    const newModels = [...activeModels];
    newModels.splice(index, 1, newModel);
    setActiveModels(newModels);
  };

  const isMouseOver = useRef(false);
  const toggleMouseOver = value => {
    isMouseOver.current = value;
  };
  const iconClassName = 'cursor-pointer text-lg opacity-70 ml-2 flex-shrink-0 ';
  const { scrollRef, scrollToBottom } = useAutoScrollToBottomRef();
  useEffect(() => {
    if (isMouseOver.current) return;
    if (messages.length > 0);
    {
      scrollToBottom();
    }
  }, [messages, isMouseOver]);
  return (
    <div
      data-model={model}
      className="flex-1 min-w-96 w-0 flex-shrink-0 relative mr-2 first:ml-2 rounded-md border-2 border-gray-200 dark:border-gray-950 h-full"
      onMouseOver={() => toggleMouseOver(true)}
      onMouseOut={() => toggleMouseOver(false)}
    >
      <div className="h-10 z-20 rounded filter bg-[#fff8] dark:bg-[#0008] backdrop-blur overflow-hidden items-center px-2 shadow-sm flex absolute top-0 left-0 right-0">
        <Select
          className="flex-1 w-0"
          borderless
          prefixIcon={
            <img src={getModelIcon(model)} className="w-4 h-4 rounded-sm" />
          }
          filterable
          filter={(value, option) =>
            option.value.toLowerCase().includes(value.toLowerCase())
          }
          value={model}
          placeholder=" "
          onChange={onModelChange}
        >
          {modelOptions.map((option, idx) => (
            <Select.Option
              style={{ height: '60px' }}
              key={idx}
              value={option.id}
              label={option.name}
            >
              <div className="flex flex-col">
                <div className="flex items-center">
                  <img
                    src={option.icon}
                    className="w-[14px] h-[14px] rounded-sm mr-1"
                    alt={option.name}
                  />
                  <span>{option.name}</span>
                  {!option.price ? (
                    // <span className="text-[10px] leading-[12px] ml-2 px-1 rounded-sm bg-blue-950 text-white dark:bg-white dark:text-black">
                    //   Free
                    // </span>
                    <Tag
                      className="ml-2 scale-[0.8]"
                      size="small"
                      theme="primary"
                    >
                      Free
                    </Tag>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex items-center">
                  <Tag variant="outline" size="small" theme="primary">
                    {option.series}
                  </Tag>
                  <Tag
                    variant="outline"
                    size="small"
                    theme="primary"
                    className="ml-2"
                  >
                    {option.length}K
                  </Tag>
                  {!!option.price && (
                    <Tag
                      className="ml-2"
                      variant="outline"
                      size="small"
                      theme="primary"
                    >
                      ¥{option.price}/1M
                    </Tag>
                  )}
                </div>
              </div>
            </Select.Option>
          ))}
        </Select>

        <i
          className={iconClassName + ' sortable-drag i-mingcute-move-line'}
        ></i>
        <Popup
          content={<ChatOptionAdjust model={model} />}
          placement="bottom-right"
          showArrow
          trigger="click"
        >
          <i className={iconClassName + 'i-mingcute-settings-2-line '} />
        </Popup>
        <Popup
          content={
            <div className="flex flex-col">
              {[
                {
                  icon: 'i-logos-hugging-face-icon',
                  onClick: () => {
                    window.open('https://huggingface.co/' + model, '_blank');
                  },
                  text: '详情',
                },
                {
                  icon: 'i-mingcute-broom-line',
                  onClick: () => onStop(true),
                  text: '清空',
                },
                {
                  icon: 'i-mingcute-close-line',
                  danger: true,
                  onClick: onClose,
                  text: '关闭',
                },
              ].map(item => (
                <Button
                  key={item.text}
                  onClick={item.onClick}
                  theme={item.danger ? 'danger' : 'default'}
                  variant="text"
                  icon={<i className={item.icon + ' mr-2'} />}
                >
                  {item.text}
                </Button>
              ))}
            </div>
          }
          placement="bottom-right"
          showArrow
          trigger="click"
        >
          <i className={iconClassName + 'i-mingcute-more-2-fill'}></i>
        </Popup>
        {/* <i
          className={iconClassName + 'i-mingcute-close-line'}
          onClick={onClose}
        ></i> */}
      </div>

      {messages.length == 0 ? (
        <ChatHolder />
      ) : (
        <div
          className="w-full pt-12 text-sm flex flex-col h-full overflow-auto px-2"
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <Fragment key={`${message.chatId}-ai-${model}`}>
              <UserMessage content={message.user} />
              <AiMessage
                model={model}
                isLast={index === messages.length - 1}
                content={message.ai}
              />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
