import { useRequest } from 'ahooks';
import { useEffect } from 'react';
import { useState } from 'react';
import { useActiveModels, useIsRowMode, useSecretKey } from '../store/app';
import ScLogo from '../assets/img/sc-logo.png';
import { fetchUserInfo } from '../services/user';
import { useDarkMode, useIsMobile } from '../utils/use';
import { message } from 'tdesign-react';
import { notification } from 'tdesign-react';
import CustomModelDrawer from './CustomModelDrawer';
import { useRef } from 'react';

export default function () {
  const [showPopup, setShowPopup] = useState();
  const [secretKey, setSecretKey] = useSecretKey();
  const [isDark, setDarkMode] = useDarkMode();
  const customModelRef = useRef();
  const { data, error, runAsync } = useRequest(fetchUserInfo, {
    pollingErrorRetryCount: 60 * 1000,
    debounceWait: 300,
    manual: true,
  });
  useEffect(() => {
    if (secretKey == import.meta.env.VITE_DEFAULT_SK) {
      notification.info({
        title: '您正在使用体验密钥',
        content:
          '体验密钥因为多人使用可能会触发限速，建议您及时更换为自己的密钥',
        closeBtn: true,
        placement: 'bottom-right',
        offset: [-20, -20],
      });
    }
    runAsync();
  }, [secretKey]);
  const isMobile = useIsMobile();

  const [isRowMode, setIsRowMode] = useIsRowMode();

  useEffect(() => {
    setShowPopup(error);
  }, [error]);
  const { addMoreModel, activeModels } = useActiveModels();
  return (
    <>
      <div className="h-12 w-full filter backdrop-blur text-xl flex items-center px-4">
        <img src="/logo.svg" alt="logo" className="w-6 mr-auto" />
        {!!data && (
          <>
            <i
              className="i-ri-money-dollar-circle-line ml-4 cursor-pointer"
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
        {!isMobile && activeModels.length > 1 && (
          <>
            <i
              title="切换行模式"
              onClick={() => setIsRowMode(!isRowMode)}
              className={
                'cursor-pointer mr-4 ' +
                (isRowMode
                  ? 'i-mingcute-columns-3-line'
                  : 'i-mingcute-rows-3-line')
              }
            ></i>
          </>
        )}
        <i
          className="i-ri-apps-2-add-line cursor-pointer mr-4"
          onClick={addMoreModel}
        ></i>
        <i
          className="i-ri-key-line cursor-pointer mr-4"
          onClick={() => setShowPopup(true)}
        ></i>
        {!isMobile && location.href.endsWith('dev') && (
          <i
            className="i-mingcute-plugin-2-fill cursor-pointer mr-4"
            onClick={() => customModelRef.current.open()}
          ></i>
        )}
        <i
          className={
            (isDark ? 'i-ri-sun-line' : 'i-ri-moon-line') +
            ' cursor-pointer mr-4'
          }
          onClick={() => setDarkMode(!isDark)}
        ></i>
        <i
          className="i-ri-github-fill cursor-pointer"
          onClick={() =>
            window.open('https://github.com/KwokKwok/SiloChat', '_blank')
          }
        ></i>
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
                <img src={ScLogo} alt="硅基流动" className="h-16 rounded-md" />
                <img src="/logo.svg" alt="SiloChat" className="h-16 ml-8" />
              </div>
              <input
                type="text"
                value={secretKey}
                autoFocus={!secretKey}
                onChange={e => setSecretKey(e.target.value)}
                placeholder="在这里输入 SiliconCloud API 密钥"
                className="w-full h-12 outline-none text-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
              />

              {!!secretKey && !!error && (
                <span className="mt-4 text-sm text-red-400">
                  {error.message}
                </span>
              )}
              <span className="mt-6 text-sm text-gray-500">
                本站使用 SiliconCloud API，需要您先注册一个 SiliconCloud 账号
                <br />
                现在
                <a
                  className="mx-1"
                  target="_blank"
                  href="https://cloud.siliconflow.cn?referrer=clzs72zzb02jqmp5vn9s5tj15"
                >
                  注册 SiliconCloud（aff）
                </a>
                即送 14 元额度可用于体验付费模型
                {/* <br />
                也欢迎使用我的
                <a className="mx-1" href="" target="_blank">
                  邀请链接
                </a>
                ，这样我也可以另外获得 14 元额度 */}
              </span>

              <span className="mt-4 text-sm text-gray-500">
                如您已有账号，请
                <a
                  className="mx-1"
                  href="https://cloud.siliconflow.cn/account/ak"
                  target="_blank"
                >
                  点击这里
                </a>
                获取 SiliconCloud 密钥
              </span>

              <span className="mt-4 text-sm text-gray-500">
                您的密钥将仅在浏览器中存储，请仅在安全的设备上使用本应用
              </span>
              <span
                className="text-blue-400 cursor-pointer mt-4 text-sm"
                onClick={() => setSecretKey(import.meta.env.VITE_DEFAULT_SK)}
              >
                🤖 先不注册，用用你的 🤖
              </span>
            </div>
          </div>
        </div>
      )}
      <CustomModelDrawer ref={customModelRef} />
    </>
  );
}
