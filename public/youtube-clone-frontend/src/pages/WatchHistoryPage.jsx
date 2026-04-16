import { useEffect, useState } from 'react';
import { getWatchHistory } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';

export default function WatchHistoryPage() {
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWatchHistory()
      .then(res => {
        const data = res.data?.data;
        setVideos(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🕓 Watch History</div>
        <div className="page-subtitle">{videos.length} video{videos.length !== 1 ? 's' : ''} watched</div>
      </div>
      <VideoGrid videos={videos} loading={loading} emptyMessage="Your watch history is empty." />
    </div>
  );
}
