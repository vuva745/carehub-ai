/**
 * NeoCare Dashboard — AI Scripts
 * TAB 16: Nurse Performance & BIG Proof (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does:
 * - Shows nurse performance metrics (visits, completion, timeliness)
 * - Shows competency / skills log (SkillLab links) for BIG compliance evidence
 * - Shows Proof coverage for performed care moments (7D Proof++ references)
 * - Highlights gaps: missing proof, missed tasks, overdue skills renewal
 *
 * MVP Scope (Important):
 * - Non-diagnostic, non-disciplinary: shows metrics + evidence only
 * - Human review required for any decisions (coordinator / supervisor)
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byTimeDesc(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 8)}…` : "-"; }
function safeStr(s: string | null | undefined, max = 140): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

// ---------------- API Simulation ----------------
// Mocking the backend API calls since we are strictly frontend for this demo
const mockApi = {
  get: async (url: string) => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 400));

    // Nurse Profile
    if (url.includes("/staff/nurses/")) {
      return { id: "N-105", name: "Mia", role: "Team Lead", bigNumber: "BIG-12345", bigStatus: "active" };
    }

    // Visits
    if (url.includes("/care/visits")) {
      return [
        { id: "V-1", startUtc: new Date().toISOString(), timeliness: "on_time", clientId: "C-123", proof: { hash: "0xabc123" } },
        { id: "V-2", startUtc: new Date(Date.now() - 86400000).toISOString(), timeliness: "on_time", clientId: "C-123", proof: { hash: "0xdef456" } },
        { id: "V-3", startUtc: new Date(Date.now() - 172800000).toISOString(), timeliness: "late", clientId: "C-124", proof: { hash: "0xghi789" } },
      ];
    }

    // Tasks
    if (url.includes("/care/tasks")) {
      return [
        { id: "T-1", startUtc: new Date().toISOString(), status: "done", taskType: "Medication", proof: { hash: "0xabc123", bitcoinRef: "btc-001" } },
        { id: "T-2", startUtc: new Date(Date.now() - 86400000).toISOString(), status: "done", taskType: "Hygiene", proof: { hash: "0xdef456" } },
        { id: "T-3", startUtc: new Date(Date.now() - 172800000).toISOString(), status: "missed", taskType: "Check-in" },
        { id: "T-4", startUtc: new Date(Date.now() - 259200000).toISOString(), status: "planned", taskType: "Medication" },
        { id: "T-5", startUtc: new Date(Date.now() - 345600000).toISOString(), status: "needs_review", taskType: "Assessment" },
      ];
    }

    // Proof Stats
    if (url.includes("/proof/stats")) {
      return { proofedCount: 44, bitcoinLinkedCount: 31, totalTasks: 52 };
    }

    // Competencies / BIG Profile
    if (url.includes("/compliance/big/profile")) {
      return { bigNumber: "BIG-12345", bigStatus: "active", renewalDueUtc: new Date(Date.now() + 90 * 86400000).toISOString(), renewalDueDays: 90 };
    }

    // SkillLab Events
    if (url.includes("/skilllab/events")) {
      return [
        { id: "SE-1", timestampUtc: new Date().toISOString(), skillName: "Medication Administration", status: "completed", points: 200 },
        { id: "SE-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), skillName: "Fall Prevention", status: "completed", points: 150 },
      ];
    }

    // Incidents
    if (url.includes("/security/incidents")) {
      return [];
    }

    // Performance Thresholds
    if (url.includes("/performance/thresholds")) {
      return { latePctWarn: 10, missingProofWarn: 5, skillRenewalDaysWarn: 30 };
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
 * Collects all data required for the Nurse Performance & BIG Proof tab.
 * In production, enforce RBAC (nurse sees self; supervisors see teams).
 */
