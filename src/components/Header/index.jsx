import { useRequest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useActiveModels, useIsRowMode } from '@src/store/app';
import { useLocalStorageAtom, useZenMode } from '@src/store/storage';
import { fetchUserInfo } from '@src/services/api';
import { useDarkMode, useIsMobile } from '@src/utils/use';
import CustomModelDrawer from './CustomModelDrawer';
import { message, notification, Button } from 'tdesign-react';
import { Dropdown } from 'tdesign-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate, useLocation } from 'react-router-dom';
import Tooltip from '@src/components/MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';
import ConfigImportModal from './ConfigImportModal';
import { exportConfig } from '@src/utils/utils';
import SecretKeyPopup from './SecretKeyPopup';
import { GUIDE_STEP, LOCAL_STORAGE_KEY } from '@src/utils/types';
import Guide from '@src/components/Guide';
import { i18nOptions } from '@src/i18n/resources';

export default function () {
  const secretKeyPopupRef = useRef(null);
  const configModalRef = useRef(null);
  const openConfigModal = () => {
    configModalRef.current.open();
  };

  const [isDark, setDarkMode] = useDarkMode();
  const { i18n, t } = useTranslation();

  const location = useLocation();
  const isImageMode = location.pathname === '/image';
  const [showGuide, setShowGuide] = useState(false);

  const customModelRef = useRef();
  const { data: balanceData, runAsync: checkBalance } = useRequest(
    fetchUserInfo,
    {
      pollingInterval: 60 * 1000,
      debounceWait: 300,
      manual: true,
    }
  );

  const balance = balanceData?.data?.balance || '';

  const [noGuide, setNoGuide] = useLocalStorageAtom(
    LOCAL_STORAGE_KEY.FLAG_NO_GUIDE
  );

  useEffect(() => {
    if (noGuide || isImageMode || !balance) {
      setShowGuide(false);
      return;
    }
    if (!secretKeyPopupRef.current?.isShow()) {
      setTimeout(() => {
        setShowGuide(true);
      }, 100);
    }
  }, [noGuide, isImageMode, balance, secretKeyPopupRef.current?.isShow()]);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isRowMode, setIsRowMode] = useIsRowMode();

  const [isZenMode, setIsZenMode] = useZenMode();
  const [showInZen, setShowInZen] = useState(false);
  useEffect(() => {
    if (isZenMode) {
      setShowInZen(false);
    }
  }, [isZenMode]);

  const { addMoreModel, activeModels } = useActiveModels();

  return (
    <>
      {showGuide && <Guide />}
      {isZenMode && (
        <div
          className="h-3 hover:bg-primary hover:bg-opacity-10 transition-colors"
          onMouseOver={() => setShowInZen(true)}
        ></div>
      )}

      <div
        onMouseLeave={() => setShowInZen(false)}
        className={
          'h-12 w-full filter backdrop-blur text-xl flex items-center px-4 ' +
          (isZenMode
            ? 'fixed top-0 left-0 right-0 z-50 transform transition-visible duration-300 delay-150 ' +
              (showInZen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-full opacity-0')
            : ' ')
        }
      >
        <img
          src="/logo.svg"
          alt="logo"
          className="w-6 mr-auto cursor-pointer"
          onClick={() => navigate('/chat')}
        />

        {!!balance && (
          <span
            className="inline-flex items-center cursor-pointer"
            onClick={checkBalance}
          >
            <i className="i-ri-money-dollar-circle-line " />
            <span className="ml-1 mr-6 font-semibold text-lg opacity-75">
              {balance}
            </span>
          </span>
        )}

        <div id={GUIDE_STEP.HEADER_MORE_FUNCTION} className="flex items-center">
          {!isImageMode && (
            <Tooltip placement="bottom" content={t('header.add_model')}>
              <i
                className="block i-ri-apps-2-add-line cursor-pointer mr-4"
                onClick={addMoreModel}
              ></i>
            </Tooltip>
          )}

          <Tooltip
            placement="bottom"
            content={t(
              isImageMode ? 'header.switch_to_chat' : 'header.switch_to_image'
            )}
          >
            <i
              onClick={() => navigate(isImageMode ? '/chat' : '/image')}
              className={
                (isImageMode
                  ? 'iconify mingcute--chat-1-line'
                  : 'iconify mingcute--pic-ai-line') +
                ' block color-current mr-4 cursor-pointer'
              }
            ></i>
          </Tooltip>
          <Dropdown
            minColumnWidth="160"
            maxHeight={400}
            placement="bottom-right"
            trigger="hover"
            options={i18nOptions.map(item => ({
              content: item.label,
              onClick: () => i18n.changeLanguage(item.value),
            }))}
          >
            <i className="iconify mingcute--translate-2-line block color-current mr-4 cursor-pointer"></i>
          </Dropdown>
          <i
            className={
              (isDark ? 'i-ri-sun-line' : 'i-ri-moon-line') +
              ' cursor-pointer mr-4'
            }
            onClick={() => setDarkMode(!isDark)}
          ></i>

          <Dropdown
            maxColumnWidth="160"
            direction="left"
            trigger="click"
            options={[
              {
                icon: isRowMode
                  ? 'i-mingcute-columns-3-fill'
                  : 'i-mingcute-rows-3-fill',
                onClick: () => setIsRowMode(!isRowMode),
                hidden: isMobile || isImageMode,
                disabled: activeModels.length <= 1,
                title: t(
                  isRowMode
                    ? 'header.multi_column_mode'
                    : 'header.dual_line_mode'
                ),
              },
              {
                icon: 'iconify mingcute--radiobox-line',
                onClick: () => setIsZenMode(!isZenMode),
                hidden: isMobile,
                title: t(
                  isZenMode ? 'header.exit_zen_mode' : 'header.zen_mode'
                ),
              },
              {
                icon: 'i-ri-key-line',
                title: t('header.modify_key'),
                onClick: () => secretKeyPopupRef.current.open(),
              },
              {
                icon: 'i-mingcute-plugin-2-fill',
                onClick: () => customModelRef.current.open(),
                hidden: isMobile || isImageMode,
                title: t('header.custom_model'),
              },
              // {
              //   icon: 'iconify mingcute--translate-2-line',
              //   title: t('header.select_language'),
              //   children: i18nOptions.map(item => ({
              //     content: item.label,
              //     onClick: () => i18n.changeLanguage(item.value),
              //   })),
              // },
              {
                icon: 'iconify mingcute--more-3-fill',
                title: t('header.more'),
                divider: true,
                children: [
                  {
                    icon: 'i-mingcute-question-fill',
                    onClick: () => setNoGuide(false),
                    title: t('header.guide'),
                  },
                  {
                    icon: 'i-mingcute-file-export-fill',
                    onClick: exportConfig,
                    title: t('header.export_config'),
                  },
                  {
                    icon: 'iconify mingcute--file-import-fill',
                    onClick: openConfigModal,
                    title: t('header.import_config'),
                  },
                  {
                    icon: 'i-ri-github-fill',
                    onClick: () => {
                      window.open('https://github.com/KwokKwok/Silo', '_blank');
                    },
                    title: 'GitHub',
                  },
                  {
                    icon: 'i-mingcute-wechat-fill',
                    onClick: async () => {
                      const notify = await notification.info({
                        placement: 'bottom-right',
                        offset: [-20, -20],
                        title: t('header.contact_developer'),
                        content: t('header.contact_developer_content'),
                        closeBtn: true,
                        duration: 0,
                        footer: (
                          <>
                            <a
                              href={`mailto:kwokglory@outlook.com?subject=${encodeURIComponent(
                                'Silo Feedback'
                              )}&body=${encodeURIComponent('')}`}
                              onClick={() => {
                                notify.close();
                              }}
                            >
                              <Button
                                className="ml-2"
                                theme="default"
                                variant="text"
                              >
                                {t('header.send_email')}
                              </Button>
                            </a>
                            <CopyToClipboard
                              text="17681890733"
                              onCopy={() => {
                                message.success(t('common.copied'));
                                notify.close();
                              }}
                            >
                              <Button
                                className="ml-2"
                                theme="primary"
                                variant="text"
                              >
                                {t('header.use_wechat')}
                              </Button>
                            </CopyToClipboard>
                          </>
                        ),
                      });
                    },
                    title: t('header.contact_developer'),
                  },
                  {
                    icon: 'i-logos-chrome',
                    onClick: () => {
                      window.open(
                        'https://chromewebstore.google.com/detail/silo-siliconcloud-api-pla/nakohnjaacfmjiodegibhnepfmioejln',
                        '_blank'
                      );
                    },
                    title: t('header.chrome_extension'),
                  },
                  {
                    icon: 'i-logos-microsoft-edge',
                    onClick: () => {
                      window.open(
                        'https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod',
                        '_blank'
                      );
                    },
                    title: t('header.edge_addons'),
                  },
                ].map(item => ({
                  prefixIcon: <i className={item.icon + ' mr-0'} />,
                  content: item.title,
                  onClick: item.onClick,
                })),
              },
            ]
              .filter(item => !item.hidden)
              .map(item => ({
                prefixIcon: <i className={item.icon + ' mr-0'} />,
                content: item.title,
                onClick: item.onClick,
                disabled: item.disabled,
                value: item.title,
                children: item.children,
              }))}
          >
            <i className={'i-ri-more-fill cursor-pointer'}></i>
          </Dropdown>
        </div>
      </div>
      <CustomModelDrawer ref={customModelRef} />
      <SecretKeyPopup
        ref={secretKeyPopupRef}
        onImport={openConfigModal}
        checkKeyValid={checkBalance}
      />
      <ConfigImportModal ref={configModalRef} />
    </>
  );
}
