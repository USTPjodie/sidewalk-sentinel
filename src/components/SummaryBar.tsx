import { AlertTriangle, TrendingUp, Clock } from "lucide-react";

export const SummaryBar = () => {
  const stats = [
    { label: "Today", value: 47, icon: AlertTriangle, trend: "+12%" },
    { label: "This Week", value: 341, icon: TrendingUp, trend: "+8%" },
    { label: "This Month", value: 1284, icon: Clock, trend: "-5%" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                    <span className={`text-xs font-medium ${
                      stat.trend.startsWith("+") ? "text-destructive" : "text-success"
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>System Active</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono text-xs">
              Last sync: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
