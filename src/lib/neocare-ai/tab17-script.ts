/**
 * NeoCare Dashboard — AI Scripts
 * TAB 17: 7D Proof++ / Legal & Dispute Center (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does:
 * - Central hub for Proof entries (7D Proof++) tied to care moments, voice checks, payments, incidents
 * - Provides audit-grade evidence playback metadata (NO raw media in MVP unless explicitly allowed)
 * - Supports disputes: create case, attach proof refs, timeline, status, resolution notes
 * - Exports a privacy-safe audit bundle (IDs + hashes + timestamps + actors + event types)
 *
 * MVP Scope:
 * - Proof ledger viewer + filters + detail drawer
 * - Dispute case creation + case timeline + status tracking
 * - Human-led decisions only (no automated legal conclusions)
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byTimeDesc(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function safeStr(s: string | null | undefined, max = 160): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function asArray(v: any) { return Array.isArray(v) ? v : (v ? [v] : []); }

// ---------------- API Simulation ----------------
// Mocking the backend API calls since we are strictly frontend for this demo
const mockApi = {
  get: async (url: string) => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 400));

    // Proof Ledger
    if (url.includes("/proof/ledger")) {
      return [
        { id: "P-1", timestampUtc: new Date().toISOString(), eventType: "CARE_TASK", severity: "info", title: "Medication Administration", clientId: "C-123", nurseId: "N-105", hash: "0xabc123def456", bitcoinRef: "btc-001", mediaRef: null, mediaType: null },
        { id: "P-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), eventType: "VOICE_CHECK", severity: "info", title: "Voice Feedback Recording", clientId: "C-123", nurseId: "N-105", hash: "0xdef456ghi789", bitcoinRef: null, mediaRef: "media-001", mediaType: "audio" },
        { id: "P-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), eventType: "PAYMENT", severity: "info", title: "Nurse Payout Escrow Release", clientId: null, nurseId: "N-105", hash: "0xghi789jkl012", bitcoinRef: "btc-002", mediaRef: null, mediaType: null },
        { id: "P-4", timestampUtc: new Date(Date.now() - 259200000).toISOString(), eventType: "INCIDENT", severity: "warning", title: "Late Visit Report", clientId: "C-124", nurseId: "N-106", hash: "0xjkl012mno345", bitcoinRef: null, mediaRef: null, mediaType: null, caseId: "CASE-1" },
        { id: "P-5", timestampUtc: new Date(Date.now() - 345600000).toISOString(), eventType: "CARE_TASK", severity: "info", title: "Hygiene Check", clientId: "C-123", nurseId: "N-105", hash: "0xmno345pqr678", bitcoinRef: "btc-003", mediaRef: null, mediaType: null },
      ];
    }

    // Disputes
    if (url.includes("/proof/disputes")) {
      return [
        { id: "CASE-1", status: "open", severity: "warning", title: "Late Visit Dispute", updatedUtc: new Date().toISOString(), createdUtc: new Date(Date.now() - 259200000).toISOString(), proofRefs: ["P-4"], reporterRole: "family", nurseId: "N-106", clientId: "C-124" },
        { id: "CASE-2", status: "reviewing", severity: "info", title: "Payment Verification Request", updatedUtc: new Date(Date.now() - 86400000).toISOString(), createdUtc: new Date(Date.now() - 172800000).toISOString(), proofRefs: ["P-3"], reporterRole: "nurse", nurseId: "N-105", clientId: null },
      ];
    }

    // Proof Summary
    if (url.includes("/proof/summary")) {
      return {
        total: 5,
        byEventType: { CARE_TASK: 2, VOICE_CHECK: 1, PAYMENT: 1, INCIDENT: 1 },
        withBitcoinRef: 3,
        withMedia: 1
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
 * Collects proof ledger + dispute cases + summary counts.
 * In production enforce RBAC:
 * - nurse views own + assigned clients
 * - coordinator/supervisor views team
 * - legal/audit role views all relevant records
 */
