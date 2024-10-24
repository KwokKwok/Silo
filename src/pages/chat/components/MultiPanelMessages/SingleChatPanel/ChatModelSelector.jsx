import { Select, Tag } from 'tdesign-react';
import { getAllTextModels, SILICON_MODELS_IDS } from '@src/utils/models';
import { useActiveModels } from '@src/store/app';
import ScLogo from '@src/assets/img/sc-logo.png';
import { useTranslation } from 'react-i18next';
import { GUIDE_STEP } from '@src/utils/types';

export default function ({ model }) {
  const { t } = useTranslation();
  const { activeModels, setActiveModels } = useActiveModels();
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
          <div className="flex flex-col">
            <div className="flex items-center">
              <img
                src={option.icon}
                className="w-[14px] h-[14px] rounded-sm mr-1"
                alt={option.name}
              />
              <span>{option.name}</span>
              {option.price === -1 && (
                <Tag className="ml-2 scale-[0.8]" size="small" theme="primary">
                  Trial
                </Tag>
              )}
              {option.price === 0 && (
                <Tag className="ml-2 scale-[0.8]" size="small" theme="primary">
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
              {option.price > 0 && (
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
                  {t('common.auth_required')}
                </Tag>
              )}
              {option.isPro && (
                <Tag
                  size="small"
                  variant="outline"
                  theme="primary"
                  className="ml-2"
                >
                  {t('common.pro')}
                </Tag>
              )}
              {option.vision && (
                <Tag
                  size="small"
                  variant="outline"
                  theme="warning"
                  className="ml-2"
                >
                  {t('common.vision')}
                </Tag>
              )}
              {option.isVendorA && (
                <Tag
                  size="small"
                  variant="outline"
                  theme="success"
                  className="ml-2"
                >
                  {t('common.china_vendor')}
                </Tag>
              )}
            </div>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
}
