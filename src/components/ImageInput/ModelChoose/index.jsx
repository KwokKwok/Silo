import React from 'react';
import { Tag, Button } from 'tdesign-react';
import { getImageModels } from '../../../utils/models';
import { useActiveImageModels } from '../../../store/storage';
import ConfigOptions from './ConfigOptions'; // 新增导入
import { useRef } from 'react';
import Tooltip from '../../MobileCompatible/Tooltip';

const ModelChoose = ({ onGenerate, onBack }) => {
  const [selectedModels, setSelectedModels] = useActiveImageModels();
  const configModelRef = useRef();

  return (
    <div className="model-choose">
      <div className="flex flex-wrap gap-4 justify-center">
        {getImageModels().map(option => {
          const isSelected = selectedModels.includes(option.id);
          return (
            <div
              key={option.id}
              className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
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
                <Tooltip content="编辑配置">
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
                  {option.price === 0 && (
                    <Tag size="small" theme="primary" className="mr-1">
                      免费
                    </Tag>
                  )}
                  {!!option.series && (
                    <Tag variant="outline" size="small" theme="primary">
                      {option.series}
                    </Tag>
                  )}
                  <i
                    className="i-logos-hugging-face-icon opacity-30 hover:opacity-100 transition-opacity ml-2"
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
      <div className="mt-2 flex items-center justify-center pb-12 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
        >
          返回
        </Button>
        <Button
          variant="outline"
          theme="primary"
          className="ml-4"
          onClick={onGenerate}
        >
          开始生成
        </Button>
      </div>
    </div>
  );
};

export default ModelChoose;
