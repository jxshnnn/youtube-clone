import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllVideos } from '../services/api';
import { setVideos, setVideoLoading } from '../store/slices/videoSlice';
import VideoGrid from '../components/video/VideoGrid';

const CATEGORIES = ['All', 'Music', 'Gaming', 'News', 'Live', 'Tech', 'Sports', 'Movies'];

export default function HomePage() {
  const dispatch = useDispatch();
  const { videos, loading, pagination } = useSelector(s => s.video);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = {
      page: 1,
      limit: 24,
      sortBy: 'createdAt',
      sortType: 'desc',
    };
    if (category !== 'All') params.query = category;

    dispatch(setVideoLoading(true));
    getAllVideos(params)
      .then(res => dispatch(setVideos(res.data?.data || { videos: [] })))
      .catch(() => dispatch(setVideoLoading(false)))
      .finally(() => dispatch(setVideoLoading(false)));
    setPage(1);
  }, [category, dispatch]);

  const loadMore = () => {
    const nextPage = page + 1;
    const params = { page: nextPage, limit: 24, sortBy: 'createdAt', sortType: 'desc' };
    if (category !== 'All') params.query = category;

    getAllVideos(params)
      .then(res => {
        const data = res.data?.data || {};
        dispatch(setVideos({ ...data, videos: [...videos, ...(data.videos || [])] }));
        setPage(nextPage);
      })
      .catch(() => {});
  };

  return (
    <div>
      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 20, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: category === cat ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: category === cat ? 'var(--bg-base)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <VideoGrid videos={videos} loading={loading} emptyMessage="No videos yet — be the first to upload!" />

      {/* Load more */}
      {!loading && pagination.currentPage < pagination.totalPages && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn btn-ghost" onClick={loadMore} style={{ padding: '10px 28px' }}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
