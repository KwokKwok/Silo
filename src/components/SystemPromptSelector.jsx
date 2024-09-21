import { useSystemPrompts } from '@src/utils/system-prompt';
import React, { useState } from 'react';
import { Popup, Button, Drawer, Input, Textarea, Form } from 'tdesign-react';
import Tooltip from './MobileCompatible/Tooltip';
const FormItem = Form.FormItem;

function SystemPromptSelector() {
  const { active, setActive, all, save, remove } = useSystemPrompts();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editingIcon, setEditingIcon] = useState('');

  const onEdit = prompt => {
    setEditingPrompt(prompt);
    if (prompt) {
      form.setFieldsValue(prompt);
      setEditingIcon(prompt.icon);
    } else {
      form.reset();
      form.clearValidate();
      setEditingIcon('');
    }
    setDrawerVisible(true);
  };

  const [form] = Form.useForm();

  const rules = {
    name: [{ required: true, message: '必填', type: 'error' }],
    content: [{ required: true, message: '必填', type: 'error' }],
    desc: [],
    icon: [],
  };

  const onFormConfirm = () => {
    form.validate().then(success => {
      if (success === true) {
        const prompt = form.getFieldsValue(true);
        save({ ...(editingPrompt || {}), ...prompt });
        setDrawerVisible(false);
      } else {
        console.log('表单校验失败');
      }
    });
  };

  return (
    <div>
      <Popup
        placement="top-left"
        trigger="click"
        showArrow
        content={
          <div className="flex p-2 flex-wrap items-center">
            {all.map(prompt => (
              <Popup
                overlayClassName="max-w-[320px]"
                key={prompt.id}
                placement="top-left"
                showArrow
                content={
                  <div className="flex flex-col">
                    <span className="mb-1">{prompt.name}</span>
                    <span className="text-xs text-gray-500 mb-2">
                      {prompt.desc || prompt.content}
                    </span>
                    <div className="flex items-center justify-end">
                      <div className="flex-1"></div>
                      <Button
                        size="small"
                        icon={<i className="i-mingcute-copy-2-line" />}
                        variant="text"
                        onClick={e => {
                          e.stopPropagation();
                          save(
                            {
                              ...prompt,
                              name: prompt.name + ' (copy)',
                              id: void 0,
                              isPreset: false,
                            },
                            true
                          );
                        }}
                      >
                        复制
                      </Button>
                      {!prompt?.isPreset && (
                        <>
                          <Button
                            size="small"
                            icon={<i className="i-mingcute-edit-line" />}
                            variant="text"
                            className="ml-auto"
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(prompt);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            size="small"
                            icon={<i className="i-mingcute-delete-line" />}
                            variant="text"
                            theme="danger"
                            onClick={e => {
                              e.stopPropagation();
                              remove(prompt);
                            }}
                          >
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                }
              >
                <img
                  onClick={() => setActive(prompt)}
                  src={prompt.icon}
                  alt={prompt.name}
                  className={
                    'w-6 h-6 mr-2 rounded-full overflow-hidden cursor-pointer transform transition-transform ' +
                    (prompt.id === active.id ? 'scale-[1.2]' : 'scale-100')
                  }
                />
              </Popup>
            ))}
            <Tooltip content="新增系统提示词">
              <div
                className="text-primary w-6 h-6 rounded-full border-2 flex items-center justify-center border-primary cursor-pointer p-1 font-semibold"
                onClick={() => onEdit()}
              >
                <i className="i-mingcute-add-fill" />
              </div>
            </Tooltip>
          </div>
        }
      >
        <img
          src={active.icon}
          alt={active.name}
          className="w-6 h-6 rounded-full cursor-pointer transform scale-[1.15] mr-1"
        />
      </Popup>

      <Drawer
        visible={drawerVisible}
        size="large"
        onClose={() => setDrawerVisible(false)}
        onConfirm={onFormConfirm}
        header={editingPrompt ? '编辑系统提示词' : '新增系统提示词'}
      >
        <Form
          rules={rules}
          form={form}
          labelAlign="right"
          layout="vertical"
          preventSubmitDefault
          resetType="empty"
          showErrorMessage
          onValuesChange={(values, allValues) => {
            if (values.icon) {
              setEditingIcon(values.icon);
            }
            if (values.name) {
              let icon = '';
              if (!allValues.icon) {
                icon = `https://avatar.vercel.sh/${
                  Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15)
                }.svg?text=${values.name}`;
              } else if (
                allValues.icon.startsWith('https://avatar.vercel.sh')
              ) {
                icon = allValues.icon.replace(
                  /(\?text=)([^&]+)/,
                  `$1${values.name}`
                );
              } else {
                return;
              }
              setEditingIcon(icon);
              form.setFieldsValue({ icon });
            }
          }}
        >
          <FormItem label="名称" name="name">
            <Input placeholder="请输入提示词名称" />
          </FormItem>
          <FormItem
            help="默认使用 Vercel Avatar 服务，{随机背景}.svg?text={文本}，文字前添加空格可调整间距。当然，你也可以直接使用图标地址，比如你可以使用本站的文生图生成一个图标，然后使用它的地址"
            label="图标"
            name="icon"
          >
            <Input
              placeholder="提示词图标地址"
              suffixIcon={
                editingIcon && (
                  <img
                    alt="icon"
                    src={editingIcon}
                    className="w-6 h-6 rounded-full transform translate-x-1"
                  />
                )
              }
            />
          </FormItem>
          <FormItem label="描述" name="desc">
            <Textarea rows={3} placeholder="请输入提示词描述" />
          </FormItem>
          <FormItem label="内容" name="content">
            <Textarea rows={5} placeholder="请输入提示词内容" />
          </FormItem>
        </Form>
      </Drawer>
    </div>
  );
}

export default SystemPromptSelector;
