import 'tdesign-react/es/style/index.css'; // 少量公共样式
import GroupMessages from './components/GroupMessages';
import MultiPanelMessages from './components/MultiPanelMessages';
import HeaderAndPopup from './components/HeaderAndPopup';
import { useIsMobile } from './utils/use';
import { useSiloChat } from './utils/chat';
import InputControl from './components/InputControl';

function App() {
  const { loading, onSubmit, onStop } = useSiloChat();
  const isMobile = useIsMobile();
  return (
    <div className="h-dvh w-full flex flex-col selection:bg-primary selection:text-white pb-2 text-sm">
      <HeaderAndPopup />
      <div className="flex-1 h-0 w-full pb-2">
        {isMobile ? <GroupMessages /> : <MultiPanelMessages />}
      </div>
      <div className="flex-shrink-0 w-full relative">
        <InputControl onStop={onStop} onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  );
}

export default App;
