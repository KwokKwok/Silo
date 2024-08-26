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
const { FormItem } = Form;

const ID_REGEX = /^[a-zA-Z0-9_\-@\.]+\/[a-zA-Z0-9_\-@\.]+$/;

export default forwardRef((props, ref) => {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const success = await form.validate();
      if (success !== true) return Promise.reject();
      const { select, ...data } = await form.getFieldsValue(true);
      const id = selectedData.id.startsWith('preset') ? '' : selectedData.id;
      saveCustomModel({ ...selectedData, ...data, id });
      form.clearValidate();
      form.reset();
    },
  }));
  const options = [...getCustomModels().raw, ...CUSTOM_MODEL_PRESET];
  const [selectedData, setSelected] = useState(null);

  const onSelectModel = value => {
    if (!value) {
      form.reset();
      return;
    }
    const selected = { ...options.find(item => item.id === value) };
    if (selected.isPreset) {
      selected.name = selected.name.replace(CUSTOM_PRESET_PREFIX, '');
    }
    setSelected(selected);
    form.setFieldsValue(selected);
  };

  const rules = {
    // name: [{ required: true, message: '必填', type: 'error' }],
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
            placeholder="选择已添加的模型，或是选择预设导入"
            keys={{ label: 'name', value: 'id' }}
            options={options}
            onChange={onSelectModel}
          ></Select>
          {!!selectedData && !selectedData?.id.startsWith('preset') && (
            <Button
              className="ml-2"
              variant="outline"
              theme="danger"
              onClick={() => removeCustomModel(selectedData.id)}
            >
              移除
            </Button>
          )}
        </FormItem>
        <FormItem label="模型名字" name="name">
          <Input placeholder="方便查看用" />
        </FormItem>
        <FormItem label="模型ID" name="ids">
          <Input placeholder="{manufacturer}/{model-name}，多个可用英文逗号隔开" />
        </FormItem>
        <FormItem label="解析函数" name="resolveFn">
          <Textarea
            rows={10}
            placeholder="建议调试好后复制过来，这里就不再做编辑器了"
          />
        </FormItem>
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
          <Textarea placeholder="比如 HuggingFace 的模型地址" />
        </FormItem>
      </Form>
    </>
  );
});
