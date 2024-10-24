import { Dialog, Button, Select, InputNumber, Slider } from 'tdesign-react';
import { useImageModelOptions } from '@src/utils/options/image-options';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';
import { useState } from 'react';
import Tooltip from '@src/components/MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';

const ConfigOptions = forwardRef(({}, ref) => {
  const { t } = useTranslation();
  const [modelId, setModelId] = useState();
  const [visible, setVisible] = useState(false);
  const {
    options: currentConfig,
    setOption,
    configItems,
    applyToAll,
  } = useImageModelOptions(modelId);
  useImperativeHandle(ref, () => ({
    open: modelId => {
      setModelId(modelId);
      setVisible(true);
    },
  }));
  const onHide = () => setVisible(false);

  const renderInputComponent = option => {
    switch (option.type) {
      case 'input_number':
        return (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{t(option.label)}</span>
                <Tooltip content={t(option.tooltip)}>
                  <i className="i-ri-question-line ml-2 cursor-pointer block"></i>
                </Tooltip>
              </div>
              <InputNumber
                value={currentConfig[option.prop]}
                onChange={value => setOption(option.prop, value)}
                min={option.min}
                max={option.max}
                step={option.step}
              />
            </div>
            <Slider
              value={currentConfig[option.prop]}
              onChange={value => setOption(option.prop, value)}
              min={option.min}
              max={option.max}
              step={option.step}
              style={{ marginTop: '10px' }}
            />
          </div>
        );
      case 'rect_select':
        return (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{t(option.label)}</span>
                <Tooltip content={t(option.tooltip)}>
                  <i className="i-ri-question-line ml-2 cursor-pointer block"></i>
                </Tooltip>
              </div>
              <Select
                value={currentConfig[option.prop]}
                onChange={value => setOption(option.prop, value)}
                style={{ width: '150px' }}
              >
                {option.options.map(size => (
                  <Select.Option key={size.value} value={size.value}>
                    {size.value}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}
            >
              {option.options.map(size => (
                <div
                  key={size.value}
                  style={{
                    width: '50px',
                    height: '50px',
                    margin: '5px',
                    border:
                      currentConfig[option.prop] === size.value
                        ? '2px solid var(--td-brand-color)'
                        : '1px solid var(--td-component-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'var(--td-bg-color-container)',
                  }}
                  onClick={() => setOption(option.prop, size.value)}
                >
                  <div
                    style={{
                      width: `${(size.x / Math.max(size.x, size.y)) * 40}px`,
                      height: `${(size.y / Math.max(size.x, size.y)) * 40}px`,
                      backgroundColor: 'var(--td-component-stroke)',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderInputWithTooltip = option => (
    <div
      key={option.prop}
      className="input-group"
      style={{ marginBottom: '20px' }}
    >
      {renderInputComponent(option)}
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onClose={onHide}
      onEscKeydown={onHide}
      header={`${modelId}`}
      footer={
        <div className="flex justify-end">
          <Tooltip content={t('common.apply_to_all_tooltip')}>
            <Button theme="default" variant="text" onClick={applyToAll}>
              {t('common.apply_to_all')}
            </Button>
          </Tooltip>
          <Button
            className="ml-2"
            theme="primary"
            variant="outline"
            onClick={onHide}
          >
            {t('common.confirm')}
          </Button>
        </div>
      }
      style={{ padding: '16px' }}
    >
      <div className="px-2 pt-2">
        {visible && configItems.map(renderInputWithTooltip)}
      </div>
    </Dialog>
  );
});
export default ConfigOptions;
