import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleRoute from '@/components/auth/RoleRoute'

import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Members from '@/pages/Members'
import Reception from '@/pages/Reception'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* pública */}
        <Route path="/auth" element={<Auth />} />

        {/* bloco autenticado */}
        <Route element={<ProtectedRoute />}>
          {/* home (dashboard) */}
          <Route path="/" element={<Dashboard />} />

          {/* rotas permitidas a owner e employee */}
          <Route element={<RoleRoute roles={['owner', 'employee']} />}>
            <Route path="/reception" element={<Reception />} />
            <Route path="/members" element={<Members />} />
          </Route>

          {/* rotas exclusivas de owner */}
          <Route element={<RoleRoute roles={['owner']} />}>
            <Route path="/plans" element={<div />} />
            <Route path="/subscriptions" element={<div />} />
            <Route path="/payments" element={<div />} />
            <Route path="/classes" element={<div />} />
            <Route path="/reports" element={<div />} />
            <Route path="/settings" element={<div />} />
          </Route>

          {/* fallback dentro da área autenticada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* fallback global (não autenticado cai para /auth) */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </HashRouter>
  )
}
