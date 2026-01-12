import { Shield, ChevronRight, Download, FileText, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { generateCareMomentsData } from "@/lib/exportUtils";
import { runTab16NursePerformance } from "@/lib/neocare-ai/tab16-script";
import { useState, useEffect } from "react";

const nurses = [
  { name: "Mia", role: "Team Lead", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80" },
  { name: "Jeffrey", role: "Nurse", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" },
  { name: "Emma", role: "Nurse", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80" },
  { name: "Liam", role: "Nurse", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" },
];

const careMoments = [
  { date: "April 23", time: "3:30 PM", nurse: "Mia", role: "Nurse", tasks: ["Take: get / retrieve alert ensure hygiene", "Tasks: performed on schedule.", "Tasks: check before ad after medication"], location: "10:12 AM, Meadow, Room 201" },
  { date: "April 23", time: "11:00 AM", nurse: "Jeffrey", role: "Nurse", tasks: ["Take: get / retrieve alert ensure hygiene", "Tasks: performed on schedule.", "Tasks: check before ad after medication"], location: "10:12 AM, Meadow, Room 201" },
  { date: "April 23", time: "10:20 AM", nurse: "Emma", role: "Nurse", tasks: ["Take: get / retrieve alert ensure hygiene", "Tasks: performed on schedule.", "Tasks: check before ad after medication"], location: "10:12 AM, Meadow, Room 201" },
  { date: "April 22", time: "4:00 PM", nurse: "Liam", role: "Nurse", tasks: ["Take: get / retrieve alert ensure hygiene", "Tasks: performed on schedule.", "Tasks: check before ad after medication"], location: "10:12 AM, Meadow, Room 201" },
];

export function Tab16NursePerformance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab16NursePerformance();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-10 text-center text-purple-500">Loading Nurse Performance...</div>;

  const model = data || {};
  const snapshot = model.layout?.find((l: any) => l.type === "performance_snapshot")?.items || [];
  const kpiGrid = model.layout?.find((l: any) => l.type === "kpi_grid")?.items || [];
  const visits = model.layout?.find((l: any) => l.type === "visits_list")?.items || [];
  const tasks = model.layout?.find((l: any) => l.type === "tasks_list")?.items || [];
  const bigProof = model.layout?.find((l: any) => l.type === "big_proof")?.items || [];
  const skillEvents = model.layout?.find((l: any) => l.type === "skilllab_events")?.items || [];
  const gaps = model.layout?.find((l: any) => l.type === "gaps_alerts")?.items || [];
  const banner = model.banner;
  
  // Extract nurse profile from model
  const nurseProfile = model.nurseProfile || { name: "Nurse", role: "Nurse" };

  const completionRate = snapshot.find((i: any) => i.label === "Completion Rate")?.value || "0%";
  const onTimeVisits = snapshot.find((i: any) => i.label === "On-Time Visits")?.value || "0/0";
  const proofCoverage = snapshot.find((i: any) => i.label === "Proof Coverage")?.value || "0%";
  const bigStatus = snapshot.find((i: any) => i.label === "BIG Status")?.value || "❓ Unknown";

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      {banner && (
        <Card className={`border-0 shadow-lg ${
          banner.severity === "critical" ? "bg-destructive/10 border-destructive/30" :
          banner.severity === "warning" ? "bg-warning/10 border-warning/30" :
          "bg-info/10 border-info/30"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {banner.severity === "critical" ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
               banner.severity === "warning" ? <AlertTriangle className="w-5 h-5 text-warning" /> :
               <CheckCircle className="w-5 h-5 text-info" />}
              <div>
                <p className="font-semibold">{banner.title}</p>
                <p className="text-sm text-muted-foreground">{banner.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
            {model.header?.title || "Nurse Performance"}
          </h1>
          <Badge variant="secondary" className="px-3 py-1">TAB: 16</Badge>
          <span className="text-purple-600/80 dark:text-purple-400/80">
            {model.header?.subtitle || "Nurse Performance"}
          </span>
        </div>
        <ExportButton
          label="Export BIG Portfolio"
          options={[
            { label: "Export as PDF", format: "pdf" },
            { label: "Export as Word", format: "word" },
            { label: "Export as CSV", format: "csv" }
          ]}
          data={generateCareMomentsData()}
          pdfTitle="Nurse Performance - BIG Portfolio"
          filename="nurse-performance-portfolio"
        />
      </div>

      {model.disclaimer && (
        <p className="text-xs text-muted-foreground italic">{model.disclaimer}</p>
      )}

      <p className="text-muted-foreground">
        {model.header?.rightMeta?.bigNumber && `BIG Number: ${model.header.rightMeta.bigNumber} • `}
        Range: {model.header?.rightMeta?.range || "30d"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Nurse Profile */}
        <div className="space-y-4">
          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden">
            <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-white/50 mb-3 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" />
                <AvatarFallback>JV</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.5)]">
                {nurseProfile.name || "Nurse"}
              </h2>
              <Badge className="mt-2 bg-emerald-500 text-white border-0 shadow-sm">
                {bigStatus.includes("Active") ? "BIG ACTIVE" : "7D PROOF VERIFIED"}
              </Badge>
              {model.header?.rightMeta?.bigNumber && (
                <p className="text-xs text-purple-800/70 dark:text-purple-300/70 mt-1">
                  BIG: {model.header.rightMeta.bigNumber}
                </p>
              )}
            </div>
            <CardContent className="p-6">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                {/* Neon glow layers */}
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/60 via-violet-500/50 to-purple-400/40 rounded-2xl blur-lg animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/40 via-violet-400/30 to-purple-300/20 rounded-2xl blur-sm" />
                {/* Main shield */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl transform rotate-3 shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:shadow-[0_0_40px_rgba(168,85,247,0.9)] transition-all" />
                <div className="absolute inset-0 bg-white dark:bg-card border-2 border-purple-200 dark:border-purple-700 rounded-2xl flex flex-col items-center justify-center text-purple-600 dark:text-purple-300 shadow-inner">
                  <span className="text-3xl font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">BIG</span>
                  <span className="text-lg drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">PROOF</span>
                </div>
              </div>
              <h3 className="font-semibold text-center mb-4">Nurses Involved</h3>
              <div className="flex justify-center gap-3">
                {nurses.map((nurse) => (
                  <div key={nurse.name} className="text-center">
                    <Avatar className="w-12 h-12 mx-auto border-2 border-muted">
                      <AvatarImage src={nurse.avatar} />
                      <AvatarFallback>{nurse.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs mt-1 font-medium">{nurse.name}</p>
                    <p className="text-xs text-muted-foreground">{nurse.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Metrics & Care Moments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {kpiGrid.slice(0, 3).map((kpi: any) => (
              <MetricCard
                key={kpi.key}
                title={kpi.label}
                value={kpi.value}
                subtitle={kpi.trend === "positive" ? "All Proof Verified" : kpi.trend === "negative" ? "Needs Attention" : "In Progress"}
                className="border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
              />
            ))}
          </div>

          {/* Performance Snapshot */}
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                Performance Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {snapshot.map((item: any) => (
                  <div key={item.label} className="text-center">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gaps & Alerts */}
          {gaps.length > 0 && (
            <Card className="overflow-hidden border border-warning/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-warning/10 to-warning/5">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-warning drop-shadow-[0_0_2px_rgba(168,85,247,0.3)] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Gaps & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                <div className="space-y-2">
                  {gaps.map((gap: any) => (
                    <div key={gap.label} className="flex items-start gap-3 p-2 bg-warning/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{gap.label}</p>
                        <p className="text-xs text-muted-foreground">{gap.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* BIG Proof Section */}
          {bigProof.length > 0 && (
            <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  BIG Compliance & Proof
                </CardTitle>
                {model.layout?.find((l: any) => l.type === "big_proof")?.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {model.layout.find((l: any) => l.type === "big_proof").subtitle}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  {bigProof.map((item: any) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  {model.layout?.find((l: any) => l.type === "tasks_list")?.title || "Recent Tasks"}
                </CardTitle>
                <div className="flex gap-2">
                  {["Today", "7 days", "30 days"].map((period, i) => (
                    <Button key={period} variant={i === 2 ? "default" : "outline"} size="sm" className={i === 2 ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-purple-200 text-purple-700"}>
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Date & Time</th>
                      <th className="pb-3 font-medium">Task Type</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Logged Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length > 0 ? tasks.map((task: any) => {
                      const date = task.startUtc ? new Date(task.startUtc) : null;
                      const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                      const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                      return (
                        <tr key={task.id} className="border-b border-border/50">
                          <td className="py-3">
                            <div className="font-medium">{dateStr}</div>
                            <div className="text-muted-foreground">{timeStr}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-medium">{task.taskType}</div>
                          </td>
                          <td className="py-3">
                            <Badge variant={task.status === "done" ? "default" : task.status === "missed" ? "destructive" : "outline"}>
                              {task.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {task.proof?.hash ? (
                              <>
                                <Badge className="bg-success/20 text-success border-success/30 gap-1">
                                  <Shield className="w-3 h-3" /> PROOF VERIFIED
                                </Badge>
                                {task.proof.bitcoinRef && (
                                  <p className="text-xs text-muted-foreground mt-1">BTC: {task.proof.bitcoinRef}</p>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">No Proof</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No tasks in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SkillLab Events */}
          {skillEvents.length > 0 && (
            <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  SkillLab Events (BIG Evidence)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                <div className="space-y-2">
                  {skillEvents.map((event: any) => {
                    const date = event.timestampUtc ? new Date(event.timestampUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                    return (
                      <div key={event.id} className="flex items-center justify-between p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{event.skillName}</p>
                          <p className="text-xs text-muted-foreground">{dateStr} • {event.status}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.points} pts
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Visits */}
          {visits.length > 0 && (
            <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  Recent Visits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                <div className="space-y-2">
                  {visits.slice(0, 5).map((visit: any) => {
                    const date = visit.startUtc ? new Date(visit.startUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                    return (
                      <div key={visit.id} className="flex items-center justify-between p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{dateStr} {timeStr}</p>
                          <p className="text-xs text-muted-foreground">Client: {visit.clientId || "Unknown"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={visit.timeliness === "on_time" ? "default" : "destructive"}>
                            {visit.timeliness || "unknown"}
                          </Badge>
                          {visit.proof?.hash && (
                            <Shield className="w-4 h-4 text-success" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Data is securely logged and protected for up to 3 years according to regulations.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  View Audit Trail <ChevronRight className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Full Audit Trail</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-96 overflow-y-auto">
                  {tasks.filter((t: any) => t.proof?.hash).slice(0, 10).map((task: any, i: number) => {
                    const date = task.startUtc ? new Date(task.startUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                    return (
                      <div key={task.id || i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <p className="font-medium">Task verified - {task.taskType}</p>
                          <p className="text-sm text-muted-foreground">{dateStr} at {timeStr}</p>
                          {task.proof?.hashShort && (
                            <p className="text-xs text-muted-foreground mt-1">Proof: {task.proof.hashShort}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
