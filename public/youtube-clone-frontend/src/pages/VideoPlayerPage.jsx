import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getVideoById } from '../services/api';
import CommentSection from '../components/comment/CommentSection';
import LikeButton from '../components/common/LikeButton';
import SubscribeButton from '../components/common/SubscribeButton';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useSelector(s => s.auth);

  const [video, setVideo]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVideoById(videoId)
      .then(res => setVideo(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) return <div style={{ padding: 32 }}><Spinner /></div>;
  if (!video)  return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <h3>Video not found</h3>
      <button className="btn btn-brand" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const owner = video.owner;
  const isOwner = user && owner?._id === user._id;

  return (
    <div>
      <div className="watch-layout">
        {/* Left: Player + Details */}
        <div>
          {/* Player */}
          <div className="video-player-wrap">
            <video
              src={video.videoFile}
              controls
              autoPlay
              preload="metadata"
              poster={video.thumbnail}
              style={{ width: '100%', height: '100%', background: '#000' }}
            />
          </div>

          {/* Title */}
          <div className="video-details">
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
              {video.title}
            </h1>

            {/* Actions row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {formatViews(video.views)} views • {formatDate(video.createdAt)}
              </div>
              <div className="video-actions">
                <LikeButton videoId={videoId} />
                <button className="action-pill" onClick={() => navigator.share?.({ title: video.title, url: window.location.href })}>
                  ↗ Share
                </button>
                {isOwner && (
                  <button className="action-pill" onClick={() => navigate(`/upload?edit=${videoId}`)}>
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Channel strip */}
          <div className="channel-strip">
            <Avatar
              src={owner?.avatar}
              name={owner?.fullname || owner?.username}
              size={44}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/channel/${owner?.username}`)}
            />
            <div className="channel-strip-info">
              <div
                className="channel-strip-name"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/channel/${owner?.username}`)}
              >
                {owner?.fullname || owner?.username}
              </div>
              <div className="channel-strip-subs">@{owner?.username}</div>
            </div>
            {owner && !isOwner && (
              <SubscribeButton channelId={owner._id} />
            )}
          </div>

          {/* Description */}
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginTop: 12,
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <div style={{
              maxHeight: showMore ? 'none' : 80,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
            }}>
              {video.description || 'No description provided.'}
            </div>
            {video.description?.length > 200 && (
              <button
                onClick={() => setShowMore(p => !p)}
                style={{ background: 'none', color: 'var(--text-primary)', fontWeight: 700, marginTop: 6, fontSize: '0.82rem' }}
              >
                {showMore ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <CommentSection videoId={videoId} />
        </div>

        {/* Right: Recommended (placeholder) */}
        <aside>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)' }}>
            Up next
          </div>
          <div className="empty-state" style={{ padding: '40px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '1.8rem' }}>📽️</div>
            <p style={{ fontSize: '0.8rem' }}>Recommended videos will appear here</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
