import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Home, Users, ClipboardList } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

type Role = 'owner' | 'employee'

type Item = {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  roles: Role[]
}

// ⚠️ Dashboard agora em /dashboard (combina com o App.tsx)
const MENU: Item[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, roles: ['owner'] },
  { to: '/members',   label: 'Alunos',    icon: Users, roles: ['owner', 'employee'] },
  { to: '/reception', label: 'Recepção',  icon: ClipboardList, roles: ['owner', 'employee'] },
]

// utilitario simples
function clsx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function SidebarNav() {
  const location = useLocation()
  const { data: profile, isLoading } = useProfile()
  const role = profile?.role as Role | undefined

  const items = useMemo(
    () => (role ? MENU.filter(i => i.roles.includes(role)) : []),
    [role]
  )

  if (isLoading) {
    return (
      <nav className="mt-2 flex flex-col gap-1">
        <div className="h-7 w-full animate-pulse rounded bg-neutral-800" />
        <div className="h-7 w-full animate-pulse rounded bg-neutral-800" />
        <div className="h-7 w-full animate-pulse rounded bg-neutral-800" />
      </nav>
    )
  }

  if (!role) return null

  return (
    <nav className="mt-2 flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        // Marca ativo em rotas exatas e também sub-rotas
        const isCurrent =
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + '/')

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                (isActive || isCurrent)
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar:collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  return (
    <aside
      className={clsx(
        'h-full border-r border-neutral-800 bg-neutral-900 text-neutral-200',
        collapsed ? 'w-[64px]' : 'w-[220px]'
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && <span className="text-sm font-semibold">Menu</span>}
        <button
          className="rounded px-2 py-1 text-xs hover:bg-neutral-800"
          onClick={() => setCollapsed(v => !v)}
          title="Alternar sidebar"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <div className="px-2">
        <SidebarNav />
      </div>
    </aside>
  )
}
