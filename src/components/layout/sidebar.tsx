import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Users,
  CreditCard,
  Settings,
  Dumbbell,
  ClipboardCheck,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Corrigido: Renomeado para SidebarNav e adicionado 'export'
export function SidebarNav() {
  const navLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/members', icon: Users, label: 'Alunos' },
    { to: '/checkin', icon: ClipboardCheck, label: 'Check-in' },
    { to: '/plans', icon: Dumbbell, label: 'Planos' },
    { to: '/payments', icon: CreditCard, label: 'Pagamentos' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-fitness text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Dumbbell className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">SGA Titan</span>
        </div>
        <TooltipProvider>
          {navLinks.map((link) => (
            <Tooltip key={link.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      {
                        'bg-accent text-accent-foreground': isActive,
                      }
                    )
                  }
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
