import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

type Role = 'owner' | 'employee'
type Profile = {
  user_id: string
  gym_id: string | null
  role: Role
  full_name: string | null
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ['profile'],
    // NÃO faça nada se não estiver autenticado
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id,gym_id,role,full_name')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    retry: 0,                    // evita loop em caso de erro
    refetchOnWindowFocus: false, // evita piscar ao focar janela
    staleTime: 5 * 60 * 1000,    // 5 min de cache
  })
}
