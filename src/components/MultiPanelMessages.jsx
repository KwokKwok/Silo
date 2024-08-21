import { useEffect, Fragment } from 'react';
import AiMessage from './AiMessage';
import UserMessage from './UserMessage';
import ChatHolder from './ChatHolder';
import { Select, Tag, Popup } from 'tdesign-react';
import TEXT_MODEL_LIST from '../utils/models';
import { useActiveModels } from '../store/app';
import { useChatMessages, useSingleChat } from '../utils/chat';
import ChatOptionAdjust from './ChatOptionAdjust';
import { useAutoScrollToBottomRef, useRefresh } from '../utils/use';
import { useRef } from 'react';

/**
 * 越来越重，后续可能需要拆分
 */
function SinglePanel({ model }) {
  const messages = useChatMessages(model);
  const { activeModels, setActiveModels, removeActiveModel } =
    useActiveModels();
  const modelOptions = TEXT_MODEL_LIST.filter(
    item => model === item.id || !activeModels.includes(item.id)
  );

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
      className="flex-1 w-0 flex-shrink-0 relative mr-2 first:ml-2 rounded-md border-2 border-gray-200 dark:border-gray-950 h-full"
      onMouseOver={() => toggleMouseOver(true)}
      onMouseOut={() => toggleMouseOver(false)}
    >
      <div className="h-10 z-20 rounded filter bg-[#fff8] dark:bg-[#0008] backdrop-blur overflow-hidden items-center px-2 shadow-sm flex absolute top-0 left-0 right-0">
        <Select
          className="flex-1 w-0"
          borderless
          filterable
          filter={(value, option) => option.value.includes(value)}
          value={model}
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
          className={
            iconClassName +
            (chat.loading
              ? 'i-mingcute-pause-circle-line'
              : 'i-mingcute-broom-line')
          }
          onClick={onStop}
        >
          {chat.loading ? '停止' : '清除'}
        </i>
        <Popup
          content={<ChatOptionAdjust model={model} />}
          placement="bottom-right"
          showArrow
          trigger="click"
        >
          <i className={iconClassName + 'i-mingcute-settings-2-line '} />
        </Popup>
        <i
          className={iconClassName + 'i-mingcute-close-line'}
          onClick={onClose}
        ></i>
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

export default function () {
  const { activeModels: models } = useActiveModels();
  let modelArr = [models];
  // 将 chats 处理成多行。4个及以上偶数分两行。其他情况均为单行
  if (models.length >= 4 && models.length % 2 === 0) {
    const _models = [...models];
    const count = models.length / 2;
    modelArr = [_models.slice(0, count), _models.slice(count)];
  }

  return (
    <div className="flex flex-col h-full">
      {modelArr.map(line => (
        <div key={line.join(',')} className="flex-1 h-0 flex last:mt-2">
          {line.map(model => (
            <SinglePanel key={model} model={model} />
          ))}
        </div>
      ))}
    </div>
  );
}
