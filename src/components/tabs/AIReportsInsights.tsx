import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AIReportsInsights = () => {
  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold text-foreground">AI Reports & Insights</h2>
        <span className="text-lg text-muted-foreground">April 25, 2024</span>
      </div>

      {/* Metrics Overview */}
      <Card className="p-8 bg-card border-2 border-border">
        <div className="grid grid-cols-5 gap-8">
          <div className="text-center border-r border-border">
            <p className="text-7xl font-bold">452</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">UPDATES</p>
          </div>
          <div className="text-center border-r border-border">
            <p className="text-7xl font-bold">318</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">EVENTS</p>
          </div>
          <div className="text-center border-r border-border">
            <p className="text-7xl font-bold text-warning">76</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">WARNINGS</p>
          </div>
          <div className="text-center border-r border-border">
            <p className="text-7xl font-bold text-foreground">25</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">ALERTS</p>
          </div>
          <div className="text-center">
            <p className="text-7xl font-bold text-primary">25</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">AIT</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6">Trends</h3>
          <p className="text-lg text-muted-foreground mb-4">Warnings Last Week</p>
          
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { day: "Fri", warnings: 40 },
              { day: "Sat", warnings: 55 },
              { day: "Sun", warnings: 45 },
              { day: "Mon", warnings: 60 },
              { day: "Tue", warnings: 70 },
              { day: "Wed", warnings: 78 },
              { day: "Thu", warnings: 80 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="warnings" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Vitals Analysis */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6">Vitals Analysis</h3>
          <div className="space-y-4">
            {[
              { name: "Heart Rate", trend: "up" },
              { name: "Blood Pressure", trend: "up" },
              { name: "Respiration", trend: "down" },
              { name: "Temperature", trend: "down" },
              { name: "SpO2", trend: "down" }
            ].map((vital, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  {vital.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-success" />
                  )}
                  <span className="font-medium text-lg">{vital.name}</span>
                </div>
                {vital.trend === "up" ? (
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Risk Alerts - Two Columns */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6">Risk Alerts</h3>
          <div className="space-y-3">
            {[
              { patient: "ANN J.", condition: "Hypoxia detected", time: "08:12" },
              { patient: "ROBERT C.", condition: "Multiple fils detected", time: "07:45" },
              { patient: "GLADYS P.", condition: "Fever detected", time: "07:18" },
              { patient: "FRANK M.", condition: "Critical blood glucose", time: "06:55" }
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-cyan-400/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold">{alert.patient}</p>
                    <p className="text-sm text-muted-foreground">{alert.condition}</p>
                  </div>
                </div>
                <span className="font-medium">{alert.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6">Risk Alerts</h3>
          <div className="space-y-3">
            {[
              { patient: "ANN J.", condition: "Hypexia", time: "07:12" },
              { patient: "ROBERT C.", condition: "falls detected", time: "07:45" },
              { patient: "GLADYS P.", condition: "Fever", time: "07:18" },
              { patient: "FRANK M.", condition: "Critical glucose", time: "06:55" }
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-cyan-400/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold">{alert.patient}</p>
                    <p className="text-sm text-muted-foreground">{alert.condition}</p>
                  </div>
                </div>
                <span className="font-medium">{alert.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 text-center">
        <div className="flex items-center justify-center gap-4">
          <Activity className="w-12 h-12 text-primary" />
          <div>
            <h3 className="text-3xl font-bold">AI-Powered Healthcare Insights</h3>
            <p className="text-muted-foreground mt-2">Real-time monitoring and intelligent analysis for better patient care</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIReportsInsights;
