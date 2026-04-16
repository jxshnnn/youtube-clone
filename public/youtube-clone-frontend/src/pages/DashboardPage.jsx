import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getChannelStats, getChannelVideos, togglePublish, deleteVideo } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import Spinner from '../components/common/Spinner';
import { addToast } from '../store/slices/uiSlice';

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stats,   setStats]   = useState(null);
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getChannelStats(), getChannelVideos()])
      .then(([sRes, vRes]) => {
        setStats(sRes.data?.data);
        setVideos(vRes.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleTogglePublish = async (videoId, current) => {
    try {
      await togglePublish(videoId);
      setVideos(p => p.map(v => v._id === videoId ? { ...v, isPublished: !v.isPublished } : v));
      dispatch(addToast({ type: 'success', message: current ? 'Video unpublished' : 'Video published' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to toggle publish status' }));
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video permanently?')) return;
    try {
      await deleteVideo(videoId);
      setVideos(p => p.filter(v => v._id !== videoId));
      dispatch(addToast({ type: 'success', message: 'Video deleted' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to delete video' }));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">📊 Channel Dashboard</div>
          <div className="page-subtitle">Manage your content and track performance</div>
        </div>
        <button className="btn btn-brand" onClick={() => navigate('/upload')}>
          ＋ Upload Video
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard icon="👥" label="Total Subscribers" value={formatNumber(stats?.totalSubscribers)} color="var(--brand)" />
        <StatsCard icon="📺" label="Total Videos" value={formatNumber(stats?.totalVideos)} color="#3b82f6" />
        <StatsCard icon="👁" label="Total Views" value={formatNumber(stats?.totalViews)} color="#10b981" />
        <StatsCard icon="👍" label="Total Likes" value={formatNumber(stats?.totalLikes)} color="#f59e0b" />
      </div>

      {/* Video Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>Your Videos ({videos.length})</span>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No videos yet</h3>
            <p>Upload your first video to get started.</p>
            <button className="btn btn-brand" onClick={() => navigate('/upload')}>Upload Video</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="video-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <tr key={v._id}>
                    <td style={{ minWidth: 280 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 80, aspectRatio: '16/9', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-elevated)', cursor: 'pointer' }}
                          onClick={() => navigate(`/watch/${v._id}`)}>
                          {v.thumbnail
                            ? <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>▶</div>
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            onClick={() => navigate(`/watch/${v._id}`)}>
                            {v.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {v.description?.slice(0, 50)}{v.description?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`publish-badge ${v.isPublished ? 'published' : 'unpublished'}`}>
                        {v.isPublished ? '● Published' : '○ Private'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatNumber(v.views)}</td>
                    <td style={{ fontWeight: 600 }}>{formatNumber(v.likesCount)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {v.createdAt?.year
                        ? `${v.createdAt.year}/${v.createdAt.month}/${v.createdAt.day}`
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleTogglePublish(v._id, v.isPublished)}
                        >
                          {v.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--brand)', borderColor: 'rgba(255,0,0,0.3)' }}
                          onClick={() => handleDelete(v._id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
