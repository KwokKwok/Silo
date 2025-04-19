import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Drawer, Button, Textarea, Space } from 'tdesign-react';
import { getAllTextModels, isSiliconModel } from '@src/utils/models';

import { useTranslation } from 'react-i18next';
import ModelOption from '@src/components/ModelOption';
import { Select } from 'tdesign-react';
import { useWebSearchSettings } from '@src/store/storage';
import { useIsMobile } from '@src/utils/use';
import { Form } from 'tdesign-react';
import { Switch } from 'tdesign-react';
import { Input } from 'tdesign-react';
import { Divider } from 'tdesign-react';
const { FormItem } = Form;
const allTextModels = getAllTextModels().filter(item =>
  isSiliconModel(item.id)
);

const WebSearchSettings = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  const [active, setActive] = useState(false);
  const [skipIntent, setSkipIntent] = useState(false);

  const [zhipuai, setZhipuai, resetZhipuai] = useWebSearchSettings();

  useEffect(() => {
    form.setFieldsValue(zhipuai);
    setActive(zhipuai.active);
    setSkipIntent(zhipuai.skipIntent);
  }, [zhipuai]);

  const [form] = Form.useForm();

  const handleSave = () => {
    form.validate().then(valid => {
      if (valid !== true) return;
      const values = form.getFieldsValue(true);
      setZhipuai(values);
      setIsOpen(false);
    });
  };

  return (
    <Drawer
      placement={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '100dvh' : '72dvh'}
      closeOnOverlayClick={false}
      visible={isOpen}
      onClose={() => setIsOpen(false)}
      header={t('webSearch.settings')}
      footer={
        <Space className="flex justify-end items-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="outline" theme="danger" onClick={resetZhipuai}>
            {t('common.reset')}
          </Button>
          <Button theme="primary" onClick={handleSave}>
            {t('common.confirm')}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        labelAlign="top"
        rules={{
          apiKey: [
            {
              required: active,
              message: '请输入智谱AI API Key',
            },
          ],
          model: [
            {
              required: !skipIntent,
              message: '请选择意图识别模型',
            },
          ],
          prompt: [
            {
              required: !skipIntent,
              message: '请输入意图识别提示词',
            },
          ],
        }}
      >
        <FormItem label="是否启用" name="active">
          <Switch onChange={setActive} />
        </FormItem>
        <FormItem
          label="智谱AI API Key"
          name="apiKey"
          help="联网搜索功能当前使用智谱 AI 的 API 接口，请前往智谱 AI 官网获取 API Key"
          statusIcon={
            <i
              className="iconify mingcute--external-link-line cursor-pointer w-5 h-5 ml-1"
              onClick={() =>
                window.open(
                  'https://bigmodel.cn/usercenter/proj-mgmt/apikeys',
                  '_blank'
                )
              }
            ></i>
          }
        >
          <Input />
        </FormItem>
        <Divider className="mt-16">高级设置</Divider>
        <FormItem
          label="搜索引擎"
          name="searchEngine"
          statusIcon={
            <i
              className="iconify mingcute--external-link-line cursor-pointer w-5 h-5 ml-1"
              onClick={() =>
                window.open(
                  'https://bigmodel.cn/dev/api/search-tool/web-search',
                  '_blank'
                )
              }
            ></i>
          }
        >
          <Select
            className="!w-full"
            filterable
            options={[
              { value: 'search_std', label: '智谱基础版搜索引擎' },
              { value: 'search_pro', label: '智谱高阶版搜索引擎' },
              { value: 'search_pro_sogou', label: '搜狗' },
              { value: 'search_pro_quark', label: '夸克搜索' },
              { value: 'search_pro_jina', label: 'jina.ai搜索' },
            ]}
            defaultValue="search_std"
          />
        </FormItem>
        <FormItem
          label="跳过搜索意图识别"
          name="skipIntent"
          help="如果启用，则不进行搜索意图识别，会强制使用用户输入进行搜索。即使用户输入“你好”，也会进行搜索"
        >
          <Switch onChange={setSkipIntent} />
        </FormItem>
        <FormItem
          className={skipIntent ? 'hidden' : ''}
          label="搜索意图识别模型"
          name="model"
        >
          <Select
            className="!w-full"
            filterable
            filter={(value, option) =>
              option['data-keywords'].includes(value.toLowerCase())
            }
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
        </FormItem>
        <FormItem
          className={skipIntent ? 'hidden' : ''}
          label="搜索意图识别提示词"
          name="prompt"
          help="模型应输出 是/否 来表示是否进行搜索"
        >
          <Textarea autosize={{ minRows: 4, maxRows: 8 }} />
        </FormItem>
      </Form>
    </Drawer>
  );
});

export default WebSearchSettings;
