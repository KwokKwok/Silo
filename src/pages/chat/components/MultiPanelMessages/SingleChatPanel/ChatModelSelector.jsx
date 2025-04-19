import { Select } from 'tdesign-react';
import { getAllTextModels, isSiliconModel } from '@src/utils/models';
import { useActiveModels } from '@src/store/app';
import ScLogo from '@src/assets/img/sc-logo.png';
import { GUIDE_STEP } from '@src/utils/types';
import ModelOption from '@src/components/ModelOption';

export default function ({ model }) {
  const { activeModels, setActiveModels } = useActiveModels();
  const allTextModels = getAllTextModels();
  const modelOptions = allTextModels.filter(
    item => model === item.id || !activeModels.includes(item.id)
  );
  const modelDetail = allTextModels.find(item => item.id === model) || {};

  const hasActiveCustomModel = activeModels.some(
    item =>
      !isSiliconModel(item) &&
      modelDetail.series?.startsWith(item.split('/')[0])
  );

  const onModelChange = newModel => {
    const index = activeModels.indexOf(model);
    const newModels = [...activeModels];
    newModels.splice(index, 1, newModel);
    setActiveModels(newModels);
  };

  return (
    <Select
      className={GUIDE_STEP.CLASS_CHAT_MODEL_SELECT + ' flex-1 w-0'}
      borderless
      prefixIcon={
        <div className="relative">
          <img src={modelDetail.icon} className="relative w-4 h-4 rounded-sm" />
          {hasActiveCustomModel && !modelDetail?.isCustom && (
            <img
              className="absolute -bottom-[2px] -right-[2px] w-[8px] h-[8px]"
              src={ScLogo}
            />
          )}
        </div>
      }
      filterable
      filter={(value, option) =>
        option['data-keywords'].includes(value.toLowerCase())
      }
      value={model}
      placeholder=" "
      onChange={onModelChange}
    >
      {modelOptions.map(option => (
        <Select.Option
          style={{ height: '60px' }}
          key={option.id}
          value={option.id}
          label={option.name}
          data-keywords={(option.id + option.keywords).toLowerCase()}
        >
          <ModelOption option={option} />
        </Select.Option>
      ))}
    </Select>
  );
}