export async function buildNeoCareTab17Input({ user, range = "7d", filter = {} }: { user: any, range?: string, filter?: any }) {
  const qs = new URLSearchParams();
  qs.set("range", range);
  if (filter.clientId) qs.set("clientId", filter.clientId);
  if (filter.nurseId) qs.set("nurseId", filter.nurseId);
  if (filter.eventType) qs.set("eventType", filter.eventType);
  if (filter.severity) qs.set("severity", filter.severity);
  if (filter.caseId) qs.set("caseId", filter.caseId);
  if (filter.q) qs.set("q", filter.q);

  const [proofLedger, disputes, proofSummary, health] = await Promise.all([
    mockApi.get(`/proof/ledger?${qs.toString()}`),
    mockApi.get(`/proof/disputes?${qs.toString()}`),
    mockApi.get(`/proof/summary?${qs.toString()}`),
    mockApi.get(`/system/health`)
  ]);

  // Ensure arrays
  const proofLedgerArray = Array.isArray(proofLedger) ? proofLedger : [];
  const disputesArray = Array.isArray(disputes) ? disputes : [];

  // Ensure summary is an object
  const summary = proofSummary && typeof proofSummary === 'object' && !Array.isArray(proofSummary)
    ? proofSummary
    : {
        total: proofLedgerArray.length,
        byEventType: {} as Record<string, number>,
        withBitcoinRef: proofLedgerArray.filter((p: any) => !!p.bitcoinRef).length,
        withMedia: proofLedgerArray.filter((p: any) => !!p.mediaRef).length
      };

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    range,
    filter,
    proofLedger: byTimeDesc(proofLedgerArray),
    disputes: byTimeDesc(disputesArray, "updatedUtc"),
    summary,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab17Model(input: any) {
  const { user, range, filter, proofLedger = [], disputes = [], summary, system } = input;

  const totalProof = (summary && typeof summary === 'object' && 'total' in summary) 
    ? (summary.total ?? proofLedger.length) 
    : proofLedger.length;
  const btcCount = (summary && typeof summary === 'object' && 'withBitcoinRef' in summary)
    ? (summary.withBitcoinRef ?? proofLedger.filter((p: any) => !!p.bitcoinRef).length)
    : proofLedger.filter((p: any) => !!p.bitcoinRef).length;
  const mediaCount = (summary && typeof summary === 'object' && 'withMedia' in summary)
    ? (summary.withMedia ?? proofLedger.filter((p: any) => !!p.mediaRef).length)
    : proofLedger.filter((p: any) => !!p.mediaRef).length;

  function mapProof(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc,
      eventType: p.eventType || "UNKNOWN", // CARE_TASK | VOICE_CHECK | PAYMENT | INCIDENT | LOGIN | ...
      severity: p.severity || "info", // info | warning | critical
      title: safeStr(p.title || `${p.eventType || "Event"} Proof`, 80),
      actors: {
        clientId: p.clientId || null,
        nurseId: p.nurseId || null,
        supervisorId: p.supervisorId || null
      },
      proof: {
        hashShort: shortId(p.hash),
        hash: p.hash || null,
        bitcoinRef: p.bitcoinRef || null,
        refId: p.refId || p.id
      },
      attachments: {
        hasMedia: !!p.mediaRef,      // MVP: only a flag + metadata
        mediaType: p.mediaType || null, // image | video | audio | none
        mediaRef: p.mediaRef || null    // do not expose raw url unless authorized
      },
      dispute: {
        hasCase: !!p.caseId,
        caseId: p.caseId || null
      },
      action: { type: "OPEN_PROOF_ENTRY", proofId: p.id }
    };
  }

  function mapCase(c: any) {
    return {
      id: c.id,
      status: c.status || "open", // open | reviewing | resolved | rejected
      severity: c.severity || "warning",
      title: safeStr(c.title || "Dispute Case", 90),
      updatedUtc: c.updatedUtc || null,
      createdUtc: c.createdUtc || null,
      linkedProofCount: (c.proofRefs || []).length,
      parties: {
        reporterRole: c.reporterRole || "family",
        nurseId: c.nurseId || null,
        clientId: c.clientId || null
      },
      action: { type: "OPEN_DISPUTE_CASE", caseId: c.id }
    };
  }

  return {
    product: "NeoCare",
    tabId: 17,
    tabKey: "proof_legal_dispute_center",
    header: {
      title: "7D Proof++ / Legal & Dispute Center",
      subtitle: `${user?.name || "User"} • Audit & Evidence`,
      rightMeta: {
        range,
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "This center provides evidence and dispute tracking only. All conclusions and legal/HR decisions require human review.",
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Total Proof Entries", value: totalProof, source: "AI-17.1" },
          { label: "Bitcoin References", value: btcCount, source: "AI-17.1" },
          { label: "Media Attached", value: mediaCount, source: "AI-17.1" },
          { label: "Open Disputes", value: disputes.filter((d: any) => (d.status || "open") !== "resolved").length, source: "AI-17.4" }
        ]
      },
      {
        type: "filters",
        title: "Filters",
        items: [
          { key: "range", label: "Range", value: range, type: "select", options: ["24h", "7d", "14d", "30d"] },
          { key: "eventType", label: "Event Type", value: filter?.eventType || "all", type: "select", options: ["all", "CARE_TASK", "VOICE_CHECK", "PAYMENT", "INCIDENT", "LOGIN"] },
          { key: "severity", label: "Severity", value: filter?.severity || "all", type: "select", options: ["all", "info", "warning", "critical"] },
          { key: "clientId", label: "Client ID", value: filter?.clientId || "", type: "text" },
          { key: "nurseId", label: "Nurse ID", value: filter?.nurseId || "", type: "text" },
          { key: "q", label: "Search", value: filter?.q || "", type: "text" }
        ],
        actions: [
          { label: "Apply", action: "APPLY_FILTERS" },
          { label: "Clear", action: "CLEAR_FILTERS" }
        ]
      },
      {
        type: "proof_ledger",
        title: "Proof Ledger",
        subtitle: "Immutable-style evidence references (hash/time/actors).",
        items: proofLedger.slice(0, 50).map(mapProof),
        emptyState: "No proof entries found for this filter."
      },
      {
        type: "dispute_cases",
        title: "Dispute Cases",
        subtitle: "Human-led dispute tracking with linked proof references.",
        actions: [{ label: "Create Case", action: "CREATE_DISPUTE_CASE" }],
        items: disputes.slice(0, 20).map(mapCase),
        emptyState: "No dispute cases found."
      },
      {
        type: "case_tools",
        title: "Case Tools (MVP)",
        items: [
          { label: "Create Dispute Case", action: "CREATE_DISPUTE_CASE", source: "AI-17.4" },
          { label: "Attach Proof to Case", action: "ATTACH_PROOF_TO_CASE", source: "AI-17.4" },
          { label: "Export Audit Bundle", action: "EXPORT_AUDIT_BUNDLE", source: "AI-17.5" }
        ]
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-17.1", label: "Proof Ledger Aggregator (counts, grouping, metadata)" },
          { key: "AI-17.2", label: "Evidence Integrity Checker (hash format, missing fields)" },
          { key: "AI-17.3", label: "Policy & Privacy Filter (role-based redaction)" },
          { key: "AI-17.4", label: "Dispute Case Builder (timeline + linking proof refs)" },
          { key: "AI-17.5", label: "Audit Export Generator (privacy-safe bundle)" }
        ]
      }
    ],
    debug: { range, filter, totalProof }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab17ProofDispute(range = "7d", filter: any = {}) {
  const user = { name: "Current User" }; // Mock user
  const input = await buildNeoCareTab17Input({ user, range, filter });
  return renderNeoCareTab17Model(input);
}

