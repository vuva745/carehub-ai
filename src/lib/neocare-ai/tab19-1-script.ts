/**
 * NeoCare Dashboard — AI Scripts
 * TAB 19.1: SkillLab & Certification (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does (MVP):
 * - Shows SkillLab modules available for nurses/students
 * - Shows certification progress per user (or per cohort if coordinator)
 * - Provides "Request Assessment" and "Upload Evidence" flows (UI only)
 * - Logs Proof references (light) for each certification step
 * - Non-clinical: this is education/certification, not diagnosis
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byNewest(items: any[], key = "updatedUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function safeStr(s: string | null | undefined, max = 80): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

// ---------------- API Simulation ----------------
const mockApi = {
  get: async (url: string) => {
    await new Promise(r => setTimeout(r, 400));

    // SkillLab Catalog
    if (url.includes("/skilllab/catalog")) {
      return [
        { id: "MOD-1", title: "Wound Care Fundamentals", category: "Clinical Skills", level: "basic", durationMin: 45, tags: ["wound", "dressing", "infection"], requirements: [], updatedUtc: new Date().toISOString() },
        { id: "MOD-2", title: "Medication Administration Safety", category: "Clinical Skills", level: "standard", durationMin: 60, tags: ["medication", "safety", "protocol"], requirements: ["MOD-1"], updatedUtc: new Date(Date.now() - 86400000).toISOString() },
        { id: "MOD-3", title: "Fall Prevention Techniques", category: "Safety", level: "basic", durationMin: 30, tags: ["safety", "prevention", "mobility"], requirements: [], updatedUtc: new Date(Date.now() - 172800000).toISOString() },
        { id: "MOD-4", title: "Communication with Families", category: "Soft Skills", level: "standard", durationMin: 40, tags: ["communication", "family", "empathy"], requirements: [], updatedUtc: new Date(Date.now() - 259200000).toISOString() },
        { id: "MOD-5", title: "Advanced Wound Care", category: "Clinical Skills", level: "premium", durationMin: 90, tags: ["wound", "advanced", "specialized"], requirements: ["MOD-1", "MOD-2"], updatedUtc: new Date(Date.now() - 345600000).toISOString() },
      ];
    }

    // Progress
    if (url.includes("/skilllab/progress")) {
      return {
        totalModules: 5,
        completedModules: 3,
        certifications: [
          { id: "CERT-1", title: "Wound Care Certification", status: "certified", steps: [{ status: "done" }, { status: "done" }, { status: "done" }], updatedUtc: new Date(Date.now() - 86400000).toISOString(), proof: { refId: "PROOF-001" } },
          { id: "CERT-2", title: "Medication Safety Certification", status: "ready_for_assessment", steps: [{ status: "done" }, { status: "done" }, { status: "pending" }], updatedUtc: new Date().toISOString(), proof: { refId: "PROOF-002" } },
          { id: "CERT-3", title: "Fall Prevention Certification", status: "in_progress", steps: [{ status: "done" }, { status: "pending" }, { status: "pending" }], updatedUtc: new Date(Date.now() - 172800000).toISOString(), proof: { refId: null } },
        ]
      };
    }

    // Assessment Requests
    if (url.includes("/skilllab/assessment-requests")) {
      return [
        { id: "REQ-1", certId: "CERT-2", status: "pending", scheduledUtc: null, reviewerName: null, notes: "", proof: { refId: "PROOF-002" }, updatedUtc: new Date().toISOString() },
        { id: "REQ-2", certId: "CERT-1", status: "completed", scheduledUtc: new Date(Date.now() - 86400000).toISOString(), reviewerName: "Dr. Smith", notes: "Assessment completed successfully", proof: { refId: "PROOF-001" }, updatedUtc: new Date(Date.now() - 86400000).toISOString() },
      ];
    }

    // Proof References
    if (url.includes("/proof/skilllab/refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), label: "Wound Care Module Completion", refId: "PROOF-001", hash: "0xabc123def456" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), label: "Medication Safety Assessment", refId: "PROOF-002", hash: "0xdef456ghi789" },
        { id: "PR-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), label: "Fall Prevention Training", refId: "PROOF-003", hash: "0xghi789jkl012" },
      ];
    }

    // AI Summary
    if (url.includes("/ai/skilllab/summary")) {
      return {
        recommendedNext: [
          { moduleId: "MOD-2", title: "Medication Administration Safety", reason: "Prerequisite completed" },
          { moduleId: "MOD-3", title: "Fall Prevention Techniques", reason: "High demand in your area" },
        ],
        flags: [
          { type: "info", message: "You're making great progress! 3 of 5 modules completed." },
        ],
        message: "Based on your progress, we recommend completing Medication Administration Safety next. This will unlock Advanced Wound Care."
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
 * Collects all data required for SkillLab & Certification (MVP).
 * In production, permissions determine what you can see:
 * - nurse/student: own progress
 * - coordinator/admin: cohort progress
 */
