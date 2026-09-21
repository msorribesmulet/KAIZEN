import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/authContext';

export function RequireAuth() {
  const { account, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-ink-muted text-sm">Cargando…</p>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
