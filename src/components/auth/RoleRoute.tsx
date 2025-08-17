import { Navigate, Outlet } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'

type Role = 'owner' | 'employee'

export default function RoleRoute({ roles }: { roles: Role[] }) {
  const { data: profile, loading } = useProfile()

  if (loading) return null
  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}