import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const dailyData = [
  { hour: "00:00", violations: 2, resolved: 1 },
  { hour: "03:00", violations: 1, resolved: 1 },
  { hour: "06:00", violations: 5, resolved: 3 },
  { hour: "09:00", violations: 12, resolved: 8 },
  { hour: "12:00", violations: 18, resolved: 12 },
  { hour: "15:00", violations: 15, resolved: 10 },
  { hour: "18:00", violations: 22, resolved: 14 },
  { hour: "21:00", violations: 8, resolved: 6 },
];

const weeklyData = [
  { day: "Mon", violations: 45, resolved: 38 },
  { day: "Tue", violations: 52, resolved: 42 },
  { day: "Wed", violations: 38, resolved: 35 },
  { day: "Thu", violations: 61, resolved: 48 },
  { day: "Fri", violations: 75, resolved: 58 },
  { day: "Sat", violations: 42, resolved: 38 },
  { day: "Sun", violations: 28, resolved: 25 },
];

const severityData = [
  { name: "High", value: 28, color: "hsl(0 72% 51%)" },
  { name: "Medium", value: 45, color: "hsl(38 92% 50%)" },
  { name: "Low", value: 27, color: "hsl(142 71% 45%)" },
];

const vehicleTypes = [
  { type: "Car", count: 156 },
  { type: "Truck", count: 42 },
  { type: "Van", count: 38 },
  { type: "Motorcycle", count: 24 },
  { type: "Bus", count: 8 },
];

type Period = "daily" | "weekly" | "monthly";

export const AnalyticsCharts = () => {
  const [period, setPeriod] = useState<Period>("daily");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Analytics Overview</h2>
        <div className="flex gap-2 bg-secondary/50 rounded-lg p-1">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations Timeline */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Violations Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={period === "daily" ? dailyData : weeklyData}>
                <defs>
                  <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173 80% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(173 80% 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
                <XAxis 
                  dataKey={period === "daily" ? "hour" : "day"} 
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stroke="hsl(173 80% 45%)"
                  strokeWidth={2}
                  fill="url(#violationsGradient)"
                  name="Violations"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="hsl(142 71% 45%)"
                  strokeWidth={2}
                  fill="url(#resolvedGradient)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Severity Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Violations by Vehicle Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
                <XAxis type="number" stroke="hsl(215 20% 55%)" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="type" 
                  stroke="hsl(215 20% 55%)" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(173 80% 45%)" 
                  radius={[0, 4, 4, 0]}
                  name="Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Peak Violation Hours
          </h3>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const intensity = Math.random();
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md flex items-center justify-center text-xs font-mono transition-all hover:scale-110"
                  style={{
                    backgroundColor: `hsl(0 72% 51% / ${intensity * 0.7 + 0.1})`,
                    color: intensity > 0.5 ? "white" : "hsl(215 20% 55%)",
                  }}
                  title={`${String(i).padStart(2, "0")}:00 - ${Math.floor(intensity * 20)} violations`}
                >
                  {String(i).padStart(2, "0")}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Hover over hours to see violation counts
          </p>
        </div>
      </div>
    </div>
  );
};
