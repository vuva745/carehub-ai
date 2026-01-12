import { Shield, Calendar, ChevronDown, Download, Info, CheckCircle, Clock, AlertCircle, Lightbulb, Filter, X, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { generateNursePayoutData } from "@/lib/exportUtils";
import { runTab18NeoPayEscrow } from "@/lib/neocare-ai/tab18-script";
import { useState, useEffect } from "react";

const nurses = [
  { name: "Mia", role: "Team Lead", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80", moments: 17, rate: 30, hours: null, status: null },
  { name: "Jeffrey", role: "Nurse", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80", moments: 20, rate: 28, hours: "30 h", status: "Pending verification..." },
  { name: "Emma", role: "Nurse", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80", moments: 15, rate: 29, hours: "20 h", status: "Payout queued..." },
  { name: "Liam", role: "Nurse", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80", moments: 18, rate: 27, hours: "21 h", status: "Paid" },
  { name: "Liam", role: "Nurse", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80", moments: 18, rate: 27, hours: "21 h", status: "Paid" },
];


export function Tab18NeoPayEscrow() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<any>({});
  const [range, setRange] = useState("30d");

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab18NeoPayEscrow(range, filter);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range, filter]);

  if (loading) return <div className="p-10 text-center text-purple-500">Loading NeoPay Escrow...</div>;

  const model = data || {};
  const kpiCards = model.layout?.find((l: any) => l.type === "kpi_cards")?.items || [];
  const filters = model.layout?.find((l: any) => l.type === "filters");
  const escrowAccounts = model.layout?.find((l: any) => l.type === "escrow_accounts")?.items || [];
  const riskPanel = model.layout?.find((l: any) => l.type === "risk_panel");
  const payoutRuns = model.layout?.find((l: any) => l.type === "payout_runs")?.items || [];
  const escrowLedger = model.layout?.find((l: any) => l.type === "escrow_ledger")?.items || [];

  const payoutData = generateNursePayoutData();

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated.`,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev: any) => ({ ...prev, [key]: value === "all" || value === "" ? undefined : value }));
  };

  const handleClearFilters = () => {
    setFilter({});
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      {model.banner && (
        <Card className={`border-0 shadow-lg ${
          model.banner.severity === "critical" ? "bg-destructive/10 border-destructive/30" :
          model.banner.severity === "warning" ? "bg-warning/10 border-warning/30" :
          "bg-info/10 border-info/30"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {model.banner.severity === "critical" ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
               model.banner.severity === "warning" ? <AlertTriangle className="w-5 h-5 text-warning" /> :
               <Info className="w-5 h-5 text-info" />}
              <div>
                <p className="font-semibold">{model.banner.title}</p>
                <p className="text-sm text-muted-foreground">{model.banner.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide mb-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            {model.header?.title || "NeoPay Escrow Nurse Payout"}
          </h1>
          <p className="text-purple-600/80 dark:text-purple-400/80 text-lg">
            TAB: 18 | {model.header?.subtitle || "NeoPay Escrow Nurse Payout"}
            {model.header?.rightMeta?.riskLevel && ` • ${model.header.rightMeta.riskLevel}`}
          </p>
        </div>
        <ExportButton
          label="Export Full Report"
          options={[
            { label: "Export as PDF", format: "pdf" },
            { label: "Export as Word", format: "word" },
            { label: "Export as CSV", format: "csv" }
          ]}
          data={payoutData}
          pdfTitle="NeoPay Escrow Full Report"
          filename="neopay-escrow-full-report"
        />
      </div>

      {model.disclaimer && (
        <p className="text-xs text-muted-foreground italic">{model.disclaimer}</p>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi: any) => (
          <MetricCard
            key={kpi.label}
            title={kpi.label}
            value={String(kpi.value)}
            subtitle="7D Proof Verified"
            className="border border-purple-300/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
          />
        ))}
      </div>

      {/* Filters */}
      {filters && (
        <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
              {filters.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filters.items?.map((filterItem: any) => (
                <div key={filterItem.key} className="space-y-2">
                  <Label className="text-xs">{filterItem.label}</Label>
                  {filterItem.type === "select" ? (
                    <Select
                      value={filterItem.value}
                      onValueChange={(value) => {
                        if (filterItem.key === "range") {
                          setRange(value);
                        } else {
                          handleFilterChange(filterItem.key, value);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterItem.options?.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={filterItem.label}
                      value={filterItem.value}
                      onChange={(e) => handleFilterChange(filterItem.key, e.target.value)}
                      className="h-9"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => handleAction("Filters Applied")} className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                <Filter className="w-4 h-4 mr-2" /> Apply Filters
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearFilters} className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                <X className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - About Escrow */}
        <div className="space-y-4">
          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">About NeoPay Nurse Escrow Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-32 h-32 mx-auto relative">
                {/* Neon glow layers */}
                <div className="absolute -inset-2 bg-yellow-500/40 rounded-2xl blur-lg animate-pulse" />
                <div className="absolute -inset-1 bg-red-500/30 rounded-2xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-warning to-destructive/60 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                  <div className="text-center text-warning-foreground drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                    <span className="text-4xl font-bold">€</span>
                    <p className="font-bold text-sm">NEOPAY</p>
                    <p className="text-xs">ESCROW</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Earnings are securely held in escrow until payout. Nurses are paid based on verified care moments completed.
              </p>
              <p className="text-sm text-muted-foreground">
                Escrow ensures funds are reliably disbursed according to the schedule.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    View Escrow Policies →
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Escrow Policies</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Verification Period</h4>
                      <p className="text-sm text-muted-foreground">Care moments are verified within 24 hours.</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Payout Schedule</h4>
                      <p className="text-sm text-muted-foreground">Payouts are processed weekly on scheduled dates.</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Dispute Resolution</h4>
                      <p className="text-sm text-muted-foreground">Any discrepancies can be flagged for review.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Middle Columns - Payout Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {["15-21 Apr", "This Month", "Last Month"].map((period, i) => (
                  <Button 
                    key={period} 
                    variant={i === 0 ? "secondary" : "outline"} 
                    size="sm"
                    className={i === 0 
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                      : "border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                    }
                  >
                    {period}
                  </Button>
                ))}
                <div className="ml-auto">
                  <ExportButton
                    label="Export Payout Log"
                    options={[
                      { label: "Export as PDF", format: "pdf" },
                      { label: "Export as Word", format: "word" },
                      { label: "Export as CSV", format: "csv" }
                    ]}
                    data={payoutData}
                    pdfTitle="NeoPay Escrow Payout Report"
                    filename="neopay-escrow-payout"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-300/30">
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Nurse Payouts</span>
                <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="overflow-x-auto rounded-lg border border-purple-200/50">
                <table className="w-full text-sm">
                  <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                    <tr className="border-b border-purple-300/50 text-left">
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Nurse</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Period</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Amount</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Care Events</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Proof</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Status</th>
                      <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRuns.length > 0 ? payoutRuns.map((run: any) => {
                      const fromDate = run.period?.fromUtc ? new Date(run.period.fromUtc) : null;
                      const toDate = run.period?.toUtc ? new Date(run.period.toUtc) : null;
                      const periodStr = fromDate && toDate 
                        ? `${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : "";
                      return (
                        <tr key={run.id} className="border-b border-purple-200/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback>{run.nurse?.name?.[0] || run.nurse?.nurseId?.[0] || "N"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{run.nurse?.name || run.nurse?.nurseId || "Nurse"}</div>
                                <div className="text-muted-foreground text-xs">{run.nurse?.nurseId || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs text-muted-foreground">{periodStr}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-purple-700 dark:text-purple-300">{run.amount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{run.evidence?.careEventCount ?? "-"}</span>
                              {run.evidence?.missingProofCount > 0 && (
                                <Badge variant="destructive" className="text-xs shadow-[0_0_5px_rgba(239,68,68,0.3)]">
                                  -{run.evidence.missingProofCount} proof
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {run.proof?.hash ? (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-success" />
                                <code className="text-xs bg-muted px-1 rounded">{run.proof.hashShort}</code>
                                {run.proof.bitcoinRef && (
                                  <Badge variant="outline" className="text-xs">BTC</Badge>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">No Proof</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              run.status === "paid" ? "bg-success/20 text-success border-success/30 shadow-[0_0_5px_rgba(34,197,94,0.3)]" :
                              run.status === "failed" ? "bg-destructive/20 text-destructive border-destructive/30 shadow-[0_0_5px_rgba(239,68,68,0.3)]" :
                              run.status === "pending" ? "bg-warning/20 text-warning border-warning/30 shadow-[0_0_5px_rgba(251,191,36,0.3)]" :
                              "bg-muted"
                            }>
                              {run.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {run.actions?.map((action: any, idx: number) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(action.label)}
                                  className="text-xs hover:bg-purple-100/50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No payout runs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Button variant="outline" className="w-full mt-4 gap-2 border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]" onClick={() => handleAction("Export All Payouts")}>
                Export all payouts (this block) <ChevronDown className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Overview */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Escrow Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              {/* Escrow Accounts Summary */}
              {escrowAccounts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Escrow Accounts</h4>
                  {escrowAccounts.slice(0, 3).map((account: any) => (
                    <div key={account.id} className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)] hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">{account.title}</p>
                        <Badge variant="outline" className="text-xs border-purple-300/50 bg-purple-100/50 dark:bg-purple-900/30">{account.type}</Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="font-semibold text-purple-700 dark:text-purple-300">{account.balance}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Reserved:</span>
                          <span className="font-semibold">{account.reserved}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded border border-purple-300/30">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-bold text-purple-700 dark:text-purple-300">{account.available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Panel */}
              {riskPanel && riskPanel.items && riskPanel.items.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Risk Panel
                  </h4>
                  <p className="text-xs text-muted-foreground">{riskPanel.subtitle}</p>
                  <div className="space-y-2">
                    {riskPanel.items.slice(0, 3).map((risk: any) => (
                      <div key={risk.id} className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                        <p className="font-medium text-xs">{risk.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)] flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Payout schedule</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">Weekly</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">All payouts require human approval in MVP mode.</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-warning">AI Finance Insight</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    No anomalies detected in escrow to-payout flow. Smooth payout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            AI flags irregularities only. All payments require human approval.
          </p>
        </div>
      </div>

      {/* Escrow Ledger Section */}
      {escrowLedger.length > 0 && (
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
              {model.layout?.find((l: any) => l.type === "escrow_ledger")?.title || "Escrow Ledger"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {model.layout?.find((l: any) => l.type === "escrow_ledger")?.subtitle || "All credits/debits with proof references"}
            </p>
          </CardHeader>
          <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="overflow-x-auto rounded-lg border border-purple-200/50">
              <table className="w-full text-sm">
                <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                  <tr className="border-b border-purple-300/50 text-left">
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Timestamp</th>
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Direction</th>
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Reason</th>
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Amount</th>
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Related</th>
                    <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100">Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {escrowLedger.slice(0, 20).map((entry: any) => {
                    const date = entry.timestampUtc ? new Date(entry.timestampUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                    return (
                      <tr key={entry.id} className="border-b border-purple-200/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium">{dateStr}</div>
                          <div className="text-muted-foreground text-xs">{timeStr}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            entry.direction === "credit" ? "bg-success/20 text-success border-success/30 shadow-[0_0_5px_rgba(34,197,94,0.3)]" :
                            "bg-destructive/20 text-destructive border-destructive/30 shadow-[0_0_5px_rgba(239,68,68,0.3)]"
                          }>
                            {entry.direction}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{entry.reason}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">{entry.amount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs space-y-1">
                            {entry.related?.clientId && <div>Client: {entry.related.clientId}</div>}
                            {entry.related?.nurseId && <div>Nurse: {entry.related.nurseId}</div>}
                            {entry.related?.payoutRunId && <div>Payout: {entry.related.payoutRunId}</div>}
                          </div>
                        </td>
                        <td className="py-3">
                          {entry.proof?.hash ? (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-success" />
                              <code className="text-xs bg-muted px-1 rounded">{entry.proof.hashShort}</code>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">No Proof</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
