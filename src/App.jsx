import 'tdesign-react/es/style/index.css'; // 少量公共样式
import HeaderAndPopup from './components/HeaderAndPopup';
import Chat from './pages/chat';
import {
  Routes,
  Route,
  Navigate,
  HashRouter as Router,
} from 'react-router-dom';
import ImageGenerate from './pages/image-generate';
import { useIsImageMode } from './store/storage';
import WebCopilot from './pages/web-copilot';

function App() {
  const [isImageMode] = useIsImageMode();
  return (
    <div className="h-dvh w-full flex flex-col selection:bg-primary selection:text-white pb-2 text-sm">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeaderAndPopup />
                {isImageMode ? <ImageGenerate /> : <Chat />}
              </>
            }
          />
          <Route path="/web-copilot" element={<WebCopilot />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
