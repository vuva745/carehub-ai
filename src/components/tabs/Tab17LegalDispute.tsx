import { Search, Scale, Shield, FileText, Download, Eye, ChevronRight, Archive, Filter, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateLegalDisputeData, downloadCSV, downloadPDF, downloadJSON } from "@/lib/exportUtils";
import { runTab17ProofDispute } from "@/lib/neocare-ai/tab17-script";
import { useState, useEffect } from "react";

const cases = [
  { name: "John de Vries", date: "April 24, 2021, 11:45 AM", status: "Open", statusDetail: "Under review", verified: true },
  { name: "John de Vries", date: "April 13, 2021, 3:45 PM", status: "COS&Mavied", statusDetail: "AM&Mmeen", verified: true },
  { name: "John de Vries", date: "April 5, 2021, 10:30 AM", status: "COSEOVuMet", statusDetail: "Under review", verified: true },
  { name: "Maria Jansen", date: "April 19, 2021, 9:00 AM", status: "COS&Mavied", statusDetail: "Under review", verified: true },
  { name: "Maria Jansen", date: "April 19, 2021, 9:00 PM", status: "COSet&taVies", statusDetail: "Under review", verified: true },
  { name: "Maria Jansen", date: "April 5, 2021, 4:00 PM", status: "COSEONevled", statusDetail: "Under review", verified: true },
];

