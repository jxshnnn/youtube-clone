import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toggleSubscription } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function SubscribeButton({ channelId, initialSubscribed = false, onToggle }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading]       = useState(false);
  const { isLoggedIn } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const handleToggle = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (loading) return;
    setLoading(true);
    try {
      await toggleSubscription(channelId);
      setSubscribed(p => !p);
      if (onToggle) onToggle(!subscribed);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <button
      className={`subscribe-btn ${subscribed ? 'subscribed' : 'not-subscribed'}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : subscribed ? '✓ Subscribed' : 'Subscribe'}
    </button>
  );
}
