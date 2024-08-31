import 'tdesign-react/es/style/index.css'; // 少量公共样式
import HeaderAndPopup from './components/HeaderAndPopup';
import Chat from './pages/chat';
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter as Router,
} from 'react-router-dom';
import ImageGenerate from './pages/image-generate';

function App() {
  return (
    <div className="h-dvh w-full flex flex-col selection:bg-primary selection:text-white pb-2 text-sm">
      <Router>
        <HeaderAndPopup />
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/image" element={<ImageGenerate />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