export function Tab17LegalDispute() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<any>({});
  const [range, setRange] = useState("7d");

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab17ProofDispute(range, filter);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range, filter]);

  if (loading) return <div className="p-10 text-center text-purple-500">Loading Legal Dispute Center...</div>;

  const model = data || {};
  const kpiCards = model.layout?.find((l: any) => l.type === "kpi_cards")?.items || [];
  const filters = model.layout?.find((l: any) => l.type === "filters");
  const proofLedger = model.layout?.find((l: any) => l.type === "proof_ledger")?.items || [];
  const disputes = model.layout?.find((l: any) => l.type === "dispute_cases")?.items || [];
  const caseTools = model.layout?.find((l: any) => l.type === "case_tools")?.items || [];

  const totalProof = kpiCards.find((i: any) => i.label === "Total Proof Entries")?.value || 0;
  const btcCount = kpiCards.find((i: any) => i.label === "Bitcoin References")?.value || 0;
  const mediaCount = kpiCards.find((i: any) => i.label === "Media Attached")?.value || 0;
  const openDisputes = kpiCards.find((i: any) => i.label === "Open Disputes")?.value || 0;

  const disputeData = generateLegalDisputeData();

  const handleExportPDF = () => {
    const headers = Object.keys(disputeData[0]);
    const rows = disputeData.map(row => Object.values(row).map(v => String(v ?? "")));
    downloadPDF("7D Proof Legal Dispute - Audit Report", [headers, ...rows], "legal-dispute-audit");
    toast({
      title: "Export Complete",
      description: "PDF audit report has been downloaded.",
    });
  };

  const handleExportZIP = () => {
    // Export as JSON (simulating ZIP package)
    downloadJSON({ cases: disputeData, exportDate: new Date().toISOString() }, "legal-dispute-evidence-package");
    toast({
      title: "Export Complete",
      description: "Evidence package (JSON) has been downloaded.",
    });
  };

  const handleExportCase = (caseId: string) => {
    const caseData = disputes.find((d: any) => d.id === caseId);
    if (!caseData) {
      toast({
        title: "Export Failed",
        description: "Case not found.",
        variant: "destructive"
      });
      return;
    }

    const exportData = {
      caseId: caseData.id,
      title: caseData.title,
      status: caseData.status,
      parties: caseData.parties,
      linkedProofCount: caseData.linkedProofCount,
      updatedUtc: caseData.updatedUtc,
      severity: caseData.severity,
      exportDate: new Date().toISOString()
    };

    downloadJSON(exportData, `legal-dispute-case-${caseId}`);
    toast({
      title: "Export Complete",
      description: `Case ${caseId} has been exported as JSON.`,
    });
  };

  const handleExportAllCases = () => {
    if (disputes.length === 0) {
      toast({
        title: "Export Failed",
        description: "No cases to export.",
        variant: "destructive"
      });
      return;
    }

    const allCasesData = disputes.map((case_: any) => ({
      caseId: case_.id,
      title: case_.title,
      status: case_.status,
      parties: case_.parties,
      linkedProofCount: case_.linkedProofCount,
      updatedUtc: case_.updatedUtc,
      severity: case_.severity
    }));

    // Export as CSV
    const headers = ["Case ID", "Title", "Status", "Client ID", "Nurse ID", "Proof Count", "Last Updated", "Severity"];
    const rows = allCasesData.map(c => [
      c.caseId || "",
      c.title || "",
      c.status || "",
      c.parties?.clientId || "",
      c.parties?.nurseId || "",
      String(c.linkedProofCount || 0),
      c.updatedUtc ? new Date(c.updatedUtc).toLocaleString() : "",
      c.severity || ""
    ]);

    downloadCSV([headers, ...rows], "all-legal-dispute-cases");
    toast({
      title: "Export Complete",
      description: `All ${disputes.length} cases have been exported as CSV.`,
    });
  };

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
            {model.header?.title || "7D Proof Legal Dispute Center"}
          </h1>
          <Badge variant="secondary" className="px-3 py-1">TAB: 17</Badge>
          <span className="text-purple-600/80 dark:text-purple-400/80">
            {model.header?.subtitle || "7D Proof Legal Dispute Center"}
          </span>
        </div>
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
            className="border-0 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20"
          />
        ))}
      </div>

      {/* Filters */}
      {filters && (
        <Card className="mb-6 border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
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
                      onValueChange={(value) => handleFilterChange(filterItem.key, value)}
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
              <Button size="sm" onClick={() => handleAction("Filters Applied")}>
                <Filter className="w-4 h-4 mr-2" /> Apply Filters
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - About Section */}
        <div className="space-y-4">
          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">About 7D Proof Legal Dispute Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-32 h-32 mx-auto relative">
                {/* Neon glow layers */}
                <div className="absolute -inset-2 bg-yellow-500/40 rounded-xl blur-lg animate-pulse" />
                <div className="absolute -inset-1 bg-yellow-400/30 rounded-xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-warning to-warning/60 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                  <Scale className="w-16 h-16 text-warning-foreground drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-warning drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">7D Proof</h3>
                <p className="text-sm text-muted-foreground">LEGAL DISPUTE CENTER</p>
              </div>
              <p className="text-sm text-muted-foreground">
                This center provides secure storage of 7D Proof logs for potential legal disputes. Data is immutable, audit-proof, and accessible for up to 3 years.
              </p>
              <p className="text-sm text-muted-foreground">
                Extraction requires authorization from both a medical professional and an authorized external party (e.g., court, insurance, inspection).
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all">
                    View Regulatory Compliance & Terms <ChevronRight className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">Regulatory Compliance & Terms of Service</DialogTitle>
                    <DialogDescription className="text-base">
                      Comprehensive compliance framework and terms governing the 7D Proof Legal Dispute Center
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    {/* GDPR Compliance */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">GDPR Compliance</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Data Protection:</strong> All personal data processed through the 7D Proof Legal Dispute Center complies with the General Data Protection Regulation (GDPR) (EU) 2016/679 and applicable national data protection laws.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Lawful Basis:</strong> Processing is based on legitimate interests for legal dispute resolution, compliance with legal obligations, and explicit consent where required. Healthcare data processing follows Article 9(2)(h) GDPR for healthcare purposes.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Data Subject Rights:</strong> Individuals have the right to access, rectify, erase, restrict processing, data portability, and object to processing. Requests must be submitted in writing and verified through authorized channels.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Data Minimization:</strong> Only necessary data for dispute resolution and legal compliance is collected and retained. No excessive or irrelevant personal information is stored.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Breach Notification:</strong> Any personal data breach will be reported to the supervisory authority within 72 hours and to affected data subjects without undue delay, as required by GDPR Article 33-34.
                        </p>
                      </div>
                    </div>

                    {/* Data Retention & Storage */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Data Retention & Storage</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Retention Period:</strong> All proof entries and dispute case records are retained for a minimum of 3 years from the date of creation, in compliance with healthcare record retention requirements and legal statute of limitations.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Immutable Storage:</strong> Once recorded, proof entries cannot be modified or deleted, ensuring data integrity and legal admissibility. Only authorized annotations may be added through proper audit trails.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Secure Storage:</strong> All data is encrypted at rest and in transit using industry-standard encryption (AES-256). Access is restricted to authorized personnel with role-based permissions.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Geographic Storage:</strong> Data is stored within EU/EEA jurisdictions or in countries with adequate data protection levels as determined by the European Commission, ensuring compliance with data transfer regulations.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Backup & Recovery:</strong> Regular encrypted backups are maintained with a 30-day retention period. Disaster recovery procedures ensure business continuity and data availability.
                        </p>
                      </div>
                    </div>

                    {/* Access Control & Authorization */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Access Control & Authorization</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Dual Authorization:</strong> Extraction of proof data for legal purposes requires simultaneous authorization from both (1) a licensed medical professional with appropriate credentials, and (2) an authorized external party (court, insurance company, regulatory inspector, or legal representative).
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Role-Based Access:</strong> System access is granted based on job function and necessity. All users must authenticate using multi-factor authentication (MFA) and maintain secure credentials.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Audit Logging:</strong> Every access, query, export, and modification attempt is logged with timestamp, user identity, IP address, and action type. Audit logs are immutable and retained for the full retention period.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Read-Only Inspection:</strong> External parties may be granted time-limited, read-only access through secure inspection links ("Shark views") that expire after a specified duration and do not allow data export.
                        </p>
                      </div>
                    </div>

                    {/* Legal Admissibility & Proof Standards */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Legal Admissibility & Proof Standards</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Chain of Custody:</strong> All proof entries maintain a complete, unbroken chain of custody from creation through storage, ensuring legal admissibility in court proceedings.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Cryptographic Proof:</strong> Each entry includes a cryptographic hash (SHA-256) and optional Bitcoin blockchain reference for additional tamper-evident verification. Proof hashes are independently verifiable.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Timestamp Integrity:</strong> All timestamps are cryptographically signed and synchronized with authoritative time sources (NTP), preventing backdating or manipulation.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Metadata Preservation:</strong> Complete metadata including actors, event types, locations, and related identifiers are preserved with each proof entry, maintaining context for legal review.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Export Formats:</strong> Legal exports are provided in standardized formats (PDF, JSON, CSV) with embedded verification hashes and digital signatures to ensure authenticity.
                        </p>
                      </div>
                    </div>

                    {/* Terms of Service */}
                    <div className="p-5 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Terms of Service</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Service Purpose:</strong> The 7D Proof Legal Dispute Center is provided for the sole purpose of maintaining immutable, audit-proof records for potential legal disputes and regulatory compliance. Use of this service constitutes acceptance of these terms.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Authorized Use:</strong> Users may only access and use the system for legitimate healthcare operations, legal dispute resolution, and regulatory compliance. Unauthorized access, tampering, or misuse is strictly prohibited and may result in legal action.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Data Accuracy:</strong> While the system ensures data integrity and immutability, users are responsible for the accuracy of information entered. False or misleading entries may result in account suspension and legal consequences.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Liability Limitation:</strong> NeoCare provides the 7D Proof system as-is. While we maintain high security and availability standards, we are not liable for indirect damages, data loss due to force majeure, or unauthorized access resulting from user credential compromise.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Intellectual Property:</strong> All system software, interfaces, and documentation remain the intellectual property of NeoCare. Users may not reverse engineer, copy, or redistribute system components without explicit written authorization.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Dispute Resolution:</strong> Any disputes arising from use of this service shall be resolved through binding arbitration in accordance with applicable jurisdiction laws. Users waive the right to class action lawsuits.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Termination:</strong> NeoCare reserves the right to suspend or terminate access for violations of these terms, security breaches, or legal requirements. Upon termination, data retention obligations continue as specified in the retention policy.
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Updates to Terms:</strong> These terms may be updated periodically. Continued use of the service after updates constitutes acceptance. Material changes will be communicated through official channels with 30 days' notice.
                        </p>
                      </div>
                    </div>

                    {/* Compliance Certifications */}
                    <div className="p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-bold text-lg text-green-900 dark:text-green-100">Compliance Certifications</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          ✓ ISO 27001: Information Security Management System
                        </p>
                        <p className="text-muted-foreground">
                          ✓ ISO 27701: Privacy Information Management System
                        </p>
                        <p className="text-muted-foreground">
                          ✓ SOC 2 Type II: Security, Availability, and Confidentiality
                        </p>
                        <p className="text-muted-foreground">
                          ✓ HIPAA Compliance: Healthcare data protection (where applicable)
                        </p>
                        <p className="text-muted-foreground">
                          ✓ GDPR Compliance: European data protection regulation
                        </p>
                        <p className="text-muted-foreground">
                          ✓ Regular third-party security audits and penetration testing
                        </p>
                      </div>
                    </div>

                    {/* Contact & Support */}
                    <div className="p-5 bg-muted/50 rounded-lg border border-border">
                      <h4 className="font-semibold mb-2 text-sm">Compliance Inquiries & Support</h4>
                      <p className="text-xs text-muted-foreground">
                        For questions regarding compliance, data protection, or these terms, contact our Data Protection Officer at: <strong>dpo@neocare.app</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleAction("Compliance Terms Acknowledged")} className="bg-purple-600 hover:bg-purple-700 text-white">
                      I Understand & Accept
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Cases List */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by client name or date" className="pl-9" />
                </div>
                <Button onClick={() => handleAction("Search Cases")}>SEARCH CASES</Button>
              </div>

              <Tabs defaultValue="recent">
                <TabsList className="mb-4">
                  <TabsTrigger value="recent">Recent Cases</TabsTrigger>
                  <TabsTrigger value="archive">Archive Cases</TabsTrigger>
                </TabsList>
                <TabsContent value="recent" className="space-y-3">
                  {disputes.length > 0 ? disputes.map((case_: any) => {
                    const date = case_.updatedUtc ? new Date(case_.updatedUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ", " + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                    const statusColor = case_.status === "resolved" ? "success" : case_.status === "reviewing" ? "warning" : "info";
                    return (
                      <div key={case_.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{case_.parties?.clientId?.[0] || case_.parties?.nurseId?.[0] || "C"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{case_.title}</p>
                            <p className="text-xs text-muted-foreground">{dateStr}</p>
                            {case_.linkedProofCount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {case_.linkedProofCount} proof reference{case_.linkedProofCount !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={case_.status === "resolved" ? "default" : "outline"} className={
                            case_.status === "resolved" ? "bg-success/20 text-success border-success/30" :
                            case_.status === "reviewing" ? "bg-warning/20 text-warning border-warning/30" :
                            "bg-info/20 text-info border-info/30"
                          }>
                            {case_.status}
                          </Badge>
                          <Badge className="bg-success/20 text-success border-success/30 gap-1">
                            <Shield className="w-3 h-3" /> 7D Proof VERIFIED
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(`View Case: ${case_.id}`)}>
                          View Proof Logs
                        </Button>
                      </div>
                    );
                  }) : (
                    <p className="text-center text-muted-foreground py-8">No dispute cases found.</p>
                  )}
                </TabsContent>
                <TabsContent value="archive">
                  <p className="text-center text-muted-foreground py-8">No archived cases found.</p>
                </TabsContent>
              </Tabs>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                    View All Cases <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">All Dispute Cases</DialogTitle>
                    <DialogDescription>
                      Complete list of all dispute cases with status, proof references, and case details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {disputes.length > 0 ? (
                      <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                            <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{disputes.length}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300/30">
                            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {disputes.filter((d: any) => d.status === "resolved").length}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-300/30">
                            <p className="text-sm text-muted-foreground mb-1">Under Review</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {disputes.filter((d: any) => d.status === "reviewing").length}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-300/30">
                            <p className="text-sm text-muted-foreground mb-1">Open</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {disputes.filter((d: any) => d.status === "open" || d.status === "pending").length}
                            </p>
                          </div>
                        </div>

                        {/* Cases Table */}
                        <div className="rounded-lg border border-purple-200/50 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-purple-100/50 dark:bg-purple-900/30">
                                <tr className="border-b border-purple-300/50">
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Case ID</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Title</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Parties</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Status</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Proof References</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Last Updated</th>
                                  <th className="pb-3 pt-3 px-4 font-semibold text-purple-900 dark:text-purple-100 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {disputes.map((case_: any) => {
                                  const date = case_.updatedUtc ? new Date(case_.updatedUtc) : null;
                                  const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
                                  const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                                  const statusColor = case_.status === "resolved" ? "success" : case_.status === "reviewing" ? "warning" : "info";
                                  return (
                                    <tr key={case_.id} className="border-b border-purple-200/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                                      <td className="py-3 px-4">
                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{case_.id || "N/A"}</code>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="font-medium">{case_.title || "Untitled Case"}</div>
                                        {case_.severity && (
                                          <Badge variant="outline" className="text-xs mt-1">
                                            {case_.severity}
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="text-xs space-y-1">
                                          {case_.parties?.clientId && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-muted-foreground">Client:</span>
                                              <span className="font-medium">{case_.parties.clientId}</span>
                                            </div>
                                          )}
                                          {case_.parties?.nurseId && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-muted-foreground">Nurse:</span>
                                              <span className="font-medium">{case_.parties.nurseId}</span>
                                            </div>
                                          )}
                                          {!case_.parties?.clientId && !case_.parties?.nurseId && (
                                            <span className="text-muted-foreground">—</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <Badge className={
                                          case_.status === "resolved" ? "bg-success/20 text-success border-success/30 shadow-[0_0_5px_rgba(34,197,94,0.3)]" :
                                          case_.status === "reviewing" ? "bg-warning/20 text-warning border-warning/30 shadow-[0_0_5px_rgba(251,191,36,0.3)]" :
                                          "bg-info/20 text-info border-info/30 shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                                        }>
                                          {case_.status || "unknown"}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          {case_.linkedProofCount > 0 ? (
                                            <>
                                              <Shield className="w-4 h-4 text-success" />
                                              <span className="font-medium">{case_.linkedProofCount}</span>
                                              <span className="text-xs text-muted-foreground">proof{case_.linkedProofCount !== 1 ? 's' : ''}</span>
                                            </>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">No proof linked</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="text-xs">
                                          <div className="font-medium">{dateStr}</div>
                                          <div className="text-muted-foreground">{timeStr}</div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex gap-1">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                                              >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                              <DialogHeader>
                                                <DialogTitle className="text-xl font-bold text-purple-900 dark:text-purple-100">
                                                  Case Details: {case_.title || case_.id}
                                                </DialogTitle>
                                                <DialogDescription>
                                                  Complete case information and proof references
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="py-4 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                    <p className="text-sm text-muted-foreground mb-1">Case ID</p>
                                                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{case_.id || "N/A"}</code>
                                                  </div>
                                                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                                                    <Badge className={
                                                      case_.status === "resolved" ? "bg-success/20 text-success border-success/30" :
                                                      case_.status === "reviewing" ? "bg-warning/20 text-warning border-warning/30" :
                                                      "bg-info/20 text-info border-info/30"
                                                    }>
                                                      {case_.status || "unknown"}
                                                    </Badge>
                                                  </div>
                                                  {case_.severity && (
                                                    <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                      <p className="text-sm text-muted-foreground mb-1">Severity</p>
                                                      <Badge variant="outline">{case_.severity}</Badge>
                                                    </div>
                                                  )}
                                                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                    <p className="text-sm text-muted-foreground mb-1">Proof References</p>
                                                    <div className="flex items-center gap-2">
                                                      <Shield className="w-4 h-4 text-success" />
                                                      <span className="font-semibold">{case_.linkedProofCount || 0}</span>
                                                      <span className="text-xs text-muted-foreground">linked proof{case_.linkedProofCount !== 1 ? 's' : ''}</span>
                                                    </div>
                                                  </div>
                                                </div>

                                                {case_.parties && (case_.parties.clientId || case_.parties.nurseId) && (
                                                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                    <h4 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">Parties Involved</h4>
                                                    <div className="space-y-2">
                                                      {case_.parties.clientId && (
                                                        <div className="flex justify-between items-center">
                                                          <span className="text-sm text-muted-foreground">Client ID:</span>
                                                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{case_.parties.clientId}</code>
                                                        </div>
                                                      )}
                                                      {case_.parties.nurseId && (
                                                        <div className="flex justify-between items-center">
                                                          <span className="text-sm text-muted-foreground">Nurse ID:</span>
                                                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{case_.parties.nurseId}</code>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}

                                                {case_.updatedUtc && (
                                                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-300/30">
                                                    <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Last Updated</h4>
                                                    <p className="text-sm">
                                                      {new Date(case_.updatedUtc).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                      })}
                                                    </p>
                                                  </div>
                                                )}

                                                <div className="p-4 bg-muted/50 rounded-lg border border-purple-300/30">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    <p className="text-sm font-semibold">7D Proof Verification</p>
                                                  </div>
                                                  <p className="text-xs text-muted-foreground">
                                                    This case is protected by 7D Proof immutability. All proof references are cryptographically verified and cannot be tampered with.
                                                  </p>
                                                </div>
                                              </div>
                                              <DialogFooter>
                                                <Button variant="outline" onClick={() => handleExportCase(case_.id)}>
                                                  <Download className="w-4 h-4 mr-2" />
                                                  Export Case
                                                </Button>
                                                <Button onClick={() => handleAction("Case Details Viewed")} className="bg-purple-600 hover:bg-purple-700 text-white">
                                                  Close
                                                </Button>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExportCase(case_.id)}
                                            className="text-xs hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                                          >
                                            <Download className="w-3 h-3 mr-1" />
                                            Export
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-purple-300/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-sm font-semibold">7D Proof Verification</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            All cases are protected by 7D Proof immutability. Proof references are cryptographically verified and cannot be tampered with.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Scale className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-lg font-semibold text-muted-foreground mb-2">No Dispute Cases Found</p>
                        <p className="text-sm text-muted-foreground">
                          There are currently no dispute cases in the system.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleExportAllCases} className="border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Cases
                    </Button>
                    <Button onClick={() => handleAction("Cases Viewed")} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tracker & Export */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">Verified Legal Dispute Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm animate-fade-in p-6">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                  title="Ongoing Cases" 
                  value={String(disputes.filter((d: any) => d.status !== "resolved").length)} 
                  subtitle="Set under protection" 
                  className="!p-3 border-0 shadow-[0_0_10px_rgba(168,85,247,0.1)] bg-purple-50/50 dark:bg-purple-900/20" 
                />
                <MetricCard 
                  title="Cases Resolved" 
                  value={String(disputes.filter((d: any) => d.status === "resolved").length)} 
                  subtitle="Proof securely shared" 
                  className="!p-3 border-0 shadow-[0_0_10px_rgba(168,85,247,0.1)] bg-purple-50/50 dark:bg-purple-900/20" 
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-warning">🏆</span>
                  <span className="font-medium">Avg. Case Response Time</span>
                </div>
                <p className="text-2xl font-bold">2.1 <span className="text-sm font-normal">days</span></p>
                <p className="text-xs text-muted-foreground">AI Insight: Within expected level</p>
              </div>

              <p className="text-sm text-muted-foreground">
                AI analysis supports data structuring, legal judgment to enable human.
              </p>

              <div className="space-y-2">
                <ExportButton
                  label="Export Audit Report"
                  options={[
                    { label: "Export as PDF", format: "pdf" },
                    { label: "Export as Word", format: "word" },
                    { label: "Export as CSV", format: "csv" }
                  ]}
                  data={disputeData}
                  pdfTitle="7D Proof Legal Dispute - Audit Report"
                  filename="legal-dispute-audit"
                />
                <Button variant="outline" className="w-full gap-2" onClick={handleExportZIP}>
                  <Archive className="w-4 h-4" /> Export ZIP (Evidence Package)
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="w-4 h-4" /> Generate Read-only Shark (Inspection View)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Read-only View</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-muted-foreground">Generate a secure, time-limited read-only link for external inspection.</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-mono break-all">https://neocare.app/inspect/abc123xyz...</p>
                      </div>
                      <Button className="w-full" onClick={() => handleAction("Link Generated")}>Generate Link</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Sensitive data is under legal protection, immutable, and securely logged for up to 3 years.
            Extraction for legal use requires dual authorization from both a medical professional and an authorized party.
          </p>
        </div>
      </div>

      {/* Proof Ledger Section */}
      {proofLedger.length > 0 && (
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
              {model.layout?.find((l: any) => l.type === "proof_ledger")?.title || "Proof Ledger"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {model.layout?.find((l: any) => l.type === "proof_ledger")?.subtitle || "Immutable-style evidence references"}
            </p>
          </CardHeader>
          <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Event Type</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Actors</th>
                    <th className="pb-3 font-medium">Proof Hash</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {proofLedger.slice(0, 20).map((proof: any) => {
                    const date = proof.timestampUtc ? new Date(proof.timestampUtc) : null;
                    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                    const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                    return (
                      <tr key={proof.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3">
                          <div className="font-medium">{dateStr}</div>
                          <div className="text-muted-foreground text-xs">{timeStr}</div>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">{proof.eventType}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">{proof.title}</div>
                          {proof.attachments?.hasMedia && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {proof.attachments.mediaType || "Media"}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="text-xs space-y-1">
                            {proof.actors?.clientId && <div>Client: {proof.actors.clientId}</div>}
                            {proof.actors?.nurseId && <div>Nurse: {proof.actors.nurseId}</div>}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{proof.proof?.hashShort || "-"}</code>
                            {proof.proof?.bitcoinRef && (
                              <Badge variant="outline" className="text-xs">BTC</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col gap-1">
                            <Badge className={
                              proof.severity === "critical" ? "bg-destructive/20 text-destructive border-destructive/30" :
                              proof.severity === "warning" ? "bg-warning/20 text-warning border-warning/30" :
                              "bg-info/20 text-info border-info/30"
                            }>
                              {proof.severity}
                            </Badge>
                            {proof.dispute?.hasCase && (
                              <Badge variant="outline" className="text-xs">Case: {proof.dispute.caseId}</Badge>
                            )}
                          </div>
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

      {/* Case Tools */}
      {caseTools && caseTools.length > 0 && (
        <Card className="overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-100/50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]">
              {model.layout?.find((l: any) => l.type === "case_tools")?.title || "Case Tools"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {caseTools.map((tool: any) => (
                <Dialog key={tool.action}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {tool.label}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{tool.label}</DialogTitle>
                      <DialogDescription>
                        {tool.action === "CREATE_DISPUTE_CASE" && "Create a new dispute case and link proof references."}
                        {tool.action === "ATTACH_PROOF_TO_CASE" && "Attach proof entries to an existing dispute case."}
                        {tool.action === "EXPORT_AUDIT_BUNDLE" && "Export a privacy-safe audit bundle for legal review."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      {tool.action === "CREATE_DISPUTE_CASE" && (
                        <>
                          <div className="space-y-2">
                            <Label>Case Title</Label>
                            <Input placeholder="Enter case title..." />
                          </div>
                          <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="Brief description..." />
                          </div>
                        </>
                      )}
                      {tool.action === "ATTACH_PROOF_TO_CASE" && (
                        <>
                          <div className="space-y-2">
                            <Label>Select Case</Label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Choose case" /></SelectTrigger>
                              <SelectContent>
                                {disputes.map((d: any) => (
                                  <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Select Proof Entries</Label>
                            <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
                              {proofLedger.slice(0, 5).map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                                  <input type="checkbox" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{p.title}</p>
                                    <p className="text-xs text-muted-foreground">{p.proof?.hashShort}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {tool.action === "EXPORT_AUDIT_BUNDLE" && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Export a privacy-safe audit bundle containing proof references, timestamps, and metadata.
                            No raw media or sensitive personal data will be included.
                          </p>
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON Bundle</SelectItem>
                                <SelectItem value="pdf">PDF Report</SelectItem>
                                <SelectItem value="csv">CSV Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleAction(tool.label)}>
                        {tool.action === "CREATE_DISPUTE_CASE" ? "Create Case" :
                         tool.action === "ATTACH_PROOF_TO_CASE" ? "Attach Proof" :
                         "Export Bundle"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
