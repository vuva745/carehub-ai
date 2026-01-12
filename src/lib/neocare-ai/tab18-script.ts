/**
 * NeoCare Dashboard — AI Scripts
 * TAB 18: NeoPay Escrow & Nurse Payouts (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does:
 * - Shows escrow balances per client/contract and per sponsor/program (if applicable)
 * - Shows payout runs to nurses (pending/paid/failed) with Proof references
 * - Supports creating an escrow "hold" for a care block, and releasing funds on completion
 * - Detects payout risks: missing proof, duplicate payouts, mismatched hours, unusual spikes
 *
 * MVP Scope:
 * - Read-only ledger views + human-triggered actions (no fully automatic payouts)
 * - Proof-first: every payout ties to care events (task/visit IDs) and proof hashes
 * - Basic compliance: export payout summary; dispute link to Tab 17
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byTimeDesc(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function safeStr(s: string | null | undefined, max = 140): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function money(n: number | string | null | undefined, ccy = "EUR"): string {
  const x = Number(n || 0);
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy }).format(x); }
  catch { return `${ccy} ${x.toFixed(2)}`; }
}

// ---------------- API Simulation ----------------
const mockApi = {
  get: async (url: string) => {
    await new Promise(r => setTimeout(r, 400));

    // Escrow Accounts
    if (url.includes("/neopay/escrow/accounts")) {
      return [
        { id: "ESC-1", type: "client", title: "Client Escrow - John de Vries", clientName: "John de Vries", currency: "EUR", balance: 5000, reserved: 1200, status: "active" },
        { id: "ESC-2", type: "client", title: "Client Escrow - Maria Jansen", clientName: "Maria Jansen", currency: "EUR", balance: 3500, reserved: 800, status: "active" },
        { id: "ESC-3", type: "sponsor_program", title: "Program: ElderCare Plus", programName: "ElderCare Plus", currency: "EUR", balance: 15000, reserved: 5000, status: "active" },
      ];
    }

    // Escrow Ledger
    if (url.includes("/neopay/escrow/ledger")) {
      return [
        { id: "LED-1", timestampUtc: new Date().toISOString(), direction: "credit", reason: "Client Payment", amount: 500, currency: "EUR", clientId: "C-123", proof: { hash: "0xabc123def456", refId: "P-1" } },
        { id: "LED-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), direction: "debit", reason: "Payout Release", amount: 300, currency: "EUR", nurseId: "N-105", payoutRunId: "PAY-1", proof: { hash: "0xdef456ghi789", refId: "P-2" } },
        { id: "LED-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), direction: "credit", reason: "Sponsor Funding", amount: 2000, currency: "EUR", proof: { hash: "0xghi789jkl012", refId: "P-3" } },
        { id: "LED-4", timestampUtc: new Date(Date.now() - 259200000).toISOString(), direction: "debit", reason: "Care Block Hold", amount: 150, currency: "EUR", clientId: "C-123", careEventId: "EVT-1", proof: { hash: "0xjkl012mno345", refId: "P-4" } },
      ];
    }

    // Payout Runs
    if (url.includes("/neopay/payouts/runs")) {
      return [
        { id: "PAY-1", createdUtc: new Date().toISOString(), status: "pending", title: "Weekly Payout - Nurse Boeienhaven", nurseId: "N-105", nurseName: "Nurse Boeienhaven", fromUtc: new Date(Date.now() - 604800000).toISOString(), toUtc: new Date().toISOString(), amount: 850, currency: "EUR", proof: { hash: "0xabc123def456", refId: "P-1" }, careEventCount: 12, missingProofCount: 0 },
        { id: "PAY-2", createdUtc: new Date(Date.now() - 86400000).toISOString(), status: "paid", title: "Weekly Payout - Nurse Smith", nurseId: "N-106", nurseName: "Nurse Smith", fromUtc: new Date(Date.now() - 1209600000).toISOString(), toUtc: new Date(Date.now() - 604800000).toISOString(), amount: 720, currency: "EUR", proof: { hash: "0xdef456ghi789", refId: "P-2", bitcoinRef: "btc-001" }, careEventCount: 10, missingProofCount: 0 },
        { id: "PAY-3", createdUtc: new Date(Date.now() - 172800000).toISOString(), status: "failed", title: "Weekly Payout - Nurse Johnson", nurseId: "N-107", nurseName: "Nurse Johnson", fromUtc: new Date(Date.now() - 1814400000).toISOString(), toUtc: new Date(Date.now() - 1209600000).toISOString(), amount: 600, currency: "EUR", proof: { hash: "0xghi789jkl012", refId: "P-3" }, careEventCount: 8, missingProofCount: 2 },
      ];
    }

    // Payout Summary
    if (url.includes("/neopay/payouts/summary")) {
      return {
        totalRuns: 3,
        totalAmount: 2170,
        pending: 1,
        paid: 1,
        failed: 1
      };
    }

    // Risk Analysis
    if (url.includes("/ai/neopay/risks")) {
      return {
        level: "medium",
        items: [
          { id: "RISK-1", code: "MISSING_PROOF", severity: "warning", title: "Missing Proof in Payout", detail: "Payout PAY-3 has 2 care events without proof references." },
          { id: "RISK-2", code: "UNUSUAL_SPIKE", severity: "info", title: "Unusual Payout Amount", detail: "Payout PAY-1 amount (850 EUR) is 18% higher than average." },
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
 * Collects escrow ledgers + payout runs + risk signals.
 * In production enforce RBAC:
 * - nurse sees own payouts
 * - finance/admin sees all
 * - sponsor sees sponsor-funded program ledgers (if applicable)
 */
