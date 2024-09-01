import { Slider } from 'tdesign-react';
import { TooltipLite } from 'tdesign-react';
import { InputNumber } from 'tdesign-react';
import { useChatOptions } from '../utils/options/chat-options';
import Tooltip from './MobileCompatible/Tooltip';

export default function ({ model }) {
  const [options, onPropChange] = useChatOptions(model);
  return (
    <div className="flex flex-col !w-64 p-1">
      {options.map(option => (
        <div key={option.prop} className="flex flex-col">
          <div className="flex items-center">
            <span>{option.name}</span>
            <Tooltip
              content={option.tooltip}
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
              allowInputOverLimit={false}
              step={option.step}
              min={option.min}
              max={option.max}
              value={option.value}
              onChange={value => onPropChange(option.prop, value)}
            />
          </div>
          <Slider
            className="mb-2 mt-1"
            min={option.min}
            max={option.max}
            step={option.step}
            value={option.value}
            onChange={value => onPropChange(option.prop, value)}
          />
        </div>
      ))}
    </div>
  );
}
