import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { clearCredentials } from '../../store/slices/authSlice';
import { logoutUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector(s => s.auth);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    dispatch(clearCredentials());
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Hamburger + Logo */}
      <button className="icon-btn" onClick={() => dispatch(toggleSidebar())} aria-label="Toggle sidebar">
        ☰
      </button>
      <a href="/" className="navbar-logo" onClick={e => { e.preventDefault(); navigate('/'); }}>
        <span className="yt-icon">▶</span>
        <span>JTube</span>
      </a>

      {/* Search */}
      <div className="navbar-search-wrap">
        <form className="navbar-search" onSubmit={handleSearch} style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search videos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search"
          />
          <button type="submit" className="search-btn" aria-label="Search submit">🔍</button>
        </form>
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {isLoggedIn ? (
          <>
            <button
              className="upload-btn"
              onClick={() => navigate('/upload')}
              aria-label="Upload video"
            >
              <span>＋</span> Upload
            </button>

            <div style={{ position: 'relative' }}>
              <div
                className="user-avatar-btn"
                onClick={() => setShowDropdown(p => !p)}
                role="button"
                aria-label="User menu"
                style={{ cursor: 'pointer' }}
              >
                <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={36} />
              </div>

              {showDropdown && (
                <div className="dropdown" style={{ minWidth: 220 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.fullname}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user?.username}</div>
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate(`/channel/${user?.username}`); setShowDropdown(false); }}>
                    👤 Your Channel
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowDropdown(false); }}>
                    📊 Dashboard
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                    ⚙️ Settings
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Sign Out
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="btn btn-brand" onClick={() => navigate('/login')}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
