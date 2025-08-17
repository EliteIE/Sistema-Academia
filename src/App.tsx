// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Reception from '@/pages/Reception'
import Members from '@/pages/Members'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleRoute from '@/components/auth/RoleRoute'
import MainLayout from '@/components/layout/main-layout'

import { useProfile } from '@/hooks/useProfile'

// Decide o destino quando o usuário acessa "/":
// owner  -> /dashboard
// employee -> /reception
function HomeRouter() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) return null // pode trocar por um skeleton/spinner
  if (!profile) return <Navigate to="/auth" replace />

  return (
    <Navigate
      to={profile.role === 'owner' ? '/dashboard' : '/reception'}
      replace
    />
  )
}

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          {/* Pública */}
          <Route path="/auth" element={<Auth />} />

          {/* Área protegida (precisa estar logado) */}
          <Route path="/" element={<ProtectedRoute />}>
            {/* Quando acessar exatamente "#/" decide para onde ir */}
            <Route index element={<HomeRouter />} />

            {/* Tudo que tem layout (Sidebar/Header + Outlet) */}
            <Route element={<MainLayout />}>
              {/* Rotas do DONO */}
              <Route element={<RoleRoute roles={['owner']} />}>
                <Route path="dashboard" element={<Dashboard />} />
                {/* Ex.: outras rotas exclusivas do dono
                <Route path="crm" element={<CRM />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
                */}
              </Route>

              {/* Rotas da RECEPÇÃO (employee) e também visíveis ao dono */}
              <Route element={<RoleRoute roles={['employee', 'owner']} />}>
                <Route path="reception" element={<Reception />} />
                <Route path="members" element={<Members />} />
              </Route>
            </Route>
          </Route>

          {/* Qualquer rota desconhecida leva para "/" e o HomeRouter decide */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}
