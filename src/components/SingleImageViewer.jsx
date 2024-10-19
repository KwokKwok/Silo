import React from 'react';
import { ImageViewer, Image, Space } from 'tdesign-react';

export default function SingleImageViewer ({ image, className }) {
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
        onClick={open}
      >
        <span>
          <i className="i-mingcute-eye-2-line mr-2" /> 预览
        </span>
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
