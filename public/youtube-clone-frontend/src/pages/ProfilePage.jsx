import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAccount, updateAvatar, updateCoverImage, changePassword, getCurrentUser } from '../services/api';
import { setUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import Avatar from '../components/common/Avatar';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [accountForm, setAccountForm] = useState({ fullname: user?.fullname || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [tab, setTab] = useState('profile');

  const avatarRef = useRef();
  const coverRef  = useRef();

  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (!accountForm.fullname || !accountForm.email) {
      dispatch(addToast({ type: 'error', message: 'All fields required' })); return;
    }
    setSavingAccount(true);
    try {
      const res = await updateAccount(accountForm);
      dispatch(setUser(res.data?.data));
      dispatch(addToast({ type: 'success', message: 'Profile updated!' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' }));
    }
    setSavingAccount(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword) { dispatch(addToast({ type: 'error', message: 'Fill all password fields' })); return; }
    if (newPassword !== confirmPassword) { dispatch(addToast({ type: 'error', message: 'Passwords do not match' })); return; }
    setSavingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      dispatch(addToast({ type: 'success', message: 'Password changed!' }));
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to change password' }));
    }
    setSavingPassword(false);
  };

  const handleAvatarChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('avatar', f);
    try {
      const res = await updateAvatar(fd);
      dispatch(setUser(res.data?.data));
      dispatch(addToast({ type: 'success', message: 'Avatar updated!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update avatar' }));
    }
  };

  const handleCoverChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('coverImage', f);
    try {
      const res = await updateCoverImage(fd);
      dispatch(setUser(res.data?.data));
      dispatch(addToast({ type: 'success', message: 'Cover image updated!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update cover image' }));
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">⚙️ Account Settings</div>
        <div className="page-subtitle">Manage your profile and preferences</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['profile', 'password'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' ? '👤 Profile' : '🔑 Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div>
          {/* Cover Image */}
          <div
            style={{
              width: '100%', height: 140, borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
              background: user?.coverImage ? `url(${user.coverImage}) center/cover` : 'linear-gradient(135deg,#1a1a2e,#16213e)',
              marginBottom: -40, position: 'relative', border: '1px solid var(--border)',
            }}
            onClick={() => coverRef.current.click()}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
            >
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                ✏️ Change Cover
              </span>
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          </div>

          {/* Avatar */}
          <div style={{ paddingLeft: 20, position: 'relative', zIndex: 1, marginBottom: 24 }}
            onClick={() => avatarRef.current.click()}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--bg-base)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
              <Avatar src={user?.avatar} name={user?.fullname || user?.username} size={80} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: '0.7rem', color: '#fff' }}>✏️</span>
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          {/* Account Form */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <form onSubmit={handleAccountSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={accountForm.fullname} onChange={e => setAccountForm(p => ({ ...p, fullname: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-control" value={`@${user?.username || ''}`} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <button type="submit" className="btn btn-brand" disabled={savingAccount}>
                {savingAccount ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <form onSubmit={handlePasswordSave}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" placeholder="Enter current password"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-brand" disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
