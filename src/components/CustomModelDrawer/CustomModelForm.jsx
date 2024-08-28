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
const { FormItem } = Form;

const ID_REGEX = /^[a-zA-Z0-9_\-@\.]+\/[a-zA-Z0-9_\-@\.\/]+$/;

export default forwardRef((props, ref) => {
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
      { required: true, message: '必填', type: 'error' },
      {
        validator: value => {
          if (!value.startsWith(CUSTOM_PRESET_PREFIX)) {
            return Promise.resolve({
              result: true,
            });
          } else {
            return Promise.resolve({
              result: false,
              message: `不能以 ${CUSTOM_PRESET_PREFIX} 开头`,
              type: 'warning',
            });
          }
        },
      },
    ],
    baseUrl: [{ required: true, message: '必填', type: 'warning' }],
    sk: [{ required: true, message: '必填', type: 'warning' }],
    ids: [
      { required: true, message: '必填', type: 'warning' },
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
                message:
                  'ID格式错误，请检查是否符合: {manufacturer}/{model-name}，多个需用英文逗号隔开',
                type: 'warning',
              });
        },
      },
    ],
    resolveFn: [{ required: true, message: '必填', type: 'error' }],
  };

  if (selected && selected.paramsMode) {
    selected.params.map(item => {
      rules[item.prop] = item.rules || [];
    });
  }
  return (
    <>
      <Form
        rules={rules}
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
          <span>自定义模型调整后，会自动重载页面，请确保页面数据无需处理</span>
        </div>
        <FormItem label="选择" name="select">
          <Select
            clearable
            placeholder="修改已添加的模型，或是选择预设导入"
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
              移除
            </Button>
          )}
        </FormItem>
        {!selected ? null : selected.paramsMode ? (
          <>
            <FormItem key="ids" label="模型ID" name="ids">
              <Input placeholder="{manufacturer}/{model-name}，多个可用英文逗号隔开" />
            </FormItem>
            {selected.params.map(item => (
              <FormItem key={item.prop} label={item.label} name={item.prop}>
                {item.type === 'input' ? (
                  <Input placeholder={item.placeholder} />
                ) : (
                  <span>不支持的类型：{item.type}</span>
                )}
              </FormItem>
            ))}
          </>
        ) : (
          <>
            <FormItem label="模型名字" name="name">
              <Input placeholder="方便查看用" />
            </FormItem>
            <FormItem label="模型ID" name="ids">
              <Input placeholder="{manufacturer}/{model-name}，多个可用英文逗号隔开" />
            </FormItem>
            {selected?.isOpenAiCompatible ? (
              <>
                <FormItem key="baseUrl" label="请求地址" name="baseUrl">
                  <Input placeholder="不需要带 /chat/completions" />
                </FormItem>
                <FormItem key="sk" label="密钥" name="sk">
                  <Input placeholder="请输入密钥" />
                </FormItem>
                <FormItem key="idResolver" label="ID解析函数" name="idResolver">
                  <Textarea
                    rows={3}
                    placeholder="默认会将模型ID去除 manufacturer 部分，然后传给调用函数。比如 deepseek-ai/deepseek-coder 会解析为 deepseek-coder。您也可以自定义 ID 解析函数。比如，如需原样传递给接口，这里可以填：modelId => modelId"
                  />
                </FormItem>
              </>
            ) : (
              <FormItem label="解析函数" name="resolveFn">
                <Textarea
                  rows={10}
                  placeholder="建议调试好后复制过来，这里就不再做编辑器了"
                />
              </FormItem>
            )}
            <FormItem label="模型图标" name="icon">
              <Input placeholder="厂商 Icon，可不填。建议从 HuggingFace 获取" />
            </FormItem>
            <FormItem label="上下文长度" name="length">
              <InputNumber
                suffix="K"
                placeholder=" "
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem label="价格" initialData={0} name="price">
              <InputNumber
                label="¥"
                placeholder=" "
                suffix="/1M tokens"
                align="right"
                theme="normal"
              />
            </FormItem>
            <FormItem label="详情地址" name="link">
              <Input placeholder="比如 HuggingFace 的模型地址" />
            </FormItem>
          </>
        )}
      </Form>
    </>
  );
});
