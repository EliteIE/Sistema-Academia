import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function ProtectedRoute() {
  const [status, setStatus] = useState<'loading' | 'anon' | 'auth'>('loading')

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setStatus(data.session ? 'auth' : 'anon')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return
      setStatus(session ? 'auth' : 'anon')
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') return null    // evita flicker
  if (status === 'anon') return <Navigate to="/auth" replace />
  return <Outlet />
}