import { useState, useEffect } from "react";
import { Award, Star, CheckCircle, Clock, AlertCircle, TrendingUp, Bot, Trophy, Shield, Search, Filter, Copy, Lock, MapPin, User, FileText, ChevronLeft, ChevronRight, Share2, Download, BookOpen, Upload, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ExportButton } from "@/components/shared/ExportButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { runTab19_1SkillLabCertification } from "@/lib/neocare-ai/tab19-1-script";
import { runTab19_2EvidenceVault } from "@/lib/neocare-ai/tab19-2-script";
import { runTab19_3CertificateIssuance } from "@/lib/neocare-ai/tab19-3-script";
import { generateCertificationData, generateSkillEvidenceData } from "@/lib/exportUtils";

const skills = [
  { name: "Preventive Care", rating: 4, stars: 4 },
  { name: "Medication Administration", rating: 4, stars: 4 },
  { name: "Escalation Protocols", rating: 3, stars: 3 },
];

const certifications = [
  { name: "Medication Administration", status: "Certified", date: "04/21/2004", icon: CheckCircle, color: "success" as const },
  { name: "Escalation Protocols", status: "Certified", date: "04/21/2004", icon: CheckCircle, color: "success" as const },
  { name: "Safe Transfer Techniques", status: "Expired", date: "04/10/2004", icon: AlertCircle, color: "destructive" as const },
];

const completedModules = [
  { name: "Medication Administration", date: "Certified 04/01/2024", points: 200 },
];

const skillModules = [
  { name: "Fall Prevention Techniques", points: 150, rating: 5 },
  { name: "Safe Transfer Techniques", points: 75, rating: 4 },
];

