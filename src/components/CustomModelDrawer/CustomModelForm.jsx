import { Textarea } from 'tdesign-react';
import { Form, Input, Select } from 'tdesign-react';
import { CUSTOM_MODEL_PRESET } from './preset';
import { InputNumber } from 'tdesign-react';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';
import { saveCustomModel } from './helper';
const { FormItem } = Form;
export default forwardRef((props, ref) => {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const success = await form.validate();
      if (success !== true) return Promise.reject();
      const { select, ...data } = await form.getFieldsValue(true);
      console.log(data);
      saveCustomModel(data);
      form.clearValidate();
      form.reset();
    },
  }));
  const options = CUSTOM_MODEL_PRESET;
  const onSelectModel = value => {
    if (!value) {
      form.reset();
      return;
    }
    const selected = { ...options.find(item => item.ids === value) };
    if (selected.isPreset) {
      selected.name = selected.name.replace('[Preset] ', '');
    }
    form.setFieldsValue(selected);
  };

  const rules = {
    // name: [{ required: true, message: '必填', type: 'error' }],
    ids: [{ required: true, message: '必填', type: 'warning' }],
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
        <FormItem label="选择已有" name="select">
          <Select
            clearable
            placeholder="选择已添加的模型，或是选择预设导入"
            keys={{ label: 'name', value: 'ids' }}
            options={options}
            onChange={onSelectModel}
          ></Select>
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
