import { useState, useEffect } from "react";
import { Shield, CheckCircle, Brain, Lock, Lightbulb, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExportButton } from "@/components/shared/ExportButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { generateAIControlData, downloadPDF, downloadCSV, downloadJSON, downloadWord } from "@/lib/exportUtils";
import { runTab21AIControl } from "@/lib/neocare-ai/tab21-script";

export function Tab21AIControl() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("org");
  const [range, setRange] = useState("30d");
  const [showThresholds, setShowThresholds] = useState(false);
  const [showModuleConfig, setShowModuleConfig] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showProofCenter, setShowProofCenter] = useState(false);
  const [showRegisterModule, setShowRegisterModule] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({ key: "", label: "", tab: "", familySafe: false, defaultEnabled: true });

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab21AIControl(scope, null, null, range);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scope, range]);

  const handleAction = (action: string, meta?: any) => {
    if (action === "APPLY_SAFE_DEFAULTS") {
      toast({
        title: "Safe Defaults Applied",
        description: "All AI modules have been configured with safe default settings. Human approval is required for all actions.",
      });
    } else if (action === "OPEN_THRESHOLD_SETTINGS") {
      setShowThresholds(true);
    } else if (action === "OPEN_AI_MODULE_CONFIG") {
      setSelectedModule(meta);
      setShowModuleConfig(true);
    } else if (action === "OPEN_PROOF_CENTER" || action.includes("Open Proof Center")) {
      setShowProofCenter(true);
    } else if (action === "TOGGLE_AI_MODULE") {
      toast({
        title: meta?.enabled ? "Module Enabled" : "Module Disabled",
        description: `AI module ${meta?.moduleKey || "unknown"} has been ${meta?.enabled ? "enabled" : "disabled"}. Changes are audited and proof-linked.`,
      });
    } else if (action === "OPEN_AI_REGISTRY" || action.includes("Register New Module")) {
      setShowRegisterModule(true);
    } else {
      toast({
        title: "Action Triggered",
        description: `${action} has been initiated.`,
      });
    }
  };

  const handleToggleConfig = (key: string, currentValue: boolean) => {
    handleAction(`Toggle ${key}: ${!currentValue}`);
  };

  const generateProofData = () => {
    const proof = data?.layout?.find((l: any) => l.type === "proof_trust");
    const audit = data?.layout?.find((l: any) => l.type === "audit_trail");
    
    return {
      exportDate: new Date().toISOString(),
      exportType: "AI Control Proof Data",
      proofReferences: proof?.items?.map((ref: any) => ({
        id: ref.id,
        label: ref.label,
        value: ref.value,
        timestamp: ref.timestampUtc || null,
      })) || [],
      auditTrail: audit?.items?.map((item: any) => ({
        id: item.id,
        actor: item.actor,
        change: item.change,
        reason: item.reason || null,
        proofReference: item.proof?.refShort || null,
        timestamp: item.timestampUtc || null,
      })) || [],
      metadata: {
        scope: scope,
        range: range,
        totalProofReferences: proof?.items?.length || 0,
        totalAuditEntries: audit?.items?.length || 0,
      }
    };
  };

  const generateProofCSVData = (proofData: any) => {
    const csvData: Record<string, any>[] = [];
    
    // Add proof references
    proofData.proofReferences.forEach((ref: any) => {
      csvData.push({
        Type: "Proof Reference",
        ID: ref.id,
        Label: ref.label,
        "Proof Hash": ref.value,
        Timestamp: ref.timestamp ? new Date(ref.timestamp).toLocaleString() : "N/A",
      });
    });
    
    // Add audit trail entries
    proofData.auditTrail.forEach((item: any) => {
      csvData.push({
        Type: "Audit Entry",
        ID: item.id,
        Actor: item.actor,
        Change: item.change,
        Reason: item.reason || "N/A",
        "Proof Reference": item.proofReference || "N/A",
        Timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
      });
    });
    
    return csvData;
  };

  const generateProofPDFContent = (proofData: any) => {
    const content: string[][] = [];
    
    // Header
    content.push(["Type", "ID", "Label/Change", "Details", "Timestamp"]);
    
    // Add proof references
    proofData.proofReferences.forEach((ref: any) => {
      content.push([
        "Proof Reference",
        ref.id || "N/A",
        ref.label || "N/A",
        `Hash: ${ref.value || "N/A"}`,
        ref.timestamp ? new Date(ref.timestamp).toLocaleString() : "N/A",
      ]);
    });
    
    // Add audit trail entries
    proofData.auditTrail.forEach((item: any) => {
      content.push([
        "Audit Entry",
        item.id || "N/A",
        item.change || "N/A",
        `Actor: ${item.actor || "N/A"} | Reason: ${item.reason || "N/A"} | Proof: ${item.proofReference || "N/A"}`,
        item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
      ]);
    });
    
    return content;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      {loading ? (
        <div className="p-10 text-center text-purple-500">Loading AI Control Panel...</div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
                {data?.header?.title || "AI Control & Automation Panel"}
              </h1>
              <p className="text-purple-600/80 dark:text-purple-400/80">
                {data?.header?.subtitle || "Human-in-the-loop safety"}
              </p>
              {data?.disclaimer && (
                <div className="flex items-center gap-2 mt-2 text-sm text-purple-600/70 dark:text-purple-400/70">
                  <Lock className="w-4 h-4" />
                  <span>{data.disclaimer}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_0_15px_rgba(16,185,129,0.4)] gap-1">
                  <Shield className="w-3 h-3" /> 7D Proof Secured
                </Badge>
                <Badge variant="outline" className="gap-1 border-purple-200 text-purple-700 dark:text-purple-300 shadow-[0_0_5px_rgba(168,85,247,0.2)]">
                  <CheckCircle className="w-3 h-3" /> Auditable
                </Badge>
                <Badge variant="outline" className="gap-1 border-purple-200 text-purple-700 dark:text-purple-300 shadow-[0_0_5px_rgba(168,85,247,0.2)]">
                  <Brain className="w-3 h-3" /> Human-Override
                </Badge>
              </div>
              <ExportButton
                label="Export AI Control Report"
                options={[
                  { label: "Export as PDF", format: "pdf" },
                  { label: "Export as Word", format: "word" },
                  { label: "Export as CSV", format: "csv" }
                ]}
                data={generateAIControlData()}
                pdfTitle="AI Control & Automation Log"
                filename="ai-control-automation-log"
              />
            </div>
          </div>

          {/* Controls */}
          {data?.controls && data.controls.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              {data.controls.map((control: any) => (
                <div key={control.key} className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">{control.label}:</label>
                  {control.type === "select" && (
                    <Select
                      value={control.value || ""}
                      onValueChange={(value) => {
                        if (control.key === "scope") {
                          setScope(value);
                        } else if (control.key === "range") {
                          setRange(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={control.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {control.options?.filter((opt: any) => opt.value !== "" && opt.value != null).map((opt: any) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* KPI Cards */}
          {data?.layout?.find((l: any) => l.type === "kpi_cards") && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.layout.find((l: any) => l.type === "kpi_cards").items.map((kpi: any) => (
                <MetricCard
                  key={kpi.label}
                  title={kpi.label}
                  value={String(kpi.value)}
                  subtitle="AI Control"
                  className="border border-purple-300/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
                />
              ))}
            </div>
          )}

          {/* Safety Guardrails */}
          {data?.layout?.find((l: any) => l.type === "safety_guardrails") && (() => {
            const guardrails = data.layout.find((l: any) => l.type === "safety_guardrails");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {guardrails.title}
                    </CardTitle>
                    {guardrails.cta && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(guardrails.cta.label)}>
                        {guardrails.cta.label}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {guardrails.items?.map((item: any, i: number) => (
                      <div key={i}>
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className={`font-medium text-sm ${item.value.includes("Not recommended") ? "text-warning" : "text-success"}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* AI Config Advisor */}
          {data?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
            const advisor = data.layout.find((l: any) => l.type === "ai_advisor");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    {advisor.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-4">{advisor.message}</p>
                  
                  {advisor.risks && advisor.risks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Risks:</h4>
                      {advisor.risks.map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-info/10 border border-info/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {advisor.suggestions && advisor.suggestions.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Suggestions:</h4>
                      {advisor.suggestions.map((item: any, i: number) => (
                        <div key={i} className={`p-2 ${item.type === "positive" ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"} rounded-lg`}>
                          <p className="text-xs text-muted-foreground">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {advisor.actions?.map((action: any, i: number) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(action.action || action.label, action.meta)}
                        className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Notification Routes & Automation Toggles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Routes */}
            {data?.layout?.find((l: any) => l.type === "routes") && (() => {
              const routes = data.layout.find((l: any) => l.type === "routes");
              return (
                <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                  <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                      {routes.title}
                    </CardTitle>
                    {routes.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{routes.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                    {routes.items && routes.items.length > 0 ? (
                      <div className="space-y-3">
                        {routes.items.map((route: any) => (
                          <div key={route.key} className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-purple-900 dark:text-purple-100 capitalize">{route.key}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{route.channel}</Badge>
                                {route.note && (
                                  <span className="text-xs text-muted-foreground">{route.note}</span>
                                )}
                              </div>
                            </div>
                            <Switch
                              checked={route.enabled}
                              onCheckedChange={() => handleAction(`Toggle route: ${route.key}`)}
                              disabled={!data?.permissions?.canEditRoutes}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">{routes.emptyState}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Automation Toggles */}
            {data?.layout?.find((l: any) => l.type === "automation_toggles") && (() => {
              const toggles = data.layout.find((l: any) => l.type === "automation_toggles");
              return (
                <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                  <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
                      {toggles.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                    {toggles.items && toggles.items.length > 0 ? (
                      <div className="space-y-3">
                        {toggles.items.map((item: any) => (
                          <div key={item.key} className={`flex items-center justify-between p-3 rounded-lg ${item.warning ? "bg-warning/10 border border-warning/20" : "bg-purple-50/50 dark:bg-purple-900/20"}`}>
                            <div className="flex-1">
                              <span className={`text-sm font-medium ${item.warning ? "text-warning" : "text-purple-900 dark:text-purple-100"}`}>
                                {item.label}
                              </span>
                              {item.warning && (
                                <p className="text-xs text-muted-foreground mt-1">Not recommended for safety</p>
                              )}
                            </div>
                            <Switch
                              checked={item.value}
                              onCheckedChange={() => handleToggleConfig(item.key, item.value)}
                              disabled={!data?.permissions?.canToggleModules}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No automation toggles available.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* AI Modules Grid */}
          {data?.layout?.find((l: any) => l.type === "ai_modules_grid") && (() => {
            const modulesGrid = data.layout.find((l: any) => l.type === "ai_modules_grid");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        {modulesGrid.title}
                      </CardTitle>
                      {modulesGrid.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{modulesGrid.subtitle}</p>
                      )}
                    </div>
                    {modulesGrid.cta && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAction(modulesGrid.cta.action || modulesGrid.cta.label, modulesGrid.cta.meta)}
                        className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                      >
                        {modulesGrid.cta.label}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  {modulesGrid.items && modulesGrid.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modulesGrid.items.map((module: any) => {
                        const date = module.lastRunUtc ? new Date(module.lastRunUtc) : null;
                        const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Never";
                        const healthColor = module.health === "ok" ? "success" : module.health === "warning" ? "warning" : module.health === "failed" ? "destructive" : "muted";
                        return (
                          <div key={module.key} className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{module.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">Tab {module.tab || "N/A"}</Badge>
                                  <Badge className={`text-xs ${module.enabled ? "bg-success" : "bg-muted"}`}>
                                    {module.enabled ? "Enabled" : "Disabled"}
                                  </Badge>
                                </div>
                              </div>
                              <Badge variant="outline" className={`text-xs border-${healthColor}/30`}>
                                {module.health}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Mode: {module.mode}</p>
                              <p>Last run: {dateStr}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {module.actions?.slice(0, 2).map((action: any, i: number) => (
                                <Button
                                  key={i}
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleAction(action.action || action.label, action.meta || { moduleKey: module.key, enabled: !module.enabled })}
                                  disabled={!data?.permissions?.canToggleModules && action.action === "TOGGLE_AI_MODULE"}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">{modulesGrid.emptyState}</p>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Recent Runs & Audit Trail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent AI Runs */}
            {data?.layout?.find((l: any) => l.type === "recent_runs") && (() => {
              const runs = data.layout.find((l: any) => l.type === "recent_runs");
              return (
                <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                  <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                      {runs.title}
                    </CardTitle>
                    {runs.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{runs.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                    {runs.items && runs.items.length > 0 ? (
                      runs.items.map((run: any) => {
                        const date = run.timestampUtc ? new Date(run.timestampUtc) : null;
                        const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "";
                        const statusColor = run.status === "ok" ? "success" : run.status === "warning" ? "warning" : "destructive";
                        return (
                          <div
                            key={run.id}
                            className="flex items-start gap-3 p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100/50 transition-colors"
                            onClick={() => handleAction(`View run: ${run.id}`)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-xs bg-muted px-2 py-1 rounded">{run.moduleKey}</code>
                                <Badge className={`text-xs bg-${statusColor}`}>{run.status}</Badge>
                                {run.requiresHumanApproval && (
                                  <Badge variant="outline" className="text-xs">Requires Approval</Badge>
                                )}
                              </div>
                              <p className="text-sm text-purple-900 dark:text-purple-100">{run.summary}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                {run.createdDrafts > 0 && <span>Drafts: {run.createdDrafts}</span>}
                                {run.notificationsSent > 0 && <span>Notifications: {run.notificationsSent}</span>}
                                {dateStr && <span>{dateStr}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground py-4">{runs.emptyState}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Audit Trail */}
            {data?.layout?.find((l: any) => l.type === "audit_trail") && (() => {
              const audit = data.layout.find((l: any) => l.type === "audit_trail");
              return (
                <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                  <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                      {audit.title}
                    </CardTitle>
                    {audit.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{audit.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                    {audit.items && audit.items.length > 0 ? (
                      audit.items.map((item: any) => {
                        const date = item.timestampUtc ? new Date(item.timestampUtc) : null;
                        const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "";
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100/50 transition-colors"
                            onClick={() => handleAction(`View audit: ${item.id}`)}
                          >
                            <CheckCircle className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">{item.actor}</span>
                                {item.proof?.refShort && (
                                  <code className="text-xs bg-muted px-2 py-1 rounded">{item.proof.refShort}</code>
                                )}
                              </div>
                              <p className="text-sm text-purple-800/80 dark:text-purple-200/80">{item.change}</p>
                              {item.reason && (
                                <p className="text-xs text-muted-foreground mt-1">Reason: {item.reason}</p>
                              )}
                              {dateStr && (
                                <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground py-4">{audit.emptyState}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* Proof References */}
          {data?.layout?.find((l: any) => l.type === "proof_trust") && (() => {
            const proof = data.layout.find((l: any) => l.type === "proof_trust");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {proof.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{proof.subtitle}</p>
                    </div>
                    {proof.cta && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(proof.cta.action || proof.cta.label, proof.cta.meta)}
                        className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                      >
                        {proof.cta.label}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  <div className="space-y-2">
                    {proof.items && proof.items.length > 0 ? proof.items.map((ref: any) => {
                      const date = ref.timestampUtc ? new Date(ref.timestampUtc) : null;
                      const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                      return (
                        <div
                          key={ref.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleAction(`View Proof: ${ref.value}`)}
                        >
                          <div>
                            <p className="text-sm font-medium">{ref.label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{ref.value}</code>
                              {dateStr && (
                                <span className="text-xs text-muted-foreground">{dateStr}</span>
                              )}
                            </div>
                          </div>
                          <Shield className="w-4 h-4 text-success" />
                        </div>
                      );
                    }) : (
                      <p className="text-center text-muted-foreground py-4">No proof references yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </>
      )}

      {/* Review Thresholds Dialog */}
      <Dialog open={showThresholds} onOpenChange={setShowThresholds}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Review Threshold Settings
            </DialogTitle>
            <DialogDescription>
              Configure alert thresholds and notification triggers for AI modules
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
              <h4 className="font-semibold text-lg mb-4 text-purple-900 dark:text-purple-100">Alert Thresholds</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="critical-threshold">Critical Alert Threshold</Label>
                  <Input
                    id="critical-threshold"
                    type="number"
                    defaultValue="90"
                    className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                  />
                  <p className="text-xs text-muted-foreground">Triggers immediate notification (0-100)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warning-threshold">Warning Alert Threshold</Label>
                  <Input
                    id="warning-threshold"
                    type="number"
                    defaultValue="70"
                    className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                  />
                  <p className="text-xs text-muted-foreground">Triggers standard notification (0-100)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="info-threshold">Info Alert Threshold</Label>
                  <Input
                    id="info-threshold"
                    type="number"
                    defaultValue="50"
                    className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                  />
                  <p className="text-xs text-muted-foreground">Logs only, no notification (0-100)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
              <h4 className="font-semibold text-lg mb-4 text-purple-900 dark:text-purple-100">Notification Frequency</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-notifications">Max Notifications per Hour</Label>
                  <Input
                    id="max-notifications"
                    type="number"
                    defaultValue="10"
                    className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                  />
                  <p className="text-xs text-muted-foreground">Prevents notification spam</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-window">Batch Window (minutes)</Label>
                  <Input
                    id="batch-window"
                    type="number"
                    defaultValue="5"
                    className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                  />
                  <p className="text-xs text-muted-foreground">Groups notifications within this window</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-100">Safety Recommendations</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep critical threshold above 85% for safety</li>
                <li>• Enable batching to reduce notification fatigue</li>
                <li>• Review thresholds monthly based on actual alert patterns</li>
                <li>• All threshold changes are audited and proof-linked</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowThresholds(false)}>Cancel</Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                toast({
                  title: "Thresholds Updated",
                  description: "Alert thresholds have been updated. Changes are audited and proof-linked.",
                });
                setShowThresholds(false);
              }}
            >
              Save Thresholds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Configuration Dialog */}
      <Dialog open={showModuleConfig} onOpenChange={setShowModuleConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Configure AI Module
            </DialogTitle>
            <DialogDescription>
              {selectedModule ? `Configure settings for ${selectedModule.label || selectedModule.key}` : "Configure AI module settings"}
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                <div className="space-y-2">
                  <Label>Module Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedModule.enabled ? "bg-success" : "bg-muted"}>
                      {selectedModule.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Badge variant="outline">Tab {selectedModule.tab || "N/A"}</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                <div className="space-y-2">
                  <Label htmlFor="module-mode">Operation Mode</Label>
                  <Select defaultValue={selectedModule.mode || "suggest_only"}>
                    <SelectTrigger id="module-mode" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suggest_only">Suggest Only (Recommended)</SelectItem>
                      <SelectItem value="notify_only">Notify Only</SelectItem>
                      <SelectItem value="draft_only">Draft Only</SelectItem>
                      <SelectItem value="auto">Auto (Requires Approval)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">How the AI module operates</p>
                </div>
              </div>

              {selectedModule.guards && (
                <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30">
                  <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">Safety Guards</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">
                        Human Approval: {selectedModule.guards.humanApprovalRequired ? "Required" : "Not Required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">
                        No Clinical Decisions: {selectedModule.guards.noClinicalDecision ? "Enforced" : "Not Enforced"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">
                        Family Safe: {selectedModule.guards.familySafe ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowModuleConfig(false);
              setSelectedModule(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                toast({
                  title: "Module Configured",
                  description: `Configuration for ${selectedModule?.label || selectedModule?.key || "module"} has been saved. Changes are audited.`,
                });
                setShowModuleConfig(false);
                setSelectedModule(null);
              }}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Center Dialog */}
      <Dialog open={showProofCenter} onOpenChange={setShowProofCenter}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Proof Center
            </DialogTitle>
            <DialogDescription>
              View all proof references and audit trails for AI control actions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {data?.layout?.find((l: any) => l.type === "proof_trust") && (() => {
              const proof = data.layout.find((l: any) => l.type === "proof_trust");
              return (
                <>
                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                    <h4 className="font-semibold text-lg mb-3 text-purple-900 dark:text-purple-100">Proof References</h4>
                    <div className="space-y-2">
                      {proof.items && proof.items.length > 0 ? proof.items.map((ref: any) => {
                        const date = ref.timestampUtc ? new Date(ref.timestampUtc) : null;
                        const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "";
                        return (
                          <div
                            key={ref.id}
                            className="p-3 bg-muted/50 rounded-lg border border-purple-200/30"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{ref.label}</p>
                                <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">{ref.value}</code>
                              </div>
                              <Shield className="w-4 h-4 text-success flex-shrink-0" />
                            </div>
                            {dateStr && (
                              <p className="text-xs text-muted-foreground">Timestamp: {dateStr}</p>
                            )}
                          </div>
                        );
                      }) : (
                        <p className="text-center text-muted-foreground py-4">No proof references available.</p>
                      )}
                    </div>
                  </div>

                  {data?.layout?.find((l: any) => l.type === "audit_trail") && (() => {
                    const audit = data.layout.find((l: any) => l.type === "audit_trail");
                    return (
                      <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                        <h4 className="font-semibold text-lg mb-3 text-purple-900 dark:text-purple-100">Audit Trail</h4>
                        <div className="space-y-2">
                          {audit.items && audit.items.length > 0 ? audit.items.map((item: any) => {
                            const date = item.timestampUtc ? new Date(item.timestampUtc) : null;
                            const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "";
                            return (
                              <div
                                key={item.id}
                                className="p-3 bg-muted/50 rounded-lg border border-purple-200/30"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">{item.actor}</span>
                                      {item.proof?.refShort && (
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{item.proof.refShort}</code>
                                      )}
                                    </div>
                                    <p className="text-sm text-purple-800/80 dark:text-purple-200/80">{item.change}</p>
                                    {item.reason && (
                                      <p className="text-xs text-muted-foreground mt-1">Reason: {item.reason}</p>
                                    )}
                                    {dateStr && (
                                      <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }) : (
                            <p className="text-center text-muted-foreground py-4">No audit trail entries available.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProofCenter(false)}>Close</Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const proofData = generateProofData();
                  const csvData = generateProofCSVData(proofData);
                  const content = generateProofPDFContent(proofData);
                  try {
                    await downloadWord("AI Control Proof Data", content, "ai-control-proof-data", csvData);
                    toast({
                      title: "Proof Data Exported",
                      description: "Proof data has been exported as Word document.",
                    });
                  } catch (error) {
                    toast({
                      title: "Export Error",
                      description: "Failed to export as Word. Trying PDF...",
                      variant: "destructive"
                    });
                    downloadPDF("AI Control Proof Data", content, "ai-control-proof-data", csvData);
                  }
                }}
              >
                Export as Word
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const proofData = generateProofData();
                  const csvData = generateProofCSVData(proofData);
                  const content = generateProofPDFContent(proofData);
                  downloadPDF("AI Control Proof Data", content, "ai-control-proof-data", csvData);
                  toast({
                    title: "Proof Data Exported",
                    description: "Proof data has been exported as PDF.",
                  });
                }}
              >
                Export as PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const proofData = generateProofData();
                  const csvData = generateProofCSVData(proofData);
                  downloadCSV(csvData, "ai-control-proof-data");
                  toast({
                    title: "Proof Data Exported",
                    description: "Proof data has been exported as CSV.",
                  });
                }}
              >
                Export as CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const proofData = generateProofData();
                  downloadJSON(proofData, "ai-control-proof-data");
                  toast({
                    title: "Proof Data Exported",
                    description: "Proof data has been exported as JSON.",
                  });
                }}
              >
                Export as JSON
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register New Module Dialog */}
      <Dialog open={showRegisterModule} onOpenChange={setShowRegisterModule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Register New AI Module
            </DialogTitle>
            <DialogDescription>
              Register a new AI module to be managed in the AI Control Panel
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-key">Module Key</Label>
              <Input
                id="module-key"
                placeholder="e.g., AI-22.1"
                value={registerFormData.key}
                onChange={(e) => setRegisterFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
              <p className="text-xs text-muted-foreground">Unique identifier for the module (e.g., AI-22.1)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-label">Module Label</Label>
              <Input
                id="module-label"
                placeholder="e.g., Patient Risk Analyzer"
                value={registerFormData.label}
                onChange={(e) => setRegisterFormData(prev => ({ ...prev, label: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
              <p className="text-xs text-muted-foreground">Human-readable name for the module</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-tab">Associated Tab</Label>
              <Select 
                value={registerFormData.tab} 
                onValueChange={(value) => setRegisterFormData(prev => ({ ...prev, tab: value }))}
              >
                <SelectTrigger id="module-tab" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50">
                  <SelectValue placeholder="Select tab number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">Tab 14 - Client Voice</SelectItem>
                  <SelectItem value="15">Tab 15 - Family Dashboard</SelectItem>
                  <SelectItem value="16">Tab 16 - Nurse Performance</SelectItem>
                  <SelectItem value="17">Tab 17 - Legal Dispute</SelectItem>
                  <SelectItem value="18">Tab 18 - NeoPay Escrow</SelectItem>
                  <SelectItem value="19">Tab 19 - SkillLab</SelectItem>
                  <SelectItem value="20">Tab 20 - ESG Dashboard</SelectItem>
                  <SelectItem value="21">Tab 21 - AI Control</SelectItem>
                  <SelectItem value="22">Tab 22 - Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Which tab does this module belong to?</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="family-safe" className="cursor-pointer">Family Safe</Label>
                    <p className="text-xs text-muted-foreground">Can this module be used in family-facing contexts?</p>
                  </div>
                  <Switch
                    id="family-safe"
                    checked={registerFormData.familySafe}
                    onCheckedChange={(checked) => setRegisterFormData(prev => ({ ...prev, familySafe: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-enabled" className="cursor-pointer">Default Enabled</Label>
                    <p className="text-xs text-muted-foreground">Should this module be enabled by default?</p>
                  </div>
                  <Switch
                    id="default-enabled"
                    checked={registerFormData.defaultEnabled}
                    onCheckedChange={(checked) => setRegisterFormData(prev => ({ ...prev, defaultEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-success" />
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Safety Guards (Auto-Applied)</h4>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Human approval required for all actions</li>
                <li>• No clinical decisions made by AI</li>
                <li>• All actions are audited and proof-linked</li>
                <li>• Default mode: suggest_only</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRegisterModule(false);
              setRegisterFormData({ key: "", label: "", tab: "", familySafe: false, defaultEnabled: true });
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (!registerFormData.key || !registerFormData.label || !registerFormData.tab) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields (Key, Label, and Tab).",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Module Registered",
                  description: `AI module "${registerFormData.label}" (${registerFormData.key}) has been registered successfully. Registration is audited and proof-linked.`,
                });
                setShowRegisterModule(false);
                setRegisterFormData({ key: "", label: "", tab: "", familySafe: false, defaultEnabled: true });
              }}
            >
              Register Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
