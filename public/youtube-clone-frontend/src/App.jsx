import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from './services/api';
import { setCredentials } from './store/slices/authSlice';

import Navbar   from './components/layout/Navbar';
import Sidebar  from './components/layout/Sidebar';
import ToastContainer from './components/common/Toast';
import AuthGuard from './components/common/AuthGuard';

import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import VideoPlayerPage   from './pages/VideoPlayerPage';
import ChannelPage       from './pages/ChannelPage';
import SearchPage        from './pages/SearchPage';
import PlaylistsPage     from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import LikedVideosPage   from './pages/LikedVideosPage';
import WatchHistoryPage  from './pages/WatchHistoryPage';
import TweetsPage        from './pages/TweetsPage';
import DashboardPage     from './pages/DashboardPage';
import UploadVideoPage   from './pages/UploadVideoPage';
import ProfilePage       from './pages/ProfilePage';

// Layout wrapper for pages that use sidebar
function AppLayout({ children }) {
  const { sidebarOpen } = useSelector(s => s.ui);
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className={`page-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

// Auth-only layout (no sidebar)
function AuthLayout({ children }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(s => s.auth);

  // Re-hydrate user on page reload if token exists
  useEffect(() => {
    if (accessToken) {
      getCurrentUser()
        .then(res => dispatch(setCredentials({ user: res.data?.data, accessToken })))
        .catch(() => {});
    }
  }, []); // eslint-disable-line

  return (
    <Routes>
      {/* Auth routes — no sidebar */}
      <Route path="/login"    element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

      {/* Public routes — with sidebar */}
      <Route path="/"               element={<AppLayout><HomePage /></AppLayout>} />
      <Route path="/watch/:videoId" element={<AppLayout><VideoPlayerPage /></AppLayout>} />
      <Route path="/channel/:username" element={<AppLayout><ChannelPage /></AppLayout>} />
      <Route path="/search"         element={<AppLayout><SearchPage /></AppLayout>} />

      {/* Protected routes — with sidebar */}
      <Route path="/playlists"         element={<AppLayout><AuthGuard><PlaylistsPage /></AuthGuard></AppLayout>} />
      <Route path="/playlist/:playlistId" element={<AppLayout><AuthGuard><PlaylistDetailPage /></AuthGuard></AppLayout>} />
      <Route path="/liked"             element={<AppLayout><AuthGuard><LikedVideosPage /></AuthGuard></AppLayout>} />
      <Route path="/history"           element={<AppLayout><AuthGuard><WatchHistoryPage /></AuthGuard></AppLayout>} />
      <Route path="/tweets"            element={<AppLayout><AuthGuard><TweetsPage /></AuthGuard></AppLayout>} />
      <Route path="/dashboard"         element={<AppLayout><AuthGuard><DashboardPage /></AuthGuard></AppLayout>} />
      <Route path="/upload"            element={<AppLayout><AuthGuard><UploadVideoPage /></AuthGuard></AppLayout>} />
      <Route path="/profile"           element={<AppLayout><AuthGuard><ProfilePage /></AuthGuard></AppLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
