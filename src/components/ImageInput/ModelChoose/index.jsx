import React from 'react';
import { Tag, Button } from 'tdesign-react';
import { getImageModels } from '../../../utils/models';
import { useLocalStorageJSONAtom } from '../../../store/storage';
import ConfigOptions from './ConfigOptions'; // 新增导入
import { useRef } from 'react';
import Tooltip from '../../MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';
import { LOCAL_STORAGE_KEY } from '@src/utils/types';

const ModelChoose = ({ onGenerate, onBack }) => {
  const { t } = useTranslation();
  const [selectedModels, setSelectedModels] = useLocalStorageJSONAtom(
    LOCAL_STORAGE_KEY.ACTIVE_IMAGE_MODELS
  );
  const configModelRef = useRef();

  return (
    <div className="model-choose">
      <div className="flex flex-wrap gap-4 justify-center">
        {getImageModels().map(option => {
          const isSelected = selectedModels.includes(option.id);
          return (
            <div
              key={option.id}
              className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary bg-primary-light dark:bg-primary-dark'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => {
                const newSelectedModels = isSelected
                  ? selectedModels.filter(id => id !== option.id)
                  : [...selectedModels, option.id];
                setSelectedModels(newSelectedModels);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="bg-white  rounded-sm p-1">
                  <img
                    src={option.icon}
                    className="w-4 h-4 rounded-sm"
                    alt={option.name}
                  />
                </div>
                <Tooltip content={t('image.config_options')}>
                  <i
                    className="i-mingcute-settings-2-line text-xl text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      configModelRef.current.open(option.id);
                    }}
                  />
                </Tooltip>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{option.name}</span>
                <div className="flex items-center mt-1">
                  {!!option.series && (
                    <Tag
                      variant="outline"
                      size="small"
                      theme="primary"
                      className="mr-1"
                    >
                      {option.series}
                    </Tag>
                  )}
                  {option.price === 0 && (
                    <Tag size="small" theme="primary" className="mr-1">
                      Free
                    </Tag>
                  )}
                  {option.price === -1 && (
                    <Tag size="small" theme="primary" className="mr-1">
                      Trial
                    </Tag>
                  )}
                  {option.isPro && (
                    <Tag size="small" theme="warning" className="mr-0">
                      Pro
                    </Tag>
                  )}

                  <i
                    className="ri--links-fill iconify ml-2"
                    onClick={() => {
                      window.open(
                        'https://huggingface.co/' + option.id,
                        '_blank'
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ConfigOptions ref={configModelRef} />
      <div className="flex items-center justify-center pb-12 mt-8">
        <Button variant="outline" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          variant="outline"
          theme="primary"
          className="ml-4"
          onClick={onGenerate}
        >
          {t('image.start_generate')}
        </Button>
      </div>
    </div>
  );
};

export default ModelChoose;
