/**
 * NeoCare Dashboard — AI Scripts
 * TAB 21: AI Control & Automation Panel (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does (MVP):
 * - Shows AI modules status across NeoCare tabs (enabled/disabled, last run, health)
 * - Allows role-based toggles (admin/coordinator only) for safe automation
 * - Provides "Human-in-the-loop" rules: AI suggests, humans approve
 * - Defines alert thresholds + notification routing (nurse/lead/family-safe)
 * - Shows audit trail of AI actions (who changed what, when, why) with Light Proof refs
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byNewest(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function safeStr(s: string | null | undefined, max = 90): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function toYesNo(v: boolean | null | undefined) { return v ? "Yes" : "No"; }

// ---------------- API Simulation ----------------
const mockApi = {
  get: async (url: string) => {
    await new Promise(r => setTimeout(r, 400));

    // AI Registry
    if (url.includes("/ai/registry")) {
      return [
        { key: "AI-14.1", label: "Client Voice Likelihood Analyzer", tab: 14, defaultEnabled: true, familySafe: true },
        { key: "AI-14.2", label: "Emotional Tone Detector", tab: 14, defaultEnabled: true, familySafe: true },
        { key: "AI-15.1", label: "Family Dashboard Aggregator", tab: 15, defaultEnabled: true, familySafe: true },
        { key: "AI-16.1", label: "Nurse Performance Tracker", tab: 16, defaultEnabled: true, familySafe: false },
        { key: "AI-17.1", label: "Proof Dispute Analyzer", tab: 17, defaultEnabled: true, familySafe: false },
        { key: "AI-18.1", label: "Escrow Risk Calculator", tab: 18, defaultEnabled: true, familySafe: false },
        { key: "AI-19.1.1", label: "Skill Catalog Organizer", tab: 19, defaultEnabled: true, familySafe: true },
        { key: "AI-20.1", label: "Impact Aggregator", tab: 20, defaultEnabled: true, familySafe: true },
        { key: "AI-21.1", label: "AI Registry & Status Monitor", tab: 21, defaultEnabled: true, familySafe: false },
      ];
    }

    // AI Config
    if (url.includes("/ai/config")) {
      return {
        humanApprovalRequired: true,
        autoNotifyEnabled: true,
        autoDraftReportsEnabled: true,
        autoTaskRemindersEnabled: true,
        allowAutoCloseAlerts: false,
        modules: {
          "AI-14.1": { enabled: true, mode: "suggest_only" },
          "AI-14.2": { enabled: true, mode: "suggest_only" },
          "AI-15.1": { enabled: true, mode: "notify_only" },
          "AI-16.1": { enabled: false, mode: "suggest_only" },
          "AI-17.1": { enabled: true, mode: "suggest_only" },
          "AI-18.1": { enabled: true, mode: "suggest_only" },
          "AI-19.1.1": { enabled: true, mode: "suggest_only" },
          "AI-20.1": { enabled: true, mode: "draft_only" },
          "AI-21.1": { enabled: true, mode: "suggest_only" },
        }
      };
    }

    // Notification Routes
    if (url.includes("/ai/notification/routes")) {
      return {
        nurse: { channel: "push", enabled: true, note: "Push notifications for urgent alerts" },
        lead: { channel: "sms", enabled: true, note: "SMS for critical escalations" },
        familySafe: { channel: "push", enabled: false, note: "Family-safe notifications (disabled by default)" }
      };
    }

    // Recent Runs
    if (url.includes("/ai/runs/recent")) {
      return [
        { id: "RUN-1", timestampUtc: new Date().toISOString(), moduleKey: "AI-14.1", status: "ok", summary: "Analyzed 45 voice samples, flagged 3 for review", createdDrafts: 0, notificationsSent: 2, requiresHumanApproval: false },
        { id: "RUN-2", timestampUtc: new Date(Date.now() - 3600000).toISOString(), moduleKey: "AI-15.1", status: "ok", summary: "Generated family dashboard summary", createdDrafts: 1, notificationsSent: 0, requiresHumanApproval: true },
        { id: "RUN-3", timestampUtc: new Date(Date.now() - 7200000).toISOString(), moduleKey: "AI-20.1", status: "ok", summary: "Aggregated ESG metrics for Q1 report", createdDrafts: 1, notificationsSent: 0, requiresHumanApproval: false },
        { id: "RUN-4", timestampUtc: new Date(Date.now() - 10800000).toISOString(), moduleKey: "AI-16.1", status: "warning", summary: "Performance analysis completed with warnings", createdDrafts: 0, notificationsSent: 1, requiresHumanApproval: true },
      ];
    }

    // Audit Trail
    if (url.includes("/ai/audit/config-changes")) {
      return [
        { id: "AUDIT-1", timestampUtc: new Date().toISOString(), actorName: "Admin User", actorRole: "admin", change: "Enabled AI-16.1 module", reason: "Performance tracking needed", proof: { refId: "PROOF-AUDIT-1" } },
        { id: "AUDIT-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), actorName: "Coordinator", actorRole: "coordinator", change: "Updated notification route for nurses", reason: "Switched to push notifications", proof: { refId: "PROOF-AUDIT-2" } },
        { id: "AUDIT-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), actorName: "Admin User", actorRole: "admin", change: "Disabled auto-close alerts", reason: "Safety compliance", proof: { refId: "PROOF-AUDIT-3" } },
      ];
    }

    // Proof References
    if (url.includes("/proof/ai/control-refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), label: "AI Config Change: Module Enabled", refId: "PROOF-AUDIT-1", hash: "0xabc123def456" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), label: "AI Config Change: Route Updated", refId: "PROOF-AUDIT-2", hash: "0xdef456ghi789" },
      ];
    }

    // AI Advisor
    if (url.includes("/ai/control/advisor")) {
      return {
        message: "AI configuration looks safe. All modules are in suggest_only mode. Human approval is required for all actions.",
        risks: [
          { type: "info", message: "AI-16.1 is currently disabled. Consider enabling for performance tracking." },
        ],
        suggestions: [
          { type: "positive", message: "Keep human approval required for all AI actions (recommended)" },
          { type: "positive", message: "Auto-close alerts is disabled (recommended for safety)" },
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
 * Collects AI module control data (MVP).
 */
