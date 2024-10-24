import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
  isExperienceSK,
  usePaidSkPassword,
  useSecretKey,
} from '@src/store/storage';
import ScLogo from '@src/assets/img/sc-logo.png';
import { notification, Button } from 'tdesign-react';
import { useTranslation } from 'react-i18next';
import { SILO_ENV } from '@src/utils/env';

const SecretKeyPopup = forwardRef(({ onImport, checkKeyValid }, ref) => {
  useImperativeHandle(ref, () => ({
    open: () => setShowPopup(true),
    isShow: () => showPopup,
  }));

  const [showPopup, setShowPopup] = useState(false);

  const [secretKey, setSecretKey] = useSecretKey();
  const [paidSkPassword, setPaidSkPassword, paidKeyError] = usePaidSkPassword();
  const [paidSkInput, setPaidSkInput] = useState('');
  const onSubmitPaidSkPassword = () => {
    setPaidSkPassword(paidSkInput);
  };

  const [error, setError] = useState('');

  const onClose = () => {
    setError('');
    setShowPopup(false);
  };

  const { t } = useTranslation();

  const check = () => {
    checkKeyValid()
      .then(onClose)
      .catch(err => {
        console.log(err);
        console.log(err.message);

        setError(err.message);
        setShowPopup(true);
      });
  };
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
    setError('');
    check();
  }, [secretKey]);
  useEffect(() => {
    check();
  }, [paidSkPassword]);

  const isCurrentKeyValid = !error;

  if (!showPopup) return null;

  return (
    <div
      onClick={() => isCurrentKeyValid && onClose()}
      className="fixed z-50 top-0 left-0 w-full h-full bg-black filter backdrop-blur-sm bg-opacity-50 flex justify-center items-center"
    >
      <div className="relative w-10/12 lg:w-[600px] py-8 flex flex-col bg-white dark:bg-gray-900 rounded-lg p-4 text-center leading-4">
        {isCurrentKeyValid && (
          <i
            className="i-mingcute-close-line opacity-70 text-2xl absolute top-4 right-4 cursor-pointer"
            onClick={onClose}
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
              {!!secretKey && error && (
                <span className="mt-4 text-sm text-red-400">{error}</span>
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
                <img src={ScLogo} alt="硅基流动" className="h-16 rounded-md" />
              </div>
              <input
                type="text"
                value={secretKey}
                autoFocus={!secretKey}
                onChange={e => setSecretKey(e.target.value)}
                placeholder={t('header.popup.enter_siliconcloud_key')}
                className="w-full h-12 outline-none text-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4"
              />

              {!!secretKey && error && (
                <span className="mt-4 text-sm text-red-400">{error}</span>
              )}
              <span className="mt-6 text-sm text-gray-500">
                {t('header.popup.intro1')}
                <br />
                <a className="mx-1" target="_blank" href={SILO_ENV.AFF_LINK}>
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
                    const popup = window.open(
                      authUrl,
                      'oauthPopup',
                      'width=600,height=600'
                    );
                    window.addEventListener('message', event => {
                      if (
                        event.data.length > 0 &&
                        event.data[0]['secretKey'] !== undefined
                      ) {
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
                  onClick={onImport}
                >
                  {t('header.popup.click_to_import')}
                </a>
              </span>

              {SILO_ENV.EXPERIENCE_SK && (
                <>
                  <span
                    className="text-blue-400 cursor-pointer mt-4 text-sm"
                    onClick={() => {
                      setSecretKey();
                    }}
                  >
                    🤖 {t('header.popup.use_experience_key')} 🤖
                  </span>
                  <span className="mt-2 text-xs text-gray-600">
                    {t('header.popup.experience_key_warning')}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default SecretKeyPopup;
