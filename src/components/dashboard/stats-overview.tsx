import { DashboardCard } from "./dashboard-card"
import { Users, CreditCard, UserCheck, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    totalMembers: number
    activeMembers: number
    monthlyRevenue: number
    dailyCheckins: number
    memberGrowth: number
    revenueGrowth: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total de Alunos"
        value={stats.totalMembers}
        description="Membros cadastrados"
        icon={Users}
        trend={{
          value: stats.memberGrowth,
          isPositive: stats.memberGrowth > 0
        }}
        variant="primary"
      />
      
      <DashboardCard
        title="Alunos Ativos"
        value={stats.activeMembers}
        description="Com mensalidade em dia"
        icon={UserCheck}
        variant="success"
      />
      
      <DashboardCard
        title="Receita Mensal"
        value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`}
        description="Faturamento do mês"
        icon={CreditCard}
        trend={{
          value: stats.revenueGrowth,
          isPositive: stats.revenueGrowth > 0
        }}
        variant="success"
      />
      
      <DashboardCard
        title="Check-ins Hoje"
        value={stats.dailyCheckins}
        description="Frequência diária"
        icon={TrendingUp}
        variant="default"
      />
    </div>
  )
}