import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, removeVideoFromPlaylist } from '../services/api';
import { useSelector } from 'react-redux';
import VideoCard from '../components/video/VideoCard';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [playlist, setPlaylist] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getPlaylistById(playlistId)
      .then(res => setPlaylist(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [playlistId]);

  const handleRemove = async (videoId) => {
    if (!window.confirm('Remove from playlist?')) return;
    await removeVideoFromPlaylist(playlistId, videoId);
    setPlaylist(p => ({ ...p, videos: p.videos.filter(v => v._id !== videoId) }));
  };

  if (loading) return <Spinner />;
  if (!playlist) return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <h3>Playlist not found</h3>
      <button className="btn btn-brand" onClick={() => navigate('/playlists')}>Back to Playlists</button>
    </div>
  );

  const isOwner = user?._id === (typeof playlist.owner === 'object' ? playlist.owner?._id : playlist.owner);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{
          width: 240, height: 135, flexShrink: 0, borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
        }}>
          🎵
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>{playlist.name}</div>
          {playlist.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>{playlist.description}</p>}
          {playlist.owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar src={playlist.owner?.avatar} name={playlist.owner?.fullName || playlist.owner?.username} size={24} />
              <span style={{ fontSize: '0.85rem' }}>{playlist.owner?.fullName || playlist.owner?.username}</span>
            </div>
          )}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {playlist.totalVideos || playlist.videos?.length || 0} videos • {(playlist.totalViews || 0).toLocaleString()} views
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {playlist.videos?.length > 0 && (
              <button className="btn btn-brand" onClick={() => navigate(`/watch/${playlist.videos[0]?._id}`)}>
                ▶ Play All
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => navigate('/playlists')}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Videos */}
      {!playlist.videos?.length ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No videos in this playlist</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {playlist.videos.map((v, idx) => (
            <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}>
                {idx + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{ width: 120, aspectRatio: '16/9', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-elevated)' }}
                    onClick={() => navigate(`/watch/${v._id}`)}
                  >
                    {v.thumbnail ? <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => navigate(`/watch/${v._id}`)}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {v.owner?.fullName || v.owner?.username} • {(v.views || 0).toLocaleString()} views
                    </div>
                  </div>
                </div>
              </div>
              {isOwner && (
                <button className="btn btn-ghost btn-icon-only" style={{ color: 'var(--brand)', flexShrink: 0 }} onClick={() => handleRemove(v._id)}>
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
