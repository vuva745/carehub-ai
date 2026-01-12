/**
 * NeoCare Dashboard — AI Scripts
 * TAB 19.2: Evidence Vault & Skills Assessments (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does (MVP):
 * - Stores and lists evidence items for SkillLab certification (privacy-safe)
 * - Supports evidence upload links (UI + metadata only; media stored elsewhere)
 * - Tracks skills checklists per module (pass/fail/needs_review)
 * - Links each evidence + skill check to Light Proof references (7D Proof++ ready)
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byNewest(items: any[], key = "updatedUtc") {
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

    // SkillLab Catalog
    if (url.includes("/skilllab/catalog")) {
      return [
        { id: "MOD-1", title: "Wound Care Fundamentals", category: "Clinical Skills", level: "basic", updatedUtc: new Date().toISOString() },
        { id: "MOD-2", title: "Medication Administration Safety", category: "Clinical Skills", level: "standard", updatedUtc: new Date(Date.now() - 86400000).toISOString() },
        { id: "MOD-3", title: "Fall Prevention Techniques", category: "Safety", level: "basic", updatedUtc: new Date(Date.now() - 172800000).toISOString() },
      ];
    }

    // Evidence
    if (url.includes("/skilllab/evidence")) {
      return [
        { id: "EVID-1", title: "Wound Dressing Practice Video", filename: "wound_dressing.mp4", moduleId: "MOD-1", type: "video", createdUtc: new Date().toISOString(), updatedUtc: new Date().toISOString(), privacy: "private", mediaUrl: "https://storage.example.com/evidence/EVID-1", proof: { refId: "PROOF-EVID-1", status: "logged" }, tags: ["practice", "wound-care"] },
        { id: "EVID-2", title: "Medication Safety Checklist", filename: "med_safety.pdf", moduleId: "MOD-2", type: "pdf", createdUtc: new Date(Date.now() - 86400000).toISOString(), updatedUtc: new Date(Date.now() - 86400000).toISOString(), privacy: "private", mediaUrl: null, proof: { refId: null, status: "pending" }, tags: ["checklist"] },
        { id: "EVID-3", title: "Fall Prevention Assessment Notes", filename: "fall_prevention_notes.pdf", moduleId: "MOD-3", type: "pdf", createdUtc: new Date(Date.now() - 172800000).toISOString(), updatedUtc: new Date(Date.now() - 172800000).toISOString(), privacy: "restricted", mediaUrl: "https://storage.example.com/evidence/EVID-3", proof: { refId: "PROOF-EVID-3", status: "logged" }, tags: ["assessment", "notes"] },
      ];
    }

    // Skill Checks
    if (url.includes("/skilllab/skill-checks")) {
      return [
        { id: "CHECK-1", moduleId: "MOD-1", skillName: "Wound Dressing Application", status: "pass", updatedUtc: new Date().toISOString(), notes: "Demonstrated proper technique", proof: { refId: "PROOF-CHECK-1" } },
        { id: "CHECK-2", moduleId: "MOD-2", skillName: "Medication Verification", status: "needs_review", updatedUtc: new Date(Date.now() - 86400000).toISOString(), notes: "Requires supervisor review", proof: { refId: null } },
        { id: "CHECK-3", moduleId: "MOD-3", skillName: "Fall Risk Assessment", status: "pass", updatedUtc: new Date(Date.now() - 172800000).toISOString(), notes: "Completed successfully", proof: { refId: "PROOF-CHECK-3" } },
        { id: "CHECK-4", moduleId: "MOD-1", skillName: "Infection Control", status: "fail", updatedUtc: new Date(Date.now() - 259200000).toISOString(), notes: "Needs improvement in hand hygiene", proof: { refId: "PROOF-CHECK-4" } },
      ];
    }

    // Evidence Policy
    if (url.includes("/skilllab/evidence-policy")) {
      return { allowedTypes: ["pdf", "jpg", "png", "mp4"], maxMb: 25, retentionDays: 365 };
    }

    // Proof References
    if (url.includes("/proof/skilllab/evidence-refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), label: "Evidence: Wound Dressing Practice", refId: "PROOF-EVID-1", hash: "0xabc123def456" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), label: "Skill Check: Wound Dressing Application", refId: "PROOF-CHECK-1", hash: "0xdef456ghi789" },
        { id: "PR-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), label: "Evidence: Fall Prevention Assessment", refId: "PROOF-EVID-3", hash: "0xghi789jkl012" },
      ];
    }

    // AI Summary
    if (url.includes("/ai/skilllab/evidence/summary")) {
      return {
        missingEvidence: [
          { moduleId: "MOD-2", moduleTitle: "Medication Administration Safety", reason: "No evidence uploaded for this module" },
        ],
        qualityFlags: [
          { type: "info", message: "Evidence EVID-2 is missing proof reference" },
        ],
        message: "You have 3 evidence items. 1 item is missing a proof reference. Consider uploading evidence for Medication Administration Safety module."
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
 * Collects all data required for Evidence Vault (MVP).
 */
