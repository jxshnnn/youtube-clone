import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getChannelProfile, getAllVideos } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';
import SubscribeButton from '../components/common/SubscribeButton';
import Spinner from '../components/common/Spinner';

export default function ChannelPage() {
  const { username } = useParams();
  const { user }     = useNavigate();
  const naviagate    = useNavigate();
  const { user: me } = useSelector(s => s.auth);

  const [channel, setChannel]   = useState(null);
  const [videos,  setVideos]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [vLoading, setVLoading] = useState(false);
  const [tab, setTab]           = useState('videos');
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    getChannelProfile(username)
      .then(res => {
        const ch = res.data?.data;
        setChannel(ch);
        setSubCount(ch?.subscribersCount || 0);
        return getAllVideos({ userId: ch?._id, limit: 24, sortBy: 'createdAt', sortType: 'desc' });
      })
      .then(res => setVideos(res.data?.data?.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div style={{ padding: 32 }}><Spinner /></div>;
  if (!channel) return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <h3>Channel not found</h3>
    </div>
  );

  const isOwn = me?.username === channel?.username;

  return (
    <div>
      {/* Banner */}
      <div className="channel-banner">
        {channel.coverImage && <img src={channel.coverImage} alt="Channel cover" />}
      </div>

      {/* Channel header */}
      <div className="channel-header">
        <div className="channel-avatar-large">
          {channel.avatar ? (
            <img src={channel.avatar} alt={channel.fullname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', color: '#fff' }}>
              {channel.fullname?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="channel-name">{channel.fullname}</div>
          <div className="channel-handle">@{channel.username}</div>
          <div className="channel-stats-row">
            {subCount.toLocaleString()} subscribers • {videos.length} videos
          </div>
        </div>

        {!isOwn && (
          <SubscribeButton
            channelId={channel._id}
            initialSubscribed={channel.isSubscribed}
            onToggle={(sub) => setSubCount(p => sub ? p + 1 : p - 1)}
          />
        )}
        {isOwn && (
          <button className="btn btn-ghost" onClick={() => naviagate('/profile')}>
            ✏️ Customize Channel
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['videos', 'about'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'videos' && (
        <VideoGrid videos={videos} loading={vLoading} emptyMessage="This channel hasn't uploaded any videos yet." />
      )}

      {tab === 'about' && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <h3 style={{ marginBottom: 12 }}>About</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: 120 }}>📧 Email</span>
              <span style={{ fontSize: '0.85rem' }}>{channel.email}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: 120 }}>👥 Subscribers</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{subCount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: 120 }}>📺 Subscribed to</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{channel.channelsSubscribedToCount || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
