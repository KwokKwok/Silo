import { useRequest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useActiveModels, useIsRowMode } from '../store/app';
import {
  isExperienceSK,
  usePaidSkPassword,
  useSecretKey,
  useZenMode,
} from '../store/storage';
import ScLogo from '../assets/img/sc-logo.png';
import { fetchUserInfo } from '../services/api';
import { useDarkMode, useIsMobile } from '../utils/use';
import CustomModelDrawer from './CustomModelDrawer';
import { message, notification, Button } from 'tdesign-react';
import { Dropdown } from 'tdesign-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate, useLocation } from 'react-router-dom';
import Tooltip from './MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';
import { SILO_ENV } from '@src/utils/env';
import ConfigImportModal from './ConfigImportModal';
import { exportConfig, importConfig } from '@src/utils/utils';

export default function () {
  const [showPopup, setShowPopup] = useState();
  const [secretKey, setSecretKey] = useSecretKey();
  const [paidSkPassword, setPaidSkPassword, paidKeyError] = usePaidSkPassword();
  const [paidSkInput, setPaidSkInput] = useState('');
  const onSubmitPaidSkPassword = () => {
    setPaidSkPassword(paidSkInput);
  };

  const configModalRef = useRef(null);
  const openConfigModal = () => {
    configModalRef.current.open();
  };

  const [isDark, setDarkMode] = useDarkMode();
  const { i18n, t } = useTranslation();

  const location = useLocation();
  const isImageMode = location.pathname === '/image';
  const customModelRef = useRef();
  const { data, error, runAsync } = useRequest(fetchUserInfo, {
    pollingErrorRetryCount: 60 * 1000,
    debounceWait: 300,
    manual: true,
  });
  useEffect(() => {
    if (isExperienceSK()) {
      notification.info({
        title: t('common.experience_key_title'),
        content: t('common.experience_key_content'),
        closeBtn: true,
        duration: 1000 * 6,
        placement: 'bottom-right',
        offset: [-20, -20],
      });
    }
    runAsync().then(() => {
      setShowPopup(false);
    });
  }, [secretKey]);
  useEffect(() => {
    runAsync().then(() => {
      setShowPopup(false);
    });
  }, [paidSkPassword]);

  const isCurrentKeyValid = !error && !!data;
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

  useEffect(() => {
    setShowPopup(error);
  }, [error]);
  const { addMoreModel, activeModels } = useActiveModels();

  return (
    <>
      {isZenMode && (
        <div
          className="h-3 hover:bg-primary hover:bg-opacity-10 transition-colors"
          onMouseOver={() => setShowInZen(true)}
        ></div>
      )}
      <ConfigImportModal ref={configModalRef} />
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
          className="w-6 mr-6 cursor-pointer"
          onClick={() => navigate('/chat')}
        />

        <span className="mr-auto"></span>
        {isCurrentKeyValid && (
          <>
            <i
              className="i-ri-money-dollar-circle-line cursor-pointer"
              onClick={() => runAsync()}
            ></i>
            <span
              className="ml-1 mr-8 font-semibold text-lg opacity-75 cursor-pointer"
              onClick={() => runAsync()}
            >
              {data.data.balance}
            </span>
          </>
        )}

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
          content={t(isImageMode ? 'header.switch_to_chat' : 'header.switch_to_image')}
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
              title: t(isRowMode ? 'header.multi_column_mode' : 'header.dual_line_mode'),
            },
            {
              icon: 'iconify mingcute--radiobox-line',
              onClick: () => setIsZenMode(!isZenMode),
              hidden: isMobile,
              title: t(isZenMode ? 'header.exit_zen_mode' : 'header.zen_mode'),
            },
            {
              icon: 'i-ri-key-line',
              title: t('header.modify_key'),
              onClick: () => setShowPopup(true),
            },
            {
              icon: 'i-mingcute-plugin-2-fill',
              onClick: () => customModelRef.current.open(),
              hidden: isMobile || isImageMode,
              title: t('header.custom_model'),
            },
            {
              icon: 'iconify mingcute--translate-2-line',
              title: t('header.select_language'),
              children: [
                {
                  content: '简体中文',
                  onClick: () => i18n.changeLanguage('zh'),
                },
                {
                  content: 'English',
                  onClick: () => i18n.changeLanguage('en'),
                },
              ],
            },
            {
              icon: 'iconify mingcute--more-3-fill',
              title: t('header.more'),
              divider: true,
              children: [
                { icon: 'i-mingcute-file-export-fill', onClick: exportConfig, title: t('header.export_config') },
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
        <CustomModelDrawer
          ref={customModelRef}
          onClose={() => customModelRef.current.close()}
        />
      </div>
      {showPopup && (
        <div
          onClick={() => data && setShowPopup(false)}
          className="fixed z-50 top-0 left-0 w-full h-full bg-black  filter backdrop-blur-sm bg-opacity-50 flex justify-center items-center"
        >
          <div className="relative w-10/12 lg:w-[600px] py-8 flex flex-col bg-white dark:bg-gray-900 rounded-lg p-4 text-center leading-4">
            {isCurrentKeyValid && (
              <i
                className="i-mingcute-close-line opacity-70 text-2xl absolute top-4 right-4 cursor-pointer"
                onClick={() => setShowPopup(false)}
              ></i>
            )}
            <div
              className="w-full flex-1 flex flex-col justify-center items-center"
              onClick={e => e.stopPropagation()}
            >
              {!!SILO_ENV.IS_PAID_SK_ENCRYPTED ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <img src="/logo.svg" alt="SiloChat" className="h-16" />
                  </div>
                  <input
                    type="password"
                    value={paidSkInput}
                    autoFocus={!paidSkInput}
                    onChange={e => setPaidSkInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        onSubmitPaidSkPassword();
                      }
                    }}
                    placeholder={t('header.popup.enter_key_password')}
                    className="w-full h-12 outline-none text-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
                  />
                  {!!paidKeyError && (
                    <span className="mt-4 text-sm text-red-400">
                      {t(paidKeyError)}
                    </span>
                  )}
                  {!!secretKey && !!error && (
                    <span className="mt-4 text-sm text-red-400">
                      {error.message}
                    </span>
                  )}
                  <Button
                    className="mt-4"
                    theme="primary"
                    variant="text"
                    onClick={onSubmitPaidSkPassword}
                  >
                    {t('common.confirm')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <img src="/logo.svg" alt="SiloChat" className="h-16 mr-8" />
                    <img
                      src={ScLogo}
                      alt="硅基流动"
                      className="h-16 rounded-md"
                    />
                  </div>
                  <input
                    type="text"
                    value={secretKey}
                    autoFocus={!secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    placeholder={t('header.popup.enter_siliconcloud_key')}
                    className="w-full h-12 outline-none text-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
                  />

                  {!!secretKey && !!error && (
                    <span className="mt-4 text-sm text-red-400">
                      {error.message}
                    </span>
                  )}
                  <span className="mt-6 text-sm text-gray-500">
                    {t('header.popup.intro1')}
                    <br />
                    <a
                      className="mx-1"
                      target="_blank"
                      href={SILO_ENV.AFF_LINK}
                    >
                      {t('header.popup.register_siliconcloud')}
                    </a>
                    {t('header.popup.free_credit')}
                  </span>

                  <span className="mt-4 text-sm text-gray-500">
                    {t('header.popup.have_account')}
                    <a
                      className="mx-1 cursor-pointer"
                      target="_blank"
                      onClick={() => {
                        const clientId = 'SFaJLLq0y6CAMoyDm81aMu';
                        const ACCOUNT_ENDPOINT = 'https://account.siliconflow.cn';
                        const authUrl = `${ACCOUNT_ENDPOINT}/oauth?client_id=${clientId}`;
                        const popup = window.open(authUrl, 'oauthPopup', 'width=600,height=600');
                        window.addEventListener('message', (event) => {
                          if (event.data.length > 0 && event.data[0]['secretKey'] !== undefined) {
                            setSecretKey(event.data[0]['secretKey']);
                            popup.close();
                          }
                        });
                      }}
                    >
                      {t('header.popup.siliconflow_oauth')}
                    </a>
                    {t('header.popup.or')}
                    <a
                      className="mx-1"
                      href="https://cloud.siliconflow.cn/account/ak"
                      target="_blank"
                    >
                      {t('header.popup.get_siliconcloud_key')}
                    </a>
                  </span>

                  <span className="mt-4 text-sm text-gray-500">
                    {t('header.popup.key_storage_notice')}
                  </span>

                  <span className="mt-4 text-sm text-gray-500">
                    {t('header.popup.have_config')}
                    <a
                      className="mx-1 cursor-pointer"
                      target="_blank"
                      onClick={openConfigModal}
                    >
                      {t('header.popup.click_to_import')}
                    </a>
                  </span>

                  <span
                    className="text-blue-400 cursor-pointer mt-4 text-sm"
                    onClick={() => {
                      setSecretKey();
                      setShowPopup(false);
                    }}
                  >
                    🤖 {t('header.popup.use_experience_key')} 🤖
                  </span>
                  <span className="mt-2 text-xs text-gray-600">
                    {t('header.popup.experience_key_warning')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <CustomModelDrawer ref={customModelRef} />
    </>
  );
}
