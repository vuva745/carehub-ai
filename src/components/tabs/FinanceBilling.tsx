import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const FinanceBilling = () => {
  const handleExport = () => {
    // Create CSV content
    const csvContent = `Date,Client,Amount
Sep 23,PATEL FAMILY,$220.0
Sep 21,ANDERSON,$520.0
Sep 18,DR. MARTENS,$460.0
Sep 15,SMITH FAMILY,$180.0
Sep 12,GOODHEALTH,$860.0`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finance-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Finance & Billing</h2>
        <Button variant="outline" onClick={handleExport}>
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">TOTAL REVENUE</h3>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <p className="text-4xl font-bold">$185,420</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-success">+12.5% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">TOTAL EXPENSES</h3>
            <DollarSign className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-4xl font-bold">$124,032</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">+8.2% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">NET PROFIT</h3>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-4xl font-bold">$61,388</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-success">+18.3% from last month</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">REVENUE OVERVIEW</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { month: "Jan", revenue: 12000 },
              { month: "Feb", revenue: 15000 },
              { month: "Mar", revenue: 18000 },
              { month: "Jun", revenue: 22000 },
              { month: "Jul", revenue: 25000 },
              { month: "Sept", revenue: 28000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Invoices */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">RECENT INVOICES</h3>
          <div className="space-y-2">
            {[
              { date: "Sep 23", client: "PATEL FAMILY", amount: "$220.0" },
              { date: "Sep 21", client: "ANDERSON", amount: "$520.0" },
              { date: "Sep 18", client: "DR. MARTENS", amount: "$460.0" },
              { date: "Sep 15", client: "SMITH FAMILY", amount: "$180.0" },
              { date: "Sep 12", client: "GOODHEALTH", amount: "$860.0" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{invoice.date}</span>
                  <span className="font-medium">{invoice.client}</span>
                </div>
                <span className="font-bold">{invoice.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">EXPENSES BREAKDOWN</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Services", value: 65, color: "hsl(var(--primary))" },
                  { name: "Equipment", value: 20, color: "hsl(var(--chart-2))" },
                  { name: "Supplies", value: 15, color: "hsl(var(--chart-3))" },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: "Services", value: 65, color: "hsl(var(--primary))" },
                  { name: "Equipment", value: 20, color: "hsl(var(--chart-2))" },
                  { name: "Supplies", value: 15, color: "hsl(var(--chart-3))" },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Billing Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">BILLING STATUS</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
              <span className="font-medium">PAID</span>
              <span className="text-2xl font-bold">1085</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20">
              <span className="font-medium">PARTIAL</span>
              <span className="text-2xl font-bold">120</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="font-medium">UNPAID</span>
              <span className="text-2xl font-bold">74</span>
            </div>
          </div>
        </Card>
      </div>

      {/* NEOCARE Branding */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-center">
          <h3 className="text-5xl font-bold text-foreground">NEOCARE</h3>
          <p className="text-muted-foreground mt-2">Financial Management System</p>
        </div>
      </Card>
    </div>
  );
};

export default FinanceBilling;
