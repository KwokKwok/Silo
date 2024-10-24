import { GUIDE_STEP, LOCAL_STORAGE_KEY } from '@src/utils/types';
import React from 'react';
import { useEffect } from 'react';
import { Guide } from 'tdesign-react';
import 'tdesign-react/es/style/index.css';
import { mockClick, mockInput } from './utils';
import { useLocalStorageAtom } from '@src/store/storage';
import { useTranslation } from 'react-i18next';

const AppGuide = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = React.useState(0);
  const [_noGuide, setNoGuide] = useLocalStorageAtom(
    LOCAL_STORAGE_KEY.FLAG_NO_GUIDE
  );

  const steps = [
    {
      element: `#${GUIDE_STEP.INPUT_SELECT_SYSTEM_PROMPT}`,
      title: t('guide.use_system_prompt'),
      body: t('guide.use_system_prompt_desc'),
      placement: 'top-left',
    },
    {
      element: `#${GUIDE_STEP.CHAT_INPUT_SHORTCUTS}`,
      title: t('guide.shortcuts'),
      body: t('guide.shortcuts_desc'),
      placement: 'top-left',
    },
    {
      element: `.t-popup.t-select__dropdown`,
      title: t('guide.model_select'),
      body: t('guide.model_select_desc'),
      placement: 'bottom-left',
    },
    {
      element: `#${GUIDE_STEP.CHAT_OPTIONS_MODAL}`,
      title: t('guide.chat_options'),
      body: t('guide.chat_options_desc'),
      placement: 'bottom-right',
    },
    {
      element: `#${GUIDE_STEP.HEADER_MORE_FUNCTION}`,
      title: t('guide.more_functions'),
      body: t('guide.more_functions_desc'),
      placement: 'bottom-left',
    },
  ];

  const handleChange = current => {
    if (current === 1) {
      mockInput(GUIDE_STEP.CHAT_INPUT, '/');
      setTimeout(() => {
        setCurrent(1);
      }, 50);
      return;
    } else if (current === 2) {
      mockInput(GUIDE_STEP.CHAT_INPUT, '');
      mockClick(`.${GUIDE_STEP.CLASS_CHAT_MODEL_SELECT} .t-input__inner`);
      setTimeout(() => {
        setCurrent(2);
      }, 50);
      return;
    } else if (current === 3) {
      mockClick(GUIDE_STEP.CHAT_OPTIONS_ADJUST);
      setTimeout(() => {
        setCurrent(3);
      }, 50);
      return;
    }

    setCurrent(current);
  };

  const onEnd = () => {
    setNoGuide(true);
  };
  return (
    <div>
      <Guide
        current={current}
        steps={steps}
        onChange={handleChange}
        onFinish={onEnd}
        onSkip={onEnd}
      />
      {/* <button id={GUIDE_STEP.INPUT_SELECT_SYSTEM_PROMPT}>选择系统提示</button> */}
    </div>
  );
};

export default AppGuide;
