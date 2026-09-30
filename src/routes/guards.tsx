import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/authStore'
import type { UserRole } from '@/types'

export function RequireAuth({ role }: { role?: UserRole }) {
  const session = useAuth((s) => s.session)
  const loc = useLocation()
  if (!session) return <Navigate to="/masuk" replace state={{ from: loc.pathname }} />
  if (role && session.user.role !== role) return <Navigate to="/masuk" replace state={{ from: loc.pathname, wrongRole: role }} />
  return <Outlet />
}
