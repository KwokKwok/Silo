import { importConfig } from '@src/utils/utils';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Upload, Button, MessagePlugin } from 'tdesign-react';


const ConfigImportModal = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [fileContent, setFileContent] = useState(null);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
  }));

  const handleClose = () => {
    setVisible(false);
    setFileContent(null);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        setFileContent(jsonContent);
      } catch (error) {
        MessagePlugin.error('无效的 JSON 文件');
      }
    };
    reader.readAsText(file.raw);
    return false; // 阻止默认上传行为
  };

  const handleConfirm = () => {
    importConfig(fileContent);
    handleClose();
    window.location.reload();
  };

  return (
    <Dialog
      visible={visible}
      onClose={handleClose}
      header={t('导入配置')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('取消')}
          </Button>
          <Button theme="primary" onClick={handleConfirm} disabled={!fileContent}>
            {t('导入并刷新页面')}
          </Button>
        </>
      }
    >
      <Upload
        action="/"
        theme="custom"
        accept="application/json"
        beforeUpload={handleUpload}
        max={1}
      >
        <Button theme="primary">{t('选择 JSON 文件')}</Button>
      </Upload>
      {fileContent && <p className='mt-2'>{t('文件解析成功，确认导入后将刷新页面')}</p>}
    </Dialog>
  );
});

export default ConfigImportModal;
