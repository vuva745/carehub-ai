/**
 * NeoCare Dashboard — AI Scripts
 * TAB 20: ESG & Impact Dashboard (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does (MVP):
 * - Shows high-level ESG/Impact metrics for NeoCare operations
 * - Tracks social impact (clients served, care minutes, response times)
 * - Tracks workforce metrics (nurse hours, training/cert completion)
 * - Tracks governance/proof (7D Proof coverage, disputes, audit readiness)
 * - Provides sponsor-friendly, privacy-safe reporting (no patient-identifiable details)
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function safeStr(s: string | null | undefined, max = 80): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function byNewest(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function toNum(n: number | null | undefined, d = 0) { const x = Number(n); return Number.isFinite(x) ? x : d; }

// ---------------- API Simulation ----------------
const mockApi = {
  get: async (url: string) => {
    await new Promise(r => setTimeout(r, 400));

    // Impact
    if (url.includes("/esg/impact")) {
      return {
        clientsServed: 1250,
        careMinutes: 187500,
        visitsCompleted: 3420,
        avgResponseMin: 12.5,
        satisfactionScore: 4.7,
        vulnerableClientsServed: 380
      };
    }

    // Workforce
    if (url.includes("/esg/workforce")) {
      return {
        activeNurses: 85,
        hoursDelivered: 15600,
        avgVisitsPerNurse: 40.2,
        trainingHours: 1240,
        certsIssued: 142
      };
    }

    // Governance
    if (url.includes("/esg/governance")) {
      return {
        proofedEvents: 8950,
        totalEvents: 10000,
        disputesOpened: 12,
        disputesResolved: 11,
        dataRetentionDays: 1095
      };
    }

    // Sponsors
    if (url.includes("/sponsors/list")) {
      return [
        { id: "SPON-1", name: "Healthcare Foundation A", active: true },
        { id: "SPON-2", name: "Community Care Initiative B", active: true },
        { id: "SPON-3", name: "Regional Health Authority C", active: true },
      ];
    }

    // Regions
    if (url.includes("/regions/list")) {
      return [
        { id: "REG-1", name: "Amsterdam North", active: true },
        { id: "REG-2", name: "Rotterdam Central", active: true },
        { id: "REG-3", name: "Utrecht South", active: true },
      ];
    }

    // Proof References
    if (url.includes("/proof/esg/refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), label: "ESG Impact Proof: Q1 2024", refId: "PROOF-ESG-001", hash: "0xabc123def456" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), label: "Workforce Metrics Proof", refId: "PROOF-ESG-002", hash: "0xdef456ghi789" },
        { id: "PR-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), label: "Governance Audit Proof", refId: "PROOF-ESG-003", hash: "0xghi789jkl012" },
      ];
    }

    // AI Summary
    if (url.includes("/ai/esg/summary")) {
      return {
        message: "ESG metrics show strong performance across all categories. Care minutes increased 15% compared to last period. Workforce training hours are on track.",
        highlights: [
          { type: "positive", message: "Care minutes increased 15% compared to last period" },
          { type: "positive", message: "Training hours exceeded target by 8%" },
          { type: "positive", message: "Dispute resolution rate improved to 92%" },
        ],
        risks: [
          { type: "warning", message: "Response time increased slightly in Region 2" },
        ],
        anomalies: [
          { type: "info", message: "Unusual spike in visits on March 15th (investigating)" },
        ]
      };
    }

    // System Health
    if (url.includes("/system/health")) {
      return { status: "ok", lastSyncUtc: new Date().toISOString() };
    }

    return null;
  }
};

// ---------------- 1) Build Input ----------------
/**
 * Collects aggregated ESG metrics.
 */