export function Tab19SkillLab() {
  const [data19_1, setData19_1] = useState<any>(null);
  const [loading19_1, setLoading19_1] = useState(true);
  const [data19_2, setData19_2] = useState<any>(null);
  const [loading19_2, setLoading19_2] = useState(true);
  const [data19_3, setData19_3] = useState<any>(null);
  const [loading19_3, setLoading19_3] = useState(true);
  const [scope, setScope] = useState("self");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [range, setRange] = useState("90d");
  const [certStatus, setCertStatus] = useState("all");
  const [certRange, setCertRange] = useState("365d");

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab19_1SkillLabCertification(scope, null);
        setData19_1(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading19_1(false);
      }
    }
    load();
  }, [scope]);

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab19_2EvidenceVault(scope, null, moduleFilter, range);
        setData19_2(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading19_2(false);
      }
    }
    load();
  }, [scope, moduleFilter, range]);

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab19_3CertificateIssuance(scope, null, certStatus, certRange);
        setData19_3(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading19_3(false);
      }
    }
    load();
  }, [scope, certStatus, certRange]);

  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showUploadEvidence, setShowUploadEvidence] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ module: "", type: "", description: "", file: null as File | null });
  const [showModuleCatalog, setShowModuleCatalog] = useState(false);
  const [showCPDDetails, setShowCPDDetails] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [selectedRenewalCert, setSelectedRenewalCert] = useState<any>(null);
  const [showRequestSkillCheck, setShowRequestSkillCheck] = useState(false);
  const [skillCheckFormData, setSkillCheckFormData] = useState({ module: "", skill: "", reason: "", preferredDate: "" });
  const [showAddTrainingHours, setShowAddTrainingHours] = useState(false);
  const [trainingHoursFormData, setTrainingHoursFormData] = useState({ activity: "", hours: "", date: "", description: "" });
  const [showExpiringCertificates, setShowExpiringCertificates] = useState(false);
  const [showStartSkillPath, setShowStartSkillPath] = useState(false);
  const [selectedSkillPath, setSelectedSkillPath] = useState<any>(null);

  const handleAction = (action: string, data?: any) => {
    if (action.includes("Open Module:") || action.includes("View Module:")) {
      const moduleTitle = action.replace("Open Module:", "").replace("View Module:", "").trim();
      const module = data19_1?.layout?.find((l: any) => l.type === "module_catalog")?.items?.find((m: any) => m.title === moduleTitle);
      if (module) setSelectedModule(module);
    } else if (action.includes("View Certification:") || action.includes("Request Assessment:")) {
      const certId = action.split(":")[1]?.trim();
      const cert = data19_1?.layout?.find((l: any) => l.type === "certifications")?.items?.find((c: any) => c.id === certId || c.title === certId);
      if (cert) setSelectedCert(cert);
    } else if (action.includes("View Request:")) {
      const reqId = action.split(":")[1]?.trim();
      const req = data19_1?.layout?.find((l: any) => l.type === "assessment_requests")?.items?.find((r: any) => r.id === reqId);
      if (req) setSelectedRequest(req);
    } else if (action.includes("View Evidence:")) {
      const evidenceTitle = action.replace("View Evidence:", "").trim();
      const evidence = data19_2?.layout?.find((l: any) => l.type === "evidence_list")?.items?.find((e: any) => e.title === evidenceTitle);
      if (evidence) setSelectedEvidence(evidence);
    } else if (action.includes("View Proof:")) {
      const proofValue = action.split(":")[1]?.trim();
      const proof = data19_1?.layout?.find((l: any) => l.type === "proof_trust")?.items?.find((p: any) => p.value === proofValue) ||
                   data19_2?.layout?.find((l: any) => l.type === "proof_trust")?.items?.find((p: any) => p.value === proofValue) ||
                   data19_3?.layout?.find((l: any) => l.type === "proof_trust")?.items?.find((p: any) => p.value === proofValue);
      if (proof) setSelectedProof(proof);
    } else if (action.includes("View Check:")) {
      const checkId = action.split(":")[1]?.trim();
      const check = data19_2?.layout?.find((l: any) => l.type === "skill_checks")?.items?.find((c: any) => c.id === checkId);
      if (check) setSelectedCheck(check);
    } else if (action.includes("View Certificate:")) {
      const certId = action.split(":")[1]?.trim();
      const cert = data19_3?.layout?.find((l: any) => l.type === "certificates")?.items?.find((c: any) => c.id === certId);
      if (cert) setSelectedCertificate(cert);
    } else if (action.includes("View Recommendations") || action.includes("Recommendations")) {
      setShowRecommendations(true);
    } else if (action.includes("Upload Evidence") || action.includes("Upload")) {
      setShowUploadEvidence(true);
    } else if (action.includes("Browse Modules") || action.includes("View All Modules") || action.includes("Module Catalog")) {
      setShowModuleCatalog(true);
    } else if (action.includes("View CPD") || action.includes("CPD Details") || action.includes("CPD Summary")) {
      setShowCPDDetails(true);
    } else if (action.includes("View All Certificates") || action.includes("All Certificates")) {
      setShowAllCertificates(true);
    } else if (action.includes("Renew") || action.includes("Renewal")) {
      setSelectedRenewalCert(data);
      setShowRenewalDialog(true);
    } else if (action.includes("Download Certificate") || action.includes("Download")) {
      toast({
        title: "Certificate Download",
        description: `Downloading certificate...`,
      });
    } else if (action.includes("Verify Certificate") || action.includes("Verification")) {
      toast({
        title: "Certificate Verification",
        description: `Verifying certificate...`,
      });
    } else if (action.includes("View Proof Center") || action.includes("Proof Center")) {
      // Show proof center dialog - reuse existing proof dialog
      if (data19_3?.layout?.find((l: any) => l.type === "proof_trust")) {
        const proof = data19_3.layout.find((l: any) => l.type === "proof_trust");
        if (proof.items && proof.items.length > 0) {
          setSelectedProof(proof.items[0]);
        }
      }
    } else if (action.includes("Request Skill Check") || action.includes("Request Check")) {
      if (data) {
        setSkillCheckFormData(prev => ({
          ...prev,
          module: data.title || data.label || "",
          skill: data.title || data.label || ""
        }));
      }
      setShowRequestSkillCheck(true);
    } else if (action.includes("Add Training Hours") || action.includes("Training Hours")) {
      setShowAddTrainingHours(true);
    } else if (action.includes("View Expiring") || action.includes("Expiring")) {
      setShowExpiringCertificates(true);
    } else if (action.includes("Request Assessment") && !action.includes("Skill Check")) {
      if (data) {
        setSelectedCert(data);
      }
      // Open certification details which has request assessment
    } else if (action.includes("Start Skill Path") || action.includes("Start a Skill Path") || action.includes("Skill Path")) {
      setShowStartSkillPath(true);
    } else {
      toast({
        title: "Action Triggered",
        description: `${action} has been initiated.`,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full flex flex-col border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">SkillLab & Certification</h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <Badge key={level} variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3" /> {level}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Badge className="bg-success/20 text-success border-success/30">
              <CheckCircle className="w-3 h-3 mr-1" /> Certified
            </Badge>
            <Badge variant="outline">Awaited 22</Badge>
            <Badge className="bg-warning/20 text-warning border-warning/30">
              <Clock className="w-3 h-3 mr-1" /> Pending 4
            </Badge>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30">
              <AlertCircle className="w-3 h-3 mr-1" /> Expired 3
            </Badge>
          </div>
          <ExportButton
            label="Export Certification"
            options={[
              { label: "Export as PDF", format: "pdf" },
              { label: "Export as Word", format: "word" },
              { label: "Export as CSV", format: "csv" }
            ]}
            data={generateCertificationData()}
            pdfTitle="SkillLab & Certification Report"
            filename="skilllab-certification-report"
          />
        </div>
      </div>

      <Tabs defaultValue="19.1" className="w-full flex-1 flex flex-col">
        <TabsList className="w-[400px] mb-4">
          <TabsTrigger value="19.1">Overview</TabsTrigger>
          <TabsTrigger value="19.2">Modules</TabsTrigger>
          <TabsTrigger value="19.3">Renewals</TabsTrigger>
        </TabsList>

        <TabsContent value="19.1" className="mt-0">
          {/* Tab 19.1: SkillLab & Certification (MVP) */}
          {loading19_1 ? (
            <div className="p-10 text-center text-purple-500">Loading SkillLab & Certification...</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {data19_1?.header?.title || "SkillLab & Certification (MVP)"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data19_1?.header?.subtitle || "My Progress"}
                  </p>
                  {data19_1?.disclaimer && (
                    <p className="text-xs text-muted-foreground italic mt-1">{data19_1.disclaimer}</p>
                  )}
                </div>
              </div>

              {/* KPI Cards */}
              {data19_1?.layout?.find((l: any) => l.type === "kpi_cards") && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data19_1.layout.find((l: any) => l.type === "kpi_cards").items.map((kpi: any) => (
                    <MetricCard
                      key={kpi.label}
                      title={kpi.label}
                      value={String(kpi.value)}
                      subtitle="SkillLab Progress"
                      className="border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
                    />
                  ))}
                </div>
              )}

              {/* AI Learning Advisor */}
              {data19_1?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
                const advisor = data19_1.layout.find((l: any) => l.type === "ai_advisor");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-warning" />
                        {advisor.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <p className="text-sm text-muted-foreground mb-4">{advisor.message}</p>
                      
                      {advisor.recommendedNext && advisor.recommendedNext.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-sm">Recommended Next:</h4>
                          {advisor.recommendedNext.map((rec: any, i: number) => (
                            <div key={i} className="p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                              <p className="font-medium text-sm">{rec.title}</p>
                              <p className="text-xs text-muted-foreground">{rec.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {advisor.flags && advisor.flags.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {advisor.flags.map((flag: any, i: number) => (
                            <div key={i} className="p-2 bg-info/10 border border-info/20 rounded-lg">
                              <p className="text-xs text-muted-foreground">{flag.message}</p>
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

              {/* Module Catalog & Certifications Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Module Catalog */}
                {data19_1?.layout?.find((l: any) => l.type === "module_catalog") && (() => {
                  const catalog = data19_1.layout.find((l: any) => l.type === "module_catalog");
                  return (
                    <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                      <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                              {catalog.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{catalog.subtitle}</p>
                          </div>
                          {catalog.cta && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction(catalog.cta.label, catalog)}
                              className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              {catalog.cta.label}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                        <div className="space-y-3">
                          {catalog.items && catalog.items.length > 0 ? catalog.items.map((module: any) => (
                            <div
                              key={module.id}
                              className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedModule(module);
                                handleAction(`Open Module: ${module.title}`, module);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">{module.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {module.level}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{module.category}</p>
                                  {module.tags && module.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {module.tags.map((tag: string, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {module.durationMin && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Duration: {module.durationMin} min
                                    </p>
                                  )}
                                </div>
                                <BookOpen className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                              </div>
                            </div>
                          )) : (
                            <p className="text-center text-muted-foreground py-8">No modules available.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Certifications */}
                {data19_1?.layout?.find((l: any) => l.type === "certifications") && (() => {
                  const certs = data19_1.layout.find((l: any) => l.type === "certifications");
                  return (
                    <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                      <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                        <div>
                          <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                            {certs.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{certs.subtitle}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                        <div className="space-y-3">
                          {certs.items && certs.items.length > 0 ? certs.items.map((cert: any) => {
                            const date = cert.lastUpdatedUtc ? new Date(cert.lastUpdatedUtc) : null;
                            const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                            return (
                              <div key={cert.id} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{cert.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={
                                        cert.status === "certified" ? "bg-success/20 text-success border-success/30" :
                                        cert.status === "ready_for_assessment" ? "bg-warning/20 text-warning border-warning/30" :
                                        cert.status === "in_progress" ? "bg-info/20 text-info border-info/30" :
                                        "bg-muted"
                                      }>
                                        {cert.status}
                                      </Badge>
                                      {cert.proof?.lastRefShort && (
                                        <Badge variant="outline" className="text-xs">
                                          <Shield className="w-3 h-3 mr-1" />
                                          {cert.proof.lastRefShort}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress: {cert.progress}</span>
                                    <span className="font-medium">{cert.progressPct}%</span>
                                  </div>
                                  <ProgressBar value={cert.progressPct} size="sm" color="primary" />
                                  {dateStr && (
                                    <p className="text-xs text-muted-foreground">Last updated: {dateStr}</p>
                                  )}
                                  {cert.cta && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-2"
                                      onClick={() => {
                                      setSelectedCert(cert);
                                      handleAction(cert.cta.label, cert);
                                    }}
                                    >
                                      {cert.cta.label}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          }) : (
                            <p className="text-center text-muted-foreground py-8">{certs.emptyState || "No certifications started yet."}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>

              {/* Assessment Requests */}
              {data19_1?.layout?.find((l: any) => l.type === "assessment_requests") && (() => {
                const requests = data19_1.layout.find((l: any) => l.type === "assessment_requests");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        {requests.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <div className="space-y-3">
                        {requests.items && requests.items.length > 0 ? requests.items.map((req: any) => {
                          const scheduledDate = req.scheduledUtc ? new Date(req.scheduledUtc) : null;
                          const scheduledStr = scheduledDate ? scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "";
                          return (
                            <div key={req.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={
                                      req.status === "completed" ? "bg-success/20 text-success border-success/30" :
                                      req.status === "scheduled" ? "bg-info/20 text-info border-info/30" :
                                      req.status === "pending" ? "bg-warning/20 text-warning border-warning/30" :
                                      "bg-destructive/20 text-destructive border-destructive/30"
                                    }>
                                      {req.status}
                                    </Badge>
                                    {req.reviewer && (
                                      <span className="text-xs text-muted-foreground">Reviewer: {req.reviewer}</span>
                                    )}
                                  </div>
                                  {scheduledStr && (
                                    <p className="text-xs text-muted-foreground mb-1">Scheduled: {scheduledStr}</p>
                                  )}
                                  {req.notes && (
                                    <p className="text-xs text-muted-foreground">{req.notes}</p>
                                  )}
                                  {req.proof?.refShort && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Proof: {req.proof.refShort}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    handleAction(`View Request: ${req.id}`, req);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        }) : (
                          <p className="text-center text-muted-foreground py-8">{requests.emptyState || "No assessment requests."}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Proof References */}
              {data19_1?.layout?.find((l: any) => l.type === "proof_trust") && (() => {
                const proof = data19_1.layout.find((l: any) => l.type === "proof_trust");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
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
                            onClick={() => handleAction(proof.cta.label, proof)}
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="19.2" className="mt-0">
          {/* Tab 19.2: Evidence Vault & Skills Assessments (MVP) */}
          {loading19_2 ? (
            <div className="p-10 text-center text-purple-500">Loading Evidence Vault...</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {data19_2?.header?.title || "Evidence Vault & Skills Assessments (MVP)"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data19_2?.header?.subtitle || "My Evidence"}
                  </p>
                  {data19_2?.disclaimer && (
                    <p className="text-xs text-muted-foreground italic mt-1">{data19_2.disclaimer}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              {data19_2?.controls && data19_2.controls.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                  {data19_2.controls.map((control: any) => (
                    <div key={control.key} className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">{control.label}:</label>
                      {control.type === "select" && (
                        <Select
                          value={control.value || ""}
                          onValueChange={(value) => {
                            if (control.key === "moduleId") {
                              setModuleFilter(value || null);
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
              {data19_2?.layout?.find((l: any) => l.type === "kpi_cards") && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data19_2.layout.find((l: any) => l.type === "kpi_cards").items.map((kpi: any) => (
                    <MetricCard
                      key={kpi.label}
                      title={kpi.label}
                      value={String(kpi.value)}
                      subtitle="Evidence Vault"
                      className="border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
                    />
                  ))}
                </div>
              )}

              {/* Policy Card */}
              {data19_2?.layout?.find((l: any) => l.type === "policy_card") && (() => {
                const policy = data19_2.layout.find((l: any) => l.type === "policy_card");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        {policy.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {policy.items?.map((item: any, i: number) => (
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

              {/* AI Advisor */}
              {data19_2?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
                const advisor = data19_2.layout.find((l: any) => l.type === "ai_advisor");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-warning" />
                        {advisor.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <p className="text-sm text-muted-foreground mb-4">{advisor.message}</p>
                      
                      {advisor.missingEvidence && advisor.missingEvidence.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-sm">Missing Evidence:</h4>
                          {advisor.missingEvidence.map((item: any, i: number) => (
                            <div key={i} className="p-2 bg-warning/10 border border-warning/20 rounded-lg">
                              <p className="font-medium text-sm">{item.moduleTitle}</p>
                              <p className="text-xs text-muted-foreground">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {advisor.qualityFlags && advisor.qualityFlags.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {advisor.qualityFlags.map((flag: any, i: number) => (
                            <div key={i} className="p-2 bg-info/10 border border-info/20 rounded-lg">
                              <p className="text-xs text-muted-foreground">{flag.message}</p>
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
                            onClick={() => handleAction(action.label, advisor)}
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

              {/* Evidence List & Skill Checks Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evidence List */}
                {data19_2?.layout?.find((l: any) => l.type === "evidence_list") && (() => {
                  const evidence = data19_2.layout.find((l: any) => l.type === "evidence_list");
                  return (
                    <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                      <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                              {evidence.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{evidence.subtitle}</p>
                          </div>
                          {evidence.cta && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction(evidence.cta.label, evidence)}
                              className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {evidence.cta.label}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                        <div className="space-y-3">
                          {evidence.items && evidence.items.length > 0 ? evidence.items.map((item: any) => {
                            const date = item.updatedUtc ? new Date(item.updatedUtc) : null;
                            const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                            return (
                              <div
                                key={item.id}
                                className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedEvidence(item);
                                  handleAction(`View Evidence: ${item.title}`, item);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm">{item.title}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {item.type}
                                      </Badge>
                                      {item.privacy === "restricted" && (
                                        <Badge variant="outline" className="text-xs">
                                          <Lock className="w-3 h-3 mr-1" />
                                          Restricted
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{item.module}</p>
                                    {item.owner && (
                                      <p className="text-xs text-muted-foreground mb-1">Owner: {item.owner}</p>
                                    )}
                                    {dateStr && (
                                      <p className="text-xs text-muted-foreground mb-1">Updated: {dateStr}</p>
                                    )}
                                    {item.proof?.refShort && (
                                      <Badge variant="outline" className="text-xs mt-1">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Proof: {item.proof.refShort}
                                      </Badge>
                                    )}
                                    {item.tags && item.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {item.tags.map((tag: string, i: number) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {item.hasMedia && (
                                    <FileText className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                            );
                          }) : (
                            <p className="text-center text-muted-foreground py-8">{evidence.emptyState || "No evidence uploaded in this period."}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Skill Checks */}
                {data19_2?.layout?.find((l: any) => l.type === "skill_checks") && (() => {
                  const checks = data19_2.layout.find((l: any) => l.type === "skill_checks");
                  return (
                    <Card className="border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                      <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                              {checks.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{checks.subtitle}</p>
                          </div>
                          {checks.cta && (
                            <Button variant="outline" size="sm" onClick={() => handleAction(checks.cta.label)}>
                              {checks.cta.label}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                        <div className="space-y-3">
                          {checks.items && checks.items.length > 0 ? checks.items.map((check: any) => {
                            const date = check.updatedUtc ? new Date(check.updatedUtc) : null;
                            const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                            return (
                              <div key={check.id} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{check.skill}</h4>
                                    <p className="text-xs text-muted-foreground mb-1">{check.module}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={
                                        check.status === "pass" ? "bg-success/20 text-success border-success/30" :
                                        check.status === "fail" ? "bg-destructive/20 text-destructive border-destructive/30" :
                                        "bg-warning/20 text-warning border-warning/30"
                                      }>
                                        {check.status}
                                      </Badge>
                                      {check.proof?.refShort && (
                                        <Badge variant="outline" className="text-xs">
                                          <Shield className="w-3 h-3 mr-1" />
                                          {check.proof.refShort}
                                        </Badge>
                                      )}
                                    </div>
                                    {check.assessor && (
                                      <p className="text-xs text-muted-foreground mt-1">Assessor: {check.assessor}</p>
                                    )}
                                    {check.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">{check.notes}</p>
                                    )}
                                    {dateStr && (
                                      <p className="text-xs text-muted-foreground mt-1">Updated: {dateStr}</p>
                                    )}
                                  </div>
                                </div>
                                {check.cta && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => {
                                      setSelectedCheck(check);
                                      handleAction(check.cta.label, check);
                                    }}
                                  >
                                    {check.cta.label}
                                  </Button>
                                )}
                              </div>
                            );
                          }) : (
                            <p className="text-center text-muted-foreground py-8">{checks.emptyState || "No skill checks recorded yet."}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>

              {/* Proof References */}
              {data19_2?.layout?.find((l: any) => l.type === "proof_trust") && (() => {
                const proof = data19_2.layout.find((l: any) => l.type === "proof_trust");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
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
                            onClick={() => handleAction(proof.cta.label, proof)}
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="19.3" className="mt-0">
          {/* Tab 19.3: Certificate Issuance & Compliance Proof (MVP) */}
          {loading19_3 ? (
            <div className="p-10 text-center text-purple-500">Loading Certificates...</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {data19_3?.header?.title || "Certificate Issuance & Compliance Proof (MVP)"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data19_3?.header?.subtitle || "My Certificates"}
                  </p>
                  {data19_3?.disclaimer && (
                    <p className="text-xs text-muted-foreground italic mt-1">{data19_3.disclaimer}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              {data19_3?.controls && data19_3.controls.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                  {data19_3.controls.map((control: any) => (
                    <div key={control.key} className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">{control.label}:</label>
                      {control.type === "select" && (
                        <Select
                          value={control.value || ""}
                          onValueChange={(value) => {
                            if (control.key === "status") {
                              setCertStatus(value);
                            } else if (control.key === "range") {
                              setCertRange(value);
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
              {data19_3?.layout?.find((l: any) => l.type === "kpi_cards") && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data19_3.layout.find((l: any) => l.type === "kpi_cards").items.map((kpi: any) => (
                    <MetricCard
                      key={kpi.label}
                      title={kpi.label}
                      value={String(kpi.value)}
                      subtitle="Certificates"
                      className="border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
                    />
                  ))}
                </div>
              )}

              {/* CPD Summary */}
              {data19_3?.layout?.find((l: any) => l.type === "cpd_summary") && (() => {
                const cpd = data19_3.layout.find((l: any) => l.type === "cpd_summary");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                          {cpd.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          {cpd.cta && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction(cpd.cta.label, cpd)}
                              className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              {cpd.cta.label}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAction("Add Training Hours")}
                            className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Add Training Hours
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cpd.items?.map((item: any, i: number) => (
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

              {/* AI Compliance Advisor */}
              {data19_3?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
                const advisor = data19_3.layout.find((l: any) => l.type === "ai_advisor");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-warning" />
                        {advisor.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <p className="text-sm text-muted-foreground mb-4">{advisor.message}</p>
                      
                      {advisor.expiringSoon && advisor.expiringSoon.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Expiring Soon:</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAction("View Expiring")}
                              className="text-xs"
                            >
                              View All
                            </Button>
                          </div>
                          {advisor.expiringSoon.map((item: any, i: number) => (
                            <div key={i} className="p-2 bg-warning/10 border border-warning/20 rounded-lg">
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {advisor.complianceFlags && advisor.complianceFlags.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {advisor.complianceFlags.map((flag: any, i: number) => (
                            <div key={i} className={`p-2 ${flag.type === "warning" ? "bg-warning/10 border border-warning/20" : "bg-info/10 border border-info/20"} rounded-lg`}>
                              <p className="text-xs text-muted-foreground">{flag.message}</p>
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
                            onClick={() => handleAction(action.label, advisor)}
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

              {/* Certificates */}
              {data19_3?.layout?.find((l: any) => l.type === "certificates") && (() => {
                const certs = data19_3.layout.find((l: any) => l.type === "certificates");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                            {certs.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{certs.subtitle}</p>
                        </div>
                        {certs.cta && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAction(certs.cta.label, certs)}
                            className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                          >
                            {certs.cta.label}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <div className="space-y-3">
                        {certs.items && certs.items.length > 0 ? certs.items.map((cert: any) => {
                          const issuedDate = cert.issuedUtc ? new Date(cert.issuedUtc) : null;
                          const issuedStr = issuedDate ? issuedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
                          const expiresDate = cert.expiresUtc ? new Date(cert.expiresUtc) : null;
                          const expiresStr = expiresDate ? expiresDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
                          return (
                            <div key={cert.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">{cert.title}</h4>
                                    <Badge className={
                                      cert.status === "issued" ? "bg-success/20 text-success border-success/30" :
                                      cert.status === "pending" ? "bg-warning/20 text-warning border-warning/30" :
                                      cert.status === "expired" ? "bg-destructive/20 text-destructive border-destructive/30" :
                                      "bg-muted"
                                    }>
                                      {cert.status}
                                    </Badge>
                                  </div>
                                  {cert.owner && (
                                    <p className="text-xs text-muted-foreground mb-1">Owner: {cert.owner}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mb-1">Issuer: {cert.issuer}</p>
                                  {issuedStr && (
                                    <p className="text-xs text-muted-foreground mb-1">Issued: {issuedStr}</p>
                                  )}
                                  {expiresStr && (
                                    <p className="text-xs text-muted-foreground mb-1">Expires: {expiresStr}</p>
                                  )}
                                  {cert.verification?.codeShort && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Code: {cert.verification.codeShort}
                                    </Badge>
                                  )}
                                  {cert.proof?.refShort && (
                                    <Badge variant="outline" className="text-xs mt-1 ml-1">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Proof: {cert.proof.refShort}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {cert.actions?.map((action: any, i: number) => (
                                  <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCertificate(cert);
                                      handleAction(action.label, cert);
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        }) : (
                          <p className="text-center text-muted-foreground py-8">{certs.emptyState || "No certificates available for this filter."}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Recent Verifications */}
              {data19_3?.layout?.find((l: any) => l.type === "verifications") && (() => {
                const verifications = data19_3.layout.find((l: any) => l.type === "verifications");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        {verifications.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{verifications.subtitle}</p>
                    </CardHeader>
                    <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
                      <div className="space-y-2">
                        {verifications.items && verifications.items.length > 0 ? verifications.items.map((ver: any) => {
                          const date = ver.timestampUtc ? new Date(ver.timestampUtc) : null;
                          const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                          return (
                            <div
                              key={ver.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedProof({ value: ver.ref, label: "Verification Reference" });
                                handleAction(`View Verification: ${ver.ref}`, ver);
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium">{ver.requester}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={
                                    ver.result === "ok" ? "bg-success/20 text-success border-success/30" :
                                    ver.result === "expired" || ver.result === "revoked" ? "bg-destructive/20 text-destructive border-destructive/30" :
                                    "bg-warning/20 text-warning border-warning/30"
                                  }>
                                    {ver.result}
                                  </Badge>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">{ver.ref}</code>
                                  {dateStr && (
                                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                                  )}
                                </div>
                              </div>
                              <Shield className="w-4 h-4 text-success" />
                            </div>
                          );
                        }) : (
                          <p className="text-center text-muted-foreground py-4">{verifications.emptyState || "No verifications recorded."}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Proof References */}
              {data19_3?.layout?.find((l: any) => l.type === "proof_trust") && (() => {
                const proof = data19_3.layout.find((l: any) => l.type === "proof_trust");
                return (
                  <Card className="border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
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
                            onClick={() => handleAction(proof.cta.label, proof)}
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
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Module Details Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {selectedModule?.title || "Module Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedModule?.category || "Skill training module information"}
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Level</p>
                  <Badge variant="outline">{selectedModule.level || "N/A"}</Badge>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{selectedModule.durationMin || "N/A"} minutes</p>
                </div>
              </div>
              {selectedModule.tags && selectedModule.tags.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedModule.description && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedModule.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedModule(null)}>Close</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
              toast({ title: "Module Started", description: `Starting ${selectedModule?.title}...` });
              setSelectedModule(null);
            }}>
              Start Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Details Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {selectedCert?.title || "Certification Details"}
            </DialogTitle>
            <DialogDescription>
              Certification status and assessment information
            </DialogDescription>
          </DialogHeader>
          {selectedCert && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={
                    selectedCert.status === "certified" ? "bg-success/20 text-success border-success/30" :
                    selectedCert.status === "ready_for_assessment" ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-info/20 text-info border-info/30"
                  }>
                    {selectedCert.status || "unknown"}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Progress</p>
                  <p className="font-semibold">{selectedCert.progress || "0%"}</p>
                </div>
              </div>
              {selectedCert.lastUpdatedUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCert.lastUpdatedUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedCert.proof?.lastRefShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">7D Proof Reference</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{selectedCert.proof.lastRefShort}</code>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCert(null)}>Close</Button>
            {selectedCert?.status !== "certified" && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                toast({ title: "Assessment Requested", description: `Requesting assessment for ${selectedCert?.title}...` });
                setSelectedCert(null);
              }}>
                Request Assessment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              Assessment Request Details
            </DialogTitle>
            <DialogDescription>
              Review assessment request information and status
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={
                    selectedRequest.status === "completed" ? "bg-success/20 text-success border-success/30" :
                    selectedRequest.status === "scheduled" ? "bg-info/20 text-info border-info/30" :
                    selectedRequest.status === "pending" ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-destructive/20 text-destructive border-destructive/30"
                  }>
                    {selectedRequest.status || "unknown"}
                  </Badge>
                </div>
                {selectedRequest.reviewer && (
                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                    <p className="text-sm text-muted-foreground mb-1">Reviewer</p>
                    <p className="font-semibold">{selectedRequest.reviewer}</p>
                  </div>
                )}
              </div>
              {selectedRequest.scheduledUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Scheduled Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.scheduledUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedRequest.notes && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.notes}</p>
                </div>
              )}
              {selectedRequest.proof?.refShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">7D Proof Reference</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{selectedRequest.proof.refShort}</code>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Details Dialog */}
      <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {selectedEvidence?.title || "Evidence Details"}
            </DialogTitle>
            <DialogDescription>
              Evidence information and proof references
            </DialogDescription>
          </DialogHeader>
          {selectedEvidence && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <Badge variant="outline">{selectedEvidence.type || "N/A"}</Badge>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Module</p>
                  <p className="font-semibold">{selectedEvidence.module || "N/A"}</p>
                </div>
              </div>
              {selectedEvidence.owner && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Owner</p>
                  <p className="text-sm text-muted-foreground">{selectedEvidence.owner}</p>
                </div>
              )}
              {selectedEvidence.updatedUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEvidence.updatedUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedEvidence.proof?.refShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">7D Proof Reference</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{selectedEvidence.proof.refShort}</code>
                  </div>
                </div>
              )}
              {selectedEvidence.tags && selectedEvidence.tags.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvidence.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvidence(null)}>Close</Button>
            {selectedEvidence?.hasMedia && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                toast({ title: "Media Download", description: "Downloading evidence media..." });
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Media
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Reference Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              7D Proof Reference
            </DialogTitle>
            <DialogDescription>
              Cryptographic proof verification details
            </DialogDescription>
          </DialogHeader>
          {selectedProof && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                <p className="text-sm font-semibold mb-2">Proof Hash</p>
                <code className="text-sm bg-muted px-3 py-2 rounded block break-all">{selectedProof.value || "N/A"}</code>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold mb-1">Label</p>
                <p className="text-sm text-muted-foreground">{selectedProof.label || "N/A"}</p>
              </div>
              {selectedProof.timestampUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Timestamp</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedProof.timestampUtc).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-300/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <p className="text-sm font-semibold text-success">Verified & Immutable</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This proof reference is cryptographically verified and cannot be tampered with.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProof(null)}>Close</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
              if (selectedProof?.value) {
                navigator.clipboard.writeText(selectedProof.value);
                toast({ title: "Copied", description: "Proof hash copied to clipboard" });
              }
            }}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Hash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Check Dialog */}
      <Dialog open={!!selectedCheck} onOpenChange={(open) => !open && setSelectedCheck(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              Skill Check Details
            </DialogTitle>
            <DialogDescription>
              Skill assessment and verification information
            </DialogDescription>
          </DialogHeader>
          {selectedCheck && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Skill</p>
                  <p className="font-semibold">{selectedCheck.skill || "N/A"}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Module</p>
                  <p className="font-semibold">{selectedCheck.module || "N/A"}</p>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold mb-1">Status</p>
                <Badge className={
                  selectedCheck.status === "passed" ? "bg-success/20 text-success border-success/30" :
                  selectedCheck.status === "failed" ? "bg-destructive/20 text-destructive border-destructive/30" :
                  "bg-warning/20 text-warning border-warning/30"
                }>
                  {selectedCheck.status || "unknown"}
                </Badge>
              </div>
              {selectedCheck.updatedUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCheck.updatedUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedCheck.proof?.refShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">7D Proof Reference</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{selectedCheck.proof.refShort}</code>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCheck(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Details Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {selectedCertificate?.title || "Certificate Details"}
            </DialogTitle>
            <DialogDescription>
              Certificate issuance and verification information
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={
                    selectedCertificate.status === "issued" ? "bg-success/20 text-success border-success/30" :
                    selectedCertificate.status === "pending" ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-destructive/20 text-destructive border-destructive/30"
                  }>
                    {selectedCertificate.status || "unknown"}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                  <p className="text-sm text-muted-foreground mb-1">Issuer</p>
                  <p className="font-semibold">{selectedCertificate.issuer || "N/A"}</p>
                </div>
              </div>
              {selectedCertificate.owner && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Owner</p>
                  <p className="text-sm text-muted-foreground">{selectedCertificate.owner}</p>
                </div>
              )}
              {selectedCertificate.issuedUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Issued Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCertificate.issuedUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedCertificate.expiresUtc && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Expires Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCertificate.expiresUtc).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedCertificate.verification?.codeShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Verification Code</p>
                  <code className="text-sm bg-muted px-3 py-2 rounded block">{selectedCertificate.verification.codeShort}</code>
                </div>
              )}
              {selectedCertificate.proof?.refShort && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">7D Proof Reference</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{selectedCertificate.proof.refShort}</code>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCertificate(null)}>Close</Button>
            {selectedCertificate?.status === "issued" && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                toast({ title: "Certificate Download", description: "Downloading certificate..." });
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Recommendations Dialog */}
      <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-warning" />
              AI Recommendations
            </DialogTitle>
            <DialogDescription>
              Personalized skill development recommendations based on your progress
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {data19_2?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
              const advisor = data19_2.layout.find((l: any) => l.type === "ai_advisor");
              return (
                <>
                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                    <p className="text-sm font-semibold mb-2">AI Advisor Message</p>
                    <p className="text-sm text-muted-foreground">{advisor.message}</p>
                  </div>

                  {advisor.recommendedNext && advisor.recommendedNext.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Recommended Next Steps</h4>
                      {advisor.recommendedNext.map((rec: any, i: number) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300/30">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-sm">{rec.title}</h5>
                            <Badge variant="outline" className="bg-yellow-100/50 dark:bg-yellow-900/30">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                          {rec.moduleId && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const module = data19_1?.layout?.find((l: any) => l.type === "module_catalog")?.items?.find((m: any) => m.id === rec.moduleId);
                                if (module) {
                                  setSelectedModule(module);
                                  setShowRecommendations(false);
                                }
                              }}
                              className="mt-2 border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              <BookOpen className="w-3 h-3 mr-2" />
                              View Module
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {advisor.missingEvidence && advisor.missingEvidence.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Missing Evidence</h4>
                      {advisor.missingEvidence.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg border border-orange-300/30">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-sm">{item.moduleTitle}</h5>
                            <Badge variant="outline" className="bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              Required
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setUploadFormData(prev => ({ ...prev, module: item.moduleTitle }));
                              setShowRecommendations(false);
                              setShowUploadEvidence(true);
                            }}
                            className="mt-2 border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            Upload Evidence
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {advisor.qualityFlags && advisor.qualityFlags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Quality Flags</h4>
                      {advisor.qualityFlags.map((flag: any, i: number) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-300/30">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{flag.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecommendations(false)}>Close</Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white" 
              onClick={() => {
                setShowRecommendations(false);
                setShowUploadEvidence(true);
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={showUploadEvidence} onOpenChange={setShowUploadEvidence}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Upload Evidence
            </DialogTitle>
            <DialogDescription>
              Upload evidence for skill assessment and certification
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evidence-module">Module / Skill</Label>
              <Select 
                value={uploadFormData.module} 
                onValueChange={(value) => setUploadFormData(prev => ({ ...prev, module: value }))}
              >
                <SelectTrigger id="evidence-module" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50">
                  <SelectValue placeholder="Select module or skill" />
                </SelectTrigger>
                <SelectContent>
                  {data19_1?.layout?.find((l: any) => l.type === "module_catalog")?.items?.map((module: any) => (
                    <SelectItem key={module.id} value={module.title}>{module.title}</SelectItem>
                  ))}
                  {data19_2?.layout?.find((l: any) => l.type === "evidence_list")?.items?.map((item: any, i: number) => (
                    <SelectItem key={i} value={item.module}>{item.module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-type">Evidence Type</Label>
              <Select 
                value={uploadFormData.type} 
                onValueChange={(value) => setUploadFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="evidence-type" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50">
                  <SelectValue placeholder="Select evidence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Recording</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="audio">Audio Recording</SelectItem>
                  <SelectItem value="assessment">Assessment Result</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-description">Description</Label>
              <Input
                id="evidence-description"
                placeholder="Brief description of the evidence..."
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-file">File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="evidence-file"
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadFormData(prev => ({ ...prev, file }));
                  }}
                  className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                />
                {uploadFormData.file && (
                  <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/30">
                    {uploadFormData.file.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: Images, Videos, Audio, PDF, Word documents
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-purple-300/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-semibold">7D Proof Protection</p>
              </div>
              <p className="text-xs text-muted-foreground">
                All uploaded evidence will be automatically protected with 7D Proof immutability and cryptographic verification.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadEvidence(false);
              setUploadFormData({ module: "", type: "", description: "", file: null });
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white" 
              onClick={() => {
                if (!uploadFormData.module || !uploadFormData.type || !uploadFormData.file) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields and select a file.",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Evidence Uploaded",
                  description: `Evidence for ${uploadFormData.module} has been uploaded successfully. 7D Proof verification in progress...`,
                });
                setShowUploadEvidence(false);
                setUploadFormData({ module: "", type: "", description: "", file: null });
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Catalog Dialog */}
      <Dialog open={showModuleCatalog} onOpenChange={setShowModuleCatalog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Module Catalog
            </DialogTitle>
            <DialogDescription>
              Browse and search all available training modules
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search modules..."
                className="flex-1 border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] border-purple-300/50">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data19_1?.layout?.find((l: any) => l.type === "module_catalog") && (() => {
              const catalog = data19_1.layout.find((l: any) => l.type === "module_catalog");
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalog.items && catalog.items.length > 0 ? catalog.items.map((module: any) => (
                    <div
                      key={module.id}
                      className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 cursor-pointer hover:border-purple-400/50 transition-colors"
                      onClick={() => {
                        setSelectedModule(module);
                        setShowModuleCatalog(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{module.title}</h4>
                        <Badge variant="outline" className="text-xs">{module.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{module.category}</p>
                      {module.durationMin && (
                        <p className="text-xs text-muted-foreground">Duration: {module.durationMin} min</p>
                      )}
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8 col-span-2">No modules available.</p>
                  )}
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleCatalog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CPD Details Dialog */}
      <Dialog open={showCPDDetails} onOpenChange={setShowCPDDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              CPD (Continuing Professional Development) Summary
            </DialogTitle>
            <DialogDescription>
              Your continuing professional development hours and compliance status
            </DialogDescription>
          </DialogHeader>
          {data19_3?.layout?.find((l: any) => l.type === "cpd_summary") && (() => {
            const cpd = data19_3.layout.find((l: any) => l.type === "cpd_summary");
            return (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {cpd.items?.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Compliance Status</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your CPD hours are tracked and verified. All training activities are proof-linked for audit purposes.
                  </p>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCPDDetails(false)}>Close</Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                toast({
                  title: "CPD Report",
                  description: "Generating CPD report...",
                });
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CPD Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Certificates Dialog */}
      <Dialog open={showAllCertificates} onOpenChange={setShowAllCertificates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              All Certificates
            </DialogTitle>
            <DialogDescription>
              View all your issued, pending, and expired certificates
            </DialogDescription>
          </DialogHeader>
          {data19_3?.layout?.find((l: any) => l.type === "certificates") && (() => {
            const certs = data19_3.layout.find((l: any) => l.type === "certificates");
            return (
              <div className="py-4 space-y-3">
                {certs.items && certs.items.length > 0 ? certs.items.map((cert: any) => {
                  const issuedDate = cert.issuedUtc ? new Date(cert.issuedUtc) : null;
                  const issuedStr = issuedDate ? issuedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
                  const expiresDate = cert.expiresUtc ? new Date(cert.expiresUtc) : null;
                  const expiresStr = expiresDate ? expiresDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
                  return (
                    <div
                      key={cert.id}
                      className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 cursor-pointer hover:border-purple-400/50 transition-colors"
                      onClick={() => {
                        setSelectedCertificate(cert);
                        setShowAllCertificates(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{cert.title}</h4>
                            <Badge className={
                              cert.status === "issued" ? "bg-success/20 text-success border-success/30" :
                              cert.status === "pending" ? "bg-warning/20 text-warning border-warning/30" :
                              cert.status === "expired" ? "bg-destructive/20 text-destructive border-destructive/30" :
                              "bg-muted"
                            }>
                              {cert.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">Issuer: {cert.issuer}</p>
                          {issuedStr && <p className="text-xs text-muted-foreground mb-1">Issued: {issuedStr}</p>}
                          {expiresStr && <p className="text-xs text-muted-foreground">Expires: {expiresStr}</p>}
                        </div>
                        <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-muted-foreground py-8">No certificates available.</p>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllCertificates(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Renewal Dialog */}
      <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Renew Certificate
            </DialogTitle>
            <DialogDescription>
              {selectedRenewalCert ? `Renew ${selectedRenewalCert.title}` : "Renew your certificate"}
            </DialogDescription>
          </DialogHeader>
          {selectedRenewalCert && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">Certificate Details</h4>
                <p className="text-sm text-muted-foreground mb-1"><strong>Title:</strong> {selectedRenewalCert.title}</p>
                <p className="text-sm text-muted-foreground mb-1"><strong>Issuer:</strong> {selectedRenewalCert.issuer}</p>
                {selectedRenewalCert.expiresUtc && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Current Expiry:</strong> {new Date(selectedRenewalCert.expiresUtc).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Renewal Requirements</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete required CPD hours</li>
                  <li>• Pass renewal assessment (if required)</li>
                  <li>• Submit renewal application</li>
                  <li>• Pay renewal fee (if applicable)</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRenewalDialog(false);
              setSelectedRenewalCert(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                toast({
                  title: "Renewal Requested",
                  description: `Renewal request for ${selectedRenewalCert?.title || "certificate"} has been submitted. You will be notified once processed.`,
                });
                setShowRenewalDialog(false);
                setSelectedRenewalCert(null);
              }}
            >
              Submit Renewal Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Skill Check Dialog */}
      <Dialog open={showRequestSkillCheck} onOpenChange={setShowRequestSkillCheck}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Request Skill Check
            </DialogTitle>
            <DialogDescription>
              Request a skill assessment for a completed module
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillcheck-module">Module</Label>
              <Select 
                value={skillCheckFormData.module} 
                onValueChange={(value) => setSkillCheckFormData(prev => ({ ...prev, module: value }))}
              >
                <SelectTrigger id="skillcheck-module" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {data19_1?.layout?.find((l: any) => l.type === "module_catalog")?.items?.map((module: any) => (
                    <SelectItem key={module.id} value={module.title}>{module.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillcheck-skill">Skill to Assess</Label>
              <Input
                id="skillcheck-skill"
                placeholder="e.g., Medication Administration, Wound Care"
                value={skillCheckFormData.skill}
                onChange={(e) => setSkillCheckFormData(prev => ({ ...prev, skill: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
              <p className="text-xs text-muted-foreground">Specific skill or competency to be assessed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillcheck-reason">Reason for Request</Label>
              <Textarea
                id="skillcheck-reason"
                placeholder="e.g., Completed module training, need formal assessment for certification..."
                value={skillCheckFormData.reason}
                onChange={(e) => setSkillCheckFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillcheck-date">Preferred Assessment Date (Optional)</Label>
              <Input
                id="skillcheck-date"
                type="date"
                value={skillCheckFormData.preferredDate}
                onChange={(e) => setSkillCheckFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
              <p className="text-xs text-muted-foreground">Leave blank for earliest available date</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Assessment Process</h4>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Your request will be reviewed by a qualified assessor</li>
                <li>• Assessment may include practical demonstration or written test</li>
                <li>• Results will be proof-linked and added to your skill profile</li>
                <li>• You will be notified once the assessment is scheduled</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRequestSkillCheck(false);
              setSkillCheckFormData({ module: "", skill: "", reason: "", preferredDate: "" });
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (!skillCheckFormData.module || !skillCheckFormData.skill || !skillCheckFormData.reason) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields (Module, Skill, and Reason).",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Skill Check Requested",
                  description: `Skill check request for "${skillCheckFormData.skill}" has been submitted. You will be notified once scheduled.`,
                });
                setShowRequestSkillCheck(false);
                setSkillCheckFormData({ module: "", skill: "", reason: "", preferredDate: "" });
              }}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Training Hours Dialog */}
      <Dialog open={showAddTrainingHours} onOpenChange={setShowAddTrainingHours}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Add Training Hours
            </DialogTitle>
            <DialogDescription>
              Log your continuing professional development (CPD) training hours
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-activity">Training Activity</Label>
              <Input
                id="training-activity"
                placeholder="e.g., Wound Care Workshop, Medication Safety Course"
                value={trainingHoursFormData.activity}
                onChange={(e) => setTrainingHoursFormData(prev => ({ ...prev, activity: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training-hours">Hours</Label>
                <Input
                  id="training-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g., 2.5"
                  value={trainingHoursFormData.hours}
                  onChange={(e) => setTrainingHoursFormData(prev => ({ ...prev, hours: e.target.value }))}
                  className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="training-date">Date</Label>
                <Input
                  id="training-date"
                  type="date"
                  value={trainingHoursFormData.date}
                  onChange={(e) => setTrainingHoursFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-description">Description (Optional)</Label>
              <Textarea
                id="training-description"
                placeholder="Additional details about the training activity..."
                value={trainingHoursFormData.description}
                onChange={(e) => setTrainingHoursFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50"
                rows={3}
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">CPD Tracking</h4>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Training hours are automatically added to your CPD total</li>
                <li>• All entries are proof-linked for audit purposes</li>
                <li>• Hours count towards your annual CPD requirements</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddTrainingHours(false);
              setTrainingHoursFormData({ activity: "", hours: "", date: "", description: "" });
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (!trainingHoursFormData.activity || !trainingHoursFormData.hours || !trainingHoursFormData.date) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields (Activity, Hours, and Date).",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Training Hours Added",
                  description: `${trainingHoursFormData.hours} hours for "${trainingHoursFormData.activity}" have been logged.`,
                });
                setShowAddTrainingHours(false);
                setTrainingHoursFormData({ activity: "", hours: "", date: "", description: "" });
              }}
            >
              Add Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Expiring Certificates Dialog */}
      <Dialog open={showExpiringCertificates} onOpenChange={setShowExpiringCertificates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning" />
              Expiring Certificates
            </DialogTitle>
            <DialogDescription>
              Certificates that are expiring soon and require renewal
            </DialogDescription>
          </DialogHeader>
          {data19_3?.layout?.find((l: any) => l.type === "ai_advisor") && (() => {
            const advisor = data19_3.layout.find((l: any) => l.type === "ai_advisor");
            const expiringCerts = data19_3?.layout?.find((l: any) => l.type === "certificates")?.items?.filter((cert: any) => {
              if (cert.expiresUtc) {
                const expiresDate = new Date(cert.expiresUtc);
                const daysUntilExpiry = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry > 0 && daysUntilExpiry <= 90; // Expiring within 90 days
              }
              return false;
            }) || [];
            
            return (
              <div className="py-4 space-y-4">
                {advisor.expiringSoon && advisor.expiringSoon.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-100">Expiring Soon</h4>
                    {advisor.expiringSoon.map((item: any, i: number) => {
                      const cert = data19_3?.layout?.find((l: any) => l.type === "certificates")?.items?.find((c: any) => c.title === item.title);
                      const expiresDate = cert?.expiresUtc ? new Date(cert.expiresUtc) : null;
                      const daysUntilExpiry = expiresDate ? Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                      
                      return (
                        <div key={i} className="p-4 bg-gradient-to-br from-warning/10 to-amber/10 dark:from-warning/20 dark:to-amber/20 rounded-lg border border-warning/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm text-purple-900 dark:text-purple-100">{item.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                              {expiresDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires: {expiresDate.toLocaleDateString()}
                                  {daysUntilExpiry !== null && (
                                    <span className="ml-2 font-medium text-warning">
                                      ({daysUntilExpiry} days remaining)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-warning/20 text-warning border-warning/30">
                              Expiring Soon
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (cert) {
                                  setSelectedRenewalCert(cert);
                                  setShowExpiringCertificates(false);
                                  setShowRenewalDialog(true);
                                }
                              }}
                              className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              Renew Now
                            </Button>
                            {cert && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCertificate(cert);
                                  setShowExpiringCertificates(false);
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {expiringCerts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-100">All Expiring Certificates</h4>
                    {expiringCerts.map((cert: any) => {
                      const expiresDate = cert.expiresUtc ? new Date(cert.expiresUtc) : null;
                      const daysUntilExpiry = expiresDate ? Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                      return (
                        <div key={cert.id} className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm text-purple-900 dark:text-purple-100">{cert.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">Issuer: {cert.issuer}</p>
                              {expiresDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires: {expiresDate.toLocaleDateString()}
                                  {daysUntilExpiry !== null && (
                                    <span className="ml-2 font-medium text-warning">
                                      ({daysUntilExpiry} days remaining)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRenewalCert(cert);
                                setShowExpiringCertificates(false);
                                setShowRenewalDialog(true);
                              }}
                              className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                            >
                              Renew
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(!advisor.expiringSoon || advisor.expiringSoon.length === 0) && expiringCerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No certificates expiring soon.</p>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpiringCertificates(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Skill Path Dialog */}
      <Dialog open={showStartSkillPath} onOpenChange={setShowStartSkillPath}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Start a Skill Path
            </DialogTitle>
            <DialogDescription>
              Choose a structured learning path to develop your skills systematically
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "path-1",
                  title: "Wound Care Specialist",
                  description: "Master advanced wound care techniques and protocols",
                  modules: 8,
                  duration: "16 hours",
                  level: "Advanced",
                  color: "purple"
                },
                {
                  id: "path-2",
                  title: "Medication Safety Expert",
                  description: "Comprehensive medication administration and safety training",
                  modules: 6,
                  duration: "12 hours",
                  level: "Intermediate",
                  color: "blue"
                },
                {
                  id: "path-3",
                  title: "Fall Prevention Specialist",
                  description: "Learn evidence-based fall prevention strategies",
                  modules: 5,
                  duration: "10 hours",
                  level: "Intermediate",
                  color: "green"
                },
                {
                  id: "path-4",
                  title: "Emergency Response",
                  description: "Critical emergency response and escalation protocols",
                  modules: 7,
                  duration: "14 hours",
                  level: "Advanced",
                  color: "red"
                }
              ].map((path) => (
                <div
                  key={path.id}
                  className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 cursor-pointer hover:border-purple-400/50 transition-colors"
                  onClick={() => setSelectedSkillPath(path)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">{path.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{path.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{path.level}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{path.modules} modules</span>
                    <span>{path.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedSkillPath && (
              <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Selected Path: {selectedSkillPath.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{selectedSkillPath.description}</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• {selectedSkillPath.modules} modules to complete</p>
                  <p>• Estimated duration: {selectedSkillPath.duration}</p>
                  <p>• Level: {selectedSkillPath.level}</p>
                  <p>• Progress will be tracked and proof-linked</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowStartSkillPath(false);
              setSelectedSkillPath(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (!selectedSkillPath) {
                  toast({
                    title: "Selection Required",
                    description: "Please select a skill path to start.",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Skill Path Started",
                  description: `You've started the "${selectedSkillPath.title}" skill path. Good luck with your learning journey!`,
                });
                setShowStartSkillPath(false);
                setSelectedSkillPath(null);
              }}
            >
              Start Path
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
