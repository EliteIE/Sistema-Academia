import { Link, useLocation } from 'react-router-dom'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProfile } from '@/hooks/useProfile'
import { Home, Users, ClipboardList, CreditCard, Dumbbell, CalendarDays, BarChart3, Settings, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useLocalStorage<boolean>('ui.sidebar.open', true)
  const { data: profile } = useProfile()
  const role = profile?.role ?? 'employee'

  const base = [{ to: '/', label: 'Dashboard', icon: Home }]
  const ownerOnly = [
    { to: '/plans', label: 'Planos', icon: ClipboardList },
    { to: '/subscriptions', label: 'Matrículas', icon: Dumbbell },
    { to: '/payments', label: 'Pagamentos', icon: CreditCard },
    { to: '/classes', label: 'Aulas', icon: CalendarDays },
    { to: '/reports', label: 'Relatórios', icon: BarChart3 },
    { to: '/settings', label: 'Configurações', icon: Settings },
  ]
  const receptionOnly = [{ to: '/reception', label: 'Recepção', icon: Search }, { to: '/members', label: 'Alunos', icon: Users }]

  const items = role === 'owner' ? [...base, ...ownerOnly, ...receptionOnly] : [...base, ...receptionOnly]

  return (
    <aside className={cn('h-screen bg-[#0b0d10] border-r border-white/10 transition-all sticky left-0 top-0', open ? 'w-64' : 'w-16')}>
      <div className="h-16 flex items-center justify-between px-3">
        <div className={cn('text-lg font-semibold tracking-tight overflow-hidden transition-all', open ? 'opacity-100 w-auto' : 'opacity-0 w-0')}>SGA Titan</div>
        <button onClick={() => setOpen(!open)} className="h-8 w-8 grid place-items-center rounded-md border border-white/10 hover:bg-white/5">
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      <nav className="px-2 py-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <Link key={to} to={to} title={!open ? label : undefined}
              className={cn('group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5')}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn('truncate transition-all', open ? 'opacity-100 w-auto' : 'opacity-0 w-0')} aria-hidden={!open}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
