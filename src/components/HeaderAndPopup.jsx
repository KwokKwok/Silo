import { useRequest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useActiveModels, useIsRowMode } from '../store/app';
import { isExperienceSK, useSecretKey, useZenMode } from '../store/storage';
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

export default function () {
  const [showPopup, setShowPopup] = useState();
  const [secretKey, setSecretKey] = useSecretKey();
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
        title: t('您正在使用体验密钥'),
        content: t(
          '体验密钥因为多人使用可能会触发限速，建议您及时更换为自己的密钥'
        ),
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
        {!!data && (
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
          <Tooltip placement="bottom" content={t('新增模型')}>
            <i
              className="block i-ri-apps-2-add-line cursor-pointer mr-4"
              onClick={addMoreModel}
            ></i>
          </Tooltip>
        )}
        <Tooltip
          placement="bottom"
          content={t(isImageMode ? '切换对话模式' : '切换文生图模式')}
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
              title: t(isRowMode ? '多列模式' : '双行模式'),
            },
            {
              icon: 'iconify mingcute--radiobox-line',
              onClick: () => setIsZenMode(!isZenMode),
              hidden: isMobile,
              title: t(isZenMode ? '退出禅模式' : '禅模式'),
            },
            {
              icon: 'i-ri-key-line',
              title: t('修改密钥'),
              onClick: () => setShowPopup(true),
            },
            {
              icon: 'i-mingcute-plugin-2-fill',
              onClick: () => customModelRef.current.open(),
              hidden: isMobile || isImageMode,
              title: t('自定义模型'),
            },
            {
              icon: 'iconify mingcute--translate-2-line',
              title: t('选择语言'),
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
              title: t('更多'),
              divider: true,
              children: [
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
                      title: t('联系开发者'),
                      content: t('您可以通过邮箱或是微信直接联系开发者'),
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
                              {t('发邮件')}
                            </Button>
                          </a>
                          <CopyToClipboard
                            text="17681890733"
                            onCopy={() => {
                              message.success(t('已复制'));
                              notify.close();
                            }}
                          >
                            <Button
                              className="ml-2"
                              theme="primary"
                              variant="text"
                            >
                              {t('使用微信')}
                            </Button>
                          </CopyToClipboard>
                        </>
                      ),
                    });
                  },
                  title: t('联系开发者'),
                },
                {
                  icon: 'i-logos-chrome',
                  onClick: () => {
                    window.open(
                      'https://chromewebstore.google.com/detail/silo-siliconcloud-api-pla/nakohnjaacfmjiodegibhnepfmioejln',
                      '_blank'
                    );
                  },
                  title: t('Chrome 扩展'),
                },
                {
                  icon: 'i-logos-microsoft-edge',
                  onClick: () => {
                    window.open(
                      'https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod',
                      '_blank'
                    );
                  },
                  title: 'Edge Addons',
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
          <div className="relative w-10/12 lg:w-[600px] h-[400px] bg-white dark:bg-gray-900 rounded-lg p-4 text-center leading-4">
            {!!data && (
              <i
                className="i-mingcute-close-line opacity-70 text-2xl absolute top-4 right-4 cursor-pointer"
                onClick={() => setShowPopup(false)}
              ></i>
            )}
            <div
              className="w-full h-full flex flex-col justify-center items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-6">
                <img src="/logo.svg" alt="SiloChat" className="h-16 mr-8" />
                <img src={ScLogo} alt="硅基流动" className="h-16 rounded-md" />
              </div>
              <input
                type="text"
                value={secretKey}
                autoFocus={!secretKey}
                onChange={e => setSecretKey(e.target.value)}
                placeholder={t('在这里输入 SiliconCloud API 密钥')}
                className="w-full h-12 outline-none text-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
              />

              {!!secretKey && !!error && (
                <span className="mt-4 text-sm text-red-400">
                  {error.message}
                </span>
              )}
              <span className="mt-6 text-sm text-gray-500">
                {t('intro1')}
                <br />
                <a
                  className="mx-1"
                  target="_blank"
                  href="https://cloud.siliconflow.cn?referrer=clzs72zzb02jqmp5vn9s5tj15"
                >
                  {t('现在注册 SiliconCloud')}
                </a>
                {t('官方也会赠送 14 元额度可用于体验付费模型')}
              </span>

              <span className="mt-4 text-sm text-gray-500">
                {t('如您已有账号，请')}
                <a
                  className="mx-1"
                  href="https://cloud.siliconflow.cn/account/ak"
                  target="_blank"
                >
                  {t('点击这里获取 SiliconCloud 密钥')}
                </a>
              </span>

              <span className="mt-4 text-sm text-gray-500">
                {t('您的密钥将仅在浏览器中存储，请仅在安全的设备上使用本应用')}
              </span>
              <span
                className="text-blue-400 cursor-pointer mt-4 text-sm"
                onClick={() => setSecretKey()}
              >
                🤖 {t('先不注册，用用你的')} 🤖
              </span>
            </div>
          </div>
        </div>
      )}
      <CustomModelDrawer ref={customModelRef} />
    </>
  );
}
