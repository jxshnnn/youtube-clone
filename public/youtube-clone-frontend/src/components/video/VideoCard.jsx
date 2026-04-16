import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';

function formatViews(n) {
  if (!n) return '0 views';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();
  const owner = video?.owner;

  return (
    <div
      className="video-card"
      onClick={() => navigate(`/watch/${video._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/watch/${video._id}`)}
    >
      {/* Thumbnail */}
      <div className="video-thumbnail-wrap">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} loading="lazy" />
        ) : (
          <div className="video-thumb-placeholder">▶</div>
        )}
        {video.duration > 0 && (
          <div className="video-duration">{formatDuration(video.duration)}</div>
        )}
      </div>

      {/* Info */}
      <div className="video-info">
        <Avatar
          src={owner?.avatar}
          name={owner?.fullname || owner?.username || '?'}
          size={36}
          style={{ cursor: 'pointer', marginTop: 2 }}
          onClick={e => {
            e.stopPropagation();
            if (owner?.username) navigate(`/channel/${owner.username}`);
          }}
        />
        <div className="video-info-text">
          <div className="video-title">{video.title}</div>
          <div className="video-meta">
            {owner?.username && (
              <a
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/channel/${owner.username}`);
                }}
                style={{ display: 'block', marginBottom: 2, color: 'var(--text-secondary)' }}
              >
                {owner.fullname || owner.username}
              </a>
            )}
            {formatViews(video.views)} • {timeAgo(video.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
