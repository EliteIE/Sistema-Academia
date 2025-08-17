import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Calendar } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  monthlyRevenue: number
  dailyCheckins: number
  memberGrowth: number
  revenueGrowth: number
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Total de alunos
      const { count: totalMembers, error: mErr } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
      if (mErr) throw mErr

      // Assinaturas ativas
      const { count: activeMembers, error: sErr } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
      if (sErr) throw sErr

      // Receita do mês (somando amount_paid do mês corrente)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const monthStart = `${year}-${month}-01`
      const nextMonth = new Date(year, now.getMonth() + 1, 1)
      const monthEnd = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1
      ).padStart(2, "0")}-01`

      const { data: payments, error: pErr } = await supabase
        .from("payments")
        .select("amount_paid, payment_date")
        .gte("payment_date", monthStart)
        .lt("payment_date", monthEnd)
      if (pErr) throw pErr

      const monthlyRevenue =
        payments?.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 0

      // Check-ins do dia
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)
      const { count: todaysCheckins, error: cErr } = await supabase
        .from("checkins")
        .select("*", { count: "exact", head: true })
        .gte("checkin_at", `${todayStr}T00:00:00`)
        .lt("checkin_at", `${todayStr}T23:59:59`)
      if (cErr) throw cErr

      // Mock de crescimento (até definirmos a métrica)
      const memberGrowth = 0
      const revenueGrowth = 0

      setStats({
        totalMembers: totalMembers ?? 0,
        activeMembers: activeMembers ?? 0,
        monthlyRevenue,
        dailyCheckins: todaysCheckins ?? 0,
        memberGrowth,
        revenueGrowth,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao carregar o dashboard",
        description:
          "Não foi possível buscar os números. Verifique as tabelas (members, subscriptions, payments, checkins).",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">
          Carregando dashboard...
        </div>
      </div>
    )
  }

  return (
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
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Cards resumidos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.totalMembers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.activeMembers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Hoje</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.dailyCheckins}
          </CardContent>
        </Card>
      </div>

      {/* Linhas inferiores de exemplo/placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>João Silva fez check-in (há 5 minutos)</div>
              <div>Maria Santos renovou plano (há 1 hora)</div>
              <div>Novo treino cadastrado (há 2 horas)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Populares</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Plano Mensal</span>
              <span className="font-medium">
                {Math.floor(stats.activeMembers * 0.6)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plano Trimestral</span>
              <span className="font-medium">
                {Math.floor(stats.activeMembers * 0.3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plano Anual</span>
              <span className="font-medium">
                {Math.floor(stats.activeMembers * 0.1)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Aula de Spinning — hoje às 18:00</div>
            <div>Avaliação Física — amanhã às 14:00</div>
            <div>Manutenção de Equipamentos — sábado às 08:00</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