export async function buildNeoCareTab19_2Input({ user, scope = "self", cohortId = null, moduleId = null, range = "90d" }: { user: any, scope?: string, cohortId?: string | null, moduleId?: string | null, range?: string }) {
  const q = new URLSearchParams({
    scope,
    cohortId: cohortId || "",
    moduleId: moduleId || "",
    range
  }).toString();

  const [modules, evidence, skillChecks, policy, proofRefs, health, ai] = await Promise.all([
    mockApi.get(`/skilllab/catalog?active=true`),
    mockApi.get(`/skilllab/evidence?${q}`),
    mockApi.get(`/skilllab/skill-checks?${q}`),
    mockApi.get(`/skilllab/evidence-policy`),
    mockApi.get(`/proof/skilllab/evidence-refs?${q}`),
    mockApi.get(`/system/health`),
    mockApi.get(`/ai/skilllab/evidence/summary?${q}`)
  ]);

  // Ensure arrays
  const modulesArray = Array.isArray(modules) ? modules : [];
  const evidenceArray = Array.isArray(evidence) ? evidence : [];
  const skillChecksArray = Array.isArray(skillChecks) ? skillChecks : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure policy is an object
  const policyObj = policy && typeof policy === 'object' && !Array.isArray(policy) ? policy : { allowedTypes: ["pdf", "jpg", "png"], maxMb: 25, retentionDays: 365 };

  // Ensure ai is an object
  const aiObj = ai && typeof ai === 'object' && !Array.isArray(ai) ? ai : { missingEvidence: [], qualityFlags: [], message: "" };

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    scope,
    cohortId,
    moduleId,
    range,
    modules: modulesArray,
    evidence: evidenceArray,
    skillChecks: skillChecksArray,
    policy: policyObj,
    proofRefs: proofRefsArray,
    ai: aiObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab19_2Model(input: any) {
  const { user, scope, cohortId, moduleId, range, modules = [], evidence = [], skillChecks = [], policy, proofRefs = [], ai, system } = input;

  const totalEvidence = evidence.length;
  const verifiedEvidence = evidence.filter((e: any) => !!e.proof?.refId).length;

  const totalChecks = skillChecks.length;
  const passedChecks = skillChecks.filter((c: any) => c.status === "pass").length;
  const passRate = pct(passedChecks, totalChecks);

  const moduleMap = new Map(modules.map((m: any) => [m.id, m]));

  function mapEvidence(e: any) {
    const mod = moduleMap.get(e.moduleId);
    return {
      id: e.id,
      title: safeStr(e.title || e.filename || "Evidence Item", 70),
      module: mod ? safeStr(mod.title, 50) : (e.moduleId ? `Module ${e.moduleId}` : "General"),
      type: (e.type || "").toLowerCase(), // pdf | image | link | note
      createdUtc: e.createdUtc || null,
      updatedUtc: e.updatedUtc || null,
      owner: scope === "cohort" ? safeStr(e.ownerName || "Student", 40) : null,
      privacy: e.privacy || "private", // private | restricted
      hasMedia: !!e.mediaUrl, // MVP: only link, not inline display
      proof: {
        refShort: shortId(e.proof?.refId),
        refId: e.proof?.refId || null,
        status: e.proof?.status || (e.proof?.refId ? "logged" : "pending")
      },
      tags: (e.tags || []).slice(0, 4),
      action: { type: "OPEN_EVIDENCE_ITEM", evidenceId: e.id }
    };
  }

  function mapCheck(c: any) {
    const mod = moduleMap.get(c.moduleId);
    const status = c.status || "needs_review"; // pass | fail | needs_review
    return {
      id: c.id,
      module: mod ? safeStr(mod.title, 60) : (c.moduleId ? `Module ${c.moduleId}` : "General"),
      skill: safeStr(c.skillName || "Skill", 70),
      status,
      assessor: scope === "cohort" ? safeStr(c.assessorName || "", 40) : null,
      updatedUtc: c.updatedUtc || null,
      notes: safeStr(c.notes || "", 120),
      proof: {
        refShort: shortId(c.proof?.refId),
        refId: c.proof?.refId || null
      },
      cta:
        status === "needs_review"
          ? { label: "Review", action: "OPEN_SKILL_CHECK", meta: { checkId: c.id } }
          : { label: "View", action: "OPEN_SKILL_CHECK", meta: { checkId: c.id } }
    };
  }

  function mapProofRef(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc || null,
      label: p.label || "Evidence Proof",
      value: shortId(p.refId || p.hash || p.id),
      action: { type: "OPEN_PROOF_INFO", refId: p.refId || null }
    };
  }

  const moduleFilterOptions = [
    { label: "All Modules", value: "" },
    ...byNewest(modules, "updatedUtc").slice(0, 30).map((m: any) => ({ label: safeStr(m.title, 60), value: m.id }))
  ];

  return {
    product: "NeoCare",
    tabId: 19.2,
    tabKey: "skilllab_evidence_vault_mvp",
    header: {
      title: "Evidence Vault & Skills Assessments (MVP)",
      subtitle: `${user?.name || "User"} • ${scope === "cohort" ? `Cohort: ${cohortId || "-"}` : "My Evidence"}`,
      rightMeta: {
        range,
        moduleFilter: moduleId || "",
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "Evidence Vault is for education/certification support only. No clinical diagnosis content. Role-based access applies.",
    controls: [
      { type: "select", key: "moduleId", label: "Filter by module", options: moduleFilterOptions, value: moduleId || "" },
      { type: "select", key: "range", label: "Range", options: [{label:"14d",value:"14d"},{label:"30d",value:"30d"},{label:"90d",value:"90d"},{label:"365d",value:"365d"}], value: range }
    ],
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Evidence Items", value: totalEvidence },
          { label: "Verified (Proof Logged)", value: verifiedEvidence },
          { label: "Skills Checks", value: totalChecks },
          { label: "Pass Rate", value: `${passRate}%` }
        ]
      },
      {
        type: "policy_card",
        title: "Evidence Policy (MVP)",
        items: [
          { label: "Allowed types", value: (policy?.allowedTypes || []).join(", ") || "pdf, jpg, png" },
          { label: "Max size", value: `${policy?.maxMb ?? 25} MB` },
          { label: "Retention", value: `${policy?.retentionDays ?? 365} days` },
          { label: "Inline media display", value: "No (links only)" }
        ]
      },
      {
        type: "ai_advisor",
        title: "AI Evidence Advisor (MVP)",
        message: (ai && typeof ai === 'object' && 'message' in ai) ? (ai.message || "AI highlights missing evidence and quality flags (non-diagnostic).") : "AI highlights missing evidence and quality flags (non-diagnostic).",
        missingEvidence: ((ai && typeof ai === 'object' && 'missingEvidence' in ai) ? (ai.missingEvidence || []) : []).slice(0, 4),
        qualityFlags: ((ai && typeof ai === 'object' && 'qualityFlags' in ai) ? (ai.qualityFlags || []) : []).slice(0, 4),
        actions: [
          { label: "Upload Evidence", action: "UPLOAD_EVIDENCE" },
          { label: "View Missing Items", action: "OPEN_MISSING_EVIDENCE" }
        ]
      },
      {
        type: "evidence_list",
        title: "Evidence Items",
        subtitle: "Metadata + proof references (media stored externally).",
        items: byNewest(evidence, "updatedUtc").slice(0, 10).map(mapEvidence),
        emptyState: "No evidence uploaded in this period.",
        cta: { label: "Upload Evidence", action: "UPLOAD_EVIDENCE" }
      },
      {
        type: "skill_checks",
        title: "Skills Checklist / Assessments",
        subtitle: "Pass/Fail/Needs review (proof-linked).",
        items: byNewest(skillChecks, "updatedUtc").slice(0, 10).map(mapCheck),
        emptyState: "No skill checks recorded yet.",
        cta: { label: "Request Skill Check", action: "REQUEST_SKILL_CHECK" }
      },
      {
        type: "proof_trust",
        title: "Proof References (Light MVP)",
        subtitle: "Evidence and assessments are linked to proof references for audit readiness.",
        items: byNewest(proofRefs, "timestampUtc").slice(0, 4).map(mapProofRef),
        cta: { label: "Open Proof Center", action: "OPEN_PROOF_CENTER", meta: { tab: "17" } }
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-19.2.1", label: "Evidence Classifier & Metadata Extractor" },
          { key: "AI-19.2.2", label: "Evidence Completeness Checker" },
          { key: "AI-19.2.3", label: "Skill Checklist Tracker" },
          { key: "AI-19.2.4", label: "Evidence Quality Flags (Non-diagnostic)" },
          { key: "AI-19.2.5", label: "Proof Reference Builder (Light)" }
        ]
      }
    ],
    debug: { scope, cohortId, moduleId, totalEvidence, verifiedEvidence, totalChecks, passedChecks, passRate }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab19_2EvidenceVault(scope = "self", cohortId: string | null = null, moduleId: string | null = null, range = "90d") {
  const user = { name: "Current User" }; // Mock user
  const input = await buildNeoCareTab19_2Input({ user, scope, cohortId, moduleId, range });
  return renderNeoCareTab19_2Model(input);
}

