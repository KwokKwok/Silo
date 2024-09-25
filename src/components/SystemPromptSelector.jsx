import { useSystemPrompts } from '@src/utils/system-prompt';
import React, { useState } from 'react';
import { Popup, Button, Drawer, Input, Textarea, Form } from 'tdesign-react';
import Tooltip from './MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@src/utils/use';
const FormItem = Form.FormItem;

function SystemPromptSelector() {
  const { t } = useTranslation();
  const { active, setActive, all, save, remove } = useSystemPrompts();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editingIcon, setEditingIcon] = useState('');
  const isMobile = useIsMobile();

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
                        icon={<i className="i-mingcute-copy-2-line mr-1" />}
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
                        {t('复制')}
                      </Button>
                      {!prompt?.isPreset && (
                        <>
                          <Button
                            size="small"
                            icon={<i className="i-mingcute-edit-line mr-1" />}
                            variant="text"
                            className="ml-auto"
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(prompt);
                            }}
                          >
                            {t('编辑')}
                          </Button>
                          <Button
                            size="small"
                            icon={<i className="i-mingcute-delete-line mr-1" />}
                            variant="text"
                            theme="danger"
                            onClick={e => {
                              e.stopPropagation();
                              remove(prompt);
                            }}
                          >
                            {t('删除')}
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
                    'w-6 h-6 mr-2 rounded-full overflow-hidden cursor-pointer transform transition-transform select-none ' +
                    (prompt.id === active.id ? 'scale-[1.2]' : 'scale-100')
                  }
                />
              </Popup>
            ))}
            <Tooltip content={t('新增系统提示词')}>
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
          className="w-6 h-6 select-none rounded-full cursor-pointer transform scale-[1.15] mr-1"
        />
      </Popup>

      <Drawer
        visible={drawerVisible}
        size={isMobile ? '100%' : 'large'}
        onClose={() => setDrawerVisible(false)}
        onConfirm={onFormConfirm}
        header={t(editingPrompt ? '编辑系统提示词' : '新增系统提示词')}
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
          <FormItem label={t('名称')} name="name">
            <Input />
          </FormItem>
          <FormItem help={t('avatar-help')} label={t('图标')} name="icon">
            <Input
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
          <FormItem label={t('描述')} name="desc">
            <Textarea rows={3} />
          </FormItem>
          <FormItem label={t('内容')} name="content">
            <Textarea rows={5} />
          </FormItem>
        </Form>
      </Drawer>
    </div>
  );
}

export default SystemPromptSelector;
