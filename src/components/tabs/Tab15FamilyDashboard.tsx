import { Settings, Heart, Activity, Calendar as CalendarIcon, MessageSquare, Lock, ChevronRight, Send, Check, Shield, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExportButton } from "@/components/shared/ExportButton";
import { toast } from "@/hooks/use-toast";
import { generateFamilyDashboardData } from "@/lib/exportUtils";
import { runTab15FamilyDashboard } from "@/lib/neocare-ai/tab15-script";
import { useState, useEffect } from "react";

const teamMembers = [
  { name: "Team Lead", role: "Team", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" },
  { name: "Mia", role: "Nurse", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80" },
  { name: "Jeffrey", role: "Nurse", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" },
  { name: "Emma", role: "Nurse", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80" },
];

const weekPlans = [
  { time: "11:00 AM", event: "Medical checkup with Jeffrey" },
  { time: "3:00 PM", event: "Bingo at Community Room" },
];

const familyUpdates = [
  { name: "Lauren", date: "Apr 23", content: "Mia wrote John enjoys the garden! Great to see!" },
  { name: "Jeffrey", date: "", content: "Lovely picnic photos by pond!" },
];

const notes = [
  { name: "Mia", date: "Apr 23", content: "John was in good spirits this morning and enjoyed his walk outside." },
  { name: "Jeffrey", date: "Apr 22", content: "Blood pressure has improved compared to last Monday." },
  { name: "Emma", date: "Apr 22", content: "" },
];

export function Tab15FamilyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab15FamilyDashboard("C-123");
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated.`,
    });
  };

  if (loading) return <div className="p-10 text-center text-purple-500">Loading Family Dashboard...</div>;

  const model = data || {};
  const snapshot = model.layout?.find((l: any) => l.type === "family_snapshot")?.items || [];
  const feed = model.layout?.find((l: any) => l.type === "family_feed")?.items || [];
  const alerts = model.layout?.find((l: any) => l.type === "family_alerts")?.items || [];
  const planning = model.layout?.find((l: any) => l.type === "planning")?.items || [];
  const proofRefs = model.layout?.find((l: any) => l.type === "proof_trust")?.items || [];
  const quickActions = model.layout?.find((l: any) => l.type === "quick_actions")?.items || [];

  const wellbeingStatus = snapshot.find((i: any) => i.label === "Wellbeing Status")?.value || "🟢 Stable";
  const todayCare = snapshot.find((i: any) => i.label === "Today's Care")?.value || "0/0";
  const alertsCount = snapshot.find((i: any) => i.label === "Alerts")?.value || "0";
  const lastUpdate = snapshot.find((i: any) => i.label === "Last Update")?.value || "-";

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
              {model.header?.title || "Family Dashboard"}
            </h1>
            <Badge variant="outline" className="text-success border-success">
              <Heart className="w-3 h-3 mr-1" /> Automatically updated after each verified care moment
            </Badge>
          </div>
          <p className="text-purple-600/80 dark:text-purple-400/80">
            {model.header?.subtitle || "Caregiver Family Dashboard | READ ONLY"}
          </p>
          {model.disclaimer && (
            <p className="text-xs text-muted-foreground mt-1 italic">{model.disclaimer}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Card className="glass-card px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-primary" />
              <span>Verified care moment logged with time, location, and nurse.</span>
            </div>
          </Card>
          <ExportButton
            label="Export Dashboard"
            options={[
              { label: "Export as PDF", format: "pdf" },
              { label: "Export as Word", format: "word" },
              { label: "Export as CSV", format: "csv" }
            ]}
            data={generateFamilyDashboardData()}
            pdfTitle="Family Dashboard Report"
            filename="family-dashboard-report"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30">
            <CardContent className="p-5 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-purple-200/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" />
                  <AvatarFallback>JV</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.5)]">
                    {model.client?.name || "Client"}
                  </h2>
                  <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700 shadow-[0_0_5px_rgba(168,85,247,0.1)]">
                    <Lock className="w-3 h-3 mr-1" /> {model.permissions?.readOnly ? "READ ONLY" : "Guest Access"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">General Info & Health</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Settings className="w-4 h-4 text-purple-500" /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Display Settings</DialogTitle>
                      <DialogDescription>Customize what info is visible to family members.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="s1">Show Room Number</Label>
                        <Switch id="s1" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="s2">Show Date of Birth</Label>
                        <Switch id="s2" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="s3">Allow Profile Photo Update</Label>
                        <Switch id="s3" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm text-purple-800/80 dark:text-purple-200/80 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              {model.client?.room && <p>📍 {model.client.room}</p>}
              {model.client?.dob && <p>🎂 {model.client.dob}</p>}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Plans for John's Week</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Settings className="w-4 h-4 text-purple-500" /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Schedule Settings</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Show Completed Events</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sync with Google Calendar</Label>
                        <Switch />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="space-y-2">
                {planning.length > 0 ? planning.slice(0, 5).map((plan: any) => {
                  const date = plan.windowStartUtc ? new Date(plan.windowStartUtc) : null;
                  const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                  return (
                    <div key={plan.id} className="flex items-center gap-3 text-sm p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-muted-foreground">{timeStr}</span>
                      <span>{plan.visitType}</span>
                      {plan.staff && (
                        <Badge variant="outline" className="ml-auto text-xs">{plan.staff}</Badge>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No planned visits in this period.</p>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" variant="default">View Care Planning <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Weekly Care Schedule</DialogTitle>
                    <DialogDescription>Upcoming appointments and recurring events.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                      <Calendar mode="single" selected={new Date()} className="rounded-md border shadow" />
                      <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700">
                        <p className="font-semibold">Next Review:</p>
                        <p>April 28th with Dr. Smith</p>
                      </div>
                    </div>
                    <ScrollArea className="h-[300px] pr-4">
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Detailed Agenda</h4>
                      <div className="space-y-3">
                        {[
                          { day: "Today", time: "11:00 AM", event: "Medical checkup with Jeffrey", type: "medical" },
                          { day: "Today", time: "3:00 PM", event: "Bingo at Community Room", type: "social" },
                          { day: "Tomorrow", time: "9:00 AM", event: "Physio Session", type: "therapy" },
                          { day: "Tomorrow", time: "2:00 PM", event: "Family Visit (Lauren)", type: "family" },
                          { day: "Wed", time: "10:30 AM", event: "Art Therapy", type: "social" },
                          { day: "Thu", time: "1:00 PM", event: "Podiatrist Visit", type: "medical" }
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-1 self-stretch rounded-full ${item.type === 'medical' ? 'bg-red-400' : item.type === 'social' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                            <div>
                              <p className="text-xs font-bold text-gray-500">{item.day} • {item.time}</p>
                              <p className="font-medium text-sm text-gray-800">{item.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Family Alerts Section */}
          {alerts.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  Alerts (Family-safe)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                {alerts.map((alert: any) => {
                  const date = alert.timestampUtc ? new Date(alert.timestampUtc) : null;
                  const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                  const severityIcon = alert.severity === "critical" ? AlertCircle : alert.severity === "warning" ? AlertCircle : Info;
                  const severityColor = alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-warning" : "text-info";
                  return (
                    <div key={alert.id} className="flex gap-3 p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                      <severityIcon className={`w-5 h-5 ${severityColor} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-purple-900 dark:text-purple-100">{alert.title}</span>
                          {dateStr && <span className="text-xs text-purple-800/60 dark:text-purple-300/60">{dateStr}</span>}
                        </div>
                        {alert.subtitle && <p className="text-sm text-purple-800/80 dark:text-purple-200/80">{alert.subtitle}</p>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Proof & Trust Section */}
          {proofRefs.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                  Proof & Trust
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Care actions are verified with Proof references (privacy-safe).</p>
              </CardHeader>
              <CardContent className="p-4 space-y-2 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                {proofRefs.map((proof: any) => (
                  <div key={proof.id} className="flex items-center justify-between p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="text-sm text-purple-900 dark:text-purple-100">{proof.label}: {proof.value}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" /> 7D Proof
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground">*Privacy note: Family Dashboard is read-only, and personal data protection is our top priority.</p>
        </div>

        {/* Middle Column - Care Overview */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Today's Care Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  {/* Neon glow layers */}
                  <div className="absolute -inset-2 bg-green-500/40 rounded-full blur-lg animate-pulse" />
                  <div className="absolute -inset-1 bg-green-400/30 rounded-full blur-sm" />
                  {/* SVG Circle with glow */}
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="none" className="text-purple-100 dark:text-purple-900" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="none"
                      strokeDasharray={`${88 * 2.51} ${100 * 2.51}`}
                      className="text-success drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                    <span className="text-base font-bold text-success leading-tight text-center break-words max-w-full drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                      {wellbeingStatus.replace("🟢 ", "").replace("🟡 ", "").replace("🔴 ", "")}
                    </span>
                    <span className="text-[11px] text-success mt-1 font-medium drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]">Status</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Wellbeing Status</h3>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70">Today's Care: {todayCare}</p>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70">Alerts: {alertsCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last Update: {lastUpdate !== "-" ? new Date(lastUpdate).toLocaleString() : "-"}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-purple-900 dark:text-purple-100">
                {feed.length > 0 ? feed.slice(0, 3).map((item: any) => {
                  const date = item.timestampUtc ? new Date(item.timestampUtc) : null;
                  const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        {item.verified && <CheckCircle className="w-4 h-4 text-success" />}
                        <span>{item.title}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{timeStr}</span>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No updates available for this period.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Family Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              {feed.length > 0 ? feed.filter((item: any) => item.kind === "note").slice(0, 3).map((item: any) => {
                const date = item.timestampUtc ? new Date(item.timestampUtc) : null;
                const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                return (
                  <div key={item.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-200 text-purple-700">{item.title?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-purple-900 dark:text-purple-100">{item.title}</span>
                        {dateStr && <span className="text-xs text-purple-800/60 dark:text-purple-300/60">{dateStr}</span>}
                      </div>
                      {item.subtitle && <p className="text-sm text-purple-800/80 dark:text-purple-200/80">{item.subtitle}</p>}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground text-center py-4">No family updates available.</p>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    View All Messages <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl h-[600px] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Family Message Board</DialogTitle>
                    <DialogDescription>Updates from the care team and family members.</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="space-y-4 py-4 pr-4">
                      {feed.length > 0 ? feed.map((item: any) => {
                        const date = item.timestampUtc ? new Date(item.timestampUtc) : null;
                        const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Just now";
                        return (
                          <div key={item.id} className="flex gap-3 p-3 bg-gray-50/50 rounded-xl">
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarFallback className="bg-purple-200 text-purple-700 text-xs">{item.title?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm">{item.title}</span>
                                <span className="text-xs text-gray-400">{dateStr}</span>
                              </div>
                              {item.subtitle && <p className="text-sm text-gray-700 leading-relaxed">{item.subtitle}</p>}
                              {item.verified && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  <Shield className="w-3 h-3 mr-1" /> Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No messages available.</p>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="pt-4 mt-auto border-t border-gray-100 space-y-3">
                    <Label htmlFor="msg">Post an update</Label>
                    <div className="flex gap-2">
                      <Input id="msg" placeholder="Write a message to the team..." className="flex-1" />
                      <Button size="icon" onClick={() => handleAction("Message Posted")}><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Health & Notes */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Health Assessments</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70">Glucose Level</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">5.9 <span className="text-sm font-normal">mmol/L</span></p>
                </div>
                <div>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70">Blood Pressure</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">125<span className="text-lg">/82</span> <span className="text-sm font-normal">mmHg</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70 flex items-center gap-1"><Activity className="w-3 h-3" /> Heart Rate</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">68 <span className="text-sm font-normal">bpm</span></p>
                  <p className="text-xs text-muted-foreground">31 mins ago</p>
                </div>
                <div>
                  <p className="text-sm text-purple-800/70 dark:text-purple-300/70">Weight</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">76.5 <span className="text-sm font-normal">kg</span></p>
                  <p className="text-xs text-success">+0.3 kg in 3 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Notes & Reflections</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Settings className="w-4 h-4 text-purple-500" /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Notes Filters</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Filter by Role</Label>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="cursor-pointer">Nurses</Badge>
                          <Badge variant="outline" className="cursor-pointer opacity-50">Doctors</Badge>
                          <Badge variant="outline" className="cursor-pointer opacity-50">Family</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show System Logs</Label>
                        <Switch />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              {notes.map((note, i) => (
                <div key={i} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-200 text-purple-700">{note.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-purple-900 dark:text-purple-100">{note.name}</span>
                      <span className="text-xs text-purple-800/60 dark:text-purple-300/60">{note.date}</span>
                    </div>
                    {note.content && <p className="text-sm text-purple-800/80 dark:text-purple-200/80">{note.content}</p>}
                  </div>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    View All Notes <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl h-[600px] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Care Notes History</DialogTitle>
                    <DialogDescription>Observations and health logs.</DialogDescription>
                  </DialogHeader>
                  <div className="py-2">
                    <Input placeholder="Search notes..." className="bg-gray-50" />
                  </div>
                  <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="space-y-4 py-4 pr-4">
                      {[...notes,
                      { name: "Dr. Smith", date: "Apr 20", content: "Medication adjustment: Reduced dosage of evening meds due to drowsiness." },
                      { name: "Physio Sarah", date: "Apr 19", content: "Great progress on standing balance. Recommended daily exercises." }
                      ].map((note, i) => (
                        <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{note.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-sm text-purple-900">{note.name}</span>
                                <div className="text-xs text-gray-400">{note.date}</div>
                              </div>
                              <Badge variant="outline" className="text-[10px] text-gray-500">Log</Badge>
                            </div>
                            <p className="text-sm text-gray-700">{note.content || "Routine check completed. No issues."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
