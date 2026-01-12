import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, children }: MetricCardProps) {
  return (
    <div className={cn("glass-card p-5 animate-fade-in", className)}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
      </div>

      {trend && (
        <div className={cn(
          "mt-2 text-xs font-medium",
          trend.value >= 0 ? "text-success" : "text-destructive"
        )}>
          {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
        </div>
      )}

      {children}
    </div>
  );
}