export async function buildNeoCareTab19_1Input({ user, scope = "self", cohortId = null }: { user: any, scope?: string, cohortId?: string | null }) {
  const [catalog, progress, requests, proofRefs, health, ai] = await Promise.all([
    mockApi.get(`/skilllab/catalog?active=true`),
    mockApi.get(`/skilllab/progress?scope=${encodeURIComponent(scope)}&cohortId=${encodeURIComponent(cohortId || "")}`),
    mockApi.get(`/skilllab/assessment-requests?scope=${encodeURIComponent(scope)}&cohortId=${encodeURIComponent(cohortId || "")}`),
    mockApi.get(`/proof/skilllab/refs?scope=${encodeURIComponent(scope)}&cohortId=${encodeURIComponent(cohortId || "")}`),
    mockApi.get(`/system/health`),
    mockApi.get(`/ai/skilllab/summary?scope=${encodeURIComponent(scope)}&cohortId=${encodeURIComponent(cohortId || "")}`)
  ]);

  // Ensure arrays
  const catalogArray = Array.isArray(catalog) ? catalog : [];
  const requestsArray = Array.isArray(requests) ? requests : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure progress is an object
  const progressObj = progress && typeof progress === 'object' && !Array.isArray(progress)
    ? progress
    : { totalModules: catalogArray.length, completedModules: 0, certifications: [] };

  // Ensure ai is an object
  const aiObj = ai && typeof ai === 'object' && !Array.isArray(ai) ? ai : { recommendedNext: [], flags: [], message: "" };

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    scope,
    cohortId,
    catalog: catalogArray,
    progress: progressObj,
    requests: requestsArray,
    proofRefs: proofRefsArray,
    ai: aiObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab19_1Model(input: any) {
  const { user, scope, cohortId, catalog = [], progress, requests = [], proofRefs = [], ai, system } = input;

  const totalModules = (progress && typeof progress === 'object' && 'totalModules' in progress)
    ? (progress.totalModules || catalog.length || 0)
    : catalog.length || 0;
  const completedModules = (progress && typeof progress === 'object' && 'completedModules' in progress)
    ? (progress.completedModules || 0)
    : 0;
  const completionRate = pct(completedModules, totalModules);

  function mapModule(m: any) {
    return {
      id: m.id,
      title: safeStr(m.title || "Skill Module", 60),
      category: m.category || "General",
      level: m.level || "basic", // basic | standard | premium
      durationMin: m.durationMin || null,
      tags: (m.tags || []).slice(0, 4),
      requirements: (m.requirements || []).slice(0, 3),
      action: { type: "OPEN_SKILL_MODULE", moduleId: m.id }
    };
  }

  function mapCert(c: any) {
    const steps = Array.isArray(c.steps) ? c.steps : [];
    const stepsDone = steps.filter((s: any) => s.status === "done").length;
    const stepsTotal = steps.length || 1;
    return {
      id: c.id,
      title: safeStr(c.title || "Certification", 60),
      status: c.status || "in_progress", // not_started | in_progress | ready_for_assessment | certified
      progress: `${stepsDone}/${stepsTotal}`,
      progressPct: pct(stepsDone, stepsTotal),
      lastUpdatedUtc: c.updatedUtc || null,
      proof: {
        lastRefShort: shortId(c.proof?.refId),
        refId: c.proof?.refId || null
      },
      cta:
        c.status === "ready_for_assessment"
          ? { label: "Request Assessment", action: "REQUEST_ASSESSMENT", meta: { certId: c.id } }
          : c.status === "certified"
          ? { label: "View Certificate", action: "OPEN_CERTIFICATE", meta: { certId: c.id } }
          : { label: "Continue", action: "CONTINUE_CERT_PATH", meta: { certId: c.id } }
    };
  }

  function mapRequest(r: any) {
    return {
      id: r.id,
      certId: r.certId,
      status: r.status || "pending", // pending | scheduled | completed | rejected
      scheduledUtc: r.scheduledUtc || null,
      reviewer: r.reviewerName ? safeStr(r.reviewerName, 40) : null,
      notes: r.notes ? safeStr(r.notes, 120) : "",
      proof: { refShort: shortId(r.proof?.refId), refId: r.proof?.refId || null },
      action: { type: "OPEN_ASSESSMENT_REQUEST", requestId: r.id }
    };
  }

  function mapProofRef(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc || null,
      label: p.label || "Skill Proof",
      value: shortId(p.refId || p.hash || p.id),
      action: { type: "OPEN_PROOF_INFO", refId: p.refId || null }
    };
  }

  const certifications = (progress && typeof progress === 'object' && 'certifications' in progress)
    ? (Array.isArray(progress.certifications) ? progress.certifications : [])
    : [];

  return {
    product: "NeoCare",
    tabId: 19.1,
    tabKey: "skilllab_certification_mvp",
    header: {
      title: "SkillLab & Certification (MVP)",
      subtitle: `${user?.name || "User"} • ${scope === "cohort" ? `Cohort: ${cohortId || "-"}` : "My Progress"}`,
      rightMeta: {
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "SkillLab provides education and certification support only. It does not replace professional supervision or clinical policies.",
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Modules Available", value: totalModules },
          { label: "Completed", value: completedModules },
          { label: "Completion Rate", value: `${completionRate}%` },
          { label: "Open Requests", value: String(requests.length) }
        ]
      },
      {
        type: "ai_advisor",
        title: "AI Learning Advisor (MVP)",
        message: (ai && typeof ai === 'object' && 'message' in ai) ? (ai.message || "Recommended next steps are based on your progress and available modules.") : "Recommended next steps are based on your progress and available modules.",
        recommendedNext: ((ai && typeof ai === 'object' && 'recommendedNext' in ai) ? (ai.recommendedNext || []) : []).slice(0, 3),
        flags: ((ai && typeof ai === 'object' && 'flags' in ai) ? (ai.flags || []) : []).slice(0, 3),
        actions: [
          { label: "View Recommendations", action: "OPEN_RECOMMENDATIONS" },
          { label: "Upload Evidence", action: "UPLOAD_EVIDENCE" }
        ]
      },
      {
        type: "module_catalog",
        title: "Skill Modules",
        subtitle: "Choose a module to train and collect proof.",
        items: byNewest(catalog, "updatedUtc").slice(0, 8).map(mapModule),
        cta: { label: "View All Modules", action: "OPEN_ALL_MODULES" }
      },
      {
        type: "certifications",
        title: "My Certifications",
        subtitle: "Progress is proof-linked (privacy-safe).",
        items: byNewest(certifications, "updatedUtc").slice(0, 6).map(mapCert),
        emptyState: "No certifications started yet."
      },
      {
        type: "assessment_requests",
        title: "Assessment Requests",
        items: byNewest(requests, "updatedUtc").slice(0, 6).map(mapRequest),
        emptyState: "No assessment requests."
      },
      {
        type: "proof_trust",
        title: "Proof References (Light MVP)",
        subtitle: "Proof references verify training steps (no sensitive media shown here).",
        items: byNewest(proofRefs, "timestampUtc").slice(0, 4).map(mapProofRef),
        cta: { label: "Open Proof Center", action: "OPEN_PROOF_CENTER", meta: { tab: "17" } }
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-19.1.1", label: "Skill Catalog Organizer" },
          { key: "AI-19.1.2", label: "Progress & Completion Tracker" },
          { key: "AI-19.1.3", label: "Learning Advisor (Recommendations)" },
          { key: "AI-19.1.4", label: "Assessment Request Router" },
          { key: "AI-19.1.5", label: "Proof Reference Builder (Light)" }
        ]
      }
    ],
    debug: { scope, cohortId, completionRate }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab19_1SkillLabCertification(scope = "self", cohortId: string | null = null) {
  const user = { name: "Current User" }; // Mock user
  const input = await buildNeoCareTab19_1Input({ user, scope, cohortId });
  return renderNeoCareTab19_1Model(input);
}

