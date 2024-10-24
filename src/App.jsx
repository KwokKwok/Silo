import 'tdesign-react/es/style/index.css'; // 少量公共样式
import Header from './components/Header';
import Chat from './pages/chat';
import {
  Routes,
  Route,
  Navigate,
  HashRouter as Router,
} from 'react-router-dom';
import ImageGenerate from './pages/image-generate';
import WebCopilot from './pages/web-copilot';
import { useI18nSideEffect } from './utils/use';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'tdesign-react';
import enConfig from 'tdesign-react/es/locale/en_US';
import zhConfig from 'tdesign-react/es/locale/zh_CN';
import { merge } from 'lodash-es';

function App() {
  useI18nSideEffect();
  const { i18n } = useTranslation();
  const globalConfig = merge(
    i18n.language.startsWith('zh') ? zhConfig : enConfig,
    {}
  );
  return (
    <ConfigProvider globalConfig={globalConfig}>
      <div className="h-dvh w-full flex flex-col selection:bg-primary selection:text-white pb-2 text-sm">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" />} />
            <Route
              path="/image"
              element={
                <>
                  <Header />
                  <ImageGenerate />
                </>
              }
            />
            <Route
              path="/chat"
              element={
                <>
                  <Header />
                  <Chat />
                </>
              }
            />
            <Route path="/web-copilot" element={<WebCopilot />} />
          </Routes>
        </Router>
      </div>
    </ConfigProvider>
  );
}

export default App;
