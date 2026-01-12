/**
 * NeoCare Dashboard — AI Scripts
 * TAB 15: Mantelzorger / Family Dashboard (Read-Only) (MVP)
 * Adapted for Frontend Usage
 *
 * What this tab does:
 * - Provides a privacy-safe, read-only view for family/mantelzorgers
 * - Shows simplified care moment feed + planning windows + family-safe alerts
 * - Shows high-level wellbeing status (derived from Tab 14 signals)
 * - Shows Proof references as trust confirmations (no medical details, no raw media)
 *
 * Privacy rules (MVP):
 * - No internal nurse notes, no clinical details, no raw audio/video
 * - Only "family-safe" summaries and verified confirmation indicators
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function byTimeDesc(items: any[], key = "timestampUtc") {
  return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}
function shortId(s: string | null | undefined) { return s ? `${String(s).slice(0, 6)}…` : "-"; }
function safeStr(s: string | null | undefined, max = 140): string {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function toYesNo(v: boolean | null | undefined) { return v ? "Yes" : "No"; }

// ---------------- API Simulation ----------------
// Mocking the backend API calls since we are strictly frontend for this demo
const mockApi = {
  get: async (url: string) => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 400));

    // Client Data
    if (url.includes("/care/clients/")) {
      return { id: "C-123", name: "John de Vries", room: "201", dob: "March 12, 1948" };
    }

    // Family Access
    if (url.includes("/access/family")) {
      return { relationship: "family", readOnly: true, canContactTeam: true, showStaffNames: true };
    }

    // Planning Windows
    if (url.includes("/care/planning/windows")) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return [
        { id: "P-1", startUtc: today.toISOString(), endUtc: new Date(today.getTime() + 3600000).toISOString(), visitType: "Medical checkup", staffName: "Jeffrey", isToday: true },
        { id: "P-2", startUtc: tomorrow.toISOString(), endUtc: new Date(tomorrow.getTime() + 3600000).toISOString(), visitType: "Bingo at Community Room", staffName: null, isToday: false },
        { id: "P-3", startUtc: new Date(tomorrow.getTime() + 86400000).toISOString(), endUtc: new Date(tomorrow.getTime() + 86400000 + 3600000).toISOString(), visitType: "Physio Session", staffName: "PT Sarah", isToday: false },
      ];
    }

    // Family Feed (already family-safe)
    if (url.includes("/care/family/feed")) {
      return [
        { id: "F-1", kind: "care_moment", status: "done", title: "Evening Medication with AI Check", subtitle: "Completed on schedule", timestampUtc: new Date().toISOString(), isToday: true, proof: { refId: "PROOF-001" } },
        { id: "F-2", kind: "care_moment", status: "done", title: "Blood Pressure Check", subtitle: "Jumped in, 9:15 AM", timestampUtc: new Date(Date.now() - 3600000).toISOString(), isToday: true, proof: { refId: "PROOF-002" } },
        { id: "F-3", kind: "note", status: "info", title: "Mia wrote John enjoys the garden!", subtitle: "Great to see!", timestampUtc: new Date(Date.now() - 86400000).toISOString(), isToday: false },
        { id: "F-4", kind: "note", status: "info", title: "Lovely picnic photos by pond!", subtitle: "Shared by Jeffrey", timestampUtc: new Date(Date.now() - 172800000).toISOString(), isToday: false },
      ];
    }

    // Family Alerts (already filtered)
    if (url.includes("/care/family/alerts")) {
      return [
        { id: "A-1", severity: "info", title: "Weekly care summary posted", subtitle: "John had a stable week", timestampUtc: new Date(Date.now() - 86400000).toISOString() },
        { id: "A-2", severity: "warning", title: "Upcoming medication review", subtitle: "Scheduled for next week", timestampUtc: new Date(Date.now() - 172800000).toISOString() },
      ];
    }

    // Wellbeing Status
    if (url.includes("/ai/wellbeing/family-status")) {
      return { level: "stable", lastUpdateUtc: new Date().toISOString(), reasonCodes: [] };
    }

    // Proof References
    if (url.includes("/proof/family/refs")) {
      return [
        { id: "PR-1", timestampUtc: new Date().toISOString(), refId: "PROOF-001", hash: "0x8f3a2b1c" },
        { id: "PR-2", timestampUtc: new Date(Date.now() - 3600000).toISOString(), refId: "PROOF-002", hash: "0x9e4b3c2d" },
        { id: "PR-3", timestampUtc: new Date(Date.now() - 86400000).toISOString(), refId: "PROOF-003", hash: "0xaf5c4d3e" },
      ];
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
 * Collects all data required for the Family Dashboard (read-only).
 * In production, enforce access control server-side (family role).
 */
