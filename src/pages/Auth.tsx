// src/pages/Auth.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button-custom';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
      });
      navigate('/'); // Redireciona para o dashboard após o login

    } catch (error: any) {
      toast({
        title: 'Erro no Login',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-primary/20 shadow-glow">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-fitness rounded-lg flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">SGA Titan</CardTitle>
           <p className="text-muted-foreground">Sistema de Gestão para Academias</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} variant="fitness">
              {loading ? 'Entrando...' : <> <LogIn className="mr-2 h-4 w-4" /> Entrar </>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
