import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllVideos } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';

const SORT_OPTIONS = [
  { label: 'Newest', sortBy: 'createdAt', sortType: 'desc' },
  { label: 'Oldest', sortBy: 'createdAt', sortType: 'asc' },
  { label: 'Most Viewed', sortBy: 'views', sortType: 'desc' },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort]       = useState(SORT_OPTIONS[0]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    getAllVideos({ query: q, limit: 24, sortBy: sort.sortBy, sortType: sort.sortType })
      .then(res => setVideos(res.data?.data?.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [q, sort]);

  return (
    <div>
      <div className="page-header d-flex justify-between align-center mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Results for "{q}"</div>
          <div className="page-subtitle">{loading ? 'Searching...' : `${videos.length} videos found`}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => setSort(opt)}
              className="btn btn-ghost"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                background: sort.label === opt.label ? 'var(--bg-hover)' : '',
                borderColor: sort.label === opt.label ? 'var(--border-focus)' : '',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <VideoGrid videos={videos} loading={loading} emptyMessage={`No videos found for "${q}"`} />
    </div>
  );
}
