// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública de autenticação */}
          <Route path="/auth" element={<Auth />} />

          {/* Rotas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            {/* Adicione outras rotas protegidas aqui no futuro */}
          </Route>

          {/* Rota para página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
