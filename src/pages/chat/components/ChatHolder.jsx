import { useTranslation } from 'react-i18next';
import EmptyImg from '@src/assets/img/empty.svg';
import { CHAT_PLACEHOLDER_TEXT } from '@src/utils/types';

/**
 * 用于存储每个模型的占位符文本，避免随机刷新
 */
const _holderText = {};
let _remainText = [...CHAT_PLACEHOLDER_TEXT];

const getRandomChatPlaceHolderText = model => {
  if (!_holderText[model]) {
    _holderText[model] = _remainText.splice(
      Math.floor(Math.random() * _remainText.length),
      1
    )[0];
    if (_remainText.length === 0) {
      _remainText = [...CHAT_PLACEHOLDER_TEXT];
    }
  }
  return _holderText[model];
};

export default function ({ text, children, img, model }) {
  const { t } = useTranslation();
  return (
    <div className="w-full flex flex-col items-center justify-center h-full px-4 select-none">
      <img src={img || EmptyImg} alt="empty" className="max-h-28 max-w-1/2" />
      {!children && (
        <p className="text-[#666] mt-4 text-sm text-center">
          {typeof text === 'string'
            ? text
            : t(getRandomChatPlaceHolderText(model))}
        </p>
      )}
      {children}
    </div>
  );
}
