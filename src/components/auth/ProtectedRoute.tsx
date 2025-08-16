// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Mostra um skeleton/loading enquanto verifica a sessão
    return (
      <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    )
  }

  if (!user) {
    // Se não estiver logado e a verificação terminou, redireciona para a página de login
    return <Navigate to="/auth" />;
  }

  // Se estiver logado, renderiza a página solicitada (Dashboard, etc.)
  return <Outlet />;
};
