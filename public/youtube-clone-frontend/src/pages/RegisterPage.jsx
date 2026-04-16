import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser, loginUser } from '../services/api';
import { setCredentials } from '../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: '', username: '', email: '', password: ''
  });
  const [avatar, setAvatar]           = useState(null);
  const [coverImage, setCoverImage]   = useState(null);
  const [avatarPreview, setAvatarPreview]   = useState(null);
  const [coverPreview, setCoverPreview]     = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const avatarRef     = useRef();
  const coverRef      = useRef();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAvatarChange = e => {
    const f = e.target.files[0];
    if (f) { setAvatar(f); setAvatarPreview(URL.createObjectURL(f)); }
  };

  const handleCoverChange = e => {
    const f = e.target.files[0];
    if (f) { setCoverImage(f); setCoverPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { fullname, username, email, password } = form;
    if (!fullname || !username || !email || !password) { setError('All fields are required.'); return; }
    if (!avatar) { setError('Profile picture (avatar) is required.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullname', fullname);
      fd.append('username', username.toLowerCase());
      fd.append('email', email);
      fd.append('password', password);
      fd.append('avatar', avatar);
      if (coverImage) fd.append('coverImage', coverImage);

      await registerUser(fd);

      // Auto-login after register
      const loginRes = await loginUser({ email, password });
      const { user, accessToken } = loginRes.data?.data || {};
      dispatch(setCredentials({ user, accessToken }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <span className="red">▶</span> JTube
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the community and start sharing</p>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">

          {/* Cover Image */}
          <div
            style={{
              width: '100%', height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden',
              background: coverPreview ? `url(${coverPreview}) center/cover` : 'linear-gradient(135deg,#1a1a2e,#16213e)',
              cursor: 'pointer', marginBottom: 16, position: 'relative',
              border: '1px dashed var(--border)',
            }}
            onClick={() => coverRef.current.click()}
          >
            {!coverPreview && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 4 }}>
                <span style={{ fontSize: '1.4rem' }}>🖼️</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to add cover image (optional)</span>
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
                background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'var(--bg-elevated)',
                border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              onClick={() => avatarRef.current.click()}
            >
              {!avatarPreview && <span style={{ fontSize: '1.5rem' }}>👤</span>}
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Profile Picture *</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Click the circle to upload avatar</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullname">Full Name *</label>
              <input id="fullname" name="fullname" className="form-control" placeholder="John Doe" value={form.fullname} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username *</label>
              <input id="username" name="username" className="form-control" placeholder="johndoe" value={form.username} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input id="email" name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" name="password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-brand btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}
