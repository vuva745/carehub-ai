import { useState, useEffect } from "react";
import { Leaf, Users, Building, TrendingUp, Lock, CheckCircle, Download, Shield, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { MetricCard } from "@/components/shared/MetricCard";
import { ExportButton } from "@/components/shared/ExportButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateESGData } from "@/lib/exportUtils";
import { runTab20ESGImpact } from "@/lib/neocare-ai/tab20-script";

const careVolumeData = [
  { type: "In Home Care", value: 7201, percentage: "91%", color: "bg-primary" },
  { type: "Assisted Living", value: 3320, percentage: "", color: "bg-info" },
  { type: "Post-Acute", value: 136.3, percentage: "%", color: "bg-warning" },
];

const esgScores = [
  { label: "Social", score: 85, color: "success" as const },
  { label: "Governance", score: 83, color: "success" as const },
  { label: "Environmental", score: 78, color: "info" as const },
];

export function Tab20ESGDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [region, setRegion] = useState("all");
  const [sponsorId, setSponsorId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab20ESGImpact(range, region, sponsorId);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range, region, sponsorId]);

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated.`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      {loading ? (
        <div className="p-10 text-center text-purple-500">Loading ESG & Impact Dashboard...</div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
                {data?.header?.title || "ESG & Impact Dashboard"}
              </h1>
              <p className="text-purple-600/80 dark:text-purple-400/80">
                {data?.header?.subtitle || "Aggregated reporting (privacy-safe)"}
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
                <Badge className="bg-success/20 text-success border-success/30 gap-1">
                  <CheckCircle className="w-3 h-3" /> Auditable
                </Badge>
                <Badge className="bg-success/20 text-success border-success/30 gap-1">
                  <CheckCircle className="w-3 h-3" /> Export-ready
                </Badge>
                <Badge className="bg-success/20 text-success border-success/30 gap-1">
                  <CheckCircle className="w-3 h-3" /> 7D Locked
                </Badge>
              </div>
              <ExportButton
                label="Export ESG Report"
                options={[
                  { label: "Export as PDF", format: "pdf" },
                  { label: "Export as Word", format: "word" },
                  { label: "Export as CSV", format: "csv" }
                ]}
                data={generateESGData()}
                pdfTitle="ESG & Impact Dashboard Report"
                filename="esg-impact-report"
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
                        if (control.key === "range") {
                          setRange(value);
                        } else if (control.key === "region") {
                          setRegion(value);
                        } else if (control.key === "sponsorId") {
                          setSponsorId(value || null);
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {data.layout.find((l: any) => l.type === "kpi_cards").items.map((kpi: any) => (
                <MetricCard
                  key={kpi.label}
                  title={kpi.label}
                  value={String(kpi.value)}
                  subtitle="ESG Metrics"
                  className="border border-purple-300/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
                />
              ))}
            </div>
          )}

          {/* Governance Panel */}
          {data?.layout?.find((l: any) => l.type === "governance_panel") && (() => {
            const governance = data.layout.find((l: any) => l.type === "governance_panel");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {governance.title}
                    </CardTitle>
                    {governance.cta && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(governance.cta.label)}>
                        {governance.cta.label}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {governance.items?.map((item: any, i: number) => (
                      <div key={i}>
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className="font-medium text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* AI Summary */}
          {data?.layout?.find((l: any) => l.type === "ai_summary") && (() => {
            const summary = data.layout.find((l: any) => l.type === "ai_summary");
            return (
              <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                  <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    {summary.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-4">{summary.message}</p>
                  
                  {summary.highlights && summary.highlights.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Highlights:</h4>
                      {summary.highlights.map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-success/10 border border-success/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {summary.risks && summary.risks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Risks:</h4>
                      {summary.risks.map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-warning/10 border border-warning/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {summary.anomalies && summary.anomalies.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-sm">Anomalies:</h4>
                      {summary.anomalies.map((item: any, i: number) => (
                        <div key={i} className="p-2 bg-info/10 border border-info/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {summary.actions?.map((action: any, i: number) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(action.label)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Sponsor Report Cards */}
          {data?.layout?.find((l: any) => l.type === "sponsor_report_cards") && (() => {
            const cards = data.layout.find((l: any) => l.type === "sponsor_report_cards");
            return (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">{cards.title}</h2>
                  {cards.subtitle && (
                    <p className="text-sm text-muted-foreground">{cards.subtitle}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cards.cards?.map((card: any) => (
                    <Card key={card.id} className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                      <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                        <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                        <ul className="space-y-2">
                          {card.bullets?.map((bullet: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}

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
                        onClick={() => handleAction(proof.cta.label)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Impact */}
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-success flex items-center gap-2 drop-shadow-[0_0_2px_rgba(34,197,94,0.3)]">
              <Leaf className="w-5 h-5" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-purple-100 dark:text-purple-900" />
                  <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray={`${35 * 2.2} ${100 * 2.2}`}
                    className="text-success" />
                  <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="8" fill="none" className="text-warning" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                  {(() => {
                    // Try to get CO2 value from KPI cards, or use a calculated/placeholder value
                    const co2Kpi = data?.layout?.find((l: any) => l.type === "kpi_cards")?.items?.find((k: any) => 
                      k.label.toLowerCase().includes("co2") || k.label.toLowerCase().includes("carbon") || k.label.toLowerCase().includes("emission")
                    );
                    const co2Value = co2Kpi?.value || "2.4";
                    return (
                      <>
                        <span className="text-xl font-bold text-purple-900 dark:text-purple-100 leading-tight">{co2Value}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">CO₂ tonnes</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="space-y-2 text-sm text-purple-900 dark:text-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span>40% CO₂ Emissions Avoided</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-info" />
                  <span>35% Waste Reduced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span>25% Green Workspaces</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Volume Metrics */}
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-5 space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">€275.8K</p>
              </div>
            </div>

            <div className="h-16 flex items-end gap-1">
              {["April", "June", "June", "July", "Aug", "Sep", "Sep"].map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-success rounded-t"
                    style={{ height: `${40 + i * 8}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{month}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Care Volume Trend</h4>
              <div className="grid grid-cols-3 gap-2">
                {careVolumeData.map((item) => (
                  <div key={item.type} className={`p-2 rounded-lg ${item.color}/10 border border-${item.color}/20`}>
                    <p className="font-bold text-purple-900 dark:text-purple-100">{item.value}K <span className="text-xs font-normal">{item.percentage}</span></p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Care Volume Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">7425</span>
                  <div className="flex-1 h-4 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: "88%" }} />
                  </div>
                  <span className="text-sm text-purple-900 dark:text-purple-100">88%</span>
                  <span className="text-xs text-muted-foreground">3,25</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor-Attributable Impact */}
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Sponsor-Attributable Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">€275.8K</p>
              <p className="text-sm text-purple-800/80 dark:text-purple-200/80">Impact Funding Secured</p>
              <ProgressBar value={75} color="primary" className="mt-2" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">€139.5K</p>
              <p className="text-sm text-purple-800/80 dark:text-purple-200/80">Qualified Escrow Releases</p>
            </div>

            <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-success" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Social Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">58</span>
                <div>
                  <p className="text-sm text-purple-900 dark:text-purple-100">Communities Reached</p>
                  <p className="text-xs text-muted-foreground">Unique Clients Helped</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Governance Score</h4>
              {esgScores.map((score) => (
                <div key={score.label} className="flex items-center gap-3 mb-2">
                  <span className="w-24 text-sm text-purple-900 dark:text-purple-100">{score.label}</span>
                  <div className="flex-1">
                    <ProgressBar value={score.score} color={score.color} size="sm" />
                  </div>
                  <span className="font-bold text-purple-900 dark:text-purple-100">{score.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">Sponsor-Attributable Impact</CardTitle>
            <p className="text-sm text-muted-foreground">Report-ready. Linked directly to sponsor funding</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-success" />
              <div>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">58</p>
                <p className="text-muted-foreground">Communities Reached</p>
                <p className="text-sm text-muted-foreground">Unique clients helped</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+1.25 years added / unique client reached</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">ESG Performance Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {esgScores.map((score) => (
              <div key={score.label} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="w-28">{score.label}</span>
                <div className="flex-1">
                  <ProgressBar value={score.score} color={score.color} size="md" />
                </div>
                <span className="text-2xl font-bold">{score.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
