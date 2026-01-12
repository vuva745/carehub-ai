/**
 * NeoCare Dashboard — AI Scripts
 * TAB 14: Client Voice & Wellbeing (MVP)
 * Adapted for Frontend Usage
 */

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function pct(a: number, b: number) { if (!b || b <= 0) return 0; return clamp(Math.round((a / b) * 100), 0, 100); }
function shortHash(h: string | null | undefined) { return h ? `${String(h).slice(0, 10)}…` : "-"; }
function byTimeDesc(items: any[], key = "timestampUtc") {
    return [...items].sort((x, y) => new Date(y[key]).getTime() - new Date(x[key]).getTime());
}

// ---------------- API Simulation ----------------
// Mocking the backend API calls since we are strictly frontend for this demo
const mockApi = {
    get: async (url: string) => {
        // console.log(`[MockAPI] GET ${url}`);

        // Simulate API latency
        await new Promise(r => setTimeout(r, 400));

        // Client Data
        if (url.includes("/care/clients/")) {
            return { id: "C-123", name: "Lisa R.", consentVoice: true };
        }

        // Voice Checks
        if (url.includes("/care/voice-checks")) {
            return [
                { id: "VC-101", timestampUtc: new Date().toISOString(), durationSec: 15, consent: true, toneLevel: "positive", flags: [], proof: { hash: "0x8f3a...2b1", eventId: "EV-999" } },
                { id: "VC-100", timestampUtc: new Date(Date.now() - 86400000).toISOString(), durationSec: 12, consent: true, toneLevel: "neutral", flags: ["low_energy"] },
            ];
        }

        // Wellbeing Notes
        if (url.includes("/care/wellbeing-notes")) {
            return [
                { id: "N-501", timestampUtc: new Date().toISOString(), authorRole: "nurse", text: "Client seemed energetic during morning walk.", tags: ["mobility", "positive"] },
                { id: "N-500", timestampUtc: new Date(Date.now() - 172800000).toISOString(), authorRole: "family", text: "Mom was a bit quiet today.", tags: ["mood"] },
            ];
        }

        // Thresholds
        if (url.includes("/care/wellbeing-thresholds")) {
            return { yellowCount48h: 2, redAny: true };
        }

        // System Health
        if (url.includes("/system/health")) {
            return { status: "ok", lastSyncUtc: new Date().toISOString() };
        }

        // AI Summary
        if (url.includes("/ai/wellbeing/summary")) {
            return { toneLevel: "high", trend: "improving", flags: [] };
        }

        return null;
    }
};


