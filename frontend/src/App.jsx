import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PostProvider, usePost } from './context/PostContext';
import UploadPage from './pages/UploadPage';
import GeneratePage from './pages/GeneratePage';
import PlatformPage from './pages/PlatformPage';
import SchedulePage from './pages/SchedulePage';
import DonePage from './pages/DonePage';

function Guard({ children }) {
  const { state } = usePost();
  if (!state.sessionId) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <PostProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/generate" element={<Guard><GeneratePage /></Guard>} />
          <Route path="/platforms" element={<Guard><PlatformPage /></Guard>} />
          <Route path="/schedule" element={<Guard><SchedulePage /></Guard>} />
          <Route path="/done" element={<Guard><DonePage /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PostProvider>
  );
}
