import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button-custom'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Dumbbell, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) navigate('/')
    })
    return () => sub.subscription.unsubscribe()
  }, [navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast({ title: 'Erro no Login', description: error.message || 'Credenciais inválidas', variant: 'destructive' })
        return
      }
      toast({ title: 'Sucesso!', description: 'Login realizado com sucesso.' })
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center mt-2">SGA Titan</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Sistema de Gestão para Academias</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={loading}/>
            <Input type="password" placeholder="Sua senha" value={password} onChange={(e)=>setPassword(e.target.value)} required disabled={loading}/>
            <Button type="submit" className="w-full" disabled={loading} variant="fitness">
              {loading ? 'Entrando…' : (<><LogIn className="mr-2 h-4 w-4" />Entrar</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
