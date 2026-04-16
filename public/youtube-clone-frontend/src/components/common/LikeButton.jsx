import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toggleVideoLike } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function LikeButton({ videoId, initialLiked = false, initialCount = 0 }) {
  const [liked, setLiked]   = useState(initialLiked);
  const [count, setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const handleToggle = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (loading) return;
    setLoading(true);
    try {
      await toggleVideoLike(videoId);
      setLiked(p => !p);
      setCount(p => liked ? p - 1 : p + 1);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <button
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {liked ? '👍' : '👍'} {count > 0 ? count.toLocaleString() : ''} {liked ? 'Liked' : 'Like'}
    </button>
  );
}
