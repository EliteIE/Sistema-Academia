import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button-custom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Dumbbell, 
  UserCheck,
  Settings,
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  icon: any
  href: string
  badge?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    title: "Alunos",
    icon: Users, 
    href: "/members"
  },
  {
    title: "Check-in",
    icon: UserCheck,
    href: "/checkin"
  },
  {
    title: "Planos",
    icon: Package,
    href: "/plans"
  },
  {
    title: "Pagamentos",
    icon: CreditCard,
    href: "/payments"
  },
  {
    title: "Treinos",
    icon: Dumbbell,
    href: "/workouts"
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/settings"
  }
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col bg-gradient-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-fitness rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            <span className="text-lg font-bold text-foreground">SGA Titan</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span className="ml-3">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Academia Titan</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  )
}