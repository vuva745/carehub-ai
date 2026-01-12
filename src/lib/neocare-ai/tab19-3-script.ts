/**
 * NeoCare Dashboard — AI Scripts
 * TAB 19.3: Certificate Issuance & Compliance Proof (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does (MVP):
 * - Issues/verifies certificates for SkillLab pathways (education/certification only)
 * - Shows certificate status: pending / issued / expired / revoked
 * - Supports QR / Verification Code generation (UI model)
 * - Links each issued certificate to Proof references (Light MVP -> 7D Proof++ ready)
 * - Supports CPD/Training hours summary (non-clinical)
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function byNewest(items: any[], key = "issuedUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 10)}…` : "-"; }
function safeStr(s: string | null | undefined, max = 90): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function toDateOnly(iso: string | null | undefined) { return iso ? String(iso).slice(0, 10) : "-"; }

// ---------------- API Simulation ----------------
const mockApi = {
  get: async (url: string) => {
    await new Promise(r => setTimeout(r, 400));

    // Certificates
    if (url.includes("/skilllab/certificates")) {
      return [
        { id: "CERT-1", title: "Wound Care Fundamentals Certification", status: "issued", issuedUtc: new Date(Date.now() - 86400000 * 30).toISOString(), expiresUtc: new Date(Date.now() + 86400000 * 700).toISOString(), issuerName: "NeoCare SkillLab", verificationCode: "NEO-WCF-2024-001", qrPayload: "NEOCARE-CERT:NEO-WCF-2024-001", proof: { refId: "PROOF-CERT-1", status: "logged" } },
        { id: "CERT-2", title: "Medication Administration Safety", status: "issued", issuedUtc: new Date(Date.now() - 86400000 * 60).toISOString(), expiresUtc: new Date(Date.now() + 86400000 * 670).toISOString(), issuerName: "NeoCare SkillLab", verificationCode: "NEO-MAS-2024-002", qrPayload: "NEOCARE-CERT:NEO-MAS-2024-002", proof: { refId: "PROOF-CERT-2", status: "logged" } },
        { id: "CERT-3", title: "Fall Prevention Techniques", status: "pending", issuedUtc: null, expiresUtc: null, issuerName: "NeoCare SkillLab", verificationCode: null, qrPayload: null, proof: { refId: null, status: "pending" } },
        { id: "CERT-4", title: "Advanced Wound Care", status: "expired", issuedUtc: new Date(Date.now() - 86400000 * 800).toISOString(), expiresUtc: new Date(Date.now() - 86400000 * 100).toISOString(), issuerName: "NeoCare SkillLab", verificationCode: "NEO-AWC-2023-001", qrPayload: "NEOCARE-CERT:NEO-AWC-2023-001", proof: { refId: "PROOF-CERT-4", status: "logged" } },
      ];
    }

    // CPD Summary
    if (url.includes("/skilllab/cpd/summary")) {
      return { hoursTotal: 120, hoursThisYear: 45, requiredHours: 50 };
    }

    // Verifications
    if (url.includes("/skilllab/certificates/verifications")) {
      return [
        { id: "VER-1", timestampUtc: new Date().toISOString(), certId: "CERT-1", result: "ok", requester: "External Verifier", verificationCode: "NEO-WCF-2024-001" },
        { id: "VER-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), certId: "CERT-2", result: "ok", requester: "HR Department", verificationCode: "NEO-MAS-2024-002" },
        { id: "VER-3", timestampUtc: new Date(Date.now() - 172800000).toISOString(), certId: "CERT-4", result: "expired", requester: "External Verifier", verificationCode: "NEO-AWC-2023-001" },
      ];
    }

    // Issuer
    if (url.includes("/skilllab/certificates/issuer")) {
      return { name: "NeoCare SkillLab", authority: "Internal Issuer (MVP)" };
    }

    // Proof References
    if (url.includes("/proof/skilllab/cert-refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), label: "Certificate: Wound Care Fundamentals", refId: "PROOF-CERT-1", hash: "0xabc123def456" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 86400000).toISOString(), label: "Certificate: Medication Administration Safety", refId: "PROOF-CERT-2", hash: "0xdef456ghi789" },
      ];
    }

    // Policy
    if (url.includes("/skilllab/certificates/policy")) {
      return { defaultExpiryMonths: 24, allowRevocation: true, verificationCodeLength: 10 };
    }

    // AI Summary
    if (url.includes("/ai/skilllab/certificates/summary")) {
      return {
        expiringSoon: [
          { certId: "CERT-2", title: "Medication Administration Safety", daysUntilExpiry: 670, reason: "Expires in approximately 22 months" },
        ],
        complianceFlags: [
          { type: "warning", message: "CPD hours for this year: 45/50 (90%). Consider completing additional training." },
        ],
        message: "You have 2 issued certificates. 1 certificate is pending issuance. 1 certificate has expired. CPD compliance is at 90%."
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
 * Collects all data required for Certificate Issuance (MVP).
 */