export async function buildNeoCareTab21Input({ user, scope = "org", regionId = null, cohortId = null, range = "30d" }: { user: any, scope?: string, regionId?: string | null, cohortId?: string | null, range?: string }) {
  const q = new URLSearchParams({
    scope,
    regionId: regionId || "",
    cohortId: cohortId || "",
    range
  }).toString();

  const [aiRegistry, aiConfig, routes, runs, audit, proofRefs, health, advisor] = await Promise.all([
    mockApi.get(`/ai/registry?${q}`),
    mockApi.get(`/ai/config?${q}`),
    mockApi.get(`/ai/notification/routes?${q}`),
    mockApi.get(`/ai/runs/recent?${q}`),
    mockApi.get(`/ai/audit/config-changes?${q}`),
    mockApi.get(`/proof/ai/control-refs?${q}`),
    mockApi.get(`/system/health`),
    mockApi.get(`/ai/control/advisor?${q}`)
  ]);

  // Ensure arrays
  const registryArray = Array.isArray(aiRegistry) ? aiRegistry : [];
  const runsArray = Array.isArray(runs) ? runs : [];
  const auditArray = Array.isArray(audit) ? audit : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure objects
  const configObj = aiConfig && typeof aiConfig === 'object' && !Array.isArray(aiConfig) ? aiConfig : {
    humanApprovalRequired: true,
    autoNotifyEnabled: true,
    autoDraftReportsEnabled: true,
    autoTaskRemindersEnabled: true,
    allowAutoCloseAlerts: false
  };

  const routesObj = routes && typeof routes === 'object' && !Array.isArray(routes) ? routes : {
    nurse: { channel: "push", enabled: true },
    lead: { channel: "sms", enabled: true },
    familySafe: { channel: "push", enabled: false }
  };

  const advisorObj = advisor && typeof advisor === 'object' && !Array.isArray(advisor) ? advisor : { message: "", risks: [], suggestions: [] };
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    filters: { scope, regionId, cohortId, range },
    registry: registryArray,
    config: configObj,
    routes: routesObj,
    runs: runsArray,
    audit: auditArray,
    proofRefs: proofRefsArray,
    advisor: advisorObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab21Model(input: any) {
  const { user, filters, registry = [], config, routes, runs = [], audit = [], proofRefs = [], advisor, system } = input;

  function moduleEnabled(key: string, fallback = true) {
    return (config?.modules?.[key]?.enabled ?? fallback) === true;
  }

  const enabledCount = registry.filter((m: any) => moduleEnabled(m.key, m.defaultEnabled ?? true)).length;
  const totalCount = registry.length;
  const enabledPct = pct(enabledCount, totalCount);

  function mapModule(m: any) {
    const enabled = moduleEnabled(m.key, m.defaultEnabled ?? true);
    const lastRun = runs.find((r: any) => r.moduleKey === m.key) || null;
    const modCfg = config?.modules?.[m.key] || {};

    return {
      key: m.key,
      label: safeStr(m.label || m.key, 70),
      tab: m.tab || null,
      enabled,
      mode: enabled ? (modCfg.mode || "suggest_only") : "disabled",
      lastRunUtc: lastRun?.timestampUtc || null,
      health: lastRun?.status || "unknown",
      scope: filters?.scope || "org",
      guards: {
        humanApprovalRequired: !!config?.humanApprovalRequired,
        noClinicalDecision: true,
        familySafe: !!m.familySafe
      },
      actions: [
        { label: enabled ? "Disable" : "Enable", action: "TOGGLE_AI_MODULE", meta: { moduleKey: m.key, enabled: !enabled } },
        { label: "Configure", action: "OPEN_AI_MODULE_CONFIG", meta: { moduleKey: m.key } },
        { label: "View Runs", action: "FILTER_RUNS_BY_MODULE", meta: { moduleKey: m.key } }
      ]
    };
  }

  function mapRoute(name: string, r: any) {
    return {
      key: name,
      enabled: !!r?.enabled,
      channel: r?.channel || "push",
      note: r?.note ? safeStr(r.note, 80) : "",
      action: { type: "OPEN_ROUTE_CONFIG", routeKey: name }
    };
  }

  function mapRun(r: any) {
    return {
      id: r.id,
      timestampUtc: r.timestampUtc || null,
      moduleKey: r.moduleKey,
      status: r.status || "ok",
      summary: safeStr(r.summary || "", 120),
      createdDrafts: r.createdDrafts || 0,
      notificationsSent: r.notificationsSent || 0,
      requiresHumanApproval: !!r.requiresHumanApproval,
      action: { type: "OPEN_AI_RUN_LOG", runId: r.id }
    };
  }

  function mapAudit(a: any) {
    return {
      id: a.id,
      timestampUtc: a.timestampUtc || null,
      actor: safeStr(a.actorName || a.actorRole || "admin", 40),
      change: safeStr(a.change || "Config updated", 120),
      reason: safeStr(a.reason || "", 120),
      proof: { refShort: shortId(a.proof?.refId), refId: a.proof?.refId || null },
      action: { type: "OPEN_AUDIT_ITEM", auditId: a.id }
    };
  }

  function mapProofRef(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc || null,
      label: p.label || "AI Control Proof",
      value: shortId(p.refId || p.hash || p.id),
      action: { type: "OPEN_PROOF_INFO", refId: p.refId || null }
    };
  }

  const scopeOptions = [
    { label: "Organization", value: "org" },
    { label: "Region", value: "region" },
    { label: "Cohort", value: "cohort" }
  ];

  return {
    product: "NeoCare",
    tabId: 21,
    tabKey: "ai_control_automation_mvp",
    header: {
      title: "AI Control & Automation Panel (MVP)",
      subtitle: `${user?.name || "Admin"} • Human-in-the-loop safety`,
      rightMeta: {
        scope: filters?.scope || "org",
        range: filters?.range || "30d",
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "AI can suggest, summarize, draft and notify. All clinical decisions and approvals remain human-led. Every AI action is logged.",
    permissions: {
      canToggleModules: !!user?.roles?.includes?.("admin") || !!user?.roles?.includes?.("coordinator"),
      canEditRoutes: !!user?.roles?.includes?.("admin") || !!user?.roles?.includes?.("coordinator"),
      readOnlyForNurses: !!user?.roles?.includes?.("nurse")
    },
    controls: [
      { type: "select", key: "scope", label: "Scope", options: scopeOptions, value: filters?.scope || "org" },
      { type: "select", key: "range", label: "Range", options: [{label:"7d",value:"7d"},{label:"30d",value:"30d"},{label:"90d",value:"90d"}], value: filters?.range || "30d" }
    ],
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "AI Modules Enabled", value: `${enabledCount}/${totalCount}` },
          { label: "Enabled Rate", value: `${enabledPct}%` },
          { label: "Human Approval Required", value: toYesNo(config?.humanApprovalRequired) },
          { label: "Auto Notify Enabled", value: toYesNo(config?.autoNotifyEnabled) },
          { label: "Auto Draft Reports", value: toYesNo(config?.autoDraftReportsEnabled) },
          { label: "Auto Task Reminders", value: toYesNo(config?.autoTaskRemindersEnabled) }
        ]
      },
      {
        type: "safety_guardrails",
        title: "Safety Guardrails (MVP)",
        items: [
          { label: "AI makes final clinical decisions", value: "No" },
          { label: "Alerts auto-closed by AI", value: config?.allowAutoCloseAlerts ? "Yes (Not recommended)" : "No (recommended)" },
          { label: "All config changes are audited", value: "Yes" },
          { label: "Family-safe channel separated", value: "Yes" }
        ],
        cta: { label: "Open Legal & Dispute Center", action: "NAVIGATE_TAB", meta: { tab: "17" } }
      },
      {
        type: "ai_advisor",
        title: "AI Config Advisor (MVP)",
        message: (advisor && typeof advisor === 'object' && 'message' in advisor) ? (advisor.message || "Advisor checks risky settings and recommends safer configurations.") : "Advisor checks risky settings and recommends safer configurations.",
        risks: ((advisor && typeof advisor === 'object' && 'risks' in advisor) ? (advisor.risks || []) : []).slice(0, 4),
        suggestions: ((advisor && typeof advisor === 'object' && 'suggestions' in advisor) ? (advisor.suggestions || []) : []).slice(0, 4),
        actions: [
          { label: "Apply Safe Defaults", action: "APPLY_SAFE_DEFAULTS" },
          { label: "Review Thresholds", action: "OPEN_THRESHOLD_SETTINGS" }
        ]
      },
      {
        type: "routes",
        title: "Notification Routes",
        subtitle: "Who gets notified and how (MVP).",
        items: [
          mapRoute("nurse", routes?.nurse),
          mapRoute("lead", routes?.lead),
          mapRoute("familySafe", routes?.familySafe)
        ],
        emptyState: "No routes configured."
      },
      {
        type: "automation_toggles",
        title: "Automation Toggles (MVP)",
        items: [
          { label: "Require human approval for AI actions", key: "humanApprovalRequired", value: !!config?.humanApprovalRequired, action: "TOGGLE_CONFIG" },
          { label: "Enable auto notifications (alerts)", key: "autoNotifyEnabled", value: !!config?.autoNotifyEnabled, action: "TOGGLE_CONFIG" },
          { label: "Enable report drafting", key: "autoDraftReportsEnabled", value: !!config?.autoDraftReportsEnabled, action: "TOGGLE_CONFIG" },
          { label: "Enable task reminders", key: "autoTaskRemindersEnabled", value: !!config?.autoTaskRemindersEnabled, action: "TOGGLE_CONFIG" },
          { label: "Allow AI to auto-close alerts", key: "allowAutoCloseAlerts", value: !!config?.allowAutoCloseAlerts, action: "TOGGLE_CONFIG", warning: true }
        ]
      },
      {
        type: "ai_modules_grid",
        title: "AI Modules Registry (MVP)",
        subtitle: "Enable/disable modules across tabs. Default mode = suggest_only.",
        items: registry.slice(0, 40).map(mapModule),
        emptyState: "No AI modules registered.",
        cta: { label: "Register New Module", action: "OPEN_AI_REGISTRY" }
      },
      {
        type: "recent_runs",
        title: "Recent AI Runs",
        subtitle: "Non-sensitive run logs for monitoring.",
        items: byNewest(runs, "timestampUtc").slice(0, 8).map(mapRun),
        emptyState: "No AI runs logged in this period."
      },
      {
        type: "audit_trail",
        title: "Config Change Audit Trail",
        subtitle: "Who changed AI settings, with proof refs.",
        items: byNewest(audit, "timestampUtc").slice(0, 8).map(mapAudit),
        emptyState: "No config changes logged."
      },
      {
        type: "proof_trust",
        title: "Proof References (Light MVP)",
        subtitle: "AI configuration and automation actions are proof-linked for audit readiness.",
        items: byNewest(proofRefs, "timestampUtc").slice(0, 4).map(mapProofRef),
        cta: { label: "Open Proof Center", action: "OPEN_PROOF_CENTER", meta: { tab: "17" } }
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-21.1", label: "AI Registry & Status Monitor" },
          { key: "AI-21.2", label: "Human-in-the-loop Approval Engine" },
          { key: "AI-21.3", label: "Notification Routing & Threshold Controller" },
          { key: "AI-21.4", label: "AI Run Log Summarizer" },
          { key: "AI-21.5", label: "Config Audit & Proof Linker (Light)" }
        ]
      }
    ],
    debug: { filters, enabledCount, totalCount, enabledPct }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab21AIControl(scope = "org", regionId: string | null = null, cohortId: string | null = null, range = "30d") {
  const user = { name: "Admin User", roles: ["admin"] }; // Mock user
  const input = await buildNeoCareTab21Input({ user, scope, regionId, cohortId, range });
  return renderNeoCareTab21Model(input);
}

