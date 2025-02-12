import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Button, Checkbox, Radio } from 'tdesign-react';
import { getAllTextModels } from '@src/utils/models';
import { useActiveModels } from '@src/store/app';
import ModelOption from '@src/components/ModelOption';
import './index.scss';

const MobileModelSelector = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { activeModels, setActiveModels } = useActiveModels();
  const [selectedModels, setSelectedModels] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // 打开弹框时，初始化已选择的模型
  useImperativeHandle(ref, () => ({
    open: () => {
      setSelectedModels([...activeModels]);
      setVisible(true);
    },
  }));

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    setActiveModels(selectedModels);
    handleClose();
  };

  const handleModelToggle = (modelId, checked) => {
    if (checked) {
      setSelectedModels(prev => [...prev, modelId]);
    } else {
      setSelectedModels(prev => prev.filter(id => id !== modelId));
    }
  };

  const allTextModels = getAllTextModels();

  const filterOptions = [
    { value: 'all', label: 'All', filter: () => true },
    {
      value: 'vision',
      label: 'VLM',
      filter: model => model.vision,
    },
    {
      value: 'free',
      label: 'Free',
      filter: model => model.price <= 0,
    },
    {
      value: 'domestic',
      label: t('common.china_vendor'),
      filter: model => model.isVendorA,
    },
    {
      value: 'auth',
      label: t('common.auth_required'),
      filter: model => model.needVerify,
    },
  ];

  const filteredModels = allTextModels.filter(
    filterOptions.find(f => f.value === activeFilter)?.filter
  );

  return (
    <Drawer
      visible={visible}
      onClose={handleClose}
      placement="bottom"
      header={t('common.select_models')}
      footer={
        <div className="flex justify-end items-center gap-2">
          <span className="mr-auto">
            {selectedModels.length} / {allTextModels.length}
          </span>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            theme="primary"
            onClick={handleConfirm}
            disabled={selectedModels.length === 0}
          >
            {t('common.confirm')}
          </Button>
        </div>
      }
      closeOnOverlayClick
      size="88dvh"
      className="mobile-model-selector"
    >
      <div className="flex flex-col h-full">
        {/* 模型列表 */}
        <div className="flex-1 px-4 pb-4 pt-2 overflow-y-auto">
          {filteredModels.map(model => (
            <div key={model.id} className="py-2">
              <Checkbox
                value={model.id}
                onChange={checked => handleModelToggle(model.id, checked)}
                checked={selectedModels.includes(model.id)}
              >
                <div className="flex items-center">
                  <ModelOption option={model} />
                </div>
              </Checkbox>
            </div>
          ))}
        </div>
        {/* 过滤器 */}
        <div className="border-gray-200 px-2 py-2 shadow-[0_-8px_12px_-2px_rgba(0,0,0,0.2),0_-4px_8px_-2px_rgba(0,0,0,0.12)]">
          <Radio.Group
            className="w-full"
            value={activeFilter}
            onChange={value => setActiveFilter(value)}
            variant="default-filled"
          >
            {filterOptions.map(option => (
              <Radio.Button key={option.value} value={option.value}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>
    </Drawer>
  );
});

export default MobileModelSelector;
