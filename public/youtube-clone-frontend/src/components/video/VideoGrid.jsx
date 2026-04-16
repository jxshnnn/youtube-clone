import VideoCard from './VideoCard';
import Spinner from '../common/Spinner';

export default function VideoGrid({ videos, loading, emptyMessage = 'No videos found' }) {
  if (loading) return <Spinner />;

  if (!videos?.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>{emptyMessage}</h3>
        <p>Videos you upload or others share will appear here.</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map(v => <VideoCard key={v._id} video={v} />)}
    </div>
  );
}
