import { Slider } from 'tdesign-react';
import { InputNumber } from 'tdesign-react';
import { useChatOptions } from '../utils/options/chat-options';
import Tooltip from './MobileCompatible/Tooltip';
import { Button } from 'tdesign-react';
import { useTranslation } from 'react-i18next';

export default function ({ model }) {
  const { t } = useTranslation();
  const { options, onPropChange, onApplyToAll } = useChatOptions(model);
  return (
    <div className="flex flex-col !w-64 p-1">
      {options.map(option => (
        <div key={option.prop} className="flex flex-col">
          <div className="flex items-center">
            <span>{t(option.name)}</span>
            <Tooltip
              content={t(option.tooltip)}
              placement="top"
              showArrow={false}
            >
              <i className="i-mingcute-information-fill ml-2 mt-2" />
            </Tooltip>
            <InputNumber
              size="small"
              className="ml-auto !w-16 !text-center"
              placeholder=" "
              theme="normal"
              step={option.step}
              value={option.value}
              onChange={value => onPropChange(option.prop, value)}
            />
          </div>
          <Slider
            className="mb-2 mt-1"
            min={Math.min(option.min, option.value)}
            max={Math.max(option.max, option.value)}
            step={option.step}
            value={option.value}
            onChange={value => onPropChange(option.prop, value)}
          />
        </div>
      ))}
      <div className="flex justify-end mt-2">
        <Button
          theme="default"
          variant="outline"
          size="small"
          onClick={onApplyToAll}
        >
          {t('应用到全部')}
        </Button>
      </div>
    </div>
  );
}
