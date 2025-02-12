import { useImperativeHandle } from 'react';
import { useState } from 'react';
import { forwardRef } from 'react';
import CustomModelForm from './CustomModelForm';
import { useRef } from 'react';
import { Drawer } from 'tdesign-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@src/utils/use';

// 用户需要输入模型名称、图标、解析方法等信息
export default forwardRef(({}, ref) => {
  const { t } = useTranslation();
  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
  }));
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const onClose = () => {
    setVisible(false);
  };
  const formRef = useRef();

  const onConfirm = async () => {
    await formRef.current.submit();
    onClose();
  };
  return (
    <Drawer
      header={t('header.custom_model')}
      visible={visible}
      confirmOnEnter
      placement={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '100dvh' : 'large'}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <CustomModelForm ref={formRef} />
    </Drawer>
  );
});
