import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',        path: '/' },
  { icon: '🔥', label: 'Trending',    path: '/search?q=trending' },
  { icon: '📋', label: 'Playlists',   path: '/playlists', auth: true },
  { icon: '🕓', label: 'History',     path: '/history',   auth: true },
  { icon: '👍', label: 'Liked Videos',path: '/liked',     auth: true },
  { icon: '💬', label: 'Community',   path: '/tweets',    auth: true },
  { icon: '📊', label: 'Dashboard',   path: '/dashboard', auth: true },
];

export default function Sidebar() {
  const { sidebarOpen } = useSelector(s => s.ui);
  const { isLoggedIn } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-section">
        {!sidebarOpen && <div style={{ height: 8 }} />}
        {sidebarOpen && <div className="sidebar-label">Menu</div>}

        {NAV_ITEMS.filter(item => !item.auth || isLoggedIn).map(item => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path.split('?')[0]);

          return (
            <button
              key={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {sidebarOpen && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section">
            <div className="sidebar-label">Explore</div>
            {[
              { icon: '🎮', label: 'Gaming',  path: '/search?q=gaming' },
              { icon: '🎵', label: 'Music',   path: '/search?q=music' },
              { icon: '📡', label: 'Live',    path: '/search?q=live' },
              { icon: '🗞️', label: 'News',    path: '/search?q=news' },
            ].map(item => (
              <button
                key={item.label}
                className="sidebar-item"
                onClick={() => navigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
