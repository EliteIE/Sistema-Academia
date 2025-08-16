import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Activity, Users, Calendar } from "lucide-react"

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  monthlyRevenue: number
  dailyCheckins: number
  memberGrowth: number
  revenueGrowth: number
}

interface Member {
  id: string
  full_name: string
  phone_number?: string
  email?: string
  end_date?: string
  plan_name?: string
  days_since_lapsed?: number
}

export default function Dashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    dailyCheckins: 0,
    memberGrowth: 0,
    revenueGrowth: 0
  })
  const [upcomingExpirations, setUpcomingExpirations] = useState<Member[]>([])
  const [lapsedMembers, setLapsedMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Mock user data (later will come from auth)
  const user = {
    name: "Admin Academia",
    email: "admin@academia.com",
    role: "admin"
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Carregar estatísticas básicas
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')

      if (membersError) throw membersError

      // Carregar assinaturas ativas
      const { data: activeSubscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')

      if (subscriptionsError) throw subscriptionsError

      // Carregar pagamentos do mês
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount_paid')
        .gte('payment_date', `${currentMonth}-01`)

      if (paymentsError) throw paymentsError

      // Carregar check-ins do dia
      const today = new Date().toISOString().slice(0, 10)
      const { data: checkins, error: checkinsError } = await supabase
        .from('checkins')
        .select('*')
        .gte('checkin_at', `${today}T00:00:00`)

      if (checkinsError) throw checkinsError

      // Carregar vencimentos próximos
      const { data: expirations, error: expirationsError } = await supabase
        .from('view_upcoming_expirations')
        .select('*')

      if (expirationsError) throw expirationsError

      // Carregar alunos inativos
      const { data: lapsed, error: lapsedError } = await supabase
        .from('view_lapsed_members')
        .select('*')

      if (lapsedError) throw lapsedError

      // Calcular estatísticas
      const monthlyRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount_paid), 0) || 0

      setStats({
        totalMembers: members?.length || 0,
        activeMembers: activeSubscriptions?.length || 0,
        monthlyRevenue,
        dailyCheckins: checkins?.length || 0,
        memberGrowth: 12, // Mock data
        revenueGrowth: 8   // Mock data
      })

      setUpcomingExpirations(expirations || [])
      setLapsedMembers(lapsed || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando dashboard...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral da sua academia
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Notifications Panel */}
        <NotificationsPanel 
          upcomingExpirations={upcomingExpirations}
          lapsedMembers={lapsedMembers}
        />

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm">João Silva fez check-in</p>
                    <p className="text-xs text-muted-foreground">há 5 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm">Maria Santos renovou plano</p>
                    <p className="text-xs text-muted-foreground">há 1 hora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm">Novo treino criado</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Populares</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plano Mensal</span>
                  <span className="text-sm font-medium">{Math.floor(stats.activeMembers * 0.6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plano Trimestral</span>
                  <span className="text-sm font-medium">{Math.floor(stats.activeMembers * 0.3)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plano Anual</span>
                  <span className="text-sm font-medium">{Math.floor(stats.activeMembers * 0.1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm">Aula de Spinning</p>
                  <p className="text-xs text-muted-foreground">Hoje às 18:00</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">Avaliação Física</p>
                  <p className="text-xs text-muted-foreground">Amanhã às 14:00</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">Manutenção Equipamentos</p>
                  <p className="text-xs text-muted-foreground">Sábado às 08:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}