export async function buildNeoCareTab18Input({ user, range = "30d", filter = {} }: { user: any, range?: string, filter?: any }) {
  const qs = new URLSearchParams();
  qs.set("range", range);
  if (filter.nurseId) qs.set("nurseId", filter.nurseId);
  if (filter.clientId) qs.set("clientId", filter.clientId);
  if (filter.escrowId) qs.set("escrowId", filter.escrowId);
  if (filter.status) qs.set("status", filter.status);
  if (filter.q) qs.set("q", filter.q);

  const [
    escrowAccounts,
    escrowLedger,
    payoutRuns,
    payoutSummary,
    risks,
    health
  ] = await Promise.all([
    mockApi.get(`/neopay/escrow/accounts?${qs.toString()}`),
    mockApi.get(`/neopay/escrow/ledger?${qs.toString()}`),
    mockApi.get(`/neopay/payouts/runs?${qs.toString()}`),
    mockApi.get(`/neopay/payouts/summary?${qs.toString()}`),
    mockApi.get(`/ai/neopay/risks?${qs.toString()}`),
    mockApi.get(`/system/health`)
  ]);

  // Ensure arrays
  const escrowAccountsArray = Array.isArray(escrowAccounts) ? escrowAccounts : [];
  const escrowLedgerArray = Array.isArray(escrowLedger) ? escrowLedger : [];
  const payoutRunsArray = Array.isArray(payoutRuns) ? payoutRuns : [];

  // Ensure summary is an object
  const summary = payoutSummary && typeof payoutSummary === 'object' && !Array.isArray(payoutSummary)
    ? payoutSummary
    : {
        totalRuns: payoutRunsArray.length,
        totalAmount: payoutRunsArray.reduce((s: number, r: any) => s + Number(r.amount || 0), 0),
        pending: payoutRunsArray.filter((r: any) => (r.status || "pending") === "pending").length,
        paid: payoutRunsArray.filter((r: any) => r.status === "paid").length,
        failed: payoutRunsArray.filter((r: any) => r.status === "failed").length
      };

  // Ensure risks is an object
  const risksObj = risks && typeof risks === 'object' && !Array.isArray(risks) ? risks : { level: "low", items: [] };

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    range,
    filter,
    escrowAccounts: escrowAccountsArray,
    escrowLedger: byTimeDesc(escrowLedgerArray),
    payoutRuns: byTimeDesc(payoutRunsArray, "createdUtc"),
    summary,
    risks: risksObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab18Model(input: any) {
  const { user, range, filter, escrowAccounts = [], escrowLedger = [], payoutRuns = [], summary, risks, system } = input;

  const riskLevel = (risks && typeof risks === 'object' && 'level' in risks) ? (risks.level || "low") : "low"; // low | medium | high
  const riskChip = riskLevel === "high" ? "🔴 High" : riskLevel === "medium" ? "🟡 Medium" : "🟢 Low";

  const banner =
    system.apiHealth === "down"
      ? { type: "banner", severity: "critical", title: "System Offline", message: "Escrow/payout updates may be delayed." }
      : riskLevel === "high"
      ? { type: "banner", severity: "warning", title: "Risk Review Needed", message: "Some payout/escrow risk flags require human approval." }
      : { type: "banner", severity: "info", title: "Escrow & Payouts", message: "All payouts must be approved by an authorized role (MVP)." };

  function mapEscrow(a: any) {
    const balance = Number(a.balance || 0);
    const reserved = Number(a.reserved || 0);
    const available = balance - reserved;
    return {
      id: a.id,
      title: safeStr(a.title || a.clientName || a.programName || "Escrow Account", 80),
      type: a.type || "client", // client | sponsor_program | organization
      currency: a.currency || "EUR",
      balance: money(balance, a.currency || "EUR"),
      reserved: money(reserved, a.currency || "EUR"),
      available: money(available, a.currency || "EUR"),
      status: a.status || "active",
      action: { type: "OPEN_ESCROW_ACCOUNT", escrowId: a.id }
    };
  }

  function mapLedger(l: any) {
    return {
      id: l.id,
      timestampUtc: l.timestampUtc || null,
      direction: l.direction || "debit", // debit | credit
      reason: safeStr(l.reason || l.type || "Ledger Entry", 80),
      amount: money(l.amount, l.currency || "EUR"),
      currency: l.currency || "EUR",
      related: {
        clientId: l.clientId || null,
        nurseId: l.nurseId || null,
        payoutRunId: l.payoutRunId || null,
        careEventId: l.careEventId || null
      },
      proof: {
        hashShort: shortId(l.proof?.hash),
        hash: l.proof?.hash || null,
        refId: l.proof?.refId || l.id
      },
      action: { type: "OPEN_LEDGER_ENTRY", ledgerId: l.id }
    };
  }

  function mapRun(r: any) {
    const st = r.status || "pending"; // pending | paid | failed | cancelled
    return {
      id: r.id,
      createdUtc: r.createdUtc || null,
      status: st,
      title: safeStr(r.title || `Payout • ${st.toUpperCase()}`, 80),
      nurse: { nurseId: r.nurseId || null, name: safeStr(r.nurseName || "", 50) },
      period: { fromUtc: r.fromUtc || null, toUtc: r.toUtc || null },
      amount: money(r.amount, r.currency || "EUR"),
      currency: r.currency || "EUR",
      proof: {
        hashShort: shortId(r.proof?.hash),
        hash: r.proof?.hash || null,
        bitcoinRef: r.proof?.bitcoinRef || null,
        refId: r.proof?.refId || r.id
      },
      evidence: {
        careEventCount: r.careEventCount ?? null,
        missingProofCount: r.missingProofCount ?? null
      },
      actions: [
        st === "pending" ? { label: "Approve", action: "APPROVE_PAYOUT", meta: { payoutRunId: r.id } } : null,
        st === "pending" ? { label: "Reject", action: "REJECT_PAYOUT", meta: { payoutRunId: r.id } } : null,
        { label: "View Proof", action: "OPEN_PROOF_CENTER", meta: { payoutRunId: r.id } },
        { label: "Open Dispute", action: "CREATE_DISPUTE_CASE", meta: { payoutRunId: r.id } }
      ].filter(Boolean)
    };
  }

  function mapRisk(it: any) {
    return {
      id: it.id || it.code || Math.random().toString(16).slice(2),
      severity: it.severity || "warning",
      title: safeStr(it.title || it.code || "Risk Flag", 90),
      detail: safeStr(it.detail || "", 140),
      action: it.action || { type: "OPEN_RISK_ITEM" }
    };
  }

  // Calculate summary values
  const totalRuns = (summary && typeof summary === 'object' && 'totalRuns' in summary) 
    ? (summary.totalRuns ?? payoutRuns.length) 
    : payoutRuns.length;
  const totalAmount = (summary && typeof summary === 'object' && 'totalAmount' in summary)
    ? (summary.totalAmount ?? payoutRuns.reduce((s: number, r: any) => s + Number(r.amount || 0), 0))
    : payoutRuns.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  const pending = (summary && typeof summary === 'object' && 'pending' in summary)
    ? (summary.pending ?? payoutRuns.filter((r: any) => (r.status || "pending") === "pending").length)
    : payoutRuns.filter((r: any) => (r.status || "pending") === "pending").length;
  const paid = (summary && typeof summary === 'object' && 'paid' in summary)
    ? (summary.paid ?? payoutRuns.filter((r: any) => r.status === "paid").length)
    : payoutRuns.filter((r: any) => r.status === "paid").length;

  return {
    product: "NeoCare",
    tabId: 18,
    tabKey: "neopay_escrow_payouts",
    header: {
      title: "NeoPay Escrow & Nurse Payouts",
      subtitle: `${user?.name || "Finance"} • Escrow & Payout Controls`,
      rightMeta: {
        range,
        riskLevel: riskChip,
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "NeoPay supports escrow and payouts with proof references. All approvals remain human-led in MVP mode.",
    banner,
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Payout Runs", value: totalRuns, source: "AI-18.2" },
          { label: "Pending", value: pending, source: "AI-18.2" },
          { label: "Paid", value: paid, source: "AI-18.2" },
          { label: "Total Amount", value: money(totalAmount, "EUR"), source: "AI-18.2" }
        ]
      },
      {
        type: "filters",
        title: "Filters",
        items: [
          { key: "range", label: "Range", value: range, type: "select", options: ["7d", "14d", "30d", "90d"] },
          { key: "status", label: "Payout Status", value: filter?.status || "all", type: "select", options: ["all", "pending", "paid", "failed", "cancelled"] },
          { key: "nurseId", label: "Nurse ID", value: filter?.nurseId || "", type: "text" },
          { key: "clientId", label: "Client ID", value: filter?.clientId || "", type: "text" },
          { key: "escrowId", label: "Escrow ID", value: filter?.escrowId || "", type: "text" },
          { key: "q", label: "Search", value: filter?.q || "", type: "text" }
        ],
        actions: [
          { label: "Apply", action: "APPLY_FILTERS" },
          { label: "Clear", action: "CLEAR_FILTERS" }
        ]
      },
      {
        type: "escrow_accounts",
        title: "Escrow Accounts",
        subtitle: "Balances, reserved funds, available funds.",
        items: escrowAccounts.slice(0, 20).map(mapEscrow),
        emptyState: "No escrow accounts found."
      },
      {
        type: "risk_panel",
        title: "Risk Panel",
        subtitle: `Risk level: ${riskChip} (human review required)`,
        items: ((risks && typeof risks === 'object' && 'items' in risks) ? (risks.items || []) : []).slice(0, 8).map(mapRisk),
        emptyState: "No risk flags."
      },
      {
        type: "payout_runs",
        title: "Payout Runs",
        subtitle: "Proof-first payout approvals (MVP).",
        items: payoutRuns.slice(0, 25).map(mapRun),
        emptyState: "No payouts found."
      },
      {
        type: "escrow_ledger",
        title: "Escrow Ledger",
        subtitle: "All credits/debits with proof references.",
        items: escrowLedger.slice(0, 50).map(mapLedger),
        emptyState: "No ledger entries found."
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-18.1", label: "Escrow Balance & Reservation Calculator" },
          { key: "AI-18.2", label: "Payout Run Aggregator (totals, status, summaries)" },
          { key: "AI-18.3", label: "Proof-to-Payout Linker (care events ↔ payouts)" },
          { key: "AI-18.4", label: "Risk Flag Engine (duplicates, missing proof, anomalies)" },
          { key: "AI-18.5", label: "Export Generator (payout summary + audit refs)" }
        ]
      }
    ],
    debug: { range, filter, riskLevel }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab18NeoPayEscrow(range = "30d", filter: any = {}) {
  const user = { name: "Finance User" }; // Mock user
  const input = await buildNeoCareTab18Input({ user, range, filter });
  return renderNeoCareTab18Model(input);
}

