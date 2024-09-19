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
import WebCopilot from './pages/web-copilot';

function App() {
  return (
    <div className="h-dvh w-full flex flex-col selection:bg-primary selection:text-white pb-2 text-sm">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route
            path="/image"
            element={
              <>
                <HeaderAndPopup />
                <ImageGenerate />
              </>
            }
          />
          <Route
            path="/chat"
            element={
              <>
                <HeaderAndPopup />
                <Chat />
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
