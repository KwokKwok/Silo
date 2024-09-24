import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { message, PopupPlacement, Popup } from 'tdesign-react';

export default function ({ copyText, placement, children }: { placement: PopupPlacement, children: React.ReactNode, copyText: string }) {
  const { t } = useTranslation();
  return (
    <Popup
      trigger="hover"
      placement={placement}
      // overlayStyle={(target, popup) => {
      //   return {
      //     top: '-4px'
      //   };
      // }}
      content={
        <div className="flex h-6 items-center justify-end">
          <CopyToClipboard
            text={copyText}
            onCopy={() => message.success(t('已复制'))}
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
