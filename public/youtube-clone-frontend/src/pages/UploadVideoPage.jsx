import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { publishVideo } from '../services/api';
import { addToast } from '../store/slices/uiSlice';

export default function UploadVideoPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ title: '', description: '', duration: '' });
  const [videoFile,   setVideoFile]   = useState(null);
  const [thumbnail,   setThumbnail]   = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error,    setError]      = useState('');

  const videoRef = useRef();
  const thumbRef = useRef();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleVideoChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setVideoFile(f);
    // auto-fill duration using video element
    const url = URL.createObjectURL(f);
    const vid = document.createElement('video');
    vid.src = url;
    vid.onloadedmetadata = () => {
      setForm(p => ({ ...p, duration: Math.round(vid.duration) }));
      URL.revokeObjectURL(url);
    };
  };

  const handleThumbnailChange = e => {
    const f = e.target.files[0];
    if (f) { setThumbnail(f); setThumbPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim())   { setError('Title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!videoFile)           { setError('Please select a video file'); return; }
    if (!thumbnail)           { setError('Please select a thumbnail'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('duration',    form.duration || 0);
      fd.append('videoFile',   videoFile);
      fd.append('thumbnail',   thumbnail);

      await publishVideo(fd);
      dispatch(addToast({ type: 'success', message: 'Video uploaded successfully!' }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">🎬 Upload Video</div>
        <div className="page-subtitle">Share your content with the world</div>
      </div>

      {error && <div className="alert-box error">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

          {/* Left: Video + details */}
          <div>
            {/* Video Upload Zone */}
            <div
              className={`upload-zone ${videoFile ? 'has-file' : ''}`}
              onClick={() => !videoFile && videoRef.current.click()}
            >
              {videoFile ? (
                <>
                  <div className="upload-zone-icon">✅</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{videoFile.name}</div>
                  <div className="upload-zone-subtext">{(videoFile.size / 1_000_000).toFixed(1)} MB</div>
                  <button type="button" className="btn btn-ghost" style={{ marginTop: 12, fontSize: '0.8rem', padding: '5px 14px' }}
                    onClick={e => { e.stopPropagation(); setVideoFile(null); setForm(p => ({ ...p, duration: '' })); }}>
                    Change Video
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-zone-icon">📁</div>
                  <div className="upload-zone-text">Click to select a video file</div>
                  <div className="upload-zone-subtext">MP4, WebM, AVI, MOV — max 500MB</div>
                </>
              )}
              <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoChange} />
            </div>

            {/* Title */}
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Title *</label>
              <input name="title" className="form-control" placeholder="Give your video a catchy title" value={form.title} onChange={handleChange} />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-control" placeholder="Tell viewers about your video..." rows={5} value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>

            {/* Duration (auto-filled) */}
            <div className="form-group">
              <label className="form-label">Duration (seconds)</label>
              <input name="duration" type="number" className="form-control" placeholder="Auto-detected from video" value={form.duration} onChange={handleChange} />
            </div>
          </div>

          {/* Right: Thumbnail */}
          <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Thumbnail *</label>
            <div
              style={{
                width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                border: thumbnail ? '1px solid rgba(16,185,129,0.4)' : '2px dashed var(--border)',
                cursor: 'pointer', background: thumbPreview ? `url(${thumbPreview}) center/cover` : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
              }}
              onClick={() => thumbRef.current.click()}
            >
              {!thumbPreview && (
                <>
                  <span style={{ fontSize: '2rem' }}>🖼️</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click to upload thumbnail</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>JPG, PNG — recommended 1280×720</span>
                </>
              )}
              <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbnailChange} />
            </div>

            {thumbPreview && (
              <button type="button" className="btn btn-ghost" style={{ marginTop: 8, width: '100%', fontSize: '0.8rem' }}
                onClick={() => { setThumbnail(null); setThumbPreview(null); }}>
                Change Thumbnail
              </button>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>Uploading... please wait</div>
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--brand)', width: '100%', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button type="submit" className="btn btn-brand" style={{ padding: '10px 28px' }} disabled={uploading}>
            {uploading ? '⏳ Uploading...' : '🚀 Publish Video'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={uploading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
