// src/components/layout/main-layout.tsx
import { Outlet } from 'react-router-dom'

// ⬇️ Sidebar exporta default (como já deixamos no sidebar.tsx)
import Sidebar from '@/components/layout/sidebar'

// ⬇️ Header exporta **named** (ex.: `export function Header() { ... }`)
import { Header } from '@/components/layout/header'

export default function MainLayout() {
  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex">
      {/* Lateral */}
      <Sidebar />

      {/* Coluna principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Header />

        {/* Conteúdo da rota */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