export async function buildNeoCareTab20Input({ user, range = "30d", region = "all", sponsorId = null }: { user: any, range?: string, region?: string, sponsorId?: string | null }) {
  const q = new URLSearchParams({
    range,
    region,
    sponsorId: sponsorId || ""
  }).toString();

  const [impact, workforce, governance, sponsors, regions, proofRefs, health, ai] = await Promise.all([
    mockApi.get(`/esg/impact?${q}`),
    mockApi.get(`/esg/workforce?${q}`),
    mockApi.get(`/esg/governance?${q}`),
    mockApi.get(`/sponsors/list?active=true`),
    mockApi.get(`/regions/list?active=true`),
    mockApi.get(`/proof/esg/refs?${q}`),
    mockApi.get(`/system/health`),
    mockApi.get(`/ai/esg/summary?${q}`)
  ]);

  // Ensure arrays
  const sponsorsArray = Array.isArray(sponsors) ? sponsors : [];
  const regionsArray = Array.isArray(regions) ? regions : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure objects
  const impactObj = impact && typeof impact === 'object' && !Array.isArray(impact) ? impact : {
    clientsServed: 0,
    careMinutes: 0,
    visitsCompleted: 0,
    avgResponseMin: null,
    satisfactionScore: null,
    vulnerableClientsServed: 0
  };

  const workforceObj = workforce && typeof workforce === 'object' && !Array.isArray(workforce) ? workforce : {
    activeNurses: 0,
    hoursDelivered: 0,
    avgVisitsPerNurse: null,
    trainingHours: 0,
    certsIssued: 0
  };

  const governanceObj = governance && typeof governance === 'object' && !Array.isArray(governance) ? governance : {
    proofedEvents: 0,
    totalEvents: 0,
    disputesOpened: 0,
    disputesResolved: 0,
    dataRetentionDays: 1095
  };

  const aiObj = ai && typeof ai === 'object' && !Array.isArray(ai) ? ai : { message: "", highlights: [], risks: [], anomalies: [] };
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    filters: { range, region, sponsorId },
    impact: impactObj,
    workforce: workforceObj,
    governance: governanceObj,
    sponsors: sponsorsArray,
    regions: regionsArray,
    proofRefs: proofRefsArray,
    ai: aiObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab20Model(input: any) {
  const { user, filters, impact, workforce, governance, sponsors, regions, proofRefs, ai, system } = input;

  const proofCoverage = pct(governance?.proofedEvents, governance?.totalEvents);
  const disputeResolutionRate = pct(governance?.disputesResolved, governance?.disputesOpened);

  const sponsorOptions = [{ label: "All Sponsors", value: "" }].concat(
    (sponsors || []).slice(0, 50).map((s: any) => ({ label: safeStr(s.name || "Sponsor", 50), value: s.id }))
  );

  const regionOptions = [{ label: "All Regions", value: "all" }].concat(
    (regions || []).slice(0, 50).map((r: any) => ({ label: safeStr(r.name || "Region", 50), value: r.id }))
  );

  function mapProofRef(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc || null,
      label: p.label || "ESG Proof",
      value: shortId(p.refId || p.hash || p.id),
      action: { type: "OPEN_PROOF_INFO", refId: p.refId || null }
    };
  }

  return {
    product: "NeoCare",
    tabId: 20,
    tabKey: "esg_impact_mvp",
    header: {
      title: "ESG & Impact Dashboard (MVP)",
      subtitle: `${user?.orgName || "NeoCare"} • Aggregated reporting (privacy-safe)`,
      rightMeta: {
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "All metrics are aggregated and privacy-safe. This dashboard supports sponsor reporting and impact visibility, not clinical decision-making.",
    controls: [
      {
        type: "select",
        key: "range",
        label: "Range",
        options: [
          { label: "7d", value: "7d" },
          { label: "30d", value: "30d" },
          { label: "90d", value: "90d" },
          { label: "365d", value: "365d" }
        ],
        value: filters?.range || "30d"
      },
      { type: "select", key: "region", label: "Region", options: regionOptions, value: filters?.region || "all" },
      { type: "select", key: "sponsorId", label: "Sponsor", options: sponsorOptions, value: filters?.sponsorId || "" }
    ],
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Clients Served", value: String(toNum(impact?.clientsServed, 0)), source: "ESG-S1" },
          { label: "Visits Completed", value: String(toNum(impact?.visitsCompleted, 0)), source: "ESG-S1" },
          { label: "Care Minutes", value: String(toNum(impact?.careMinutes, 0)), source: "ESG-S1" },
          { label: "Avg Response (min)", value: impact?.avgResponseMin ?? "-", source: "ESG-S1" },
          { label: "Active Nurses", value: String(toNum(workforce?.activeNurses, 0)), source: "ESG-W1" },
          { label: "Hours Delivered", value: String(toNum(workforce?.hoursDelivered, 0)), source: "ESG-W1" },
          { label: "Training Hours", value: String(toNum(workforce?.trainingHours, 0)), source: "ESG-W1" },
          { label: "Certificates Issued", value: String(toNum(workforce?.certsIssued, 0)), source: "ESG-W1" }
        ]
      },
      {
        type: "governance_panel",
        title: "Governance & Proof",
        items: [
          { label: "7D Proof Coverage", value: `${proofCoverage}%`, source: "ESG-G1" },
          { label: "Total Events", value: String(toNum(governance?.totalEvents, 0)), source: "ESG-G1" },
          { label: "Disputes Opened", value: String(toNum(governance?.disputesOpened, 0)), source: "ESG-G2" },
          { label: "Disputes Resolved", value: String(toNum(governance?.disputesResolved, 0)), source: "ESG-G2" },
          { label: "Resolution Rate", value: `${disputeResolutionRate}%`, source: "ESG-G2" },
          { label: "Data Retention", value: `${toNum(governance?.dataRetentionDays, 1095)} days`, source: "ESG-G3" }
        ],
        cta: { label: "Open Legal & Dispute Center", action: "NAVIGATE_TAB", meta: { tab: "17" } }
      },
      {
        type: "ai_summary",
        title: "AI Impact Summary (MVP)",
        message: (ai && typeof ai === 'object' && 'message' in ai) ? (ai.message || "AI summarizes impact trends and flags anomalies using aggregated data.") : "AI summarizes impact trends and flags anomalies using aggregated data.",
        highlights: ((ai && typeof ai === 'object' && 'highlights' in ai) ? (ai.highlights || []) : []).slice(0, 4),
        risks: ((ai && typeof ai === 'object' && 'risks' in ai) ? (ai.risks || []) : []).slice(0, 4),
        anomalies: ((ai && typeof ai === 'object' && 'anomalies' in ai) ? (ai.anomalies || []) : []).slice(0, 4),
        actions: [
          { label: "Generate Sponsor Report", action: "GENERATE_ESG_REPORT" },
          { label: "Export CSV", action: "EXPORT_ESG_CSV" }
        ]
      },
      {
        type: "sponsor_report_cards",
        title: "Sponsor-Friendly Cards (MVP)",
        subtitle: "Shareable summaries for Sponsor A (annual license) or Sponsor B (block campaigns).",
        cards: [
          {
            id: "card_impact",
            title: "Social Impact",
            bullets: [
              `Clients served: ${toNum(impact?.clientsServed, 0)}`,
              `Visits completed: ${toNum(impact?.visitsCompleted, 0)}`,
              `Care minutes: ${toNum(impact?.careMinutes, 0)}`,
              `Avg response: ${impact?.avgResponseMin ?? "-"} min`
            ]
          },
          {
            id: "card_workforce",
            title: "Workforce & Training",
            bullets: [
              `Active nurses: ${toNum(workforce?.activeNurses, 0)}`,
              `Hours delivered: ${toNum(workforce?.hoursDelivered, 0)}`,
              `Training hours: ${toNum(workforce?.trainingHours, 0)}`,
              `Certificates issued: ${toNum(workforce?.certsIssued, 0)}`
            ]
          },
          {
            id: "card_governance",
            title: "Proof & Governance",
            bullets: [
              `7D Proof coverage: ${proofCoverage}%`,
              `Disputes opened: ${toNum(governance?.disputesOpened, 0)}`,
              `Resolved: ${toNum(governance?.disputesResolved, 0)} (${disputeResolutionRate}%)`,
              `Retention: ${toNum(governance?.dataRetentionDays, 1095)} days`
            ]
          }
        ]
      },
      {
        type: "proof_trust",
        title: "Proof References (Light MVP)",
        subtitle: "Proof references can be used to back sponsor reports without exposing private data.",
        items: byNewest(proofRefs, "timestampUtc").slice(0, 4).map(mapProofRef),
        cta: { label: "Open Proof Center", action: "OPEN_PROOF_CENTER", meta: { tab: "17" } }
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-20.1", label: "Impact Aggregator (Clients/Visits/Minutes)" },
          { key: "AI-20.2", label: "Workforce Metrics Tracker" },
          { key: "AI-20.3", label: "Governance & Proof Coverage Analyzer" },
          { key: "AI-20.4", label: "Sponsor Report Generator (Privacy-Safe)" },
          { key: "AI-20.5", label: "ESG Anomaly Detector (Aggregated)" }
        ]
      }
    ],
    debug: { range, region, sponsorId, proofCoverage, disputeResolutionRate }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab20ESGImpact(range = "30d", region = "all", sponsorId: string | null = null) {
  const user = { orgName: "NeoCare" }; // Mock user
  const input = await buildNeoCareTab20Input({ user, range, region, sponsorId });
  return renderNeoCareTab20Model(input);
}

