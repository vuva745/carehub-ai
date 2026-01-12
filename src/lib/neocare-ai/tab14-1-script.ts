/**
 * NeoCare — TAB 14.1 VoiceSlogan Text (AI MVP)
 * UI-level logic only (no backend AI, no medical analysis)
 * Adapted for Frontend Usage
 */

// ---------- Helpers ----------
function nowUtc() { return new Date().toISOString(); }
function shortId(id: string | null | undefined) { return id ? `${String(id).slice(0, 8)}…` : "-"; }

// ---------- AI-14.1.1: Care Goal Binding ----------
export function bindCareGoal({ text, careGoalId }: { text: string, careGoalId: string }) {
  if (!text || !careGoalId) {
    return { valid: false, error: "CARE_GOAL_REQUIRED" };
  }
  return { valid: true, payload: { text, careGoalId } };
}

// ---------- AI-14.1.2: Text Validator ----------
export function validateVoiceSloganText(text: string) {
  if (!text || text.trim().length < 3) {
    return { valid: false, error: "TEXT_TOO_SHORT" };
  }
  if (text.length > 240) {
    return { valid: false, error: "TEXT_TOO_LONG" };
  }
  return { valid: true };
}

// ---------- AI-14.1.3: Submission State Controller ----------
export function getSubmissionState(status: string) {
  switch (status) {
    case "loading": return { label: "Submitting…", color: "blue" };
    case "success": return { label: "Logged", color: "green" };
    case "error":   return { label: "Error", color: "red" };
    default:        return { label: "Idle", color: "grey" };
  }
}

// ---------- AI-14.1.4: Proof Indicator Mapper ----------
export function mapProofIndicator(proof: any) {
  return {
    badge: proof?.id ? "7D Proof: Logged" : "Pending",
    proofIdShort: shortId(proof?.id || null)
  };
}

// ---------- AI-14.1.5: Sponsor Counter ----------
export function updateSponsorCounter(counter: any) {
  return {
    dailyCount: (counter?.dailyCount || 0) + 1,
    lastActivityUtc: nowUtc()
  };
}

// ---------- Mock Data ----------
const mockSponsor = {
  name: "Community Health Sponsor",
  dailyCount: 12,
  lastActivityUtc: new Date(Date.now() - 3600000).toISOString()
};

const mockCareGoals = [
  { id: "CG-1", label: "Maintain Mobility" },
  { id: "CG-2", label: "Pain Management" },
  { id: "CG-3", label: "Social Engagement" },
  { id: "CG-4", label: "Nutrition & Hydration" }
];

const mockRecentSlogans = [
  {
    text: "Feeling much better today, thank you!",
    careGoalLabel: "Maintain Mobility",
    timestampUtc: new Date(Date.now() - 7200000).toISOString(),
    sponsorTag: "Community Health Sponsor",
    proof: { id: "PROOF-001" }
  },
  {
    text: "The morning walk was wonderful",
    careGoalLabel: "Social Engagement",
    timestampUtc: new Date(Date.now() - 14400000).toISOString(),
    sponsorTag: "Community Health Sponsor",
    proof: { id: "PROOF-002" }
  },
  {
    text: "Appreciate the care team's support",
    careGoalLabel: "Pain Management",
    timestampUtc: new Date(Date.now() - 21600000).toISOString(),
    sponsorTag: "Community Health Sponsor",
    proof: null
  }
];

// ---------- Render Model ----------
export function renderTab14_1Model({
  sponsor = mockSponsor,
  careGoals = mockCareGoals,
  recentSlogans = mockRecentSlogans,
  state = "idle"
}: {
  sponsor?: any,
  careGoals?: any[],
  recentSlogans?: any[],
  state?: string
}) {
  return {
    tabId: "14.1",
    title: "VoiceSlogan Text",
    disclaimer: "Text-only confirmation. No audio. No medical analysis.",
    sponsorCard: {
      name: sponsor?.name || "Sponsor",
      dailyCount: sponsor?.dailyCount || 0,
      lastActivityUtc: sponsor?.lastActivityUtc || "-"
    },
    input: {
      textPlaceholder: "Enter VoiceSlogan (text)…",
      careGoalRequired: true,
      careGoals
    },
    submissionState: getSubmissionState(state),
    list: recentSlogans.map(s => ({
      text: s.text,
      careGoal: s.careGoalLabel,
      timestampUtc: s.timestampUtc,
      sponsorTag: s.sponsorTag,
      proof: mapProofIndicator(s.proof)
    }))
  };
}

