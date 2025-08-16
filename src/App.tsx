// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import MembersPage from './pages/Members';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Adiciona o basename para funcionar no GitHub Pages */}
        <Router basename="/Sistema-Academia/">
          <Routes>
            {/* Rota pública de autenticação */}
            <Route path="/auth" element={<Auth />} />

            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<MembersPage />} />
            </Route>

            {/* Rota para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

