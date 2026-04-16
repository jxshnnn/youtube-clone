import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getLikedVideos } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';

export default function LikedVideosPage() {
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLikedVideos()
      .then(res => setVideos(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👍 Liked Videos</div>
        <div className="page-subtitle">{videos.length} liked video{videos.length !== 1 ? 's' : ''}</div>
      </div>
      <VideoGrid videos={videos} loading={loading} emptyMessage="You haven't liked any videos yet." />
    </div>
  );
}
