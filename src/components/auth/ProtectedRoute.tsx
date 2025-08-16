import { Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export default function ProtectedRoute() {
  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
    staleTime: 30_000
  })
  if (isLoading) return null
  return data ? <Outlet /> : <Navigate to="/auth" replace />
}
