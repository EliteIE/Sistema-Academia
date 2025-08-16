import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type Role = 'owner' | 'employee'
type Props = { roles: Role[] }

export default function RoleRoute({ roles }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        if (active) { setAllowed(false); setLoading(false) }
        return
      }

      let role: string | null =
        (user.app_metadata as any)?.role ??
        (user.user_metadata as any)?.role ?? null

      if (!role) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
        role = profile?.role ?? null
      }

      const can = !!role && roles.includes(role as Role)
      if (active) { setAllowed(can); setLoading(false) }
    })()
    return () => { active = false }
  }, [roles])

  if (loading) return null
  if (!allowed) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
