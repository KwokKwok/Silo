import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { message, PopupPlacement } from 'tdesign-react';
import { Popup } from 'tdesign-react';

export default function ({ copyText, placement, children }: { placement: 'bottom-left' | 'bottom-right', children: React.ReactNode, copyText: string }) {
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
