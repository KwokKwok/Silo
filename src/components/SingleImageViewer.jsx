import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageViewer, Image, Space } from 'tdesign-react';

export default function SingleImageViewer({
  image,
  className,
  children,
  onAction,
}) {
  const { t } = useTranslation();
  // 有 onAction 则使用 onAction. 否则如果 children 为空则默认打开预览，children 不为空则认为用户可能有自定义的操作
  const action = onAction || (children ? () => 0 : open => open());
  const trigger = ({ open }) => {
    const mask = (
      <div
        style={{
          background: 'rgba(0,0,0,.6)',
          color: '#fff',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--td-radius-medium)',
        }}
        onClick={() => action(open)}
      >
        {children ? (
          children
        ) : (
          <span>
            <i className="i-mingcute-eye-2-line mr-2" /> {t('common.preview')}
          </span>
        )}
      </div>
    );

    return (
      <Image
        src={image}
        overlayContent={mask}
        overlayTrigger="hover"
        fit="contain"
        style={{
          width: 160,
          height: 160,
          border: '4px solid var(--td-bg-color-secondarycontainer)',
          borderRadius: 'var(--td-radius-medium)',
        }}
        className={className}
      />
    );
  };

  return (
    <Space breakLine size={16}>
      <ImageViewer trigger={trigger} images={[image]} />
    </Space>
  );
}
