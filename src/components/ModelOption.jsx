import { Tag } from 'tdesign-react';
import { useTranslation } from 'react-i18next';
import { useUserInfo } from '@src/store/app';

function fmtNumber(num) {
  if (num >= 1000000) {
    return Number((num / 1000000).toFixed(1)) + 'M';
  }
  if (num >= 1000) {
    return Number((num / 1000).toFixed(1)) + 'K';
  }
  return num.toString();
}

export default function ModelOption({ option }) {
  const { t } = useTranslation();
  const [userInfo] = useUserInfo();
  const { category } = userInfo;

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-[2px]">
        <img
          src={option.icon}
          className="w-[14px] h-[14px] rounded-sm mr-1"
          alt={option.name}
        />
        <span>{option.name}</span>
        {!!option.vision && (
          <Tag
            size="small"
            theme="default"
            className="ml-1 transform scale-75"
            icon={<i className="iconify i-mingcute-eye-2-fill"></i>}
          >
            <span className="pl-1">VLM</span>
          </Tag>
        )}
        {!!option.isCustom && (
          <Tag
            className="scale-[0.8]"
            size="small"
            theme="warning"
            variant="light-outline"
          >
            Custom
          </Tag>
        )}
      </div>
      <div className="flex items-center">
        {!!option.series && (
          <Tag variant="outline" size="small" theme="primary">
            {option.series}
          </Tag>
        )}
        {!!option.length && (
          <Tag variant="outline" size="small" theme="primary" className="ml-2">
            {option.length}K
          </Tag>
        )}
        {!!category && (
          <Tag variant="outline" size="small" theme="default" className="ml-2">
            TPM: {fmtNumber(option.levels[category].TPM)}
          </Tag>
        )}
        {option.price > 0 ? (
          <Tag
            className="ml-2 inline-flex items-center justify-center"
            variant="outline"
            size="small"
            theme={option.noGift ? 'danger' : 'success'}
            icon={<i className="iconify i-mingcute-currency-dollar-fill"></i>}
          >
            <div className="pl-1">
              {option.priceIn === option.priceOut ? (
                <span>{option.priceIn}</span>
              ) : (
                <>
                  <span>{option.priceIn}</span>
                  <span className="mx-0.5">/</span>
                  <span>{option.priceOut}</span>
                </>
              )}
            </div>
          </Tag>
        ) : (
          <Tag
            className="ml-2 inline-flex items-center justify-center"
            variant="outline"
            size="small"
            theme="success"
          >
            {t('common.free')}
          </Tag>
        )}

        {/* {option.isVendorA && (
          <Tag size="small" variant="outline" theme="success" className="ml-2">
            {t('common.china_vendor')}
          </Tag>
        )} */}
      </div>
    </div>
  );
}
