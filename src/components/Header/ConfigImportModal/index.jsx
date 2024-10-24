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

  const handleUpload = file => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        setFileContent(jsonContent);
      } catch (error) {
        MessagePlugin.error(t('config_import.invalid_json'));
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
      header={t('config_import.title')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            theme="primary"
            onClick={handleConfirm}
            disabled={!fileContent}
          >
            {t('config_import.import_and_refresh')}
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
        <Button theme="primary">{t('config_import.select_json')}</Button>
      </Upload>
      {fileContent && <p className="mt-2">{t('config_import.file_parsed')}</p>}
    </Dialog>
  );
});

export default ConfigImportModal;
