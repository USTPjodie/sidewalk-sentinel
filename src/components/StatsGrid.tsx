import { TrendingUp, TrendingDown, Car, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  variant?: "default" | "destructive" | "warning" | "success";
}

const variants = {
  default: {
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  destructive: {
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  warning: {
    iconBg: "bg-warning/20",
    iconColor: "text-warning",
  },
  success: {
    iconBg: "bg-success/20",
    iconColor: "text-success",
  },
};

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon, 
  variant = "default" 
}: StatCardProps) => {
  const style = variants[variant];
  const isPositive = change && change > 0;
  
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${style.iconBg}`}>
          <Icon className={`w-6 h-6 ${style.iconColor}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? "text-destructive" : "text-success"
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Violations"
        value={47}
        change={12}
        changeLabel="vs. yesterday"
        icon={AlertTriangle}
        variant="destructive"
      />
      <StatCard
        title="Active Cameras"
        value={12}
        icon={Car}
        variant="default"
      />
      <StatCard
        title="Avg. Duration"
        value="23m"
        change={-8}
        changeLabel="vs. last week"
        icon={Clock}
        variant="warning"
      />
      <StatCard
        title="Resolved Today"
        value={31}
        change={-15}
        changeLabel="vs. yesterday"
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
};
