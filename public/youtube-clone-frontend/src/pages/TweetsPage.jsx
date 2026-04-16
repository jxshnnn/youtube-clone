import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserTweets, createTweet, updateTweet, deleteTweet } from '../services/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const dy = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${dy}d`;
}

export default function TweetsPage() {
  const { user } = useSelector(s => s.auth);
  const [tweets,  setTweets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(null); // { id, content }

  useEffect(() => {
    if (!user?._id) return;
    getUserTweets(user._id)
      .then(res => setTweets(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const res = await createTweet({ content: content.trim() });
      const t = res.data?.data;
      setTweets(p => [{
        ...t,
        owner: { username: user.username, fullname: user.fullname, avatar: user.avatar },
      }, ...p]);
      setContent('');
    } catch (_) {}
    setPosting(false);
  };

  const handleUpdate = async (tweetId) => {
    if (!editing?.content?.trim()) return;
    try {
      const res = await updateTweet(tweetId, { content: editing.content });
      setTweets(p => p.map(t => t._id === tweetId ? { ...t, content: editing.content } : t));
      setEditing(null);
    } catch (_) {}
  };

  const handleDelete = async (tweetId) => {
    if (!window.confirm('Delete this post?')) return;
    await deleteTweet(tweetId);
    setTweets(p => p.filter(t => t._id !== tweetId));
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">💬 Community</div>
        <div className="page-subtitle">Share thoughts with your audience</div>
      </div>

      {/* Compose */}
      <div className="tweet-compose">
        <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={40} />
        <div style={{ flex: 1 }}>
          <textarea
            className="form-control"
            placeholder="Share something with your community..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '8px 0', resize: 'none', width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{content.length}/2000</span>
            <button
              className="btn btn-brand"
              onClick={handlePost}
              disabled={posting || !content.trim()}
              style={{ padding: '7px 18px', fontSize: '0.85rem' }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        tweets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No posts yet</h3>
            <p>Posts you create will appear here.</p>
          </div>
        ) : (
          tweets.map(tweet => (
            <div key={tweet._id} className="tweet-card">
              <Avatar src={tweet.owner?.avatar} name={tweet.owner?.fullname || tweet.owner?.username} size={40} />
              <div className="tweet-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span className="tweet-author">{tweet.owner?.fullname || tweet.owner?.username}</span>
                    <span className="tweet-handle">@{tweet.owner?.username} · {timeAgo(tweet.createdAt)}</span>
                  </div>
                  {user?._id === (tweet.owner?._id || tweet.owner) && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" style={{ width: 28, height: 28, fontSize: '0.8rem' }}
                        onClick={() => setEditing({ id: tweet._id, content: tweet.content })}>
                        ✏️
                      </button>
                      <button className="icon-btn" style={{ width: 28, height: 28, fontSize: '0.8rem', color: 'var(--brand)' }}
                        onClick={() => handleDelete(tweet._id)}>
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                {editing?.id === tweet._id ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      className="form-control"
                      value={editing.content}
                      onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
                      rows={3}
                      style={{ marginBottom: 8, resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-brand" style={{ padding: '5px 14px', fontSize: '0.8rem' }}
                        onClick={() => handleUpdate(tweet._id)}>Save</button>
                      <button className="btn btn-ghost" style={{ padding: '5px 14px', fontSize: '0.8rem' }}
                        onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="tweet-content">{tweet.content}</div>
                )}

                <div className="tweet-actions">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ❤️ {tweet.likesCount || 0} likes
                  </span>
                </div>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
