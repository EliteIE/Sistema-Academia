import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-custom"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Users, Phone } from "lucide-react"

interface Member {
  id: string
  full_name: string
  phone_number?: string
  email?: string
  end_date?: string
  plan_name?: string
  days_since_lapsed?: number
}

interface NotificationsPanelProps {
  upcomingExpirations: Member[]
  lapsedMembers: Member[]
}

export function NotificationsPanel({ upcomingExpirations, lapsedMembers }: NotificationsPanelProps) {
  const recentLapsed = lapsedMembers.filter(m => m.days_since_lapsed && m.days_since_lapsed >= 30 && m.days_since_lapsed < 90)
  const oldLapsed = lapsedMembers.filter(m => m.days_since_lapsed && m.days_since_lapsed >= 90)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Vencimentos Próximos */}
      <Card className="border-warning/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            Vencimentos da Semana
          </CardTitle>
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {upcomingExpirations.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingExpirations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum vencimento próximo</p>
          ) : (
            upcomingExpirations.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.plan_name}</p>
                  <p className="text-xs text-warning">Vence: {member.end_date}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="h-3 w-3 mr-1" />
                  Contatar
                </Button>
              </div>
            ))
          )}
          {upcomingExpirations.length > 5 && (
            <Button variant="ghost" className="w-full text-sm">
              Ver todos ({upcomingExpirations.length})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Oportunidades de Reativação */}
      <Card className="border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Oportunidades de Reativação
          </CardTitle>
          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
            {recentLapsed.length + oldLapsed.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inativos Recentes */}
          {recentLapsed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Inativos Recentes (30-89 dias)</span>
                <Badge variant="outline" className="text-xs">{recentLapsed.length}</Badge>
              </div>
              {recentLapsed.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.days_since_lapsed} dias inativo
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Reativar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Inativos Antigos */}
          {oldLapsed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Inativos Antigos (90+ dias)</span>
                <Badge variant="outline" className="text-xs">{oldLapsed.length}</Badge>
              </div>
              {oldLapsed.slice(0, 2).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.days_since_lapsed} dias inativo
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Promoção
                  </Button>
                </div>
              ))}
            </div>
          )}

          {recentLapsed.length === 0 && oldLapsed.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma oportunidade de reativação</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}