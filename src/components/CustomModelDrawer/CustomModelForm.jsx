import { Textarea } from 'tdesign-react';
import { Form, Input, Select } from 'tdesign-react';
import CUSTOM_MODEL_PRESET from './preset';
import { InputNumber } from 'tdesign-react';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';
import { removeCustomModel, saveCustomModel } from './helper';
import { getCustomModels } from '../../utils/models';
import { useState } from 'react';
import { Button } from 'tdesign-react';
import { CUSTOM_PRESET_PREFIX } from '../../utils/types';
import { useMemo } from 'react';
import { isBrowserExtension } from '@src/utils/utils';
import { useTranslation } from 'react-i18next';
const { FormItem } = Form;

const ID_REGEX = /^[a-zA-Z0-9_\-@\.]+\/[a-zA-Z0-9_\-@\.\/]+$/;

export default forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
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
      { required: true, message: t('必填'), type: 'error' },
      {
        validator: value => {
          if (!value.startsWith(CUSTOM_PRESET_PREFIX)) {
            return Promise.resolve({
              result: true,
            });
          } else {
            return Promise.resolve({
              result: false,
              message: `Don't use preset prefix`,
              type: 'warning',
            });
          }
        },
      },
    ],
    baseUrl: [{ required: true, message: t('必填'), type: 'warning' }],
    sk: [{ required: true, message: t('必填'), type: 'warning' }],
    ids: [
      { required: true, message: t('必填'), type: 'warning' },
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
                message: t(
                  'ID格式错误，请检查是否符合: {manufacturer}/{model-name}，多个需用英文逗号隔开'
                ),
                type: 'warning',
              });
        },
      },
    ],
    resolveFn: [{ required: true, message: t('必填'), type: 'error' }],
  };

  if (selected && selected.paramsMode) {
    selected.params.map(item => {
      rules[item.prop] = item.rules || [];
    });
  }
  const idsFormItem = (
    <FormItem
      key="ids"
      label={t('模型ID')}
      name="ids"
      help={t('格式：{manufacturer}/{model-name}，多个可用英文逗号隔开')}
    >
      <Input placeholder="" />
    </FormItem>
  );
  return (
    <>
      <Form
        rules={rules}
        labelWidth={'128px'}
        form={form}
        labelAlign="right"
        layout="vertical"
        preventSubmitDefault
        resetType="empty"
        showErrorMessage
      >
        {/* <Alert
          theme="info"
          close
          className="mb-4"
          message=""
        /> */}
        <div className="mb-4 opacity-60 flex items-center">
          <span>
            {t('自定义模型调整后，会自动重载页面，请确保页面数据无需处理')}
          </span>
        </div>
        <FormItem label={t('选择')} name="select">
          <Select
            clearable
            placeholder={t('修改已添加的模型，或是选择预设导入')}
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
              {t('移除')}
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
                    {t('不支持的类型：')}
                    {item.type}
                  </span>
                )}
              </FormItem>
            ))}
          </>
        ) : (
          <>
            <FormItem label={t('模型名字')} name="name">
              <Input placeholder={t('方便查看用')} />
            </FormItem>
            {idsFormItem}
            {selected?.isOpenAiCompatible ? (
              <>
                <FormItem key="baseUrl" label={t('请求地址')} name="baseUrl">
                  <Input placeholder={t('不需要 `/chat/completions`')} />
                </FormItem>
                <FormItem key="sk" label={t('密钥')} name="sk">
                  <Input />
                </FormItem>
                <FormItem
                  key="idResolver"
                  label={t('ID解析函数')}
                  name="idResolver"
                >
                  <Textarea rows={3} placeholder={t('id-resolver-help')} />
                </FormItem>
              </>
            ) : (
              <FormItem
                label={t('解析函数')}
                help={
                  isBrowserExtension
                    ? t('浏览器扩展暂不支持自定义解析函数')
                    : ''
                }
                name="resolveFn"
              >
                <Textarea
                  disabled={isBrowserExtension}
                  rows={10}
                  placeholder={t('建议调试好后复制过来，这里就不再做编辑器了')}
                />
              </FormItem>
            )}
            <FormItem label={t('模型图标')} name="icon">
              <Input
                placeholder={t('厂商 Icon，可不填。建议从 HuggingFace 获取')}
              />
            </FormItem>
            <FormItem label={t('上下文长度')} name="length">
              <InputNumber
                suffix="K"
                placeholder=" "
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem label={t('价格')} initialData={0} name="price">
              <InputNumber
                label="¥"
                placeholder=" "
                suffix="/1M tokens"
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem label={t('详情地址')} name="link">
              <Input placeholder={t('比如 HuggingFace 的模型地址')} />
            </FormItem>
          </>
        )}
      </Form>
    </>
  );
});