export async function buildNeoCareTab19_3Input({ user, scope = "self", cohortId = null, status = "all", range = "365d" }: { user: any, scope?: string, cohortId?: string | null, status?: string, range?: string }) {
  const q = new URLSearchParams({
    scope,
    cohortId: cohortId || "",
    status: status || "all",
    range
  }).toString();

  const [certs, cpd, verifications, issuer, proofRefs, policy, health, ai] = await Promise.all([
    mockApi.get(`/skilllab/certificates?${q}`),
    mockApi.get(`/skilllab/cpd/summary?${q}`),
    mockApi.get(`/skilllab/certificates/verifications?${q}`),
    mockApi.get(`/skilllab/certificates/issuer`),
    mockApi.get(`/proof/skilllab/cert-refs?${q}`),
    mockApi.get(`/skilllab/certificates/policy`),
    mockApi.get(`/system/health`),
    mockApi.get(`/ai/skilllab/certificates/summary?${q}`)
  ]);

  // Ensure arrays
  const certsArray = Array.isArray(certs) ? certs : [];
  const verificationsArray = Array.isArray(verifications) ? verifications : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure objects
  const cpdObj = cpd && typeof cpd === 'object' && !Array.isArray(cpd) ? cpd : { hoursTotal: 0, hoursThisYear: 0, requiredHours: 0 };
  const issuerObj = issuer && typeof issuer === 'object' && !Array.isArray(issuer) ? issuer : { name: "NeoCare SkillLab", authority: "Internal Issuer (MVP)" };
  const policyObj = policy && typeof policy === 'object' && !Array.isArray(policy) ? policy : { defaultExpiryMonths: 24, allowRevocation: true, verificationCodeLength: 10 };
  const aiObj = ai && typeof ai === 'object' && !Array.isArray(ai) ? ai : { expiringSoon: [], complianceFlags: [], message: "" };
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    scope,
    cohortId,
    status,
    range,
    certs: certsArray,
    cpd: cpdObj,
    verifications: verificationsArray,
    issuer: issuerObj,
    proofRefs: proofRefsArray,
    policy: policyObj,
    ai: aiObj,
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab19_3Model(input: any) {
  const { user, scope, cohortId, status, range, certs = [], cpd, verifications = [], issuer, proofRefs = [], policy, ai, system } = input;

  const issued = certs.filter((c: any) => c.status === "issued").length;
  const pending = certs.filter((c: any) => c.status === "pending").length;
  const expired = certs.filter((c: any) => c.status === "expired").length;
  const revoked = certs.filter((c: any) => c.status === "revoked").length;

  const required = cpd?.requiredHours || 0;
  const thisYear = cpd?.hoursThisYear || 0;
  const cpdPct = pct(thisYear, required);

  function mapCert(c: any) {
    const verificationCode = c.verificationCode || null;
    const qrPayload = c.qrPayload || (verificationCode ? `NEOCARE-CERT:${verificationCode}` : null);

    return {
      id: c.id,
      title: safeStr(c.title || "Certificate", 70),
      owner: scope === "cohort" ? safeStr(c.ownerName || "Student/Nurse", 50) : null,
      status: c.status || "pending", // pending | issued | expired | revoked
      issuedUtc: c.issuedUtc || null,
      expiresUtc: c.expiresUtc || null,
      issuer: safeStr(c.issuerName || issuer?.name || "NeoCare SkillLab", 60),
      verification: {
        codeShort: shortId(verificationCode),
        code: verificationCode,
        qrPayload, // used by frontend QR generator
        verifyUrl: c.verifyUrl || null // optional external verification endpoint
      },
      proof: {
        refShort: shortId(c.proof?.refId),
        refId: c.proof?.refId || null,
        status: c.proof?.status || (c.proof?.refId ? "logged" : "pending")
      },
      actions: [
        { label: "View", action: "OPEN_CERTIFICATE", meta: { certId: c.id } },
        ...(c.status === "issued" ? [{ label: "Verify", action: "VERIFY_CERTIFICATE", meta: { certId: c.id } }] : []),
        ...(c.status === "pending" ? [{ label: "Issue (Admin)", action: "ISSUE_CERTIFICATE", meta: { certId: c.id } }] : []),
        ...(policy?.allowRevocation && c.status === "issued"
          ? [{ label: "Revoke (Admin)", action: "REVOKE_CERTIFICATE", meta: { certId: c.id } }]
          : [])
      ]
    };
  }

  function mapVerification(v: any) {
    return {
      id: v.id,
      timestampUtc: v.timestampUtc || null,
      certId: v.certId || null,
      result: v.result || "ok", // ok | failed | expired | revoked
      requester: safeStr(v.requester || "Verifier", 60),
      ref: shortId(v.verificationCode || v.certId || v.id),
      action: { type: "OPEN_VERIFICATION_LOG", verificationId: v.id }
    };
  }

  function mapProofRef(p: any) {
    return {
      id: p.id,
      timestampUtc: p.timestampUtc || null,
      label: p.label || "Certificate Proof",
      value: shortId(p.refId || p.hash || p.id),
      action: { type: "OPEN_PROOF_INFO", refId: p.refId || null }
    };
  }

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Issued", value: "issued" },
    { label: "Pending", value: "pending" },
    { label: "Expired", value: "expired" },
    { label: "Revoked", value: "revoked" }
  ];

  return {
    product: "NeoCare",
    tabId: 19.3,
    tabKey: "certificate_issuance_compliance_mvp",
    header: {
      title: "Certificate Issuance & Compliance Proof (MVP)",
      subtitle: `${user?.name || "User"} • ${scope === "cohort" ? `Cohort: ${cohortId || "-"}` : "My Certificates"}`,
      rightMeta: {
        range,
        status,
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    disclaimer:
      "Certificates are for education/training verification only. They do not grant clinical privileges unless validated by the relevant authority.",
    controls: [
      { type: "select", key: "status", label: "Status", options: statusOptions, value: status || "all" },
      { type: "select", key: "range", label: "Range", options: [{label:"90d",value:"90d"},{label:"365d",value:"365d"}], value: range }
    ],
    layout: [
      {
        type: "kpi_cards",
        items: [
          { label: "Issued", value: issued },
          { label: "Pending", value: pending },
          { label: "Expired", value: expired },
          { label: "Revoked", value: revoked }
        ]
      },
      {
        type: "cpd_summary",
        title: "CPD / Training Hours (MVP)",
        items: [
          { label: "Hours this year", value: String(thisYear), source: "AI-19.3.2" },
          { label: "Required hours", value: String(required), source: "AI-19.3.2" },
          { label: "Compliance rate", value: `${cpdPct}%`, source: "AI-19.3.2" },
          { label: "Policy expiry (default)", value: `${policy?.defaultExpiryMonths ?? 24} months`, source: "AI-19.3.5" }
        ],
        cta: { label: "Add Training Hours", action: "ADD_CPD_ENTRY" }
      },
      {
        type: "ai_advisor",
        title: "AI Compliance Advisor (MVP)",
        message: (ai && typeof ai === 'object' && 'message' in ai) ? (ai.message || "AI highlights expiring certificates and compliance gaps (non-diagnostic).") : "AI highlights expiring certificates and compliance gaps (non-diagnostic).",
        expiringSoon: ((ai && typeof ai === 'object' && 'expiringSoon' in ai) ? (ai.expiringSoon || []) : []).slice(0, 4),
        complianceFlags: ((ai && typeof ai === 'object' && 'complianceFlags' in ai) ? (ai.complianceFlags || []) : []).slice(0, 4),
        actions: [
          { label: "View Expiring", action: "OPEN_EXPIRING_CERTS" },
          { label: "Request Assessment", action: "REQUEST_ASSESSMENT" }
        ]
      },
      {
        type: "certificates",
        title: "Certificates",
        subtitle: "Each certificate includes a verification code + proof reference (MVP).",
        items: byNewest(certs, "issuedUtc").slice(0, 10).map(mapCert),
        emptyState: "No certificates available for this filter.",
        cta: { label: "Start a Skill Path", action: "OPEN_SKILL_MODULE" }
      },
      {
        type: "verifications",
        title: "Recent Verifications",
        subtitle: "Certificate verification checks (public verification).",
        items: byNewest(verifications, "timestampUtc").slice(0, 6).map(mapVerification),
        emptyState: "No verifications recorded."
      },
      {
        type: "proof_trust",
        title: "Proof References (Light MVP)",
        subtitle: "Certificates are linked to proof references for audit readiness.",
        items: byNewest(proofRefs, "timestampUtc").slice(0, 4).map(mapProofRef),
        cta: { label: "Open Proof Center", action: "OPEN_PROOF_CENTER", meta: { tab: "17" } }
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-19.3.1", label: "Certificate Issuer & Validator" },
          { key: "AI-19.3.2", label: "CPD Hours Tracker" },
          { key: "AI-19.3.3", label: "Expiry Warning System" },
          { key: "AI-19.3.4", label: "Verification Code Generator" },
          { key: "AI-19.3.5", label: "Compliance Checker (Non-diagnostic)" },
          { key: "AI-19.3.6", label: "Proof Reference Builder (Light)" }
        ]
      }
    ],
    debug: { scope, cohortId, status, issued, pending, expired, revoked, cpdPct }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab19_3CertificateIssuance(scope = "self", cohortId: string | null = null, status = "all", range = "365d") {
  const user = { name: "Current User" }; // Mock user
  const input = await buildNeoCareTab19_3Input({ user, scope, cohortId, status, range });
  return renderNeoCareTab19_3Model(input);
}

