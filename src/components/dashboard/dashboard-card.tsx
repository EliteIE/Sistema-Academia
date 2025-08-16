import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "primary"
  className?: string
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105",
      variant === "success" && "border-success/20 shadow-success/10",
      variant === "warning" && "border-warning/20 shadow-warning/10", 
      variant === "primary" && "border-primary/20 shadow-glow/20",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
          variant === "primary" && "text-primary",
          variant === "default" && "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-2",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <span className={cn(
              "mr-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "↗" : "↘"}
            </span>
            {Math.abs(trend.value)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}