import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { message } from 'tdesign-react';
import { Popup } from 'tdesign-react';
import { useSiloChat } from '../utils/chat';

export default function ({ copyText, placement, children }: { placement: 'bottom-left' | 'bottom-right', children: React.ReactNode, copyText: string }) {
  // 聊天中如果鼠标悬浮，会造成布局抖动
  const { loading } = useSiloChat();
  if (loading) {
    return children;
  }

  return (
    <Popup
      trigger="hover"
      placement={placement}
      overlayStyle={(target, popup) => {
        return {
          top: '-4px'
        };
      }}
      content={
        <div className="flex h-6 items-center justify-end">
          <CopyToClipboard
            text={copyText}
            onCopy={() => message.success('已复制')}
          >
            <i className="opacity-60 hover:opacity-100 transition-opacity duration-300 text-base  i-ri-file-copy-line cursor-pointer"></i>
          </CopyToClipboard>
        </div>
      }
    >
      {children}
    </Popup>
  );
}