export async function buildNeoCareTab15Input({ user, clientId, range = "7d" }: { user: any, clientId: string, range?: string }) {
  const [client, familyAccess, planning, familyFeed, familyAlerts, wellbeing, proofRefs, health] =
    await Promise.all([
      mockApi.get(`/care/clients/${encodeURIComponent(clientId)}`),
      mockApi.get(`/access/family?clientId=${encodeURIComponent(clientId)}`),
      mockApi.get(`/care/planning/windows?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
      mockApi.get(`/care/family/feed?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
      mockApi.get(`/care/family/alerts?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
      mockApi.get(`/ai/wellbeing/family-status?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
      mockApi.get(`/proof/family/refs?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
      mockApi.get(`/system/health`)
    ]);

  // Minimal fallbacks (MVP safe defaults)
  const access = familyAccess || { relationship: "family", readOnly: true, canContactTeam: true };
  const wb = wellbeing || { level: "stable", lastUpdateUtc: null, reasonCodes: [] };

  // Ensure arrays before passing to byTimeDesc
  const planningArray = Array.isArray(planning) ? planning : [];
  const feedArray = Array.isArray(familyFeed) ? familyFeed : [];
  const alertsArray = Array.isArray(familyAlerts) ? familyAlerts : [];
  const proofRefsArray = Array.isArray(proofRefs) ? proofRefs : [];

  // Ensure health is an object
  const healthObj = health && typeof health === 'object' && !Array.isArray(health) ? health : { status: "ok", lastSyncUtc: null };

  return {
    user,
    client,
    access,
    range,
    planning: byTimeDesc(planningArray, "startUtc"),
    feed: byTimeDesc(feedArray, "timestampUtc"),
    alerts: byTimeDesc(alertsArray, "timestampUtc"),
    wellbeing: wb,
    proofRefs: byTimeDesc(proofRefsArray, "timestampUtc"),
    system: { apiHealth: healthObj.status || "ok", lastSyncUtc: healthObj.lastSyncUtc || null }
  };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab15Model(input: any) {
  const { user, client, access, range, planning = [], feed = [], alerts = [], wellbeing, proofRefs = [], system } = input;

  // High-level snapshot numbers (MVP)
  const plannedToday = planning.filter((p: any) => (p.isToday === true) || false).length;
  const completedToday = feed.filter((f: any) => f.kind === "care_moment" && f.status === "done" && f.isToday === true).length;

  const wellbeingLevel = wellbeing?.level || "stable"; // stable | attention | alert
  const wellbeingChip =
    wellbeingLevel === "alert" ? "🔴 Alert" :
    wellbeingLevel === "attention" ? "🟡 Attention" : "🟢 Stable";

  function mapFeedItem(f: any) {
    // f is already family-safe on backend
    return {
      id: f.id,
      kind: f.kind || "care_moment", // care_moment | note | system
      status: f.status || "info",    // done | info | warning
      title: safeStr(f.title || f.summary || "Update"),
      subtitle: safeStr(f.subtitle || "", 100),
      timestampUtc: f.timestampUtc || null,
      verified: !!f.proof?.refId,
      proof: {
        refIdShort: shortId(f.proof?.refId),
        refId: f.proof?.refId || null
      },
      action: { type: "OPEN_FAMILY_ITEM", itemId: f.id }
    };
  }

  function mapAlert(a: any) {
    // a is already family-filtered on backend
    return {
      id: a.id,
      severity: a.severity || "info", // info | warning | critical
      title: safeStr(a.title || "Alert"),
      subtitle: safeStr(a.subtitle || "", 120),
      timestampUtc: a.timestampUtc || null,
      action: access?.canContactTeam
        ? { type: "CONTACT_CARE_TEAM", clientId: client?.id, alertId: a.id }
        : { type: "NONE" }
    };
  }

  function mapPlan(p: any) {
    return {
      id: p.id,
      dateUtc: p.dateUtc || null,
      windowStartUtc: p.startUtc,
      windowEndUtc: p.endUtc || null,
      visitType: safeStr(p.visitType || "Care visit", 40),
      // Optional privacy: hide staff name
      staff: p.staffName && access?.showStaffNames ? safeStr(p.staffName, 40) : null
    };
  }

  function mapProofRef(r: any) {
    return {
      id: r.id,
      timestampUtc: r.timestampUtc || null,
      label: "Proof ID",
      value: shortId(r.refId || r.hash || r.id),
      action: { type: "OPEN_PROOF_INFO", refId: r.refId || null }
    };
  }

  return {
    product: "NeoCare",
    tabId: 15,
    tabKey: "family_dashboard_read_only",
    header: {
      title: "Family Dashboard (Read-Only)",
      subtitle: `${client?.name || "Client"} • ${access?.relationship || "Family"}`,
      rightMeta: {
        range,
        access: access?.readOnly ? "read_only" : "restricted",
        apiHealth: system.apiHealth,
        lastSyncUtc: system.lastSyncUtc
      }
    },
    permissions: {
      readOnly: true,
      canContactTeam: !!access?.canContactTeam,
      canSeeStaffNames: !!access?.showStaffNames
    },
    disclaimer:
      "This view is simplified and privacy-safe. For medical questions or urgent concerns, contact the care team.",
    layout: [
      {
        type: "quick_actions",
        items: [
          ...(access?.canContactTeam ? [{ label: "Contact Care Team", action: "CONTACT_CARE_TEAM", meta: { clientId: client?.id } }] : []),
          { label: "What is Proof?", action: "OPEN_FAMILY_FAQ", meta: { topic: "proof" } },
          { label: "View Planning", action: "SCROLL_TO_PLANNING" }
        ]
      },
      {
        type: "family_snapshot",
        items: [
          { label: "Wellbeing Status", value: wellbeingChip, source: "AI-15.3" },
          { label: "Today's Care", value: `${completedToday}/${plannedToday}`, source: "AI-15.1" },
          { label: "Alerts", value: String(alerts.length), source: "AI-15.2" },
          { label: "Last Update", value: wellbeing?.lastUpdateUtc || "-", source: "AI-15.3" }
        ]
      },
      {
        type: "family_feed",
        title: "Latest Care Moments",
        subtitle: "Family-safe summaries (read-only).",
        items: feed.slice(0, 6).map(mapFeedItem),
        emptyState: "No updates available for this period.",
        source: "AI-15.1"
      },
      {
        type: "family_alerts",
        title: "Alerts (Family-safe)",
        items: alerts.slice(0, 5).map(mapAlert),
        emptyState: "No alerts.",
        source: "AI-15.2"
      },
      {
        type: "planning",
        title: "Planning (High-level)",
        items: planning.slice(0, 10).map(mapPlan),
        emptyState: "No planned visits in this period."
      },
      {
        type: "proof_trust",
        title: "Proof & Trust",
        subtitle: "Care actions are verified with Proof references (privacy-safe).",
        items: proofRefs.slice(0, 3).map(mapProofRef),
        cta: { label: "What is Proof?", action: "OPEN_FAMILY_FAQ", meta: { topic: "proof" } },
        source: "AI-15.5"
      },
      {
        type: "ai_modules",
        title: "AI Modules (MVP)",
        items: [
          { key: "AI-15.1", label: "Family Safe Summary Generator" },
          { key: "AI-15.2", label: "Family Alert Filter" },
          { key: "AI-15.3", label: "Wellbeing Snapshot (Read-Only)" },
          { key: "AI-15.4", label: "Family Explain-AI / FAQ Generator" },
          { key: "AI-15.5", label: "Proof Reference Builder" }
        ]
      }
    ],
    debug: { clientId: client?.id, range, wellbeingLevel }
  };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab15FamilyDashboard(clientId: string) {
  const user = { name: "Family Member" }; // Mock user
  const input = await buildNeoCareTab15Input({ user, clientId, range: "7d" });
  return renderNeoCareTab15Model(input);
}

