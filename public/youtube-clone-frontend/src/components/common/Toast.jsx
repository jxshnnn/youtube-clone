import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { useEffect } from 'react';

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <div className={`toast ${toast.type || 'info'}`}>
      <span className="toast-icon">{icons[toast.type] || icons.info}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        className="icon-btn"
        style={{ width: 24, height: 24, fontSize: '0.8rem', flexShrink: 0 }}
        onClick={() => dispatch(removeToast(toast.id))}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector(s => s.ui.toasts);
  return (
    <div className="toast-container">
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  );
}
