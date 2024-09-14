import { useEffect, Fragment } from 'react';
import AiMessage from '../AiMessage';
import UserMessage from '../UserMessage';
import ChatHolder from '../ChatHolder';
import { Select, Tag, Popup, Button } from 'tdesign-react';
import { getAllTextModels, SILICON_MODELS_IDS } from '../../utils/models';
import { useActiveModels } from '../../store/app';
import { useChatMessages, useSingleChat } from '../../utils/chat';
import ChatOptionAdjust from '../ChatOptionAdjust';
import { useAutoScrollToBottomRef, useRefresh } from '../../utils/use';
import ScLogo from '../../assets/img/sc-logo.png';
import { useRef } from 'react';

export default function ({ model, plain = false }) {
  const messages = useChatMessages(model);
  const { activeModels, setActiveModels, removeActiveModel } =
    useActiveModels();
  const allTextModels = getAllTextModels();
  const modelOptions = allTextModels.filter(
    item => model === item.id || !activeModels.includes(item.id)
  );
  const modelDetail = allTextModels.find(item => item.id === model) || {};
  const hasActiveCustomModel = activeModels.some(
    item =>
      !SILICON_MODELS_IDS.includes(item) &&
      modelDetail.series?.startsWith(item.split('/')[0])
  );

  useEffect(() => {
    if (!modelDetail.id) {
      // 模型有可能不再提供了，或者自定义模型被删除了
      removeActiveModel(model);
    }
  }, [model]);
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
    if (!plain && isMouseOver.current) return;
    if (messages.length > 0);
    {
      scrollToBottom();
    }
  }, [messages, isMouseOver]);
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
            'h-10 z-20 rounded filter  backdrop-blur overflow-hidden items-center px-2  flex absolute top-0 left-0 right-0 bg-[#fff8] dark:bg-[#0008] shadow-sm'
          }
        >
          <Select
            className="flex-1 w-0"
            borderless
            prefixIcon={
              <div className="relative">
                <img
                  src={modelDetail.icon}
                  className="relative w-4 h-4 rounded-sm"
                />
                {hasActiveCustomModel && !modelDetail?.isCustom && (
                  <img
                    className="absolute -bottom-[2px] -right-[2px] w-[8px] h-[8px]"
                    src={ScLogo}
                  />
                )}
              </div>
            }
            filterable
            filter={(value, option, ...rest) =>
              option['data-keywords'].includes(value.toLowerCase())
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
                data-keywords={(option.id + option.keywords).toLowerCase()}
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <img
                      src={option.icon}
                      className="w-[14px] h-[14px] rounded-sm mr-1"
                      alt={option.name}
                    />
                    <span>{option.name}</span>
                    {option.price === 0 && (
                      <Tag
                        className="ml-2 scale-[0.8]"
                        size="small"
                        theme="primary"
                      >
                        Free
                      </Tag>
                    )}
                    {!!option.isCustom && (
                      <Tag
                        className="scale-[0.8]"
                        size="small"
                        theme="warning"
                        variant="light-outline"
                      >
                        Custom
                      </Tag>
                    )}
                  </div>
                  <div className="flex items-center">
                    {!!option.series && (
                      <Tag variant="outline" size="small" theme="primary">
                        {option.series}
                      </Tag>
                    )}
                    {!!option.length && (
                      <Tag
                        variant="outline"
                        size="small"
                        theme="primary"
                        className="ml-2"
                      >
                        {option.length}K
                      </Tag>
                    )}
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
                    {option.needVerify && (
                      <Tag
                        className="ml-2"
                        variant="outline"
                        size="small"
                        theme="primary"
                      >
                        需实名
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
                  ...(!modelDetail?.isCustom || modelDetail?.link
                    ? [
                        {
                          icon:
                            !modelDetail.link ||
                            modelDetail.link.startsWith(
                              'https://huggingface.co/'
                            )
                              ? 'i-logos-hugging-face-icon'
                              : 'i-mingcute-external-link-line',
                          onClick: () => {
                            if (modelDetail.link) {
                              window.open(modelDetail.link, '_blank');
                              return;
                            }
                            window.open(
                              'https://huggingface.co/' + model,
                              '_blank'
                            );
                          },
                          text: '详情',
                        },
                      ]
                    : []),
                  {
                    icon: 'i-mingcute-broom-line',
                    onClick: () => onStop(true),
                    text: '清空',
                  },
                  {
                    icon: 'i-mingcute-close-line',
                    danger: true,
                    disabled: activeModels.length === 1,
                    onClick: onClose,
                    text: '关闭',
                  },
                ].map(item => (
                  <Button
                    key={item.text}
                    onClick={item.onClick}
                    disabled={item.disabled}
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
        </div>
      )}

      {messages.length == 0 ? (
        <ChatHolder />
      ) : (
        <div
          className={
            'w-full flex flex-col h-full overflow-auto ' +
            (plain ? 'px-4' : ' pt-12 px-2 text-sm ')
          }
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <Fragment key={`${message.chatId}-ai-${model}`}>
              <UserMessage
                content={message.user}
                evaluate={!!message.evaluate}
              />
              <AiMessage
                plain={plain}
                model={model}
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
