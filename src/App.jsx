import { AnnotationProvider } from './context/AnnotationContext';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CommentPanel from './components/CommentPanel';

export default function App() {
  return (
    <AnnotationProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#212121' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ChatView />
          <CommentPanel />
        </div>
      </div>
    </AnnotationProvider>
  );
}