export async function buildNeoCareTab16Input({ user, nurseId, range = "30d" }: { user: any, nurseId?: string, range?: string }) {
  const effectiveNurseId = nurseId || user?.id || "N-105";

  const [
    nurseProfile,
    visits,
    tasks,
    proofStats,
    competencies,
    skillEvents,
    incidents,
    thresholds,
    health
  ] = await Promise.all([
    mockApi.get(`/staff/nurses/${encodeURIComponent(effectiveNurseId)}`),
    mockApi.get(`/care/visits?nurseId=${encodeURIComponent(effectiveNurseId)}&range=${encodeURIComponent(range)}`),
    mockApi.get(`/care/tasks?nurseId=${encodeURIComponent(effectiveNurseId)}&range=${encodeURIComponent(range)}`),
    mockApi.get(`/proof/stats?nurseId=${encodeURIComponent(effectiveNurseId)}&range=${encodeURIComponent(range)}`),
    mockApi.get(`/compliance/big/profile?nurseId=${encodeURIComponent(effectiveNurseId)}`),
    mockApi.get(`/skilllab/events?nurseId=${encodeURIComponent(effectiveNurseId)}&range=${encodeURIComponent(range)}`),
    mockApi.get(`/security/incidents?nurseId=${encodeURIComponent(effectiveNurseId)}&range=${encodeURIComponent(range)}`),
    mockApi.get(`/performance/thresholds?nurseId=${encodeURIComponent(effectiveNurseId)}`),
    mockApi.get(`/system/health`)
  ]);

  // Safe fallbacks
  const thr = thresholds && typeof thresholds === 'object' && !Array.isArray(thresholds) 
    ? thresholds 
    : { latePctWarn: 10, missingProofWarn: 5, skillRenewalDaysWarn: 30 };

  // Ensure arrays
  const visitsArray = Array.isArray(visits) ? visits : [];
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const skillEventsArray = Array.isArray(skillEvents) ? skillEvents : [];
  const incidentsArray = Array.isArray(incidents) ? incidents : [];

  // Derived metrics
  const plannedTasks = tasksArray.filter((t: any) => (t.status || "planned") === "planned").length;
  const doneTasks = tasksArray.filter((t: any) => t.status === "done").length;
  const missedTasks = tasksArray.filter((t: any) => t.status === "missed").length;
  const reviewTasks = tasksArray.filter((t: any) => t.status === "needs_review").length;

  const onTime = visitsArray.filter((v: any) => v.timeliness === "on_time").length;
  const late = visitsArray.filter((v: any) => v.timeliness === "late").length;
  const unknownTime = visitsArray.filter((v: any) => !v.timeliness).length;

  const proofed = (proofStats && typeof proofStats === 'object' && !Array.isArray(proofStats) && 'proofedCount' in proofStats)
    ? (proofStats.proofedCount ?? tasksArray.filter((t: any) => t.status === "done" && !!t.proof?.hash).length)
    : tasksArray.filter((t: any) => t.status === "done" && !!t.proof?.hash).length;

  const bitcoinLinked = (proofStats && typeof proofStats === 'object' && !Array.isArray(proofStats) && 'bitcoinLinkedCount' in proofStats)
    ? (proofStats.bitcoinLinkedCount ?? tasksArray.filter((t: any) => t.status === "done" && !!t.proof?.bitcoinRef).length)
    : tasksArray.filter((t: any) => t.status === "done" && !!t.proof?.bitcoinRef).length;

  const completionRate = pct(doneTasks, plannedTasks);
  const latePct = pct(late, (onTime + late));
  const proofCoverage = pct(proofed, doneTasks);
  const btcCoverage = pct(bitcoinLinked, proofed);

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    nurseId: effectiveNurseId,
    nurseProfile,
    range,
    visits: byTimeDesc(visitsArray, "startUtc"),
    tasks: byTimeDesc(tasksArray, "startUtc"),
    proofStats: proofStats && typeof proofStats === 'object' && !Array.isArray(proofStats) ? proofStats : null,
    competencies: competencies && typeof competencies === 'object' && !Array.isArray(competencies) ? competencies : null,
    skillEvents: byTimeDesc(skillEventsArray, "timestampUtc"),
    incidents: byTimeDesc(incidentsArray, "timestampUtc"),
    thresholds: thr,
    kpis: {
      plannedTasks,
      doneTasks,
      missedTasks,
      reviewTasks,
      completionRate,
      onTime,
      late,
      unknownTime,
      latePct,
      proofed,
      proofCoverage,
      bitcoinLinked,
      btcCoverage
    },
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab16Model(input: any) {
  const { user, nurseId, nurseProfile, range, visits = [], tasks = [], kpis, competencies, skillEvents = [], incidents = [], thresholds, system } = input;

  const bigStatus = (competencies && typeof competencies === 'object' && 'bigStatus' in competencies) 
    ? (competencies.bigStatus || "unknown") 
    : "unknown"; // active | expired | unknown
  const bigNumber = (competencies && typeof competencies === 'object' && 'bigNumber' in competencies) 
    ? (competencies.bigNumber || null) 
    : null;
  const renewalDueUtc = (competencies && typeof competencies === 'object' && 'renewalDueUtc' in competencies) 
    ? (competencies.renewalDueUtc || null) 
    : null;
  const renewalDueDays = (competencies && typeof competencies === 'object' && 'renewalDueDays' in competencies) 
    ? (competencies.renewalDueDays || null) 
    : null;

  // Warnings (MVP)
  const warnLate = (kpis.latePct >= ((thresholds && typeof thresholds === 'object' && 'latePctWarn' in thresholds) ? thresholds.latePctWarn : 10));
  const warnMissingProof = ((100 - kpis.proofCoverage) >= ((thresholds && typeof thresholds === 'object' && 'missingProofWarn' in thresholds) ? thresholds.missingProofWarn : 5));
  const warnSkillRenewal = renewalDueDays != null
    ? (renewalDueDays <= ((thresholds && typeof thresholds === 'object' && 'skillRenewalDaysWarn' in thresholds) ? thresholds.skillRenewalDaysWarn : 30))
    : false;

  const banner =
    system.apiHealth === "down"
      ? { type: "banner", severity: "critical", title: "System Offline", message: "Proof logging may be delayed. Offline mode recommended." }
      : (warnMissingProof || warnLate || warnSkillRenewal)
      ? { type: "banner", severity: "warning", title: "Review Needed", message: "Some compliance/performance indicators require attention (human review)." }
      : null;

  function mapVisit(v: any) {
    return {
      id: v.id,
      startUtc: v.startUtc,
      timeliness: v.timeliness || "unknown",
      clientId: v.clientId || null,
      proof: {
        hashShort: shortId(v.proof?.hash),
        hash: v.proof?.hash || null,
        bitcoinRef: v.proof?.bitcoinRef || null
      },
      action: { type: "OPEN_VISIT", visitId: v.id }
    };
  }

  function mapTask(t: any) {
    return {
      id: t.id,
      startUtc: t.startUtc,
      status: t.status || "planned", // planned | done | missed | needs_review
      taskType: safeStr(t.taskType || "Task", 40),
      proof: {
        hashShort: shortId(t.proof?.hash),
        hash: t.proof?.hash || null,
        bitcoinRef: t.proof?.bitcoinRef || null
      },
      action: { type: "OPEN_TASK", taskId: t.id }
    };
  }

  function mapSkillEvent(e: any) {
    return {
      id: e.id,
      timestampUtc: e.timestampUtc,
      skillName: safeStr(e.skillName || "Skill", 60),
      status: e.status || "completed",
      points: e.points || 0,
      action: { type: "OPEN_SKILL_EVENT", eventId: e.id }
    };
  }

  return {
    product: "NeoCare",
    tabId: 16,
    tabKey: "nurse_performance_big_proof",
    nurseProfile: nurseProfile || { name: "Nurse", role: "Nurse" },
    header: {
      title: "Nurse Performance & BIG Proof",
      subtitle: `${nurseProfile?.name || "Nurse"} • ${nurseId || "Unknown"}`,
      rightMeta: {
        range,
        bigNumber,
        bigStatus,
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    permissions: {
      canViewSelf: true,
      canViewTeam: false, // RBAC enforced server-side
      canExport: true
    },
    disclaimer: "This view shows metrics and evidence only. All performance decisions require human review by coordinator/supervisor.",
    banner,
    layout: [
      {
        type: "quick_actions",
        items: [
          { label: "View BIG Profile", action: "OPEN_BIG_PROFILE", meta: { nurseId } },
          { label: "Export Portfolio", action: "EXPORT_PORTFOLIO", meta: { nurseId } },
          { label: "View SkillLab", action: "OPEN_SKILLLAB", meta: { nurseId } },
          { label: "Review Gaps", action: "SCROLL_TO_GAPS" }
        ]
      },
      {
        type: "performance_snapshot",
        items: [
          { label: "Completion Rate", value: `${kpis.completionRate}%`, source: "AI-16.1" },
          { label: "On-Time Visits", value: `${kpis.onTime}/${kpis.onTime + kpis.late}`, source: "AI-16.2" },
          { label: "Proof Coverage", value: `${kpis.proofCoverage}%`, source: "AI-16.3" },
          { label: "BIG Status", value: bigStatus === "active" ? "✅ Active" : bigStatus === "expired" ? "⚠️ Expired" : "❓ Unknown", source: "AI-16.4" }
        ]
      },
      {
        type: "kpi_grid",
        title: "Performance KPIs",
        items: [
          { key: "plannedTasks", label: "Planned Tasks", value: String(kpis.plannedTasks), trend: null },
          { key: "doneTasks", label: "Completed Tasks", value: String(kpis.doneTasks), trend: "positive" },
          { key: "missedTasks", label: "Missed Tasks", value: String(kpis.missedTasks), trend: kpis.missedTasks > 0 ? "negative" : null },
          { key: "reviewTasks", label: "Needs Review", value: String(kpis.reviewTasks), trend: kpis.reviewTasks > 0 ? "warning" : null },
          { key: "proofed", label: "Proofed Tasks", value: String(kpis.proofed), trend: "positive" },
          { key: "bitcoinLinked", label: "Bitcoin-Linked", value: String(kpis.bitcoinLinked), trend: "positive" }
        ],
        source: "AI-16.1"
      },
      {
        type: "visits_list",
        title: "Recent Visits",
        items: visits.slice(0, 10).map(mapVisit),
        emptyState: "No visits in this period.",
        source: "AI-16.2"
      },
      {
        type: "tasks_list",
        title: "Recent Tasks",
        items: tasks.slice(0, 10).map(mapTask),
        emptyState: "No tasks in this period.",
        source: "AI-16.1"
      },
      {
        type: "big_proof",
        title: "BIG Compliance & Proof",
        subtitle: `BIG Number: ${bigNumber || "Not registered"}`,
        items: [
          { label: "BIG Status", value: bigStatus === "active" ? "Active" : bigStatus === "expired" ? "Expired" : "Unknown" },
          { label: "Proof Coverage", value: `${kpis.proofCoverage}%` },
          { label: "Bitcoin-Linked Proof", value: `${kpis.btcCoverage}%` },
          ...(renewalDueUtc ? [{ label: "Renewal Due", value: new Date(renewalDueUtc).toLocaleDateString() }] : [])
        ],
        source: "AI-16.4"
      },
      {
        type: "skilllab_events",
        title: "SkillLab Events (BIG Evidence)",
        items: skillEvents.slice(0, 10).map(mapSkillEvent),
        emptyState: "No skill events in this period.",
        source: "AI-16.5"
      },
      {
        type: "gaps_alerts",
        title: "Gaps & Alerts",
        items: [
          ...(warnLate ? [{ type: "warning", label: "Late Visits", value: `${kpis.latePct}% late visits (threshold: ${(thresholds && typeof thresholds === 'object' && 'latePctWarn' in thresholds) ? thresholds.latePctWarn : 10}%)` }] : []),
          ...(warnMissingProof ? [{ type: "warning", label: "Missing Proof", value: `${100 - kpis.proofCoverage}% tasks without proof (threshold: ${(thresholds && typeof thresholds === 'object' && 'missingProofWarn' in thresholds) ? thresholds.missingProofWarn : 5}%)` }] : []),
          ...(warnSkillRenewal ? [{ type: "warning", label: "Skill Renewal", value: `Renewal due in ${renewalDueDays} days` }] : [])
        ],
        emptyState: "No gaps detected.",
        source: "AI-16.6"
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-16.1", label: "Task Completion Analyzer" },
          { key: "AI-16.2", label: "Timeliness Monitor" },
          { key: "AI-16.3", label: "Proof Coverage Tracker" },
          { key: "AI-16.4", label: "BIG Compliance Checker" },
          { key: "AI-16.5", label: "SkillLab Evidence Linker" },
          { key: "AI-16.6", label: "Gap Detection & Alert Generator" }
        ]
      }
    ],
    debug: { nurseId, range, bigStatus, warnLate, warnMissingProof, warnSkillRenewal }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab16NursePerformance(nurseId?: string) {
  const user = { id: "N-105", name: "Current User" }; // Mock user
  const input = await buildNeoCareTab16Input({ user, nurseId, range: "30d" });
  return renderNeoCareTab16Model(input);
}

