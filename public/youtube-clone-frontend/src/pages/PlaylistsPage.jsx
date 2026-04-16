import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../services/api';
import Spinner from '../components/common/Spinner';

export default function PlaylistsPage() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    getUserPlaylists(user._id)
      .then(res => setPlaylists(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setCreating(true);
    try {
      const res = await createPlaylist(form);
      setPlaylists(p => [res.data?.data, ...p]);
      setForm({ name: '', description: '' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create playlist');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playlist?')) return;
    await deletePlaylist(id);
    setPlaylists(p => p.filter(pl => pl._id !== id));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">📋 My Playlists</div>
          <div className="page-subtitle">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-brand" onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Cancel' : '＋ New Playlist'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Create Playlist</h3>
          {error && <div className="alert-box error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-control" placeholder="My Awesome Playlist" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" placeholder="What's this playlist about?" rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-brand" disabled={creating}>
              {creating ? 'Creating...' : 'Create Playlist'}
            </button>
          </form>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to organize your favorite videos.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {playlists.map(pl => (
            <div key={pl._id} className="playlist-card">
              <div className="playlist-thumb" onClick={() => navigate(`/playlist/${pl._id}`)}>
                <span>🎵</span>
                <div className="playlist-count-badge">
                  <span style={{ fontSize: '1.1rem' }}>{pl.totalVideos || 0}</span>
                  <span>videos</span>
                </div>
              </div>
              <div className="playlist-info">
                <div className="playlist-name" onClick={() => navigate(`/playlist/${pl._id}`)}>{pl.name}</div>
                <div className="playlist-meta">
                  {pl.totalViews?.toLocaleString() || 0} views • Updated {new Date(pl.updatedAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                    onClick={() => navigate(`/playlist/${pl._id}`)}>
                    View
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--brand)', borderColor: 'rgba(255,0,0,0.3)' }}
                    onClick={() => handleDelete(pl._id)}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
