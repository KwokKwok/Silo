import { Textarea } from 'tdesign-react';
import { Form, Input, Select } from 'tdesign-react';
import CUSTOM_MODEL_PRESET from './preset';
import { InputNumber } from 'tdesign-react';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';
import { removeCustomModel, saveCustomModel } from './helper';
import { getCustomModels } from '@src/utils/models';
import { useState } from 'react';
import { Button } from 'tdesign-react';
import { CUSTOM_PRESET_PREFIX } from '@src/utils/types';
import { useMemo } from 'react';
import { isBrowserExtension } from '@src/utils/utils';
import { useTranslation } from 'react-i18next';
import { Switch } from 'tdesign-react';
import { useIsMobile } from '@src/utils/use';
const { FormItem } = Form;

const ID_REGEX = /^[a-zA-Z0-9_\-@\.]+\/[a-zA-Z0-9_\-@\.\/]+$/;

export default forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const isMobile = useIsMobile();
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const success = await form.validate();
      if (success !== true) return Promise.reject();
      const { select, ...data } = await form.getFieldsValue(true);
      // 需要清除 ID。以 preset 开头，但不是 paramsMode
      const needRemoveId =
        selected?.id.startsWith('preset') && !selected.paramsMode;
      console.log(needRemoveId);

      saveCustomModel({
        ...selected,
        ...data,
        id: needRemoveId ? '' : selected.id,
      });
      form.clearValidate();
      form.reset();
    },
  }));

  const options = useMemo(() => {
    const { raw } = getCustomModels();
    const rawIds = raw.map(item => item.id);
    const filteredPresets = CUSTOM_MODEL_PRESET.filter(
      item => !rawIds.includes(item.id)
    );
    raw.forEach(item => (item.canRemove = true));
    return [...raw, ...filteredPresets];
  }, [props]);

  const [selected, setSelected] = useState(null);

  const onSelectModel = value => {
    if (!value) {
      form.reset();
      return;
    }
    const selectedItem = { ...options.find(item => item.id === value) };
    if (selectedItem.isPreset) {
      selectedItem.name = selectedItem.name.replace(CUSTOM_PRESET_PREFIX, '');
    }
    setSelected(selectedItem);
    setTimeout(() => {
      form.setFieldsValue(selectedItem);
    }, 0);
  };

  const rules = {
    name: [
      { required: true, message: t('common.required'), type: 'error' },
      {
        validator: value => {
          if (!value.startsWith(CUSTOM_PRESET_PREFIX)) {
            return Promise.resolve({
              result: true,
            });
          } else {
            return Promise.resolve({
              result: false,
              message: t('custom_model.preset_prefix_error'),
              type: 'warning',
            });
          }
        },
      },
    ],
    baseUrl: [
      { required: true, message: t('common.required'), type: 'warning' },
    ],
    sk: [{ required: true, message: t('common.required'), type: 'warning' }],
    ids: [
      { required: true, message: t('common.required'), type: 'warning' },
      {
        validator: value => {
          const ids = value.split(',');
          const isValid = ids.every(item => ID_REGEX.test(item));
          return isValid
            ? Promise.resolve({
                result: true,
              })
            : Promise.resolve({
                result: false,
                message: t('custom_model.id_format_error'),
                type: 'warning',
              });
        },
      },
    ],
    resolveFn: [
      { required: true, message: t('common.required'), type: 'error' },
    ],
  };

  if (selected && selected.paramsMode) {
    selected.params.map(item => {
      rules[item.prop] =
        item.rules.map(rule => ({
          ...rule,
          message: t(rule.message),
        })) || [];
    });
  }
  const idsFormItem = (
    <FormItem
      key="ids"
      label={t('custom_model.model_id')}
      name="ids"
      help={t('custom_model.model_id_help')}
    >
      <Input placeholder="" />
    </FormItem>
  );
  return (
    <>
      <Form
        rules={rules}
        labelWidth={isMobile ? '' : '128px'}
        form={form}
        labelAlign="right"
        layout="vertical"
        preventSubmitDefault
        resetType="empty"
        showErrorMessage
      >
        <div className="mb-4 opacity-60 flex items-center">
          <span>{t('custom_model.reload_notice')}</span>
        </div>
        <FormItem label={t('common.select')} name="select">
          <Select
            clearable
            placeholder={t('custom_model.select_placeholder')}
            keys={{ label: 'name', value: 'id' }}
            options={options}
            onChange={onSelectModel}
          ></Select>
          {selected?.canRemove && (
            <Button
              className="ml-2"
              variant="outline"
              theme="danger"
              onClick={() => removeCustomModel(selected.id)}
            >
              {t('common.remove')}
            </Button>
          )}
        </FormItem>
        {!selected ? null : selected.paramsMode ? (
          <>
            {idsFormItem}
            {selected.params.map(item => (
              <FormItem
                key={item.prop}
                label={t(item.label)}
                name={item.prop}
                help={t(item.help)}
                statusIcon={
                  item.url ? (
                    <i
                      className="iconify mingcute--external-link-line cursor-pointer w-5 h-5 ml-1"
                      onClick={() => window.open(item.url, '_blank')}
                    ></i>
                  ) : null
                }
              >
                {item.type === 'input' ? (
                  <Input placeholder={item.placeholder} />
                ) : (
                  <span>
                    {t('custom_model.unsupported_type', { type: item.type })}
                  </span>
                )}
              </FormItem>
            ))}
          </>
        ) : (
          <>
            <FormItem label={t('common.name')} name="name">
              <Input placeholder={t('custom_model.name_placeholder')} />
            </FormItem>
            {idsFormItem}
            {selected?.isOpenAiCompatible ? (
              <>
                <FormItem
                  key="baseUrl"
                  label={t('custom_model.base_url')}
                  name="baseUrl"
                >
                  <Input placeholder={t('custom_model.base_url_placeholder')} />
                </FormItem>
                <FormItem
                  key="sk"
                  label={t('custom_model.secret_key')}
                  name="sk"
                >
                  <Input />
                </FormItem>
                <FormItem
                  key="idResolver"
                  label={t('custom_model.id_resolver')}
                  name="idResolver"
                >
                  <Textarea
                    rows={3}
                    placeholder={t('custom_model.id_resolver_help')}
                  />
                </FormItem>
                <FormItem
                  key="vision"
                  label={t('custom_model.vlm')}
                  name="vision"
                >
                  <Switch />
                </FormItem>
              </>
            ) : (
              <FormItem
                label={t('custom_model.resolver')}
                help={
                  isBrowserExtension
                    ? t('custom_model.browser_extension_notice')
                    : ''
                }
                name="resolveFn"
              >
                <Textarea
                  disabled={isBrowserExtension}
                  rows={10}
                  placeholder={t('custom_model.resolver_placeholder')}
                />
              </FormItem>
            )}
            <FormItem label={t('common.icon')} name="icon">
              <Input placeholder={t('custom_model.icon_placeholder')} />
            </FormItem>
            <FormItem label={t('custom_model.context_length')} name="length">
              <InputNumber
                suffix="K"
                placeholder=" "
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem
              label={t('custom_model.price')}
              initialData={0}
              name="price"
            >
              <InputNumber
                label="¥"
                placeholder=" "
                suffix="/1M tokens"
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem label={t('custom_model.details_link')} name="link">
              <Input placeholder={t('custom_model.details_link_placeholder')} />
            </FormItem>
          </>
        )}
      </Form>
    </>
  );
});
