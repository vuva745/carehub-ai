import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, XCircle, Shield, Lock } from "lucide-react";

type StatusType = "active" | "pending" | "expired" | "verified" | "locked" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { icon: typeof CheckCircle; className: string; defaultLabel: string }> = {
  active: {
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/30",
    defaultLabel: "Active",
  },
  pending: {
    icon: Clock,
    className: "bg-warning/20 text-warning border-warning/30",
    defaultLabel: "Pending",
  },
  expired: {
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
    defaultLabel: "Expired",
  },
  verified: {
    icon: Shield,
    className: "bg-success/20 text-success border-success/30",
    defaultLabel: "Verified",
  },
  locked: {
    icon: Lock,
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
    defaultLabel: "Locked",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-warning/20 text-warning border-warning/30",
    defaultLabel: "Warning",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label || config.defaultLabel}
    </span>
  );
}
