import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getComments, addComment, deleteComment } from '../../services/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function CommentSection({ videoId }) {
  const { user, isLoggedIn } = useSelector(s => s.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    getComments(videoId, { limit: 30 })
      .then(res => setComments(res.data?.data?.docs || res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await addComment(videoId, { content: text.trim() });
      const newComment = res.data?.data;
      if (newComment) {
        setComments(p => [{
          ...newComment,
          owner: { username: user?.username, fullname: user?.fullname, avatar: user?.avatar },
        }, ...p]);
      }
      setText('');
    } catch (_) {}
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(p => p.filter(c => c._id !== commentId));
    } catch (_) {}
  };

  return (
    <div className="comment-section">
      <div className="comment-header">{comments.length} Comments</div>

      {/* Add comment */}
      {isLoggedIn && (
        <form className="comment-add" onSubmit={handleSubmit}>
          <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={36} />
          <div style={{ flex: 1 }}>
            <textarea
              ref={inputRef}
              className="comment-input"
              placeholder="Add a comment..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={1}
              style={{ width: '100%', resize: 'none', minHeight: 36 }}
            />
            {text.trim() && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setText('')}>Cancel</button>
                <button type="submit" className="btn btn-brand" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={submitting}>
                  {submitting ? '...' : 'Comment'}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {loading ? <Spinner size={28} /> : (
        <div className="comment-list">
          {comments.length === 0 && (
            <div className="text-muted text-sm" style={{ textAlign: 'center', padding: '24px 0' }}>
              No comments yet. Be the first!
            </div>
          )}
          {comments.map(c => (
            <div key={c._id} className="comment-item">
              <Avatar
                src={c.owner?.avatar}
                name={c.owner?.fullname || c.owner?.username}
                size={36}
              />
              <div className="comment-body">
                <div className="comment-author">
                  {c.owner?.fullname || c.owner?.username}
                  <span>{timeAgo(c.createdAt)}</span>
                </div>
                <div className="comment-text">{c.content}</div>
                {user && c.owner?._id === user._id && (
                  <div className="comment-actions">
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(c._id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