// ---------------- 1) Build Input ----------------
export async function buildNeoCareTab14Input({ user, clientId, range = "14d" }: { user: any, clientId: string, range?: string }) {
    // Using mockApi instead of passed req.api
    const [client, voiceChecks, notes, thresholds, health] = await Promise.all([
        mockApi.get(`/care/clients/${encodeURIComponent(clientId)}`),
        mockApi.get(`/care/voice-checks?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
        mockApi.get(`/care/wellbeing-notes?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`),
        mockApi.get(`/care/wellbeing-thresholds?clientId=${encodeURIComponent(clientId)}`),
        mockApi.get(`/system/health`)
    ]);

    const ai = await mockApi.get(`/ai/wellbeing/summary?clientId=${encodeURIComponent(clientId)}&range=${encodeURIComponent(range)}`);

    return {
        user,
        client: client || { name: "Client" },
        range,
        voiceChecks: byTimeDesc(voiceChecks || []),
        notes: byTimeDesc(notes || []),
        thresholds: thresholds || { yellowCount48h: 2, redAny: true },
        ai: ai || { toneLevel: "low", trend: "stable", flags: [] },
        system: {
            apiHealth: health?.status || "ok",
            lastSyncUtc: health?.lastSyncUtc || null
        }
    };
}

// ---------------- 2) Render UI Model ----------------
export function renderNeoCareTab14Model(input: any) {
    const { user, client, range, voiceChecks = [], notes = [], thresholds, ai, system } = input;

    const last = voiceChecks[0] || null;

    function mapVoice(v: any) {
        return {
            id: v.id,
            timestampUtc: v.timestampUtc,
            durationSec: v.durationSec || 10,
            consent: !!v.consent,
            toneLevel: v.toneLevel || ai?.toneLevel || "low",
            flags: (v.flags || []).slice(0, 3),
            proof: {
                hashShort: shortHash(v.proof?.hash),
                eventId: v.proof?.eventId || null
            },
            action: { type: "OPEN_VOICE_CHECK", voiceCheckId: v.id }
        };
    }

    function mapNote(n: any) {
        return {
            id: n.id,
            timestampUtc: n.timestampUtc,
            authorRole: n.authorRole || "nurse", // nurse | family_ro | system
            text: n.text || "",
            tags: (n.tags || []).slice(0, 4),
            action: { type: "OPEN_NOTE", noteId: n.id }
        };
    }

    return {
        product: "NeoCare",
        tabId: 14,
        tabKey: "client_voice_wellbeing",
        header: {
            title: "Client Voice & Wellbeing",
            subtitle: `${client?.name || "Client"} • ${user?.name || "Care Team"}`,
            rightMeta: {
                range,
                consentStatus: client?.consentVoice ? "active" : "missing",
                apiHealth: system.apiHealth
            }
        },
        disclaimer: "AI provides non-diagnostic wellbeing signals only. All clinical decisions remain human-led.",
        layout: [
            {
                type: "quick_actions",
                items: [
                    { label: "Start Voice Check (10s)", action: "START_VOICE_CHECK", meta: { clientId: client?.id } },
                    { label: "Add Wellbeing Note", action: "ADD_WELLBEING_NOTE", meta: { clientId: client?.id } },
                    { label: "Notify Nurse", action: "NOTIFY_NURSE", meta: { clientId: client?.id } },
                    { label: "View Proof", action: "OPEN_PROOF_CENTER", meta: { clientId: client?.id } }
                ]
            },
            {
                type: "wellbeing_snapshot",
                items: [
                    { label: "Emotional Tone", value: ai?.toneLevel || "low", source: "AI-14.2" },
                    { label: "Trend", value: ai?.trend || "stable", source: "AI-14.3" },
                    { label: "Flags", value: (ai?.flags || []).map((f: any) => f.code || f).slice(0, 5), source: "AI-14.4" },
                    { label: "Last Voice Check", value: last?.timestampUtc || "-", source: "AI-14.1" }
                ]
            },
            {
                type: "voice_history",
                title: "Voice Checks (Proof-first)",
                items: voiceChecks.slice(0, 20).map(mapVoice),
                emptyState: "No voice checks recorded in this period."
            },
            {
                type: "notes",
                title: "Wellbeing Notes",
                items: notes.slice(0, 20).map(mapNote),
                emptyState: "No notes yet."
            },
            {
                type: "thresholds",
                title: "Notification Thresholds (MVP)",
                items: [
                    { label: "Notify nurse if yellow flags in 48h", value: thresholds?.yellowCount48h ?? 2 },
                    { label: "Notify lead on any red flag", value: thresholds?.redAny ? "Yes" : "No" }
                ]
            },
            {
                type: "ai_modules",
                title: "AI Modules (MVP)",
                items: [
                    { key: "AI-14.1", label: "Voice Capture & Consent Check" },
                    { key: "AI-14.2", label: "Emotional Tone Detection (Non-diagnostic)" },
                    { key: "AI-14.3", label: "Wellbeing Trend Monitor" },
                    { key: "AI-14.4", label: "Risk Flag Generator" },
                    { key: "AI-14.5", label: "Caregiver Notification Engine" },
                    { key: "AI-14.6", label: "Voice Proof & Audit Logger" }
                ]
            }
        ],
        debug: { clientId: client?.id, range }
    };
}

// ---------------- 3) Main Handler Type ----------------
export async function runTab14LikelihoodAnalysis(clientId: string) {
    const user = { name: "Current User" }; // Mock user
    const input = await buildNeoCareTab14Input({ user, clientId, range: "7d" });
    return renderNeoCareTab14Model(input);
}
