import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthGuard({ children }) {
  const { isLoggedIn } = useSelector(s => s.auth);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
