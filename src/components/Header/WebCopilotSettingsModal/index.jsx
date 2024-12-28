import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Drawer, Button, Textarea, Space } from 'tdesign-react';
import { getAllTextModels } from '@src/utils/models';

import { useTranslation } from 'react-i18next';
import ModelOption from '@src/components/ModelOption';
import { Select } from 'tdesign-react';
import {
  useLocalStorageAtom,
  useLocalStorageJSONAtom,
} from '@src/store/storage';
import { LOCAL_STORAGE_KEY } from '@src/utils/types';
const allTextModels = getAllTextModels();

const WebCopilotSettings = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [activeModels, setActiveModels] = useLocalStorageJSONAtom(
    LOCAL_STORAGE_KEY.WORD_EXPLAINER_ACTIVE_MODELS
  );
  const [activePrompt, setActivePrompt] = useLocalStorageAtom(
    LOCAL_STORAGE_KEY.WORD_EXPLAINER_PROMPT
  );

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  useEffect(() => {
    setSelectedModels(activeModels);
    setPrompt(activePrompt);
  }, [activeModels, activePrompt]);

  const handleSave = () => {
    if (selectedModels.length === 0) {
      return;
    }
    setActiveModels(selectedModels);
    setActivePrompt(prompt);
    setIsOpen(false);
  };

  return (
    <Drawer
      placement="top"
      size="72dvh"
      closeOnOverlayClick={false}
      visible={isOpen}
      onClose={() => setIsOpen(false)}
      header={t('webCopilot.settings')}
      footer={
        <Space className="flex justify-end items-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button theme="primary" onClick={handleSave}>
            {t('common.confirm')}
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">
            {t('webCopilot.selectModel')}
          </div>
          <Select
            className="!w-full"
            filterable
            filter={(value, option) =>
              option['data-keywords'].includes(value.toLowerCase())
            }
            value={selectedModels}
            placeholder=""
            multiple
            onChange={setSelectedModels}
          >
            {allTextModels.map(option => (
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
        </div>

        <div>
          <div className="text-sm font-medium mb-2">
            {t('webCopilot.prompt')}
          </div>
          <Textarea
            value={prompt}
            onChange={value => setPrompt(value)}
            autosize={{ minRows: 4, maxRows: 8 }}
          />
        </div>
      </div>
    </Drawer>
  );
});

export default WebCopilotSettings;
